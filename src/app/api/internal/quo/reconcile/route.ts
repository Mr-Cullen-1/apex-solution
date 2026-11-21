import { timingSafeEqual } from "node:crypto";
import { readQuoConfig, requiredSecret } from "@/features/quo/config";
import { QuoError } from "@/features/quo/model";
import { readBody } from "@/features/quo/webhook";
import { listCalls } from "@/features/quo/client";
import { reconcileCalls } from "@/features/quo/reconcile";
import { createRunStore } from "@/features/quo/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const scope = readQuoConfig(), secret = requiredSecret("QUO_RECONCILE_SECRET");
    const auth = request.headers.get("authorization") ?? "";
    const expected = Buffer.from(`Bearer ${secret}`), received = Buffer.from(auth);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const apiKey = requiredSecret("QUO_API_KEY");
    let input: unknown;
    try { input = JSON.parse((await readBody(request, 4096)).toString("utf8")); }
    catch (error) { throw error instanceof QuoError ? error : new QuoError("invalid_payload"); }
    const result = await reconcileCalls(input, {
      scope, store: createRunStore(scope),
      list: value => listCalls({ ...scope, ...value, apiKey }),
    });
    console.info(JSON.stringify({ component: "quo_reconcile", code: result.errorCode ?? result.status, pages: result.pages, calls: result.calls }));
    return Response.json({ ok: result.status !== "failed", ...result }, { status: result.status === "failed" ? 503 : 200 });
  } catch (error) {
    const code = error instanceof QuoError ? error.code : "reconciliation_failed";
    console.error(JSON.stringify({ component: "quo_reconcile", code }));
    const status = code === "run_throttled" ? 429 : code === "run_busy" ? 409 : code === "run_not_found" ? 404 : code === "payload_too_large" ? 413 : ["invalid_payload", "invalid_timestamp", "invalid_window", "invalid_cursor", "invalid_run"].includes(code) ? 400 : 503;
    return Response.json({ ok: false, error: code }, { status, headers: code === "run_throttled" ? { "Retry-After": "5" } : undefined });
  }
}
