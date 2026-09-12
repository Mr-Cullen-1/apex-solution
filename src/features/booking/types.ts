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

/** Shape of a row in `public.service_requests`. Includes the internal
 * Telegram-delivery-tracking columns — never return this directly from an
 * API response to the customer. */
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
  created_at: string;
  updated_at: string;
};
