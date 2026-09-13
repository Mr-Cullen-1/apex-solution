import Link from "next/link";
import type { AdminReviewStatusFilter } from "@/features/admin/reviews/types";

export function ReviewPagination({
  status,
  search,
  page,
  pageSize,
  total,
}: {
  status: AdminReviewStatusFilter;
  search: string;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    params.set("status", status);
    if (search) params.set("q", search);
    params.set("page", String(targetPage));
    return `/admin/reviews?${params.toString()}`;
  }

  return (
    <nav aria-label="Review pages" className="flex items-center justify-between border-t border-steel pt-4 text-sm text-slate">
      <span>
        Page {page} of {totalPages} · {total} review{total === 1 ? "" : "s"}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="rounded-control border border-steel px-3 py-1.5 font-semibold text-navy hover:border-navy">
            Previous
          </Link>
        ) : (
          <span className="rounded-control border border-steel px-3 py-1.5 font-semibold text-steel">Previous</span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className="rounded-control border border-steel px-3 py-1.5 font-semibold text-navy hover:border-navy">
            Next
          </Link>
        ) : (
          <span className="rounded-control border border-steel px-3 py-1.5 font-semibold text-steel">Next</span>
        )}
      </div>
    </nav>
  );
}
