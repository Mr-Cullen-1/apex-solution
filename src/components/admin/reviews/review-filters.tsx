import Link from "next/link";
import type { AdminReviewStatusFilter } from "@/features/admin/reviews/types";

const TABS: { value: AdminReviewStatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

/** URL-driven filters (instruction #49): status/page/search all live in the
 * query string, never only in component state, so refresh/back/forward and
 * a shared link all reproduce the same view. Plain server-rendered
 * links/form — no client JS required for filtering or search. */
export function ReviewFilters({ status, search }: { status: AdminReviewStatusFilter; search: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div role="tablist" aria-label="Review status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = tab.value === status;
          const params = new URLSearchParams();
          params.set("status", tab.value);
          if (search) params.set("q", search);
          return (
            <Link
              key={tab.value}
              href={`/admin/reviews?${params.toString()}`}
              role="tab"
              aria-selected={active}
              className={`rounded-control px-4 py-2 text-sm font-semibold transition-colors ${
                active ? "bg-navy text-white" : "border border-steel bg-surface text-slate hover:border-navy hover:text-navy"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <form method="get" action="/admin/reviews" className="flex items-center gap-2">
        <input type="hidden" name="status" value={status} />
        <label htmlFor="review-search" className="sr-only">
          Search reviews
        </label>
        <input
          id="review-search"
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search name, service, location…"
          className="min-h-10 w-full rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none focus-visible:border-brand-primary sm:w-64"
        />
        <button type="submit" className="min-h-10 rounded-control border border-steel bg-surface px-4 text-sm font-semibold text-navy hover:border-navy">
          Search
        </button>
      </form>
    </div>
  );
}
