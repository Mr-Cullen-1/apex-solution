import "server-only";
import { parseWebhook, QuoError, type CallEvent, type Scope } from "./model";
import { verifySignature } from "./signature";

export type PersistResult = "processed" | "duplicate" | "stale";
export async function readBody(request: Request, limit: number): Promise<Buffer> {
  const reader = request.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new QuoError("payload_too_large");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  } finally { reader.releaseLock(); }
}

export async function handleWebhook(request: Request, deps: {
  scope: Scope; key: string;
  persist: (event: CallEvent) => Promise<PersistResult>;
  log: (code: string) => void;
}): Promise<Response> {
  let event: ReturnType<typeof parseWebhook>;
  try {
    const raw = await readBody(request, 65536);
    if (!verifySignature(raw, request.headers, deps.key)) {
      deps.log("invalid_signature");
      return Response.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }
    event = parseWebhook(JSON.parse(raw.toString("utf8")), deps.scope);
  } catch (error) {
    const code = error instanceof QuoError ? error.code : "invalid_payload";
    deps.log(code);
    return Response.json({ ok: false, error: code }, { status: code === "payload_too_large" ? 413 : code === "scope_mismatch" ? 403 : 400 });
  }
  if (!event) {
    deps.log("ignored");
    return Response.json({ ok: true, status: "ignored" });
  }
  try {
    const status = await deps.persist({ ...event, source: "webhook", deliveryId: request.headers.get("webhook-id")! });
    deps.log(status);
    return Response.json({ ok: true, status });
  } catch {
    // Never log provider, database, or transport error messages (may contain PII).
    deps.log("database_unavailable");
    return Response.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }
}
