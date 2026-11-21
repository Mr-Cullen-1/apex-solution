import "server-only";
import { randomUUID } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { QuoError, type CallEvent, type Scope } from "./model";
import type { RunRecord, RunStore } from "./reconcile";
import type { PersistResult } from "./webhook";

export async function persistCall(event: CallEvent): Promise<PersistResult> {
  const { data, error } = await getSupabaseServerClient().rpc("quo_ingest_call", { p_event: event }).abortSignal(AbortSignal.timeout(5000));
  if (error || !["processed", "duplicate", "stale"].includes(data)) throw new QuoError("database_unavailable");
  return data as PersistResult;
}
export function createRunStore(scope: Scope): RunStore {
  const owner = randomUUID();
  async function rpc(name: string, args: Record<string, unknown>): Promise<RunRecord> {
    const { data, error } = await getSupabaseServerClient().rpc(name, { p_scope: scope, p_owner: owner, ...args }).abortSignal(AbortSignal.timeout(5000));
    if (error) {
      const known = ["run_busy", "run_throttled", "run_not_found", "lease_lost", "cursor_loop", "cursor_history_limit", "invalid_page", "invalid_window"];
      throw new QuoError(known.includes(error.message) ? error.message : "database_unavailable");
    }
    if (!data || typeof data.id !== "string" || !["running", "partial", "completed", "failed"].includes(data.status)) throw new QuoError("database_unavailable");
    return data as RunRecord;
  }
  return {
    claim: input => rpc("quo_claim_run", { p_run_id: input.runId ?? null, p_from: input.from ?? null, p_to: input.to ?? null }),
    stage: (id, events, nextCursor) => rpc("quo_stage_page", { p_run_id: id, p_events: events, p_next_cursor: nextCursor }),
    advance: id => rpc("quo_advance_run", { p_run_id: id }),
    release: (id, status, error) => rpc("quo_release_run", { p_run_id: id, p_status: status, p_error: error ?? null }),
  };
}
