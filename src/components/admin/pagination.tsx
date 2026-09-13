import Link from "next/link";

/** Generic URL-driven pagination — reused by Requests and Customers (the
 * admin reviews page has its own, narrower version since it only ever
 * carries two params). `params` should include every OTHER current filter
 * so paging preserves them; `page` is added/overwritten here. */
export function Pagination({
  basePath,
  params,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  params: Record<string, string>;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const usp = new URLSearchParams(params);
    usp.set("page", String(targetPage));
    return `${basePath}?${usp.toString()}`;
  }

  return (
    <nav aria-label="Pages" className="flex items-center justify-between border-t border-steel pt-4 text-sm text-slate">
      <span>
        Page {page} of {totalPages} · {total} total
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
