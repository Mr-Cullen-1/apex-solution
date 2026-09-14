import { primaryServices } from "@/content/services";
import type { ApexCategoryId, ChatAssistantReply, ChatIntent, ChatWireMessage } from "./types";

// Shared between the client (composer maxLength, client-side history
// trimming) and the server (authoritative enforcement) — see instruction:
// "Do not trust the client to enforce these limits. The server is
// authoritative." The client using the same constants is a convenience,
// not the security boundary; normalize/validate below are what actually
// enforce it on every request.
export const CHAT_MAX_MESSAGES = 10;
export const CHAT_MAX_MESSAGE_LENGTH = 800;
export const CHAT_MAX_REPLY_LENGTH = 1200;

const VALID_INTENTS: ReadonlySet<string> = new Set<ChatIntent>([
  "service_question",
  "booking",
  "call",
  "off_topic",
  "unknown",
]);

// Derived from the real catalog rather than a second hand-maintained list —
// if content/services.ts ever gains/loses a top-level category, this stays
// correct without a separate edit.
const VALID_CATEGORY_IDS: ReadonlySet<string> = new Set(primaryServices.map((category) => category.id));

export type ChatRequestPayload = { messages: ChatWireMessage[] };
export type ChatRequestErrors = { form?: string };

/** unknown -> ChatRequestPayload. Defensive coercion only: drops any message
 * with a role other than "user"/"assistant" or blank content, trims and
 * truncates surviving content, and keeps only the most recent
 * CHAT_MAX_MESSAGES entries. Mirrors features/booking/model.ts's
 * normalize-then-validate split. */
export function normalizeChatPayload(value: unknown): ChatRequestPayload {
  const input = value && typeof value === "object" ? (value as { messages?: unknown }) : {};
  const rawMessages = Array.isArray(input.messages) ? input.messages : [];

  const messages = rawMessages
    .map((item): ChatWireMessage | null => {
      if (!item || typeof item !== "object") return null;
      const { role, content } = item as { role?: unknown; content?: unknown };
      if (role !== "user" && role !== "assistant") return null;
      const trimmed = typeof content === "string" ? content.trim() : "";
      if (!trimmed) return null;
      return { role, content: trimmed.slice(0, CHAT_MAX_MESSAGE_LENGTH) };
    })
    .filter((message): message is ChatWireMessage => message !== null)
    .slice(-CHAT_MAX_MESSAGES);

  return { messages };
}

/** Final shape check after normalization. The one thing normalize()
 * deliberately does NOT silently fix: the conversation must end on a user
 * message, since that's what the model is actually being asked to answer. */
export function validateChatPayload(payload: ChatRequestPayload): ChatRequestErrors {
  const errors: ChatRequestErrors = {};
  if (!payload.messages.length) {
    errors.form = "Enter a message.";
    return errors;
  }
  const last = payload.messages[payload.messages.length - 1];
  if (last.role !== "user") errors.form = "The latest message must be from the visitor.";
  return errors;
}

/** unknown (parsed Gemini structured-output JSON) -> ChatAssistantReply, or
 * null if the shape can't be trusted. The JSON Schema passed to Gemini
 * constrains generation, but per-repository convention that is never the
 * only validation — this re-validates the parsed result independently, the
 * same way client-declared shapes are never trusted elsewhere in this repo
 * (final "response policy check" per docs/CHAT_ARCHITECTURE.md: bounded
 * length, canonical intent, canonical category). `intent`/`categoryId`
 * degrade to a safe default rather than failing the whole reply — only a
 * missing/blank `message` is fatal, since that's the one field actually
 * shown to the visitor.
 *
 * `safety`/`emergencyKind` are always "normal"/null here — Gemini's own
 * response_format schema doesn't include them at all. Emergency status is
 * decided exclusively by the deterministic guard in safety.ts, before
 * Gemini is ever called; a call that reaches this function already passed
 * that guard. */
export function normalizeAssistantReply(value: unknown): ChatAssistantReply | null {
  if (!value || typeof value !== "object") return null;
  const { message, intent, categoryId } = value as Record<string, unknown>;

  const trimmedMessage = typeof message === "string" ? message.trim().slice(0, CHAT_MAX_REPLY_LENGTH) : "";
  if (!trimmedMessage) return null;

  const safeIntent: ChatIntent = typeof intent === "string" && VALID_INTENTS.has(intent) ? (intent as ChatIntent) : "unknown";
  const safeCategoryId: ApexCategoryId | null =
    typeof categoryId === "string" && VALID_CATEGORY_IDS.has(categoryId) ? (categoryId as ApexCategoryId) : null;

  return { message: trimmedMessage, intent: safeIntent, categoryId: safeCategoryId, safety: "normal", emergencyKind: null };
}
