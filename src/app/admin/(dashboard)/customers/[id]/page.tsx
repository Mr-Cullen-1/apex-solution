import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCustomer } from "@/features/admin/customers/repository";
import { listRequestsForCustomer } from "@/features/admin/requests/repository";
import { listActivityForCustomer } from "@/features/admin/activity/repository";
import { CustomerRequestHistory } from "@/components/admin/customers/customer-request-history";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { AddNoteForm } from "@/components/admin/add-note-form";
import { SectionCard } from "@/components/admin/ui/section-card";

export const metadata: Metadata = { title: "Customer profile" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
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
      <div className="flex flex-wrap items-center gap-4">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg font-bold text-brand-primary">{initials(customer.fullName)}</span>
        <div>
          <p className="eyebrow">Customer profile</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-[-0.02em] text-navy">{customer.fullName}</h1>
          <p className="mt-1 text-sm text-slate">Customer since {formatDate(customer.firstSeenAt)}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Total requests" value={String(customer.totalRequests)} />
        <StatTile label="First request" value={formatDate(customer.firstSeenAt)} />
        <StatTile label="Most recent request" value={formatDate(customer.lastRequestAt)} />
      </div>

      <SectionCard title="Contact">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          <dt className="text-slate">Phone</dt>
          <dd className="text-navy sm:col-span-2">{customer.phone}</dd>
          <dt className="text-slate">Email</dt>
          <dd className="text-navy sm:col-span-2">{customer.email ?? "—"}</dd>
          <dt className="text-slate">ZIP</dt>
          <dd className="text-navy sm:col-span-2">{customer.zipCode ?? "—"}</dd>
        </dl>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <SectionCard title="Request history">
            {requestsResult.ok ? <CustomerRequestHistory requests={requestsResult.requests} /> : <p className="text-sm text-ink">{requestsResult.message}</p>}
          </SectionCard>

          <SectionCard title="Activity">
            {activityResult.ok ? <ActivityTimeline events={activityResult.events} /> : <p className="text-sm text-ink">{activityResult.message}</p>}
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Notes">
            <AddNoteForm customerId={customer.id} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-panel border border-steel bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-[-0.01em] text-navy">{value}</p>
    </div>
  );
}
