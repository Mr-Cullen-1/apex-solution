import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ActiveAdminCountResult, ServiceRequestSignalsResult } from "./types";

const SIGNALS_FAILED_MESSAGE = "Couldn't load Book Now signals. Try again.";
const ADMIN_COUNT_FAILED_MESSAGE = "Couldn't load admin count. Try again.";

/** Dashboard-only read signals from service_requests/customers — no lead
 * list, no PII, no per-row data (full lead management lives on
 * /admin/requests, not here). */
export async function getServiceRequestSignals(): Promise<ServiceRequestSignalsResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: SIGNALS_FAILED_MESSAGE };

  try {
    const supabase = getSupabaseServerClient();
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [newLast24h, telegramFailed, emailFailed, newStatusCount, needsFollowUpCount, customerCount] = await Promise.all([
      supabase.from("service_requests").select("id", { count: "exact", head: true }).gte("created_at", since24h),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("telegram_status", "failed"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("email_status", "failed"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("request_status", "NEW"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).in("request_status", ["NEW", "CONTACTED"]),
      supabase.from("customers").select("id", { count: "exact", head: true }),
    ]);

    for (const result of [newLast24h, telegramFailed, emailFailed, newStatusCount, needsFollowUpCount, customerCount]) {
      if (result.error) {
        console.error("[admin_service_request_signals_failed]", result.error.code, result.error.message);
        return { ok: false, message: SIGNALS_FAILED_MESSAGE };
      }
    }

    return {
      ok: true,
      signals: {
        newLast24h: newLast24h.count ?? 0,
        telegramFailed: telegramFailed.count ?? 0,
        emailFailed: emailFailed.count ?? 0,
        newStatusCount: newStatusCount.count ?? 0,
        needsFollowUpCount: needsFollowUpCount.count ?? 0,
        customerCount: customerCount.count ?? 0,
      },
    };
  } catch (err) {
    console.error("[admin_service_request_signals_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: SIGNALS_FAILED_MESSAGE };
  }
}

/** SUPER_ADMIN-only dashboard card — active admin headcount. Never shown
 * to a plain ADMIN (no admin-management visibility for that role). */
export async function getActiveAdminCount(): Promise<ActiveAdminCountResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ADMIN_COUNT_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase.from("admin_users").select("user_id", { count: "exact", head: true }).eq("is_active", true);
    if (error) {
      console.error("[admin_active_admin_count_failed]", error.code, error.message);
      return { ok: false, message: ADMIN_COUNT_FAILED_MESSAGE };
    }
    return { ok: true, count: count ?? 0 };
  } catch (err) {
    console.error("[admin_active_admin_count_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ADMIN_COUNT_FAILED_MESSAGE };
  }
}
