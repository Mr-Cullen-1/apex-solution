import type { ApexCategoryId, ChatIntent, ChatSafety } from "./types";

export type ChatAction = { type: "book"; categoryId: ApexCategoryId | null; label: string } | { type: "call"; label: string };

// Centralized, deliberately short CTA wording — not derived from
// content/services.ts's full category names, since a chat action label
// needs to read as an action ("Book Cooling Service"), not a category name
// ("Cooling"). Kept here, not duplicated elsewhere.
const CATEGORY_BOOKING_LABEL: Record<ApexCategoryId, string> = {
  cooling: "Book Cooling Service",
  heating: "Book Heating Service",
  "appliance-repair": "Book Appliance Repair",
  "water-heater-repair": "Book Water Heater Service",
};

const CALL_ACTION: ChatAction = { type: "call", label: "Call Apex" };

function bookAction(categoryId: ApexCategoryId | null): ChatAction {
  return { type: "book", categoryId, label: categoryId ? CATEGORY_BOOKING_LABEL[categoryId] : "Book a Service" };
}

/**
 * Pure, deterministic mapping from validated assistant metadata to the
 * conversion actions the UI is allowed to render under that message.
 * Gemini never chooses a label, a categoryId it didn't already return
 * through the server-validated API response, or an action shape — this is
 * the only place that decision is made, and the input here must already be
 * validated metadata (see ChatMessage's doc comment in types.ts).
 *
 * Rules (see docs/CHAT_ARCHITECTURE.md for the full rationale):
 * - "emergency" safety always wins: zero conversion actions, ever — the
 *   emergency instructions are the only thing that message should say.
 * - "booking"/"call" intents render their obvious action(s).
 * - "service_question" only renders once a category is actually known —
 *   a vague question gets no CTA rather than a generic, presumptuous one.
 * - "off_topic" and "unknown" (without a known category) render nothing —
 *   no CTA is better than an irrelevant one.
 */
export function getChatActions({
  intent,
  categoryId,
  safety,
}: {
  intent: ChatIntent;
  categoryId: ApexCategoryId | null;
  safety: ChatSafety;
}): ChatAction[] {
  if (safety === "emergency") return [];

  switch (intent) {
    case "booking":
      return [bookAction(categoryId), CALL_ACTION];
    case "call":
      return [CALL_ACTION];
    case "service_question":
      return categoryId ? [bookAction(categoryId), CALL_ACTION] : [];
    case "unknown":
      return categoryId ? [bookAction(categoryId)] : [];
    case "off_topic":
    default:
      return [];
  }
}
