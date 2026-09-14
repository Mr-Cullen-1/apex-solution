import Link from "next/link";
import type { AdminCustomerListItem } from "@/features/admin/customers/types";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { UsersIcon } from "@/components/ui/icons";

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

export function CustomerList({ customers }: { customers: AdminCustomerListItem[] }) {
  if (customers.length === 0) {
    return (
      <div className="rounded-panel border border-steel bg-surface p-6">
        <EmptyState icon={<UsersIcon className="size-6" />} title="No customers match this view" description="Try a different search term." />
      </div>
    );
  }

  return (
    <>
      {/* Fixed pixel column widths + a table min-width (rather than an
       * unconstrained flexible Customer column) so a long email can never
       * visually spill into ZIP — it's clipped with an ellipsis and a
       * hover title instead. overflow-x-auto on the wrapper scrolls below
       * the min-width rather than compressing any column further. */}
      <div className="hidden overflow-x-auto rounded-panel border border-steel bg-surface lg:block">
        <table className="w-full min-w-[940px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel bg-page-bg text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
              <th className="w-[200px] px-4 py-3">Customer</th>
              <th className="w-[130px] px-4 py-3">Phone</th>
              <th className="w-[210px] px-4 py-3">Email</th>
              <th className="w-[70px] px-4 py-3">ZIP</th>
              <th className="w-[110px] px-4 py-3">First seen</th>
              <th className="w-[110px] px-4 py-3">Last request</th>
              <th className="w-[90px] px-4 py-3">Requests</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-steel last:border-b-0 hover:bg-page-bg">
                <td className="px-4 py-3.5 align-top">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[0.65rem] font-bold text-brand-primary">{initials(customer.fullName)}</span>
                    <Link href={`/admin/customers/${customer.id}`} className="block min-w-0 truncate font-semibold text-navy hover:text-brand-primary hover:underline">
                      {customer.fullName}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3.5 align-top whitespace-nowrap text-slate">{customer.phone}</td>
                <td className="px-4 py-3.5 align-top text-slate">
                  <span className="block truncate" title={customer.email ?? undefined}>
                    {customer.email ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3.5 align-top text-slate">{customer.zipCode ?? "—"}</td>
                <td className="px-4 py-3.5 align-top whitespace-nowrap text-slate">{formatDate(customer.firstSeenAt)}</td>
                <td className="px-4 py-3.5 align-top whitespace-nowrap text-slate">{formatDate(customer.lastRequestAt)}</td>
                <td className="px-4 py-3.5 align-top font-semibold text-navy">{customer.totalRequests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {customers.map((customer) => (
          <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="flex flex-col gap-2 rounded-panel border border-steel bg-surface p-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-primary">{initials(customer.fullName)}</span>
              <p className="font-semibold text-navy">{customer.fullName}</p>
            </div>
            <p className="text-sm text-slate">
              {customer.phone} {customer.email && `· ${customer.email}`}
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate">
              <span>First seen {formatDate(customer.firstSeenAt)}</span>
              <span>{customer.totalRequests} request{customer.totalRequests === 1 ? "" : "s"}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
