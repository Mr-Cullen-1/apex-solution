import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ADMIN_CUSTOMERS_PAGE_SIZE } from "./types";
import type { AdminCustomerListItem, GetAdminCustomerResult, ListAdminCustomersParams, ListAdminCustomersResult } from "./types";

const LIST_FAILED_MESSAGE = "Couldn't load customers. Try again.";

type CustomerRow = { id: string; full_name: string; phone: string; email: string | null; zip_code: string | null; created_at: string };
type SummaryRow = { customer_id: string; total_requests: number; last_request_at: string | null };

function toCustomerListItem(row: CustomerRow, summary: SummaryRow | undefined): AdminCustomerListItem {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    zipCode: row.zip_code,
    firstSeenAt: row.created_at,
    lastRequestAt: summary?.last_request_at ?? null,
    totalRequests: summary?.total_requests ?? 0,
  };
}

/** Paginated customer list + a summary lookup (customer_request_summary,
 * supabase/migrations/20260914140000_customer_request_summary_view.sql) for
 * just the current page's rows — never fuzzy name matching, search is a
 * plain ilike across name/phone/email. */
export async function listAdminCustomers(params: ListAdminCustomersParams): Promise<ListAdminCustomersResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };

  const page = Math.max(1, Math.floor(params.page));
  const from = (page - 1) * ADMIN_CUSTOMERS_PAGE_SIZE;
  const to = from + ADMIN_CUSTOMERS_PAGE_SIZE - 1;

  try {
    const supabase = getSupabaseServerClient();
    let query = supabase.from("customers").select("id, full_name, phone, email, zip_code, created_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);

    const search = params.search?.trim();
    if (search) {
      const likeEscaped = search.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
      const pattern = `%${likeEscaped}%`;
      const literal = `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      query = query.or(`full_name.ilike.${literal},phone.ilike.${literal},email.ilike.${literal}`);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("[admin_customers_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }

    const rows = (data ?? []) as CustomerRow[];
    const ids = rows.map((row) => row.id);
    let summaries: SummaryRow[] = [];
    if (ids.length > 0) {
      const { data: summaryData, error: summaryError } = await supabase.from("customer_request_summary").select("customer_id, total_requests, last_request_at").in("customer_id", ids);
      if (summaryError) console.error("[admin_customers_summary_failed]", summaryError.code, summaryError.message);
      summaries = (summaryData ?? []) as SummaryRow[];
    }
    const summaryMap = new Map(summaries.map((row) => [row.customer_id, row]));

    return { ok: true, customers: rows.map((row) => toCustomerListItem(row, summaryMap.get(row.id))), total: count ?? 0, page, pageSize: ADMIN_CUSTOMERS_PAGE_SIZE };
  } catch (err) {
    console.error("[admin_customers_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

export async function getAdminCustomer(customerId: string): Promise<GetAdminCustomerResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const [{ data, error }, { data: summaryData, error: summaryError }] = await Promise.all([
      supabase.from("customers").select("id, full_name, phone, email, zip_code, created_at").eq("id", customerId).maybeSingle(),
      supabase.from("customer_request_summary").select("customer_id, total_requests, last_request_at").eq("customer_id", customerId).maybeSingle(),
    ]);
    if (error) {
      console.error("[admin_customer_fetch_failed]", error.code, error.message);
      return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
    }
    if (!data) return { ok: false, status: "not_found" };
    if (summaryError) console.error("[admin_customer_summary_failed]", summaryError.code, summaryError.message);

    return { ok: true, customer: toCustomerListItem(data as CustomerRow, (summaryData as SummaryRow | null) ?? undefined) };
  } catch (err) {
    console.error("[admin_customer_fetch_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
  }
}
