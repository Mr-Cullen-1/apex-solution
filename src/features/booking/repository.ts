import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { resolveServiceRequestContext } from "./model";
import type { BookNowPayload, ServiceRequestRow } from "./types";

/** Inserts the lead first — this is the source of truth. Telegram delivery
 * (see submission-adapter.ts) only ever happens after this succeeds, and its
 * outcome never changes what was already stored here. Returns the full row
 * (not just an id) so the caller has everything it needs to format the
 * Telegram message without a second round trip. */
export async function createServiceRequest(payload: BookNowPayload): Promise<{ ok: true; row: ServiceRequestRow } | { ok: false; error: string }> {
  const supabase = getSupabaseServerClient();
  const context = resolveServiceRequestContext({ categoryId: payload.categoryId, serviceId: payload.serviceId });
  // The offer flag has no dedicated column (see docs/BOOK_NOW_ARCHITECTURE.md)
  // — it's folded into `issue` so a first-time-offer claim isn't silently
  // dropped, reusing the same short context-tag column "Other" already uses.
  const issue = payload.offer ? "First-Time Customer Offer" : payload.issue || null;

  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      full_name: payload.fullName,
      phone: payload.phone,
      email: payload.email || null,
      zip_code: payload.zipCode,
      service_id: context.serviceId,
      service_label: context.serviceLabel,
      category_id: context.categoryId,
      category_label: context.categoryLabel,
      issue,
      message: payload.message,
      sms_consent: payload.serviceTextConsent,
      source_path: payload.sourcePath || null,
      // Set explicitly rather than relying on the column default: "pending"
      // only when an email was actually supplied, so the confirmation-email
      // branch below has an accurate starting point to update from.
      email_status: payload.email ? "pending" : "not_requested",
    })
    .select()
    .single();

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
