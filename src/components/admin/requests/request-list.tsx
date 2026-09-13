import Link from "next/link";
import type { AdminRequest } from "@/features/admin/requests/types";

const STATUS_STYLES: Record<AdminRequest["requestStatus"], string> = {
  NEW: "bg-brand-soft text-brand-primary",
  CONTACTED: "bg-status-live/15 text-status-live",
  SCHEDULED: "bg-status-live/15 text-status-live",
  COMPLETED: "bg-ink/10 text-ink-muted",
  CANCELLED: "bg-ink/10 text-ink-muted",
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

/** List rows never render the full customer message — truncated to a
 * preview here; the full text is only on the request detail page. */
export function RequestList({ requests }: { requests: AdminRequest[] }) {
  if (requests.length === 0) {
    return <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm text-slate">No requests match this view.</div>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-panel border border-steel bg-surface lg:block">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
              <th className="w-32 px-4 py-3">Submitted</th>
              <th className="w-40 px-4 py-3">Customer</th>
              <th className="w-32 px-4 py-3">Phone</th>
              <th className="w-32 px-4 py-3">Service</th>
              <th className="px-4 py-3">Issue</th>
              <th className="w-20 px-4 py-3">ZIP</th>
              <th className="w-28 px-4 py-3">Status</th>
              <th className="w-32 px-4 py-3">Offer</th>
              <th className="w-24 px-4 py-3">Telegram</th>
              <th className="w-24 px-4 py-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-steel last:border-b-0 hover:bg-page-bg">
                <td className="px-4 py-3 align-top text-xs text-slate">{formatDate(request.createdAt)}</td>
                <td className="px-4 py-3 align-top">
                  <Link href={`/admin/requests/${request.id}`} className="font-semibold text-brand-primary hover:underline">
                    {request.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top text-slate">{request.phone}</td>
                <td className="px-4 py-3 align-top text-slate">{request.serviceLabel ?? request.categoryLabel ?? "—"}</td>
                <td className="px-4 py-3 align-top text-slate">
                  <p className="line-clamp-1">{request.issue ?? "—"}</p>
                </td>
                <td className="px-4 py-3 align-top text-slate">{request.zipCode}</td>
                <td className="px-4 py-3 align-top">
                  <span className={`inline-flex items-center rounded-control px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] ${STATUS_STYLES[request.requestStatus]}`}>{request.requestStatus}</span>
                </td>
                <td className="px-4 py-3 align-top text-slate">{request.offerLabel ? `${request.offerLabel} — ${request.discountPercent}%` : "No offer"}</td>
                <td className="px-4 py-3 align-top text-slate">{request.telegramStatus}</td>
                <td className="px-4 py-3 align-top text-slate">{request.emailStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {requests.map((request) => (
          <Link key={request.id} href={`/admin/requests/${request.id}`} className="flex flex-col gap-2 rounded-panel border border-steel bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{request.fullName}</p>
                <p className="text-xs text-slate">{formatDate(request.createdAt)}</p>
              </div>
              <span className={`inline-flex items-center rounded-control px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] ${STATUS_STYLES[request.requestStatus]}`}>{request.requestStatus}</span>
            </div>
            <p className="text-sm text-slate">
              {request.serviceLabel ?? request.categoryLabel ?? "General"} · {request.phone}
            </p>
            {request.issue && <p className="line-clamp-1 text-sm text-slate">{request.issue}</p>}
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate">
              <span>Telegram: {request.telegramStatus}</span>
              <span>Email: {request.emailStatus}</span>
              {request.offerLabel && <span className="text-copper">{request.discountPercent}% offer</span>}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
