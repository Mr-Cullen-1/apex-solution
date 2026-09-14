import Link from "next/link";
import type { AdminRequest } from "@/features/admin/requests/types";
import { RequestStatusBadge } from "@/components/admin/requests/request-status-badge";
import { DeliveryStatusBadge } from "@/components/admin/requests/delivery-status-badge";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { InboxIcon } from "@/components/ui/icons";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

/** List rows never render the full customer message — truncated to a
 * preview here; the full text is only on the request detail page. */
export function RequestList({ requests }: { requests: AdminRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-panel border border-steel bg-surface p-6">
        <EmptyState icon={<InboxIcon className="size-6" />} title="No requests match this view" description="Try widening the filters or clearing the search." />
      </div>
    );
  }

  return (
    <>
      {/* Issue is deliberately not a column here — the list is an
       * operations scan, not the case file; the full issue text (plus
       * everything else) lives on the detail page. Fixed pixel widths + a
       * table min-width keep every column (status/offer/delivery badges
       * especially) from ever being compressed below a readable size —
       * overflow-x-auto on the wrapper below scrolls instead of squeezing. */}
      <div className="hidden overflow-x-auto rounded-panel border border-steel bg-surface lg:block">
        <table className="w-full min-w-[1040px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel bg-page-bg text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
              <th className="w-[120px] px-4 py-3">Submitted</th>
              <th className="w-[210px] px-4 py-3">Customer</th>
              <th className="w-[130px] px-4 py-3">Service</th>
              <th className="w-[60px] px-4 py-3">ZIP</th>
              <th className="w-[130px] px-4 py-3">Status</th>
              <th className="w-[120px] px-4 py-3">Offer</th>
              <th className="w-[130px] px-4 py-3">Telegram</th>
              <th className="w-[140px] px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-steel last:border-b-0 hover:bg-page-bg">
                <td className="px-4 py-3.5 align-top text-xs text-slate">{formatDate(request.createdAt)}</td>
                <td className="px-4 py-3.5 align-top">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[0.65rem] font-bold text-brand-primary">
                      {initials(request.fullName)}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/admin/requests/${request.id}`} className="block truncate font-semibold text-navy hover:text-brand-primary hover:underline">
                        {request.fullName}
                      </Link>
                      <p className="text-xs text-slate">{request.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 align-top text-slate">{request.serviceLabel ?? request.categoryLabel ?? "—"}</td>
                <td className="px-4 py-3.5 align-top text-slate">{request.zipCode}</td>
                <td className="px-4 py-3.5 align-top">
                  <RequestStatusBadge status={request.requestStatus} />
                </td>
                <td className="px-4 py-3.5 align-top">
                  {request.offerLabel ? (
                    <Badge tone="accent">{request.discountPercent}% off</Badge>
                  ) : (
                    <span className="text-xs whitespace-nowrap text-steel">No offer</span>
                  )}
                </td>
                <td className="px-4 py-3.5 align-top">
                  <DeliveryStatusBadge status={request.telegramStatus} />
                </td>
                <td className="px-4 py-3.5 align-top">
                  <DeliveryStatusBadge status={request.emailStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {requests.map((request) => (
          <Link key={request.id} href={`/admin/requests/${request.id}`} className="flex flex-col gap-3 rounded-panel border border-steel bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-primary">{initials(request.fullName)}</span>
                <div>
                  <p className="font-semibold text-navy">{request.fullName}</p>
                  <p className="text-xs text-slate">{formatDate(request.createdAt)}</p>
                </div>
              </div>
              <RequestStatusBadge status={request.requestStatus} />
            </div>
            <p className="text-sm text-slate">
              {request.serviceLabel ?? request.categoryLabel ?? "General"} · {request.phone}
            </p>
            {request.issue && <p className="line-clamp-1 text-sm text-slate">{request.issue}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <DeliveryStatusBadge status={request.telegramStatus} />
              <DeliveryStatusBadge status={request.emailStatus} />
              {request.offerLabel && <Badge tone="accent">{request.discountPercent}% off</Badge>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
