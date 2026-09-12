import "server-only";
import type { TelegramDeliveryResult } from "./types";

// Server-only Telegram delivery for Book Now leads. The bot is only a
// sending identity for Phase 1 — no webhook, no long polling, no separate
// bot process. This module just calls Telegram Bot API `sendMessage`
// directly from the Next.js server, the same way src/lib/supabase/server.ts
// is the one place Supabase credentials are read.

const TELEGRAM_API_TIMEOUT_MS = 8_000;
// Telegram's hard limit for a sendMessage text body.
const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

type TelegramConfig = { botToken: string; chatId: string; threadId?: string };

function readTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return null;
  const threadId = process.env.TELEGRAM_THREAD_ID;
  return { botToken, chatId, threadId: threadId || undefined };
}

export function isTelegramConfigured(): boolean {
  return readTelegramConfig() !== null;
}

export type LeadForTelegram = {
  requestId: string;
  fullName: string;
  phone: string;
  email: string | null;
  zipCode: string;
  categoryLabel: string | null;
  serviceLabel: string | null;
  issue: string | null;
  message: string;
  smsConsent: boolean;
  /** ISO timestamp from the Supabase row (`created_at`) — the database
   * timestamp is canonical; this is only ever used for display. */
  createdAt: string;
};

/** The business operates exclusively across NY/NJ/CT/MA/RI (see
 * src/content/company.ts `serviceRegion`) — all US-Eastern — so
 * America/New_York is a real, established business timezone, not an
 * invented display default. */
const BUSINESS_TIME_ZONE = "America/New_York";

function formatTimestamp(iso: string): string {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: BUSINESS_TIME_ZONE,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
    return `${formatted} ET`;
  } catch {
    return iso;
  }
}

function serviceLine(lead: LeadForTelegram): string {
  if (lead.serviceLabel && lead.categoryLabel) return `${lead.categoryLabel} — ${lead.serviceLabel}`;
  return lead.categoryLabel ?? lead.serviceLabel ?? "Not specified";
}

/** Builds the lines of the operational lead message. Exported separately
 * from the length-guarding wrapper below so the "only shorten the customer
 * message, never name/phone/etc." rule has one obvious place to look. */
function buildMessageLines(lead: LeadForTelegram, message: string): string[] {
  const lines = [
    "🔵 NEW SERVICE REQUEST",
    "",
    "👤 Full Name:",
    lead.fullName,
    "",
    "📞 Phone:",
    lead.phone,
    "",
    "📧 Email:",
    lead.email || "Not provided",
    "",
    "📍 ZIP Code:",
    lead.zipCode,
    "",
    "🛠 Service:",
    serviceLine(lead),
  ];
  if (lead.issue) lines.push("", "🔎 Issue:", lead.issue);
  lines.push(
    "",
    "📝 Customer Request:",
    message,
    "",
    "💬 SMS Consent:",
    lead.smsConsent ? "Yes" : "No",
    "",
    "🌐 Source:",
    "Apex Home Services — Book Now",
    "",
    "🆔 Request ID:",
    lead.requestId,
    "",
    "🕒 Submitted:",
    formatTimestamp(lead.createdAt),
  );
  return lines;
}

/** Plain text, deliberately no `parse_mode` — a customer-controlled field
 * (name, message) could contain characters that break Markdown/HTML parsing
 * (unescaped `<`, `&`, `*`, `_`, …), and Telegram would reject or mangle the
 * whole message rather than just that field. Plain text always renders
 * exactly what was sent, emoji included. */
export function formatLeadMessage(lead: LeadForTelegram): string {
  const full = buildMessageLines(lead, lead.message).join("\n");
  if (full.length <= TELEGRAM_MAX_MESSAGE_LENGTH) return full;

  // Only the customer's free-text message is ever shortened to fit — name,
  // phone, ZIP, email, service/issue context, request ID, and timestamp are
  // never truncated. The full, untouched message always remains in Supabase
  // regardless of what fits here.
  const overage = full.length - TELEGRAM_MAX_MESSAGE_LENGTH;
  const suffix = "… (truncated — full text saved)";
  const keep = Math.max(0, lead.message.length - overage - suffix.length);
  const shortenedMessage = `${lead.message.slice(0, keep)}${suffix}`;
  return buildMessageLines(lead, shortenedMessage).join("\n");
}

function sanitizeTelegramError(raw: string | null | undefined): string {
  if (!raw) return "Unknown Telegram error";
  const config = readTelegramConfig();
  const withoutToken = config?.botToken ? raw.split(config.botToken).join("[redacted]") : raw;
  return withoutToken.slice(0, 500);
}

/** Calls Telegram Bot API `sendMessage` directly — no SDK, no queue, no
 * separate bot process. Returns `not_configured` (never throws) when the env
 * vars are absent, so the caller can decide how to record that outcome. Any
 * network/HTTP/parse failure is caught and returned as `failed` with a
 * sanitized, bounded error summary — the bot token is never included. */
export async function sendTelegramMessage(text: string): Promise<TelegramDeliveryResult> {
  const config = readTelegramConfig();
  if (!config) return { status: "not_configured" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_API_TIMEOUT_MS);
  try {
    const body: { chat_id: string; text: string; message_thread_id?: number } = { chat_id: config.chatId, text };
    if (config.threadId) {
      const threadId = Number(config.threadId);
      if (Number.isFinite(threadId)) body.message_thread_id = threadId;
    }

    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => null)) as { ok?: boolean; result?: { message_id?: number }; description?: string } | null;
    if (!response.ok || !data?.ok) {
      return { status: "failed", error: sanitizeTelegramError(data?.description ?? `HTTP ${response.status}`) };
    }
    const messageId = data.result?.message_id;
    if (typeof messageId !== "number") return { status: "failed", error: "Telegram response did not include a message_id." };
    return { status: "sent", messageId };
  } catch (err) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    const message = isAbort ? "Telegram request timed out." : err instanceof Error ? err.message : "Unknown Telegram error";
    return { status: "failed", error: sanitizeTelegramError(message) };
  } finally {
    clearTimeout(timeout);
  }
}
