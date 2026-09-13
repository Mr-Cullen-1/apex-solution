export type ActivityEventType =
  | "request_created"
  | "request_status_changed"
  | "admin_note_added"
  | "telegram_sent"
  | "telegram_failed"
  | "email_sent"
  | "email_failed";

export type ActivityEvent = {
  id: string;
  customerId: string;
  serviceRequestId: string | null;
  actorAdminUserId: string | null;
  /** Resolved from a single listAdmins()-derived map, never a per-event
   * Supabase Auth Admin API call — see repository.ts. `null` for a
   * system-generated event (e.g. request_created) or an admin no longer
   * on the roster. */
  actorEmail: string | null;
  eventType: ActivityEventType;
  note: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

export type ListActivityResult = { ok: true; events: ActivityEvent[] } | { ok: false; message: string };

export type AddNoteResult = { ok: true; event: ActivityEvent } | { ok: false; status: "invalid"; message: string } | { ok: false; status: "error"; message: string };
