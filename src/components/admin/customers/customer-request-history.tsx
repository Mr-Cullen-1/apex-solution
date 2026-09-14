import Link from "next/link";
import type { AdminRequest } from "@/features/admin/requests/types";
import { RequestStatusBadge } from "@/components/admin/requests/request-status-badge";
import { Badge } from "@/components/admin/ui/badge";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

/** Chronological (newest first) request history for one customer's
 * profile — instruction example: "Sep 13 / Heating — Other / First-Time
 * Customer — 10% / Status: Completed". Every historical request is
 * preserved and shown, never summarized away. */
export function CustomerRequestHistory({ requests }: { requests: AdminRequest[] }) {
  if (requests.length === 0) {
    return <p className="text-sm text-slate">No requests yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {requests.map((request) => (
        <li key={request.id} className="border-l-2 border-steel pl-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/admin/requests/${request.id}`} className="text-sm font-semibold text-brand-primary hover:underline">
              {formatDate(request.createdAt)}
            </Link>
            <RequestStatusBadge status={request.requestStatus} />
          </div>
          <p className="mt-1 text-sm text-navy">
            {request.serviceLabel ?? request.categoryLabel ?? "General"}
            {request.issue ? ` — ${request.issue}` : ""}
          </p>
          {request.offerLabel && (
            <div className="mt-1.5">
              <Badge tone="accent">
                {request.offerLabel} — {request.discountPercent}%
              </Badge>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
