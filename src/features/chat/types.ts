export type ChatRole = "user" | "assistant";

/** `intent`/`categoryId`/`safety`/`emergencyKind` are only ever set on an
 * assistant message, and only ever copied verbatim from a validated
 * POST /api/chat response (see chat-context.tsx) — never inferred
 * client-side from `content`, and never present on a locally-authored
 * fallback message (rate-limited/network/unavailable) or a user message.
 * Phase 4's action mapping (features/chat/actions.ts) treats "field is
 * undefined" as "no validated metadata to act on." */
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  intent?: ChatIntent;
  categoryId?: ApexCategoryId | null;
  safety?: ChatSafety;
  emergencyKind?: EmergencyKind | null;
};

/** What the browser actually sends to POST /api/chat — deliberately smaller
 * than ChatMessage (no `id`, no anything the model doesn't need). */
export type ChatWireMessage = {
  role: ChatRole;
  content: string;
};

export type ChatIntent = "service_question" | "booking" | "call" | "off_topic" | "unknown";

/** Mirrors the four real top-level category ids from content/services.ts.
 * Kept as its own literal union (rather than `string`) so a malformed or
 * unrecognized value from the model can never silently pass through. */
export type ApexCategoryId = "appliance-repair" | "cooling" | "heating" | "water-heater-repair";

/** "emergency" is set only by the deterministic guard in safety.ts — Gemini
 * never sets this itself (its response_format schema doesn't even include
 * it). See docs/CHAT_ARCHITECTURE.md. */
export type ChatSafety = "normal" | "emergency";

export type EmergencyKind = "gas" | "carbon_monoxide" | "fire_smoke" | "electrical" | "water_electrical";

/** The server-validated shape returned by the assistant. `chat-context.tsx`
 * copies every field of this verbatim onto the resulting `ChatMessage`,
 * and `features/chat/actions.ts` maps `intent`/`categoryId`/`safety` to the
 * UI's conversion actions — see docs/CHAT_ARCHITECTURE.md. */
export type ChatAssistantReply = {
  message: string;
  intent: ChatIntent;
  categoryId: ApexCategoryId | null;
  safety: ChatSafety;
  emergencyKind: EmergencyKind | null;
};
