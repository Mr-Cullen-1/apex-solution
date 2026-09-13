import type { Metadata } from "next";
import { DashboardCard } from "@/components/admin/dashboard-card";
import { getAdminReviewCounts } from "@/features/admin/reviews/repository";
import { getActiveAdminCount, getServiceRequestSignals } from "@/features/admin/dashboard/repository";
import { requireAdmin } from "@/features/admin/auth/require-admin";

export const metadata: Metadata = { title: "Dashboard" };

// Always fresh — operational counts must never serve stale, publicly-cached
// data (instruction #20). Direct Supabase reads (not `fetch`), so this
// segment option is what prevents Next from treating the render as
// cacheable static output.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const isSuperAdmin = admin.role === "SUPER_ADMIN";

  const [countsResult, signalsResult, adminCountResult] = await Promise.all([
    getAdminReviewCounts(),
    getServiceRequestSignals(),
    isSuperAdmin ? getActiveAdminCount() : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-navy">Dashboard</h1>
        <p className="mt-1 text-sm text-slate">Operational summary — refreshed on every load.</p>
      </div>

      <section aria-labelledby="request-signals-heading" className="flex flex-col gap-4">
        <h2 id="request-signals-heading" className="text-sm font-bold uppercase tracking-[0.1em] text-slate">
          Requests
        </h2>
        {!signalsResult.ok ? (
          <ErrorPanel message={signalsResult.message} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard label="Requests — last 24h" value={signalsResult.signals.newLast24h} href="/admin/requests" cta="View requests" />
            <DashboardCard label="New Requests" value={signalsResult.signals.newStatusCount} href="/admin/requests?status=NEW" cta="View new" emphasize />
            <DashboardCard label="Needs Follow-up" value={signalsResult.signals.needsFollowUpCount} href="/admin/requests" cta="View requests" />
            <DashboardCard label="Customers" value={signalsResult.signals.customerCount} href="/admin/customers" cta="View customers" />
            <DashboardCard label="Telegram Failed" value={signalsResult.signals.telegramFailed} href="/admin/requests?telegram=failed" cta="View failed" />
            <DashboardCard label="Email Failed" value={signalsResult.signals.emailFailed} href="/admin/requests?email=failed" cta="View failed" />
          </div>
        )}
      </section>

      <section aria-labelledby="review-signals-heading" className="flex flex-col gap-4">
        <h2 id="review-signals-heading" className="text-sm font-bold uppercase tracking-[0.1em] text-slate">
          Reviews
        </h2>
        {!countsResult.ok ? (
          <ErrorPanel message={countsResult.message} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard label="Pending Reviews" value={countsResult.counts.pending} href="/admin/reviews?status=pending" cta="Review pending" emphasize />
            <DashboardCard label="Approved Reviews" value={countsResult.counts.approved} href="/admin/reviews?status=approved" cta="View approved" />
            <DashboardCard label="Rejected Reviews" value={countsResult.counts.rejected} href="/admin/reviews?status=rejected" cta="View rejected" />
            <DashboardCard label="Featured Reviews" value={countsResult.counts.featured} href="/admin/reviews?status=approved" cta="View approved" />
          </div>
        )}
      </section>

      {isSuperAdmin && (
        <section aria-labelledby="admin-signals-heading" className="flex flex-col gap-4">
          <h2 id="admin-signals-heading" className="text-sm font-bold uppercase tracking-[0.1em] text-slate">
            Admins
          </h2>
          {!adminCountResult || !adminCountResult.ok ? (
            <ErrorPanel message={adminCountResult?.message ?? "Couldn't load admin count."} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard label="Active Admins" value={adminCountResult.count} href="/admin/admins" cta="Manage admins" />
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return <div className="rounded-panel border border-steel bg-surface p-6 text-sm font-medium text-ink">{message}</div>;
}
