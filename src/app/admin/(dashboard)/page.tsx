import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/ui/page-header";
import { KpiCard } from "@/components/admin/ui/kpi-card";
import { ChartCard } from "@/components/admin/ui/chart-card";
import { SectionCard } from "@/components/admin/ui/section-card";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AreaLineChart } from "@/components/admin/charts/area-line-chart";
import { DonutChart } from "@/components/admin/charts/donut-chart";
import { BarListChart } from "@/components/admin/charts/bar-list-chart";
import { StackedBar } from "@/components/admin/charts/stacked-bar";
import { RequestStatusBadge } from "@/components/admin/requests/request-status-badge";
import { AlertTriangleIcon, InboxIcon, MailIcon, SendIcon, ShieldIcon, StarIcon, UsersIcon } from "@/components/ui/icons";
import { getAdminReviewCounts } from "@/features/admin/reviews/repository";
import {
  getActiveAdminCount,
  getDeliveryOutcomes,
  getRecentRequestsFeed,
  getRequestStatusDistribution,
  getRequestsOverTime,
  getServiceRequestSignals,
  getTopServiceCategories,
} from "@/features/admin/dashboard/repository";
import { requireAdmin } from "@/features/admin/auth/require-admin";

export const metadata: Metadata = { title: "Dashboard" };

// Always fresh — operational counts must never serve stale, publicly-cached
// data (instruction #20). Direct Supabase reads (not `fetch`), so this
// segment option is what prevents Next from treating the render as
// cacheable static output.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const RANGE_OPTIONS = [7, 14, 30] as const;
type RangeOption = (typeof RANGE_OPTIONS)[number];

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

type DashboardPageProps = { searchParams: Promise<{ range?: string }> };

export default async function AdminDashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const admin = await requireAdmin();
  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const parsedRange = Number.parseInt(params.range ?? "14", 10);
  const range: RangeOption = RANGE_OPTIONS.includes(parsedRange as RangeOption) ? (parsedRange as RangeOption) : 14;

  const [countsResult, signalsResult, adminCountResult, seriesResult, distributionResult, categoriesResult, deliveryResult, feedResult] = await Promise.all([
    getAdminReviewCounts(),
    getServiceRequestSignals(),
    isSuperAdmin ? getActiveAdminCount() : Promise.resolve(null),
    getRequestsOverTime(range),
    getRequestStatusDistribution(),
    getTopServiceCategories(6),
    getDeliveryOutcomes(),
    getRecentRequestsFeed(6),
  ]);

  const kpis = signalsResult.ok && countsResult.ok
    ? [
        { label: "New Requests", value: signalsResult.signals.newStatusCount, href: "/admin/requests?status=NEW", cta: "View new", icon: <InboxIcon className="size-4" />, tone: "brand" as const },
        { label: "Open Requests", value: signalsResult.signals.needsFollowUpCount, href: "/admin/requests", cta: "View requests", icon: <InboxIcon className="size-4" />, tone: "brand" as const },
        {
          label: "Requests — 24h",
          value: signalsResult.signals.newLast24h,
          href: "/admin/requests",
          cta: "View requests",
          icon: <InboxIcon className="size-4" />,
          tone: "neutral" as const,
        },
        { label: "Total Customers", value: signalsResult.signals.customerCount, href: "/admin/customers", cta: "View customers", icon: <UsersIcon className="size-4" />, tone: "neutral" as const },
        { label: "Pending Reviews", value: countsResult.counts.pending, href: "/admin/reviews?status=pending", cta: "Review pending", icon: <StarIcon className="size-4" />, tone: "brand" as const },
        {
          label: "Approved Reviews",
          value: countsResult.counts.approved,
          href: "/admin/reviews?status=approved",
          cta: "View approved",
          icon: <StarIcon className="size-4" />,
          tone: "success" as const,
        },
        {
          label: "Telegram Failed",
          value: signalsResult.signals.telegramFailed,
          href: "/admin/requests?telegram=failed",
          cta: "View failed",
          icon: <SendIcon className="size-4" />,
          tone: "critical" as const,
        },
        {
          label: "Email Failed",
          value: signalsResult.signals.emailFailed,
          href: "/admin/requests?email=failed",
          cta: "View failed",
          icon: <MailIcon className="size-4" />,
          tone: "critical" as const,
        },
        ...(isSuperAdmin && adminCountResult?.ok
          ? [{ label: "Active Admins", value: adminCountResult.count, href: "/admin/admins", cta: "Manage admins", icon: <ShieldIcon className="size-4" />, tone: "neutral" as const }]
          : []),
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader eyebrow="Operations" title="Dashboard" description="Live operational summary — refreshed on every load." />

      {!signalsResult.ok || !countsResult.ok ? (
        <ErrorPanel message={!signalsResult.ok ? signalsResult.message : (countsResult as { message: string }).message} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          title="Requests over time"
          subtitle={`Daily submissions, last ${range} days`}
          className="lg:col-span-2"
          action={<RangeToggle current={range} />}
        >
          {seriesResult.ok ? (
            <AreaLineChart points={seriesResult.points.map((p) => ({ label: p.date, value: p.count }))} ariaLabel={`Requests submitted per day, last ${range} days`} />
          ) : (
            <EmptyState title="Chart unavailable" description={seriesResult.message} />
          )}
        </ChartCard>

        <ChartCard title="Request status" subtitle="All-time distribution">
          {distributionResult.ok ? (
            <DonutChart
              ariaLabel="Request status distribution"
              segments={[
                { label: "New", value: distributionResult.distribution.NEW, color: "var(--status-pipeline-1)" },
                { label: "Contacted", value: distributionResult.distribution.CONTACTED, color: "var(--status-pipeline-2)" },
                { label: "Scheduled", value: distributionResult.distribution.SCHEDULED, color: "var(--status-pipeline-3)" },
                { label: "Completed", value: distributionResult.distribution.COMPLETED, color: "var(--status-pipeline-4)" },
                { label: "Cancelled", value: distributionResult.distribution.CANCELLED, color: "var(--ink-muted)" },
              ]}
            />
          ) : (
            <EmptyState title="Chart unavailable" description={distributionResult.message} />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Reviews moderation" subtitle="pending / approved / rejected">
          {countsResult.ok ? (
            <DonutChart
              ariaLabel="Review moderation status"
              centerLabel="Reviews"
              segments={[
                { label: "Pending", value: countsResult.counts.pending, color: "var(--brand-primary)" },
                { label: "Approved", value: countsResult.counts.approved, color: "var(--status-live)" },
                { label: "Rejected", value: countsResult.counts.rejected, color: "var(--ink-muted)" },
              ]}
            />
          ) : (
            <EmptyState title="Chart unavailable" description={countsResult.message} />
          )}
        </ChartCard>

        <ChartCard title="Top service categories" subtitle="Most recent 5,000 submissions">
          {categoriesResult.ok ? (
            categoriesResult.categories.length === 0 ? (
              <EmptyState title="No submissions yet" description="Categories will appear here once Book Now requests start coming in." />
            ) : (
              <BarListChart ariaLabel="Top service categories by request volume" items={categoriesResult.categories.map((c) => ({ label: c.label, value: c.count }))} />
            )
          ) : (
            <EmptyState title="Chart unavailable" description={categoriesResult.message} />
          )}
        </ChartCard>

        <ChartCard title="Delivery outcomes" subtitle="Telegram & confirmation email">
          {deliveryResult.ok ? (
            <div className="flex flex-col divide-y divide-steel">
              <div className="pb-5">
                <StackedBar
                  title="Telegram"
                  ariaLabel="Telegram delivery outcomes"
                  segments={[
                    { label: "Sent", value: deliveryResult.outcomes.telegram.sent, color: "var(--status-live)" },
                    { label: "Pending", value: deliveryResult.outcomes.telegram.pending, color: "var(--brand-primary)" },
                    { label: "Failed", value: deliveryResult.outcomes.telegram.failed, color: "var(--status-critical)" },
                  ]}
                />
              </div>
              <div className="pt-5">
                <StackedBar
                  title="Confirmation email"
                  ariaLabel="Confirmation email delivery outcomes"
                  segments={[
                    { label: "Sent", value: deliveryResult.outcomes.email.sent, color: "var(--status-live)" },
                    { label: "Pending", value: deliveryResult.outcomes.email.pending, color: "var(--brand-primary)" },
                    { label: "Failed", value: deliveryResult.outcomes.email.failed, color: "var(--status-critical)" },
                    { label: "Not requested", value: deliveryResult.outcomes.email.notRequested, color: "var(--ink-muted)" },
                  ]}
                />
              </div>
            </div>
          ) : (
            <EmptyState title="Chart unavailable" description={deliveryResult.message} />
          )}
        </ChartCard>
      </div>

      <SectionCard title="Recent activity" action={<Link href="/admin/requests" className="text-sm font-semibold text-brand-primary hover:underline">View all requests →</Link>}>
        {!feedResult.ok ? (
          <p className="text-sm text-ink">{feedResult.message}</p>
        ) : feedResult.items.length === 0 ? (
          <EmptyState icon={<AlertTriangleIcon className="size-6" />} title="No requests yet" description="New Book Now submissions will show up here as they arrive." />
        ) : (
          <ul className="flex flex-col divide-y divide-steel">
            {feedResult.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link href={`/admin/requests/${item.id}`} className="font-semibold text-brand-primary hover:underline">
                    {item.fullName}
                  </Link>
                  <p className="text-xs text-slate">
                    {item.serviceLabel ?? item.categoryLabel ?? "General"} · {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <RequestStatusBadge status={item.requestStatus} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

function RangeToggle({ current }: { current: RangeOption }) {
  return (
    <div role="tablist" aria-label="Chart range" className="flex gap-1 rounded-control border border-steel p-0.5">
      {RANGE_OPTIONS.map((option) => (
        <Link
          key={option}
          href={`/admin?range=${option}`}
          role="tab"
          aria-selected={option === current}
          className={`rounded-control px-2.5 py-1 text-xs font-semibold transition-colors ${option === current ? "bg-navy text-white" : "text-slate hover:text-navy"}`}
        >
          {option}d
        </Link>
      ))}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return <div className="rounded-panel border border-steel bg-surface p-6 text-sm font-medium text-ink">{message}</div>;
}
