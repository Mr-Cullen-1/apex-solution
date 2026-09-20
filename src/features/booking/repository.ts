import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeEmail, normalizeUsPhone } from "@/features/customers/phone";
import { resolveOfferContext, resolveServiceRequestContext } from "./model";
import type { BookNowPayload, ServiceRequestRow } from "./types";

/** Resolves/creates the customer, inserts the lead, and records a
 * `request_created` activity event — all in one transaction via the
 * `book_now_create_request` RPC (see
 * supabase/migrations/20260914130000_service_requests_crm_fields.sql), so a
 * failure partway through never leaves a half-created CRM state (a
 * customer with no request, or a request with no customer_id). The
 * database insert remains the source of truth; Telegram delivery (see
 * submission-adapter.ts) only ever happens after this succeeds, and its
 * outcome never changes what was already stored here. Returns the full row
 * (not just an id) so the caller has everything it needs to format the
 * Telegram message without a second round trip.
 *
 * options.source defaults to "book_now" -- Admin Create Request and
 * campaign-link submissions pass their own value ("admin_phone" /
 * "instagram" / "facebook") through this same function/RPC, so every
 * request origin shares one creation path instead of a parallel one. */
export async function createServiceRequest(
  payload: BookNowPayload,
  options: { source?: string } = {},
): Promise<{ ok: true; row: ServiceRequestRow } | { ok: false; error: string }> {
  const supabase = getSupabaseServerClient();
  const context = resolveServiceRequestContext({ categoryId: payload.categoryId, serviceId: payload.serviceId });
  const offer = resolveOfferContext(payload.offer);
  const email = payload.email || null;

  // Campaign attribution (Phase 6) -- resolved here, server-side, from the
  // token the client sent, never trusted as-is. An unrecognized/inactive
  // token is silently dropped (falls back to options.source/"book_now",
  // campaign_link_id null) rather than rejecting an otherwise-valid lead --
  // same philosophy as a stale service/category id.
  let resolvedSource = options.source || "book_now";
  let campaignLinkId: string | null = null;
  if (payload.campaignToken) {
    const { data: campaignLink } = await supabase.rpc("get_active_campaign_link", { p_token: payload.campaignToken });
    const link = (campaignLink as { id: string; platform: string } | null) ?? null;
    if (link) {
      resolvedSource = link.platform;
      campaignLinkId = link.id;
    }
  }

  const { data, error } = await supabase.rpc("book_now_create_request", {
    p_full_name: payload.fullName,
    p_phone: payload.phone,
    p_normalized_phone: normalizeUsPhone(payload.phone),
    p_email: email,
    p_normalized_email: email ? normalizeEmail(email) : null,
    p_zip_code: payload.zipCode,
    p_service_id: context.serviceId,
    p_service_label: context.serviceLabel,
    p_category_id: context.categoryId,
    p_category_label: context.categoryLabel,
    p_issue: payload.issue || null,
    p_message: payload.message,
    p_sms_consent: payload.serviceTextConsent,
    p_source_path: payload.sourcePath || null,
    p_offer_code: offer.offerCode,
    p_offer_label: offer.offerLabel,
    p_discount_percent: offer.discountPercent,
    p_source: resolvedSource,
    p_campaign_link_id: campaignLinkId,
  });

  if (error || !data) {
    console.error("[book_now_insert_failed]", error?.code, error?.message);
    return { ok: false, error: error?.message ?? "insert returned no row" };
  }
  return { ok: true, row: data as ServiceRequestRow };
}

/** Best-effort status updates — logged, never thrown. A failure to record
 * the Telegram outcome must not turn into a second, different error for a
 * customer whose lead is already safely stored. */
export async function markTelegramSent(id: string, messageId: number): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("service_requests")
    .update({ telegram_status: "sent", telegram_message_id: messageId, telegram_sent_at: new Date().toISOString(), telegram_last_error: null })
    .eq("id", id);
  if (error) console.error("[book_now_telegram_status_update_failed]", id, error.message);
}

export async function markTelegramFailed(id: string, errorSummary: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("service_requests")
    .update({ telegram_status: "failed", telegram_last_error: errorSummary })
    .eq("id", id);
  if (error) console.error("[book_now_telegram_status_update_failed]", id, error.message);
}

/** Independent of markTelegramSent/Failed above — email and Telegram are
 * separate columns on the same row, updated by separate calls, so one
 * channel's outcome never overwrites the other's. */
export async function markEmailSent(id: string, messageId: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("service_requests")
    .update({ email_status: "sent", email_message_id: messageId, email_sent_at: new Date().toISOString(), email_last_error: null })
    .eq("id", id);
  if (error) console.error("[book_now_email_status_update_failed]", id, error.message);
}

export async function markEmailFailed(id: string, errorSummary: string): Promise<void> {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("service_requests")
    .update({ email_status: "failed", email_last_error: errorSummary })
    .eq("id", id);
  if (error) console.error("[book_now_email_status_update_failed]", id, error.message);
}
