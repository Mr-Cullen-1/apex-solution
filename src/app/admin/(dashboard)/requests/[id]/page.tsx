import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminRequest } from "@/features/admin/requests/repository";
import { listActivityForRequest } from "@/features/admin/activity/repository";
import { RequestStatusControl } from "@/components/admin/requests/request-status-control";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { AddNoteForm } from "@/components/admin/add-note-form";

export const metadata: Metadata = { title: "Request detail" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

type RequestDetailPageProps = { params: Promise<{ id: string }> };

// Opening/viewing a request never resends Telegram or Resend — this page
// only ever reads. Status changes go through RequestStatusControl's Server
// Action.
export default async function AdminRequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const result = await getAdminRequest(id);

  if (!result.ok && result.status === "not_found") notFound();
  if (!result.ok) {
    return <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>;
  }

  const { request } = result;
  const activity = await listActivityForRequest(request.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-navy">{request.fullName}</h1>
          <p className="mt-1 text-sm text-slate">Submitted {formatDateTime(request.createdAt)}</p>
        </div>
        <Link href={`/admin/customers/${request.customerId}`} className="text-sm font-semibold text-brand-primary hover:underline">
          View customer profile →
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-panel border border-steel bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">Contact</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-slate">Phone</dt>
              <dd className="text-navy">{request.phone}</dd>
              <dt className="text-slate">Email</dt>
              <dd className="text-navy">{request.email ?? "—"}</dd>
              <dt className="text-slate">ZIP</dt>
              <dd className="text-navy">{request.zipCode}</dd>
            </dl>
          </section>

          <section className="rounded-panel border border-steel bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">Service request</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-slate">Service</dt>
              <dd className="text-navy">{request.serviceLabel ?? request.categoryLabel ?? "—"}</dd>
              <dt className="text-slate">Issue</dt>
              <dd className="text-navy">{request.issue ?? "—"}</dd>
              <dt className="text-slate">Offer</dt>
              <dd className="text-navy">{request.offerLabel ? `${request.offerLabel} — ${request.discountPercent}%` : "No offer"}</dd>
            </dl>
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-slate">Customer message</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-navy">{request.message}</p>
          </section>

          <section className="rounded-panel border border-steel bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">Delivery</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-slate">Telegram</dt>
              <dd className="text-navy">
                {request.telegramStatus}
                {request.telegramSentAt && ` — ${formatDateTime(request.telegramSentAt)}`}
              </dd>
              <dt className="text-slate">Email confirmation</dt>
              <dd className="text-navy">
                {request.emailStatus}
                {request.emailSentAt && ` — ${formatDateTime(request.emailSentAt)}`}
              </dd>
              <dt className="text-slate">Created</dt>
              <dd className="text-navy">{formatDateTime(request.createdAt)}</dd>
              <dt className="text-slate">Updated</dt>
              <dd className="text-navy">{formatDateTime(request.updatedAt)}</dd>
            </dl>
          </section>

          <section className="rounded-panel border border-steel bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">Activity</h2>
            <div className="mt-4">{activity.ok ? <ActivityTimeline events={activity.events} /> : <p className="text-sm text-ink">{activity.message}</p>}</div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="rounded-panel border border-steel bg-surface p-6">
            <RequestStatusControl requestId={request.id} status={request.requestStatus} />
          </section>

          <section className="rounded-panel border border-steel bg-surface p-6">
            <AddNoteForm customerId={request.customerId} serviceRequestId={request.id} />
          </section>
        </div>
      </div>
    </div>
  );
}
