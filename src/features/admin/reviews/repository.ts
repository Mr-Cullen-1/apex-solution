import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createReviewMediaSignedUrl } from "@/features/reviews/signed-media";
import type { ReviewRow } from "@/features/reviews/types";
import {
  ADMIN_REVIEWS_PAGE_SIZE,
  type AdminReview,
  type AdminReviewCounts,
  type AdminReviewMutationResult,
  type AdminReviewStatusFilter,
  type GetAdminReviewResult,
  type ListAdminReviewsParams,
  type ListAdminReviewsResult,
  type ReviewStatus,
} from "./types";

const COUNTS_FAILED_MESSAGE = "Couldn't load review counts. Try again.";
const LIST_FAILED_MESSAGE = "Couldn't load reviews. Try again.";
const MUTATION_FAILED_MESSAGE = "The review couldn't be updated right now. Please try again.";

const ADMIN_REVIEW_COLUMNS =
  "id, full_name, display_name, rating, review_text, service_slug, service_label, location_text, status, is_verified_customer, is_featured, consent_to_publish, source, media_path, created_at, updated_at, approved_at, rejected_at";

type AdminReviewRow = Pick<
  ReviewRow,
  | "id"
  | "full_name"
  | "display_name"
  | "rating"
  | "review_text"
  | "service_slug"
  | "service_label"
  | "location_text"
  | "status"
  | "is_verified_customer"
  | "is_featured"
  | "consent_to_publish"
  | "source"
  | "media_path"
  | "created_at"
  | "updated_at"
  | "approved_at"
  | "rejected_at"
>;

async function toAdminReview(row: AdminReviewRow): Promise<AdminReview> {
  const mediaUrl = row.media_path ? await createReviewMediaSignedUrl(row.media_path) : null;
  return {
    id: row.id,
    fullName: row.full_name,
    displayName: row.display_name,
    rating: row.rating,
    reviewText: row.review_text,
    serviceSlug: row.service_slug,
    serviceLabel: row.service_label,
    locationText: row.location_text,
    status: row.status,
    isVerifiedCustomer: row.is_verified_customer,
    isFeatured: row.is_featured,
    consentToPublish: row.consent_to_publish,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    hasMedia: row.media_path !== null,
    mediaUrl,
  };
}

/** Four fast counts for the dashboard cards. Not derived from `listAdminReviews`
 * — a dedicated head-count query per card so the dashboard never has to pull
 * full rows just to display a number. */
export async function getAdminReviewCounts(): Promise<{ ok: true; counts: AdminReviewCounts } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: COUNTS_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const [pending, approved, rejected, featured] = await Promise.all([
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "rejected"),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("is_featured", true),
    ]);

    for (const result of [pending, approved, rejected, featured]) {
      if (result.error) {
        console.error("[admin_review_counts_failed]", result.error.code, result.error.message);
        return { ok: false, message: COUNTS_FAILED_MESSAGE };
      }
    }

    return {
      ok: true,
      counts: {
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
        featured: featured.count ?? 0,
      },
    };
  } catch (err) {
    console.error("[admin_review_counts_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: COUNTS_FAILED_MESSAGE };
  }
}

/** Simple server-side pagination + optional search across the admin-visible
 * text fields (full_name, display_name, service_label, location_text).
 * Status filtering and pagination are mandatory per spec; search is a
 * best-effort addition on top, never a blocker. */
export async function listAdminReviews(params: ListAdminReviewsParams): Promise<ListAdminReviewsResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };

  const page = Math.max(1, Math.floor(params.page));
  const from = (page - 1) * ADMIN_REVIEWS_PAGE_SIZE;
  const to = from + ADMIN_REVIEWS_PAGE_SIZE - 1;

  try {
    const supabase = getSupabaseServerClient();
    let query = supabase.from("reviews").select(ADMIN_REVIEW_COLUMNS, { count: "exact" }).order("created_at", { ascending: false }).range(from, to);

    if (params.status !== "all") query = query.eq("status", params.status);

    const search = params.search?.trim();
    if (search) {
      // Two independent escaping layers, applied in this order:
      // 1. Escape Postgres ILIKE wildcards (`%`, `_`, and a literal
      //    backslash) so a search containing them matches literally instead
      //    of acting as a pattern wildcard.
      // 2. Wrap the whole value as a PostgREST quoted filter literal —
      //    required because `.or()` builds a single comma/paren-delimited
      //    filter string PostgREST itself parses; an unquoted value
      //    containing `,`, `(`, `)`, `.`, or `"` could otherwise break out
      //    of the intended `column.ilike.<value>` clause and manipulate the
      //    filter structure. PostgREST unescapes exactly one layer of
      //    `\\`/`\"` when parsing a quoted literal, which is what lets the
      //    ILIKE-escaping from step 1 survive intact through to Postgres.
      const likeEscaped = search.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
      const pattern = `%${likeEscaped}%`;
      const literal = `"${pattern.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      query = query.or(`full_name.ilike.${literal},display_name.ilike.${literal},service_label.ilike.${literal},location_text.ilike.${literal}`);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("[admin_reviews_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }

    const rows = (data ?? []) as AdminReviewRow[];
    const reviews = await Promise.all(rows.map(toAdminReview));
    return { ok: true, reviews, total: count ?? 0, page, pageSize: ADMIN_REVIEWS_PAGE_SIZE };
  } catch (err) {
    console.error("[admin_reviews_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

export async function getAdminReview(reviewId: string): Promise<GetAdminReviewResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("reviews").select(ADMIN_REVIEW_COLUMNS).eq("id", reviewId).maybeSingle();
    if (error) {
      console.error("[admin_review_fetch_failed]", error.code, error.message);
      return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
    }
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, review: await toAdminReview(data as AdminReviewRow) };
  } catch (err) {
    console.error("[admin_review_fetch_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: LIST_FAILED_MESSAGE };
  }
}

/** Maps a Postgres error raised by one of the admin_set_review_* RPCs
 * (supabase/migrations/20260913120000_create_review_moderation_events.sql)
 * to a clean result — a missing review never crashes the admin page, and
 * the "only approved reviews may be featured" business rule surfaces as a
 * readable message rather than a generic failure. */
function mapModerationRpcError(error: { code?: string; message: string }): AdminReviewMutationResult {
  if (error.code === "P0002" || error.message.includes("review not found")) return { ok: false, status: "not_found" };
  if (error.message.includes("only approved reviews may be featured")) {
    return { ok: false, status: "invalid", message: "Only approved reviews can be featured." };
  }
  console.error("[admin_review_mutation_failed]", error.code, error.message);
  return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
}

async function runModerationRpc(fn: string, args: Record<string, unknown>): Promise<AdminReviewMutationResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc(fn, args);
    if (error) return mapModerationRpcError(error);
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, review: await toAdminReview(data as AdminReviewRow) };
  } catch (err) {
    console.error("[admin_review_mutation_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  }
}

/** Moves a review to a new status. Approve/Reject/restore-to-Pending all
 * go through this one function — the RPC itself keeps approved_at/rejected_at
 * canonical (via the existing trigger) and auto-clears is_featured when a
 * featured review is rejected (instruction #34), recording an audit event
 * only when the status actually changes. */
export async function setReviewStatus(reviewId: string, adminUserId: string, newStatus: ReviewStatus): Promise<AdminReviewMutationResult> {
  return runModerationRpc("admin_set_review_status", { p_review_id: reviewId, p_admin_user_id: adminUserId, p_new_status: newStatus });
}

export async function setReviewVerified(reviewId: string, adminUserId: string, isVerified: boolean): Promise<AdminReviewMutationResult> {
  return runModerationRpc("admin_set_review_verified", { p_review_id: reviewId, p_admin_user_id: adminUserId, p_is_verified: isVerified });
}

/** Server-enforced (not just hidden in the UI): the RPC itself rejects
 * featuring anything but an approved review — see instruction #34. */
export async function setReviewFeatured(reviewId: string, adminUserId: string, isFeatured: boolean): Promise<AdminReviewMutationResult> {
  return runModerationRpc("admin_set_review_featured", { p_review_id: reviewId, p_admin_user_id: adminUserId, p_is_featured: isFeatured });
}

export function isValidReviewStatusFilter(value: string | null): value is AdminReviewStatusFilter {
  return value === "pending" || value === "approved" || value === "rejected" || value === "all";
}
