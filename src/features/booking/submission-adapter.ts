import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isResendConfigured, sendConfirmationEmail } from "./email";
import { resolveSourceLabel } from "./model";
import { createServiceRequest, markEmailFailed, markEmailSent, markTelegramFailed, markTelegramSent } from "./repository";
import { formatLeadMessage, isTelegramConfigured, sendTelegramMessage } from "./telegram";
import type { BookNowPayload, ServiceRequestRow, SubmissionResult } from "./types";

const NOT_CONFIGURED_MESSAGE =
  "Thanks — we received your request details, but online submission is not connected yet. Apex has not received this request. Please call us directly to reach the team right away.";
const SUBMISSION_FAILED_MESSAGE = "We couldn't submit your request right now. Please try again or call us.";

async function deliverTelegram(row: ServiceRequestRow): Promise<void> {
  if (!isTelegramConfigured()) {
    console.warn("[book_now_telegram_not_configured] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — lead stored, no notification sent.", row.id);
    await markTelegramFailed(row.id, "Telegram not configured");
    return;
  }

  const text = formatLeadMessage({
    requestId: row.id,
    requestCode: row.request_code,
    sourceLabel: resolveSourceLabel(row.source),
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    zipCode: row.zip_code,
    categoryLabel: row.category_label,
    serviceLabel: row.service_label,
    issue: row.issue,
    message: row.message,
    smsConsent: row.sms_consent,
    createdAt: row.created_at,
  });

  const delivery = await sendTelegramMessage(text);
  if (delivery.status === "sent") {
    await markTelegramSent(row.id, delivery.messageId);
  } else if (delivery.status === "failed") {
    console.error("[book_now_telegram_delivery_failed]", row.id, delivery.error);
    await markTelegramFailed(row.id, delivery.error);
  }
}

/** No-op when the customer left email blank — `email_status` is already
 * "not_requested" from the insert, and Resend is never called. */
async function deliverConfirmationEmail(row: ServiceRequestRow): Promise<void> {
  if (!row.email) return;

  if (!isResendConfigured()) {
    console.warn("[book_now_resend_not_configured] RESEND_API_KEY/RESEND_FROM_EMAIL not set — lead stored, no confirmation email sent.", row.id);
    await markEmailFailed(row.id, "Resend not configured");
    return;
  }

  const delivery = await sendConfirmationEmail({
    requestId: row.id,
    fullName: row.full_name,
    email: row.email,
    categoryLabel: row.category_label,
    serviceLabel: row.service_label,
    issue: row.issue,
    zipCode: row.zip_code,
    message: row.message,
  });

  if (delivery.status === "sent") {
    await markEmailSent(row.id, delivery.messageId);
  } else if (delivery.status === "failed") {
    console.error("[book_now_email_delivery_failed]", row.id, delivery.error);
    await markEmailFailed(row.id, delivery.error);
  }
}

/** Orchestrates the full flow: validated payload -> Supabase insert (source
 * of truth) -> two independent, best-effort operational deliveries ->
 * status updates. Telegram and email never gate each other — each records
 * its own outcome on its own columns, and neither's success or failure ever
 * changes the response already decided by the successful DB insert (see
 * docs/BOOK_NOW_ARCHITECTURE.md).
 *
 * Run concurrently via Promise.all, not sequentially: the two deliveries
 * touch disjoint columns on the same row (no write conflict), each function
 * already catches and records its own failure internally (neither ever
 * rejects), and this still runs on a serverless function that may freeze
 * once a response is sent — so both are awaited here before responding,
 * rather than left to finish in the background unawaited. */
export async function submitBookNowRequest(payload: BookNowPayload, options: { source?: string } = {}): Promise<SubmissionResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "not_configured", message: NOT_CONFIGURED_MESSAGE };

  const created = await createServiceRequest(payload, options);
  if (!created.ok) return { ok: false, status: "error", message: SUBMISSION_FAILED_MESSAGE };

  const { row } = created;
  await Promise.all([deliverTelegram(row), deliverConfirmationEmail(row)]);

  // Neither delivery channel's outcome is ever surfaced to the customer
  // here — the lead is already safely stored, so the response is the same
  // regardless of Telegram/email success or failure.
  return { ok: true, status: "received", requestId: row.id };
}

/** Same canonical creation + delivery pipeline as submitBookNowRequest
 * above, but returns the full stored row (request_code, customer_id, ...)
 * instead of the public API's narrow { requestId } contract — for
 * server-side/internal callers only (e.g. Admin Create Request, which needs
 * the request_code for its own success message and the customer_id to
 * attach an internal note). Never call this from a route that serializes
 * its result straight back to the browser -- ServiceRequestRow includes
 * internal delivery-tracking fields that must never reach an untrusted
 * client. */
export async function submitAdminServiceRequest(
  payload: BookNowPayload,
  options: { source?: string } = {},
): Promise<{ ok: true; row: ServiceRequestRow } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: NOT_CONFIGURED_MESSAGE };

  const created = await createServiceRequest(payload, options);
  if (!created.ok) return { ok: false, message: SUBMISSION_FAILED_MESSAGE };

  const { row } = created;
  await Promise.all([deliverTelegram(row), deliverConfirmationEmail(row)]);
  return { ok: true, row };
}
