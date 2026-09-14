import type { ReactNode } from "react";
import { getServiceFilterOptions } from "@/features/admin/requests/service-options";
import type { AdminEmailStatusFilter, AdminOfferFilter, AdminRequestStatusFilter, AdminTelegramStatusFilter } from "@/features/admin/requests/types";

const SELECT_CLASSES = "min-h-10 rounded-control border border-steel bg-surface px-3 text-sm text-navy outline-none focus-visible:border-brand-primary";

/** All filters live in the URL (?status=&telegram=&email=&offer=&service=&q=&page=)
 * — one GET form, submitted together, always resets to page 1. Server-side
 * pagination + these filters are mandatory; the service dropdown and
 * search are conveniences on top. */
export function RequestFilters({
  status,
  telegramStatus,
  emailStatus,
  offer,
  serviceId,
  search,
}: {
  status: AdminRequestStatusFilter;
  telegramStatus: AdminTelegramStatusFilter;
  emailStatus: AdminEmailStatusFilter;
  offer: AdminOfferFilter;
  serviceId: string;
  search: string;
}) {
  const serviceOptions = getServiceFilterOptions();

  return (
    <form method="get" action="/admin/requests" className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-panel border border-steel bg-surface p-4 sm:p-5">
      <Field label="Status">
        <select name="status" defaultValue={status} className={SELECT_CLASSES}>
          <option value="all">All</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </Field>

      <Field label="Telegram">
        <select name="telegram" defaultValue={telegramStatus} className={SELECT_CLASSES}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </Field>

      <Field label="Email">
        <select name="email" defaultValue={emailStatus} className={SELECT_CLASSES}>
          <option value="all">All</option>
          <option value="not_requested">Not requested</option>
          <option value="pending">Pending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </Field>

      <Field label="Offer">
        <select name="offer" defaultValue={offer} className={SELECT_CLASSES}>
          <option value="all">All</option>
          <option value="with">With offer</option>
          <option value="without">No offer</option>
        </select>
      </Field>

      <Field label="Service">
        <select name="service" defaultValue={serviceId} className={SELECT_CLASSES}>
          <option value="">All</option>
          {serviceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-1 min-w-[200px] flex-col gap-1">
        <label htmlFor="request-search" className="text-xs font-bold uppercase tracking-[0.06em] text-slate">
          Search
        </label>
        <input
          id="request-search"
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Name, phone, email, ZIP…"
          className="min-h-10 rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none focus-visible:border-brand-primary"
        />
      </div>

      <button type="submit" className="min-h-10 rounded-control bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary">
        Apply
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-slate">{label}</span>
      {children}
    </div>
  );
}
