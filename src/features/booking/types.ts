export type BookNowDraft = {
  fullName: string;
  phone: string;
  email: string;
  zipCode: string;
  message: string;
  serviceTextConsent: boolean;
};

export type BookNowPayload = BookNowDraft & {
  categoryId: string;
  serviceId: string;
  offer: boolean;
  /** Short free-form context tag. Today only ever set to "Other" by the
   * symptom-grid "Other" card; empty otherwise. Not customer-typed. */
  issue: string;
  /** Originating route (e.g. "/services/heating"), captured client-side at
   * submit time via `window.location.pathname`. Never the full URL/query. */
  sourcePath: string;
};

export type BookNowErrors = Partial<Record<keyof BookNowDraft | "form", string>>;

export type SubmissionResult =
  | { ok: true; status: "received"; requestId: string }
  | { ok: false; status: "invalid"; errors: BookNowErrors }
  | { ok: false; status: "not_configured"; message: string }
  | { ok: false; status: "error"; message: string };

export type TelegramDeliveryResult =
  | { status: "sent"; messageId: number }
  | { status: "failed"; error: string }
  | { status: "not_configured" };

/** Resend's message id is a string (a UUID-like value), unlike Telegram's
 * numeric message_id — these are deliberately separate result types rather
 * than one shared "delivery result" so each channel's own id type stays
 * accurate. */
export type EmailDeliveryResult =
  | { status: "sent"; messageId: string }
  | { status: "failed"; error: string }
  | { status: "not_configured" };

/** Admin-facing operational CRM status (Admin Phase 2) — independent of
 * telegram_status/email_status, which track delivery, not the lead's
 * lifecycle. Every existing (and newly created) row defaults to "NEW". */
export type RequestStatus = "NEW" | "CONTACTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

/** Shape of a row in `public.service_requests`. Includes the internal
 * Telegram/email-delivery-tracking columns — never return this directly
 * from an API response to the customer. */
export type ServiceRequestRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  zip_code: string;
  service_id: string | null;
  service_label: string | null;
  category_id: string | null;
  category_label: string | null;
  issue: string | null;
  message: string;
  sms_consent: boolean;
  source: string;
  source_path: string | null;
  telegram_status: "pending" | "sent" | "failed";
  telegram_message_id: number | null;
  telegram_sent_at: string | null;
  telegram_last_error: string | null;
  /** "not_requested" when the customer left email blank at submission time —
   * distinct from "failed" (an actual send attempt that didn't succeed). */
  email_status: "not_requested" | "pending" | "sent" | "failed";
  email_message_id: string | null;
  email_sent_at: string | null;
  email_last_error: string | null;
  /** Admin Phase 2 — CRM identity and offer tracking, all set once at
   * creation time via the `book_now_create_request` RPC (see
   * supabase/migrations/20260914130000_service_requests_crm_fields.sql).
   * `customer_id` is never null on a row created after that migration. */
  customer_id: string;
  request_status: RequestStatus;
  /** Null when no promotion was claimed. Independent of `issue` — the two
   * used to be conflated (see the migration's backfill comment). */
  offer_code: string | null;
  offer_label: string | null;
  discount_percent: number | null;
  created_at: string;
  updated_at: string;
};
