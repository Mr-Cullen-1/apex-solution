import "server-only";
import { GoogleGenAI } from "@google/genai";
import { normalizeAssistantReply } from "./model";
import { SYSTEM_INSTRUCTION } from "./system-prompt";
import type { ChatAssistantReply, ChatWireMessage } from "./types";

// Server-only Gemini access. Never import this from a client component or
// from any module a client component could pull in — the `server-only`
// import above makes that a build error rather than a silent leak, same
// convention as lib/supabase/server.ts.
//
// Lightweight, low-latency model only: this handles short support
// questions and simple service classification, not deep reasoning — see
// docs/CHAT_ARCHITECTURE.md for why gemini-3.5-flash-lite was chosen.
const MODEL = "gemini-3.5-flash-lite";

// Modest, single-turn ceiling — a customer must never be stuck waiting
// indefinitely on a chat reply. One retry only (network hiccup, not an
// application-level retry loop).
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 1;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    message: { type: "string" },
    intent: {
      type: "string",
      enum: ["service_question", "booking", "call", "off_topic", "unknown"],
    },
    categoryId: {
      type: "string",
      enum: ["appliance-repair", "cooling", "heating", "water-heater-repair"],
      nullable: true,
    },
  },
  required: ["message", "intent", "categoryId"],
};

function readApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  return key && key.length > 0 ? key : null;
}

export function isGeminiConfigured(): boolean {
  return readApiKey() !== null;
}

let cachedClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (cachedClient) return cachedClient;
  const apiKey = readApiKey();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
}

export type AssistantReplyOutcome = { status: "answered"; reply: ChatAssistantReply } | { status: "unavailable" };

/** Stateless by design (Phase 2 MVP — no previous_interaction_id, `store:
 * false`): the caller passes the whole bounded history each turn instead of
 * relying on Gemini-side conversation retention. No tools are configured —
 * this is a text-only support interaction, nothing the model can act on
 * directly. */
export async function requestAssistantReply(messages: ChatWireMessage[]): Promise<AssistantReplyOutcome> {
  const client = getClient();

  const input = messages.map((message) =>
    message.role === "user"
      ? { type: "user_input" as const, content: [{ type: "text" as const, text: message.content }] }
      : { type: "model_output" as const, content: [{ type: "text" as const, text: message.content }] },
  );

  try {
    const interaction = await client.interactions.create(
      {
        model: MODEL,
        input,
        // Kept as its own top-level field, never interpolated into `input`
        // — visitor text must never be mistaken for an instruction.
        system_instruction: SYSTEM_INSTRUCTION,
        store: false,
        response_format: { type: "text", mime_type: "application/json", schema: RESPONSE_SCHEMA },
        generation_config: { thinking_level: "minimal" },
      },
      { timeout: REQUEST_TIMEOUT_MS, maxRetries: MAX_RETRIES },
    );

    if (interaction.status !== "completed" || !interaction.output_text) {
      console.error("[chat_gemini_request_failed]", interaction.status);
      return { status: "unavailable" };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(interaction.output_text);
    } catch {
      console.error("[chat_gemini_response_invalid]", "unparsable_json");
      return { status: "unavailable" };
    }

    const reply = normalizeAssistantReply(parsed);
    if (!reply) {
      console.error("[chat_gemini_response_invalid]", "shape_mismatch");
      return { status: "unavailable" };
    }

    return { status: "answered", reply };
  } catch (err) {
    console.error("[chat_gemini_request_failed]", err instanceof Error ? err.message : "unknown_error");
    return { status: "unavailable" };
  }
}
