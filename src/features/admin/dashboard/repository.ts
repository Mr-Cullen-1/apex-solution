import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type {
  ActiveAdminCountResult,
  DeliveryOutcomesResult,
  OfferUsageResult,
  RecentRequestFeedItem,
  RecentRequestFeedResult,
  RequestStatusDistribution,
  RequestStatusDistributionResult,
  RequestsOverTimeResult,
  ServiceRequestSignalsResult,
  TopServiceCategoriesResult,
} from "./types";
import type { RequestStatus } from "@/features/booking/types";

const SIGNALS_FAILED_MESSAGE = "Couldn't load Book Now signals. Try again.";
const ADMIN_COUNT_FAILED_MESSAGE = "Couldn't load admin count. Try again.";
const ANALYTICS_FAILED_MESSAGE = "Couldn't load this chart's data. Try again.";
const REQUEST_STATUSES: RequestStatus[] = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELLED"];

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

function formatShortDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

/** Daily request volume for the "Requests over time" dashboard chart.
 * Fetches only `created_at` for rows in the window and buckets by UTC
 * calendar day in JS (no GROUP BY RPC needed) — every day in the window is
 * present, even at 0, so the chart never silently skips a quiet day. */
export async function getRequestsOverTime(days: 7 | 14 | 30): Promise<RequestsOverTimeResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (days - 1));
    since.setUTCHours(0, 0, 0, 0);

    const { data, error } = await supabase.from("service_requests").select("created_at").gte("created_at", since.toISOString()).order("created_at", { ascending: true }).limit(5000);
    if (error) {
      console.error("[admin_requests_over_time_failed]", error.code, error.message);
      return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
    }

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as { created_at: string }[]) {
      const day = row.created_at.slice(0, 10);
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    const points = [];
    for (let i = 0; i < days; i++) {
      const day = new Date(since);
      day.setUTCDate(day.getUTCDate() + i);
      const key = day.toISOString().slice(0, 10);
      points.push({ date: formatShortDate(key), count: counts.get(key) ?? 0 });
    }

    return { ok: true, points };
  } catch (err) {
    console.error("[admin_requests_over_time_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  }
}

/** request_status counts across all five pipeline states, for the "Request
 * status distribution" donut. Five head-count queries — same pattern as
 * getServiceRequestSignals above — rather than fetching and reducing every
 * row. */
export async function getRequestStatusDistribution(): Promise<RequestStatusDistributionResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const results = await Promise.all(
      REQUEST_STATUSES.map((status) => supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("request_status", status)),
    );

    for (const result of results) {
      if (result.error) {
        console.error("[admin_request_status_distribution_failed]", result.error.code, result.error.message);
        return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
      }
    }

    const distribution = REQUEST_STATUSES.reduce((acc, status, i) => {
      acc[status] = results[i].count ?? 0;
      return acc;
    }, {} as RequestStatusDistribution);

    return { ok: true, distribution };
  } catch (err) {
    console.error("[admin_request_status_distribution_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  }
}

/** Ranks service categories by submission volume for the "Top service
 * categories" bar chart. Fetches only the `category_label` column, bounded
 * to the most recent 5,000 submissions — a ranking chart doesn't need every
 * historical row, and this avoids a dedicated GROUP BY RPC for a dashboard
 * read. */
export async function getTopServiceCategories(limit = 6): Promise<TopServiceCategoriesResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("service_requests").select("category_label").order("created_at", { ascending: false }).limit(5000);
    if (error) {
      console.error("[admin_top_service_categories_failed]", error.code, error.message);
      return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
    }

    const counts = new Map<string, number>();
    for (const row of (data ?? []) as { category_label: string | null }[]) {
      const label = row.category_label ?? "Uncategorized";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    const categories = [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return { ok: true, categories };
  } catch (err) {
    console.error("[admin_top_service_categories_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  }
}

/** Telegram/email delivery breakdowns for the optional delivery-outcomes
 * charts — seven head-count queries, same cheap pattern as the signals and
 * status-distribution queries above. */
export async function getDeliveryOutcomes(): Promise<DeliveryOutcomesResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const [tgPending, tgSent, tgFailed, emailNotRequested, emailPending, emailSent, emailFailed] = await Promise.all([
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("telegram_status", "pending"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("telegram_status", "sent"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("telegram_status", "failed"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("email_status", "not_requested"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("email_status", "pending"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("email_status", "sent"),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).eq("email_status", "failed"),
    ]);

    for (const result of [tgPending, tgSent, tgFailed, emailNotRequested, emailPending, emailSent, emailFailed]) {
      if (result.error) {
        console.error("[admin_delivery_outcomes_failed]", result.error.code, result.error.message);
        return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
      }
    }

    return {
      ok: true,
      outcomes: {
        telegram: { pending: tgPending.count ?? 0, sent: tgSent.count ?? 0, failed: tgFailed.count ?? 0 },
        email: { notRequested: emailNotRequested.count ?? 0, pending: emailPending.count ?? 0, sent: emailSent.count ?? 0, failed: emailFailed.count ?? 0 },
      },
    };
  } catch (err) {
    console.error("[admin_delivery_outcomes_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  }
}

/** With-offer vs. without-offer submission split, for the optional offer
 * usage chart. Reuses the same offer_code null/not-null filter as the
 * Requests page's "Offer" filter (src/features/admin/requests/repository.ts). */
export async function getOfferUsage(): Promise<OfferUsageResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const [withOffer, withoutOffer] = await Promise.all([
      supabase.from("service_requests").select("id", { count: "exact", head: true }).not("offer_code", "is", null),
      supabase.from("service_requests").select("id", { count: "exact", head: true }).is("offer_code", null),
    ]);
    if (withOffer.error || withoutOffer.error) {
      console.error("[admin_offer_usage_failed]", withOffer.error?.code ?? withoutOffer.error?.code, withOffer.error?.message ?? withoutOffer.error?.message);
      return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
    }
    return { ok: true, usage: { withOffer: withOffer.count ?? 0, withoutOffer: withoutOffer.count ?? 0 } };
  } catch (err) {
    console.error("[admin_offer_usage_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  }
}

/** Latest N request submissions for the dashboard's recent-activity mini
 * feed — a narrow, dashboard-only read (same rationale as
 * getServiceRequestSignals above), not the full paginated Requests list. */
export async function getRecentRequestsFeed(limit = 6): Promise<RecentRequestFeedResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("service_requests")
      .select("id, full_name, service_label, category_label, request_status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      console.error("[admin_recent_requests_feed_failed]", error.code, error.message);
      return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
    }

    const rows = (data ?? []) as { id: string; full_name: string; service_label: string | null; category_label: string | null; request_status: RequestStatus; created_at: string }[];
    const items: RecentRequestFeedItem[] = rows.map((row) => ({
      id: row.id,
      fullName: row.full_name,
      serviceLabel: row.service_label,
      categoryLabel: row.category_label,
      requestStatus: row.request_status,
      createdAt: row.created_at,
    }));

    return { ok: true, items };
  } catch (err) {
    console.error("[admin_recent_requests_feed_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: ANALYTICS_FAILED_MESSAGE };
  }
}
