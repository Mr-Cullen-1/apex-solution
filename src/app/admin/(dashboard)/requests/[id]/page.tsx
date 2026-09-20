import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminRequest } from "@/features/admin/requests/repository";
import { listActivityForRequest } from "@/features/admin/activity/repository";
import { RequestStatusControl } from "@/components/admin/requests/request-status-control";
import { RequestStatusBadge } from "@/components/admin/requests/request-status-badge";
import { DeliveryStatusBadge } from "@/components/admin/requests/delivery-status-badge";
import { Badge } from "@/components/admin/ui/badge";
import { SectionCard } from "@/components/admin/ui/section-card";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { AddNoteForm } from "@/components/admin/add-note-form";
import { ArrowRightIcon } from "@/components/ui/icons";
import { resolveSourceLabel } from "@/features/booking/model";
import { ReviewInvitationCard } from "@/components/admin/requests/review-invitation-card";
import { listReviewInvitationsForRequest } from "@/features/admin/reviews/invitations-repository";

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
  const [activity, invitations] = await Promise.all([listActivityForRequest(request.id), listReviewInvitationsForRequest(request.id)]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{request.requestCode} · {resolveSourceLabel(request.source)}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-navy">{request.fullName}</h1>
          <p className="mt-1 text-sm text-slate">Submitted {formatDateTime(request.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <RequestStatusBadge status={request.requestStatus} />
          <Link href={`/admin/customers/${request.customerId}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:underline">
            Customer profile <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SectionCard title="Contact">
            {/* Each field is its own dt+dd group inside one div -- a flat
                dt,dd,dt,dd,dt,dd child list here would auto-place into
                sm:grid-cols-3's row-major grid as Phone/value/Email on row
                1 and value/ZIP/value on row 2 (three columns, six flat
                items), splitting every label from its own value. Wrapping
                each pair keeps label directly above its value regardless of
                column count -- the exact pattern "Delivery" below already
                uses. */}
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate">Phone</dt>
                <dd className="mt-1.5 text-navy">{request.phone}</dd>
              </div>
              <div>
                <dt className="text-slate">Email</dt>
                <dd className="mt-1.5 text-navy">{request.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate">ZIP Code</dt>
                <dd className="mt-1.5 text-navy">{request.zipCode}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Service request">
            {/* Same dt+dd-per-field fix as Contact above. */}
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-slate">Service</dt>
                <dd className="mt-1.5 text-navy">{request.serviceLabel ?? request.categoryLabel ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate">Issue</dt>
                <dd className="mt-1.5 text-navy">{request.issue ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate">Offer</dt>
                <dd className="mt-1.5">{request.offerLabel ? <Badge tone="accent">{request.offerLabel} — {request.discountPercent}%</Badge> : <span className="text-slate">No offer</span>}</dd>
              </div>
            </dl>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-slate">Customer message</p>
            <p className="mt-2 whitespace-pre-line rounded-control bg-page-bg p-4 text-sm leading-6 text-navy">{request.message}</p>
          </SectionCard>

          <SectionCard title="Delivery">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-slate">Telegram</dt>
                <dd className="mt-1.5">
                  <DeliveryStatusBadge status={request.telegramStatus} />
                  {request.telegramSentAt && <p className="mt-1.5 text-xs text-slate">{formatDateTime(request.telegramSentAt)}</p>}
                </dd>
              </div>
              <div>
                <dt className="text-slate">Email confirmation</dt>
                <dd className="mt-1.5">
                  <DeliveryStatusBadge status={request.emailStatus} />
                  {request.emailSentAt && <p className="mt-1.5 text-xs text-slate">{formatDateTime(request.emailSentAt)}</p>}
                </dd>
              </div>
              <div>
                <dt className="text-slate">Created</dt>
                <dd className="mt-1.5 text-navy">{formatDateTime(request.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-slate">Updated</dt>
                <dd className="mt-1.5 text-navy">{formatDateTime(request.updatedAt)}</dd>
              </div>
            </dl>
          </SectionCard>

          <SectionCard title="Activity">
            {activity.ok ? <ActivityTimeline events={activity.events} /> : <p className="text-sm text-ink">{activity.message}</p>}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Status">
            <RequestStatusControl requestId={request.id} status={request.requestStatus} />
          </SectionCard>

          <SectionCard title="Notes">
            <AddNoteForm customerId={request.customerId} serviceRequestId={request.id} />
          </SectionCard>

          <SectionCard title="Review invitation">
            <ReviewInvitationCard
              requestId={request.id}
              invitation={invitations.ok ? (invitations.invitations[0] ?? null) : null}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
