import "server-only";
import { createHash } from "node:crypto";
import { normalizeApiCall, object, timestamp, QuoError, type CallEvent, type Scope } from "./model";
import type { CallPage } from "./client";

export type ReconcileInput = { runId?: string; from?: string; to?: string; maxPages: number };
export type RunStatus = "running" | "partial" | "completed" | "failed";
export type RunRecord = {
  id: string; from_at: string; to_at: string; status: RunStatus;
  pages_processed: number; calls_processed: number; next_cursor: string | null;
  page_events: CallEvent[] | null; page_index: number; error_code: string | null;
};
export type RunStore = {
  claim: (input: ReconcileInput) => Promise<RunRecord>;
  stage: (id: string, events: CallEvent[], nextCursor: string | null) => Promise<RunRecord>;
  advance: (id: string) => Promise<RunRecord>;
  release: (id: string, status: "partial" | "failed" | "completed", error?: string) => Promise<RunRecord>;
};
export function parseReconcileInput(value: unknown): ReconcileInput {
  const input = object(value), maxPages = input.maxPages ?? 1;
  if (!Number.isInteger(maxPages) || Number(maxPages) < 1 || Number(maxPages) > 5) throw new QuoError("invalid_window");
  // Progress is server-owned. An arbitrary cursor cannot bypass its history.
  if ("after" in input) throw new QuoError("invalid_cursor");
  if (input.runId !== undefined) {
    if (typeof input.runId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.runId) || input.from !== undefined || input.to !== undefined) throw new QuoError("invalid_run");
    return { runId: input.runId, maxPages: Number(maxPages) };
  }
  const from = timestamp(input.from), to = timestamp(input.to);
  const span = Date.parse(to) - Date.parse(from);
  if (span <= 0 || span > 31 * 86400000) throw new QuoError("invalid_window");
  return { from, to, maxPages: Number(maxPages) };
}

export async function reconcileCalls(value: unknown, deps: {
  scope: Scope; store: RunStore;
  list: (input: { from: string; to: string; after: string | null }) => Promise<CallPage>;
  now?: () => number;
}) {
  const now = deps.now ?? Date.now, started = now();
  const input = parseReconcileInput(value);
  let run = await deps.store.claim(input);
  const initialPages = run.pages_processed;
  let errorCode: string | undefined;
  if (run.status !== "completed") {
    try {
      while (run.status !== "completed" && run.pages_processed - initialPages < input.maxPages) {
        if (now() - started >= 45000) break;
        if (run.page_events === null) {
          // Allow up to three API attempts and one stage RPC before the deadline.
          if (now() - started >= 20000) break;
          const page = await deps.list({ from: run.from_at, to: run.to_at, after: run.next_cursor });
          const events: CallEvent[] = [];
          for (const raw of page.data) {
            const call = normalizeApiCall(raw, deps.scope);
            if (call) events.push({ eventId: "reconcile_" + createHash("sha256").update(JSON.stringify(call)).digest("hex"), eventType: "api.snapshot", source: "reconciliation", call });
          }
          // Store only normalized operational fields, never raw API bodies.
          run = await deps.store.stage(run.id, events, page.nextCursor);
        } else {
          // One transaction ingests the call AND advances its durable page index.
          run = await deps.store.advance(run.id);
        }
      }
    } catch (error) {
      errorCode = error instanceof QuoError ? error.code : "reconciliation_failed";
    }
    // Release cannot overwrite progress with stale in-memory counters.
    run = await deps.store.release(run.id, errorCode ? "failed" : run.status === "completed" ? "completed" : "partial", errorCode);
  }
  return {
    runId: run.id, status: run.status, pages: run.pages_processed, calls: run.calls_processed,
    nextCursor: run.next_cursor, pageIndex: run.page_index,
    ...(run.error_code ? { errorCode: run.error_code } : {}),
  };
}
