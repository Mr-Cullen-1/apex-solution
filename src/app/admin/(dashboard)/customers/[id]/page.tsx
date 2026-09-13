import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCustomer } from "@/features/admin/customers/repository";
import { listRequestsForCustomer } from "@/features/admin/requests/repository";
import { listActivityForCustomer } from "@/features/admin/activity/repository";
import { CustomerRequestHistory } from "@/components/admin/customers/customer-request-history";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { AddNoteForm } from "@/components/admin/add-note-form";

export const metadata: Metadata = { title: "Customer profile" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

type CustomerProfilePageProps = { params: Promise<{ id: string }> };

// No customer login/account exists anywhere — this profile is internal
// CRM only (instruction: "DO NOT add call history in Phase 2").
export default async function AdminCustomerProfilePage({ params }: CustomerProfilePageProps) {
  const { id } = await params;
  const result = await getAdminCustomer(id);

  if (!result.ok && result.status === "not_found") notFound();
  if (!result.ok) {
    return <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>;
  }

  const { customer } = result;
  const [requestsResult, activityResult] = await Promise.all([listRequestsForCustomer(customer.id), listActivityForCustomer(customer.id)]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-navy">{customer.fullName}</h1>
        <p className="mt-1 text-sm text-slate">Customer since {formatDate(customer.firstSeenAt)}</p>
      </div>

      <section className="rounded-panel border border-steel bg-surface p-6">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <dt className="text-slate">Phone</dt>
          <dd className="text-navy">{customer.phone}</dd>
          <dt className="text-slate">Email</dt>
          <dd className="text-navy">{customer.email ?? "—"}</dd>
          <dt className="text-slate">ZIP</dt>
          <dd className="text-navy">{customer.zipCode ?? "—"}</dd>
          <dt className="text-slate">First request</dt>
          <dd className="text-navy">{formatDate(customer.firstSeenAt)}</dd>
          <dt className="text-slate">Most recent request</dt>
          <dd className="text-navy">{formatDate(customer.lastRequestAt)}</dd>
          <dt className="text-slate">Total requests</dt>
          <dd className="text-navy">{customer.totalRequests}</dd>
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-panel border border-steel bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">Request history</h2>
            <div className="mt-4">{requestsResult.ok ? <CustomerRequestHistory requests={requestsResult.requests} /> : <p className="text-sm text-ink">{requestsResult.message}</p>}</div>
          </section>

          <section className="rounded-panel border border-steel bg-surface p-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">Activity</h2>
            <div className="mt-4">{activityResult.ok ? <ActivityTimeline events={activityResult.events} /> : <p className="text-sm text-ink">{activityResult.message}</p>}</div>
          </section>
        </div>

        <div>
          <section className="rounded-panel border border-steel bg-surface p-6">
            <AddNoteForm customerId={customer.id} />
          </section>
        </div>
      </div>
    </div>
  );
}
