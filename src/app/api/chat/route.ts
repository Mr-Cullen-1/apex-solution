import { isGeminiConfigured, requestAssistantReply } from "@/features/chat/gemini";
import { normalizeChatPayload, validateChatPayload } from "@/features/chat/model";
import { isChatRateLimited } from "@/features/chat/rate-limit";
import { buildEmergencyReply, detectEmergency } from "@/features/chat/safety";

// Small text-chat payload only — no attachments, no application state.
const MAX_REQUEST_BYTES = 16_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ ok: false, status: "invalid", errors: { form: "The request is too large." } }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, status: "invalid", errors: { form: "The request body must be valid JSON." } }, { status: 400 });
  }

  const payload = normalizeChatPayload(body);
  const errors = validateChatPayload(payload);
  if (Object.keys(errors).length) {
    console.warn("[chat_request_invalid]", Object.keys(errors));
    return Response.json({ ok: false, status: "invalid", errors }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  // Deterministic safety layer: checked before rate limiting and before
  // Gemini configuration, and never routed through Gemini — a
  // life-safety response must never depend on either being available. See
  // features/chat/safety.ts and docs/CHAT_ARCHITECTURE.md. Logs only the
  // matched category, never the visitor's message.
  const latestMessage = payload.messages[payload.messages.length - 1].content;
  const emergencyKind = detectEmergency(latestMessage);
  if (emergencyKind) {
    console.warn(`[chat_emergency_guard_triggered] kind=${emergencyKind}`);
    return Response.json(
      { ok: true, status: "answered", reply: buildEmergencyReply(emergencyKind) },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  // Rate limit before the costly Gemini call — see features/chat/rate-limit.ts.
  if (await isChatRateLimited(request)) {
    console.warn("[chat_rate_limited]");
    return Response.json({ ok: false, status: "rate_limited" }, { status: 429, headers: { "Cache-Control": "no-store" } });
  }

  if (!isGeminiConfigured()) {
    console.warn("[chat_gemini_not_configured]");
    return Response.json({ ok: false, status: "not_configured" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const result = await requestAssistantReply(payload.messages);
  if (result.status !== "answered") {
    return Response.json({ ok: false, status: "unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json(
    { ok: true, status: "answered", reply: result.reply },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
