import "server-only";

export const QUO_VERSION = "2026-03-30";
export type Scope = { orgId: string; phoneNumberId: string };
export class QuoError extends Error {
  constructor(public readonly code: string) { super(code); }
}
export type CallSnapshot = {
  org_id: string; quo_call_id: string; phone_number_id: string;
  caller_number: string | null; direction: "incoming"; status: string;
  outcome: "answered" | "missed" | "unknown" | "failed" | "forwarded" | "abandoned" | "ai_handled";
  duration_seconds: number | null; answered_at: string | null; started_at: string;
  completed_at: string | null; source_updated_at: string; phase: number;
  has_voicemail: boolean | null; metadata: Record<string, string>;
};
export type CallEvent = { eventId: string; eventType: string; call: CallSnapshot; deliveryId?: string; source: "webhook" | "reconciliation" };
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new QuoError("invalid_payload");
  return value as Record<string, unknown>;
}
export function identifier(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,160}$/.test(value)) throw new QuoError("invalid_identifier");
  return value;
}
export function timestamp(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value) || !Number.isFinite(Date.parse(value))) throw new QuoError("invalid_timestamp");
  return new Date(value).toISOString();
}
function optionalTime(value: unknown) { return value == null ? null : timestamp(value); }
function duration(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 31536000) throw new QuoError("invalid_duration");
  return value;
}
function caller(numbers: unknown, available: boolean) {
  if (!available) return { number: null, resolution: "unavailable" };
  if (!Array.isArray(numbers) || numbers.length > 100) throw new QuoError("invalid_participants");
  if (numbers.some(n => typeof n !== "string")) throw new QuoError("invalid_participants");
  // Count possible external identities before filtering withheld/short numbers.
  const unique = [...new Set(numbers as string[])];
  if (unique.length === 0) return { number: null, resolution: "unavailable" };
  if (unique.length > 1) return { number: null, resolution: "ambiguous" };
  if (!/^\+[1-9]\d{1,14}$/.test(unique[0])) return { number: null, resolution: "withheld" };
  return { number: unique[0], resolution: "single_external_participant" };
}
function snapshot(resource: Record<string, unknown>, scope: Scope, status: string, phase: number, identity: ReturnType<typeof caller>, voicemail: boolean | null, fallbackTime?: string): CallSnapshot {
  const answered = optionalTime(resource.answeredAt);
  const outcome = status === "ai-handled" || resource.aiHandled ? "ai_handled"
    : status === "forwarded" ? "forwarded"
    : status === "answered" || answered ? "answered"
    : ["missed", "no-answer", "unanswered"].includes(status) ? "missed"
    : ["failed", "busy", "canceled"].includes(status) ? "failed"
    : status === "abandoned" ? "abandoned" : "unknown";
  return {
    org_id: scope.orgId, quo_call_id: identifier(resource.id), phone_number_id: scope.phoneNumberId,
    caller_number: identity.number, direction: "incoming", status, outcome,
    duration_seconds: duration(resource.duration), answered_at: answered, started_at: timestamp(resource.createdAt),
    completed_at: optionalTime(resource.completedAt), source_updated_at: timestamp(resource.updatedAt ?? fallbackTime ?? resource.createdAt),
    phase, has_voicemail: voicemail, metadata: { api_version: QUO_VERSION, caller_resolution: identity.resolution },
  };
}
export function parseWebhook(value: unknown, scope: Scope): Omit<CallEvent, "source" | "deliveryId"> | null {
  const envelope = object(value);
  if (envelope.apiVersion !== QUO_VERSION) throw new QuoError("unsupported_version");
  const data = object(envelope.data), context = object(data.context);
  if (context.orgId !== scope.orgId) throw new QuoError("scope_mismatch");
  if (!["call.answered", "call.completed", "call.missed"].includes(String(envelope.type))) return null;
  if (context.phoneNumberId !== scope.phoneNumberId) throw new QuoError("scope_mismatch");
  const r = object(data.resource), type = String(envelope.type);
  if (type !== "call.missed") {
    if (r.direction === "outgoing") return null;
    if (r.direction !== "incoming") throw new QuoError("invalid_direction");
  }
  const eventTime = timestamp(envelope.createdAt);
  const participants = object(context.participants);
  if (!["available", "unavailable"].includes(String(participants.resolution))) throw new QuoError("invalid_participants");
  const phone = caller(participants.external, participants.resolution === "available");
  const status = type === "call.missed" ? "missed" : type === "call.answered" ? "answered" : r.status;
  if (type === "call.completed" && (!["answered", "unanswered", "failed", "forwarded", "abandoned", "ai-handled", "unknown"].includes(String(status)) || typeof r.hasVoicemail !== "boolean")) throw new QuoError("invalid_status");
  // Minimal missed/answered payloads cannot replace terminal duration/voicemail facts.
  const fields = type === "call.completed" ? r : { id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt, answeredAt: type === "call.answered" ? r.answeredAt : null };
  return { eventId: identifier(envelope.id), eventType: type, call: snapshot(fields, scope, String(status), type === "call.completed" ? 3 : type === "call.missed" ? 2 : 1, phone, type === "call.completed" ? r.hasVoicemail as boolean : null, eventTime) };
}
export function normalizeApiCall(value: unknown, scope: Scope): CallSnapshot | null {
  const r = object(value);
  if (r.phoneNumberId !== scope.phoneNumberId) throw new QuoError("scope_mismatch");
  if (r.direction === "outgoing") return null;
  if (r.direction !== "incoming") throw new QuoError("invalid_direction");
  const statuses = ["queued", "initiated", "ringing", "in-progress", "completed", "busy", "failed", "no-answer", "canceled", "missed", "answered", "forwarded", "abandoned"];
  if (typeof r.status !== "string" || !statuses.includes(r.status)) throw new QuoError("invalid_status");
  if (!Array.isArray(r.participants)) throw new QuoError("invalid_participants");
  const phone = caller(r.participants.filter(p => object(p).actorId === null).map(p => object(p).phoneNumber), true);
  const terminal = !["queued", "initiated", "ringing", "in-progress", "answered"].includes(r.status) || r.completedAt != null;
  // GET explicitly requests include=voicemail; absent means none, not omitted expansion.
  if (r.voicemail != null) object(r.voicemail);
  return snapshot(r, scope, r.status, terminal ? 3 : 1, phone, r.voicemail != null);
}
