import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ADMIN_REQUESTS_PAGE_SIZE } from "./types";
import type { AdminRequest, AdminRequestMutationResult, GetAdminRequestResult, ListAdminRequestsParams, ListAdminRequestsResult, RequestStatus } from "./types";

const LIST_FAILED_MESSAGE = "Couldn't load requests. Try again.";
const MUTATION_FAILED_MESSAGE = "The request couldn't be updated right now. Please try again.";

const ADMIN_REQUEST_COLUMNS =
  "id, customer_id, full_name, phone, email, zip_code, service_id, service_label, category_id, category_label, issue, message, sms_consent, source_path, request_status, offer_label, discount_percent, telegram_status, telegram_message_id, telegram_sent_at, email_status, email_message_id, email_sent_at, created_at, updated_at";

type AdminRequestRow = {
  id: string;
  customer_id: string;
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
  source_path: string | null;
  request_status: RequestStatus;
  offer_label: string | null;
  discount_percent: number | null;
  telegram_status: "pending" | "sent" | "failed";
  telegram_message_id: number | null;
  telegram_sent_at: string | null;
  email_status: "not_requested" | "pending" | "sent" | "failed";
  email_message_id: string | null;
  email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

function toAdminRequest(row: AdminRequestRow): AdminRequest {
  return {
    id: row.id,
    customerId: row.customer_id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    zipCode: row.zip_code,
    serviceLabel: row.service_label,
    categoryLabel: row.category_label,
    issue: row.issue,
    message: row.message,
    smsConsent: row.sms_consent,
    sourcePath: row.source_path,
    requestStatus: row.request_status,
    offerLabel: row.offer_label,
    discountPercent: row.discount_percent,
    telegramStatus: row.telegram_status,
    telegramMessageId: row.telegram_message_id,
    telegramSentAt: row.telegram_sent_at,
    emailStatus: row.email_status,
    emailMessageId: row.email_message_id,
    emailSentAt: row.email_sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** URL-driven filters + server-side pagination (25/page). Search covers
 * name/phone/email/ZIP — optional, never a blocker (mirrors the admin
 * reviews search). */
export async function listAdminRequests(params: ListAdminRequestsParams): Promise<ListAdminRequestsResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };

  const page = Math.max(1, Math.floor(params.page));
  const from = (page - 1) * ADMIN_REQUESTS_PAGE_SIZE;
  const to = from + ADMIN_REQUESTS_PAGE_SIZE - 1;

  try {
    const supabase = getSupabaseServerClient();
    let query = supabase.from("service_requests").select(ADMIN_REQUEST_COLUMNS, { count: "exact" }).order("created_at", { ascending: false }).range(from, to);

    if (params.status !== "all") query = query.eq("request_status", params.status);
    if (params.telegramStatus !== "all") query = query.eq("telegram_status", params.telegramStatus);
    if (params.emailStatus !== "all") query = query.eq("email_status", params.emailStatus);
    if (params.offer === "with") query = query.not("offer_code", "is", null);
    if (params.offer === "without") query = query.is("offer_code", null);
    if (params.serviceId) query = query.eq("service_id", params.serviceId);

    const search = params.search?.trim();
    if (search) {
      // Same two-layer escaping as the admin reviews search (see
      // src/features/admin/reviews/repository.ts) — ILIKE-wildcard
      // escaping, then PostgREST quoted-literal escaping, so a search
      // string containing `,`, `(`, `)`, `.`, or `"` can never break out of
      // the intended column scoping in this `.or()` filter.
      const likeEscaped = search.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
      const pattern = `%${likeEscaped}%`;
      const literal = `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      query = query.or(`full_name.ilike.${literal},phone.ilike.${literal},email.ilike.${literal},zip_code.ilike.${literal}`);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("[admin_requests_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }

    const requests = ((data ?? []) as AdminRequestRow[]).map(toAdminRequest);
    return { ok: true, requests, total: count ?? 0, page, pageSize: ADMIN_REQUESTS_PAGE_SIZE };
  } catch (err) {
    console.error("[admin_requests_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

/** Full chronological request history for one customer's profile page
 * (instruction: "All requests linked to this customer should appear
 * chronologically"). Not paginated — a single customer's own history is
 * bounded in practice; capped defensively at 200. */
export async function listRequestsForCustomer(customerId: string): Promise<{ ok: true; requests: AdminRequest[] } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("service_requests")
      .select(ADMIN_REQUEST_COLUMNS)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[admin_customer_requests_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }
    return { ok: true, requests: ((data ?? []) as AdminRequestRow[]).map(toAdminRequest) };
  } catch (err) {
    console.error("[admin_customer_requests_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

export async function getAdminRequest(requestId: string): Promise<GetAdminRequestResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("service_requests").select(ADMIN_REQUEST_COLUMNS).eq("id", requestId).maybeSingle();
    if (error) {
      console.error("[admin_request_fetch_failed]", error.code, error.message);
      return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
    }
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, request: toAdminRequest(data as AdminRequestRow) };
  } catch (err) {
    console.error("[admin_request_fetch_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
  }
}

/** Opening/viewing a request never resends Telegram or Resend — this only
 * ever changes `request_status` via admin_set_request_status, the same RPC
 * pattern as review moderation (one transaction, one audit/history event,
 * only when the status actually changes). */
export async function setRequestStatus(requestId: string, adminUserId: string, newStatus: RequestStatus): Promise<AdminRequestMutationResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_set_request_status", { p_request_id: requestId, p_admin_user_id: adminUserId, p_new_status: newStatus });
    if (error) {
      if (error.code === "P0002" || error.message.includes("not found")) return { ok: false, status: "not_found" };
      console.error("[admin_request_status_failed]", error.code, error.message);
      return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
    }
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, request: toAdminRequest(data as AdminRequestRow) };
  } catch (err) {
    console.error("[admin_request_status_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  }
}
