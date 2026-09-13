import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { listAdmins } from "@/features/admin/admins/repository";
import type { ActivityEvent, AddNoteResult, ListActivityResult } from "./types";

const LIST_FAILED_MESSAGE = "Couldn't load activity history. Try again.";
const NOTE_FAILED_MESSAGE = "The note couldn't be saved right now. Please try again.";

type ActivityRow = {
  id: string;
  customer_id: string;
  service_request_id: string | null;
  actor_admin_user_id: string | null;
  event_type: ActivityEvent["eventType"];
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const ACTIVITY_COLUMNS = "id, customer_id, service_request_id, actor_admin_user_id, event_type, note, metadata, created_at";

/** Resolves admin UUID -> email once via the existing admin roster
 * (already small — Phase 2 has no bulk-admin scenario) rather than one
 * Supabase Auth Admin API call per activity row. */
async function buildActorEmailMap(): Promise<Map<string, string>> {
  const result = await listAdmins();
  if (!result.ok) return new Map();
  return new Map(result.admins.map((admin) => [admin.userId, admin.email]));
}

function toActivityEvent(row: ActivityRow, actorEmails: Map<string, string>): ActivityEvent {
  return {
    id: row.id,
    customerId: row.customer_id,
    serviceRequestId: row.service_request_id,
    actorAdminUserId: row.actor_admin_user_id,
    actorEmail: row.actor_admin_user_id ? (actorEmails.get(row.actor_admin_user_id) ?? null) : null,
    eventType: row.event_type,
    note: row.note,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function listActivityForCustomer(customerId: string, limit = 100): Promise<ListActivityResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const [{ data, error }, actorEmails] = await Promise.all([
      supabase.from("customer_activity_events").select(ACTIVITY_COLUMNS).eq("customer_id", customerId).order("created_at", { ascending: false }).limit(limit),
      buildActorEmailMap(),
    ]);
    if (error) {
      console.error("[admin_activity_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }
    return { ok: true, events: ((data ?? []) as ActivityRow[]).map((row) => toActivityEvent(row, actorEmails)) };
  } catch (err) {
    console.error("[admin_activity_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

export async function listActivityForRequest(serviceRequestId: string): Promise<ListActivityResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const [{ data, error }, actorEmails] = await Promise.all([
      supabase.from("customer_activity_events").select(ACTIVITY_COLUMNS).eq("service_request_id", serviceRequestId).order("created_at", { ascending: false }),
      buildActorEmailMap(),
    ]);
    if (error) {
      console.error("[admin_activity_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }
    return { ok: true, events: ((data ?? []) as ActivityRow[]).map((row) => toActivityEvent(row, actorEmails)) };
  } catch (err) {
    console.error("[admin_activity_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: NOTE_FAILED_MESSAGE };
  }
}

/** Adds one internal note via the admin_add_note RPC (append-only —
 * mirrors the review-moderation RPC pattern). `serviceRequestId` is
 * optional: null scopes the note to the customer generally, set scopes it
 * to one specific request. */
export async function addNote(customerId: string, serviceRequestId: string | null, adminUserId: string, text: string): Promise<AddNoteResult> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, status: "invalid", message: "Enter a note." };
  if (trimmed.length > 2000) return { ok: false, status: "invalid", message: "Note is too long (2000 characters max)." };
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: NOTE_FAILED_MESSAGE };

  try {
    const supabase = getSupabaseServerClient();
    const [{ data, error }, actorEmails] = await Promise.all([
      supabase.rpc("admin_add_note", { p_customer_id: customerId, p_service_request_id: serviceRequestId, p_admin_user_id: adminUserId, p_note: trimmed }),
      buildActorEmailMap(),
    ]);
    if (error || !data) {
      console.error("[admin_note_add_failed]", error?.code, error?.message);
      return { ok: false, status: "error", message: NOTE_FAILED_MESSAGE };
    }
    return { ok: true, event: toActivityEvent(data as ActivityRow, actorEmails) };
  } catch (err) {
    console.error("[admin_note_add_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: NOTE_FAILED_MESSAGE };
  }
}
