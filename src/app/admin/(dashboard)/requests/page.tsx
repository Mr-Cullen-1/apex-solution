import type { Metadata } from "next";
import { RequestFilters } from "@/components/admin/requests/request-filters";
import { RequestList } from "@/components/admin/requests/request-list";
import { Pagination } from "@/components/admin/pagination";
import { AdminPageHeader } from "@/components/admin/ui/page-header";
import { listAdminRequests } from "@/features/admin/requests/repository";
import type { AdminEmailStatusFilter, AdminOfferFilter, AdminRequestStatusFilter, AdminTelegramStatusFilter } from "@/features/admin/requests/types";

export const metadata: Metadata = { title: "Requests" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STATUS_VALUES: AdminRequestStatusFilter[] = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELLED", "all"];
const TELEGRAM_VALUES: AdminTelegramStatusFilter[] = ["pending", "sent", "failed", "all"];
const EMAIL_VALUES: AdminEmailStatusFilter[] = ["not_requested", "pending", "sent", "failed", "all"];
const OFFER_VALUES: AdminOfferFilter[] = ["with", "without", "all"];

type RequestsPageProps = {
  searchParams: Promise<{ status?: string; telegram?: string; email?: string; offer?: string; service?: string; page?: string; q?: string }>;
};

export default async function AdminRequestsPage({ searchParams }: RequestsPageProps) {
  const params = await searchParams;

  const status = (STATUS_VALUES.includes(params.status as AdminRequestStatusFilter) ? params.status : "all") as AdminRequestStatusFilter;
  const telegramStatus = (TELEGRAM_VALUES.includes(params.telegram as AdminTelegramStatusFilter) ? params.telegram : "all") as AdminTelegramStatusFilter;
  const emailStatus = (EMAIL_VALUES.includes(params.email as AdminEmailStatusFilter) ? params.email : "all") as AdminEmailStatusFilter;
  const offer = (OFFER_VALUES.includes(params.offer as AdminOfferFilter) ? params.offer : "all") as AdminOfferFilter;
  const serviceId = params.service?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = (params.q ?? "").trim();

  const result = await listAdminRequests({ status, telegramStatus, emailStatus, offer, serviceId: serviceId || undefined, page, search: search || undefined });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader eyebrow="Operations" title="Requests" description="Book Now submissions — newest first." />

      <RequestFilters status={status} telegramStatus={telegramStatus} emailStatus={emailStatus} offer={offer} serviceId={serviceId} search={search} />

      {!result.ok ? (
        <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>
      ) : (
        <>
          <RequestList requests={result.requests} />
          <Pagination
            basePath="/admin/requests"
            params={{ status, telegram: telegramStatus, email: emailStatus, offer, service: serviceId, q: search }}
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
          />
        </>
      )}
    </div>
  );
}
