import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createServiceRequest, markTelegramFailed, markTelegramSent } from "./repository";
import { formatLeadMessage, isTelegramConfigured, sendTelegramMessage } from "./telegram";
import type { BookNowPayload, SubmissionResult } from "./types";

const NOT_CONFIGURED_MESSAGE =
  "Thanks — we received your request details, but online submission is not connected yet. Apex has not received this request. Please call us directly to reach the team right away.";
const SUBMISSION_FAILED_MESSAGE = "We couldn't submit your request right now. Please try again or call us.";

/** Orchestrates the real Phase 1 flow: validated payload -> Supabase insert
 * (source of truth) -> best-effort Telegram notification -> status update.
 * The database insert is what decides whether the customer's request was
 * "received" — a Telegram outage after a successful insert never changes the
 * response already returned to the browser (see docs/BOOK_NOW_ARCHITECTURE.md). */
export async function submitBookNowRequest(payload: BookNowPayload): Promise<SubmissionResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "not_configured", message: NOT_CONFIGURED_MESSAGE };

  const created = await createServiceRequest(payload);
  if (!created.ok) return { ok: false, status: "error", message: SUBMISSION_FAILED_MESSAGE };

  const { row } = created;

  if (!isTelegramConfigured()) {
    console.warn("[book_now_telegram_not_configured] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID not set — lead stored, no notification sent.", row.id);
    await markTelegramFailed(row.id, "Telegram not configured");
    return { ok: true, status: "received", requestId: row.id };
  }

  const text = formatLeadMessage({
    requestId: row.id,
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

  // Telegram's outcome is deliberately never surfaced to the customer here —
  // the lead is already safely stored, so the response is the same whether
  // Telegram succeeded or failed. See docs/BOOK_NOW_ARCHITECTURE.md.
  return { ok: true, status: "received", requestId: row.id };
}
