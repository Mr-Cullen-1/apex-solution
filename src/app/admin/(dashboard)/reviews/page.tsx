import type { Metadata } from "next";
import { ReviewFilters } from "@/components/admin/reviews/review-filters";
import { ReviewPagination } from "@/components/admin/reviews/review-pagination";
import { ReviewBoard } from "@/components/admin/reviews/review-board";
import { isValidReviewStatusFilter, listAdminReviews } from "@/features/admin/reviews/repository";
import type { AdminReviewStatusFilter } from "@/features/admin/reviews/types";

export const metadata: Metadata = { title: "Reviews" };

// Never stale: moderation decisions must be made against current data.
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ReviewsPageProps = {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams;

  // Moderation is the primary job here — default view is Pending, not All
  // (instruction #22).
  const status: AdminReviewStatusFilter = isValidReviewStatusFilter(params.status ?? null) ? (params.status as AdminReviewStatusFilter) : "pending";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = (params.q ?? "").trim();

  const result = await listAdminReviews({ status, page, search: search || undefined });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-navy">Reviews</h1>
        <p className="mt-1 text-sm text-slate">Moderate customer review submissions.</p>
      </div>

      <ReviewFilters status={status} search={search} />

      {!result.ok ? (
        <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>
      ) : (
        <>
          <ReviewBoard reviews={result.reviews} />
          <ReviewPagination status={status} search={search} page={result.page} pageSize={result.pageSize} total={result.total} />
        </>
      )}
    </div>
  );
}
