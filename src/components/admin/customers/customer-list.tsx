import Link from "next/link";
import type { AdminCustomerListItem } from "@/features/admin/customers/types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

export function CustomerList({ customers }: { customers: AdminCustomerListItem[] }) {
  if (customers.length === 0) {
    return <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm text-slate">No customers match this view.</div>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-panel border border-steel bg-surface lg:block">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
              <th className="px-4 py-3">Customer</th>
              <th className="w-36 px-4 py-3">Phone</th>
              <th className="w-48 px-4 py-3">Email</th>
              <th className="w-20 px-4 py-3">ZIP</th>
              <th className="w-32 px-4 py-3">First seen</th>
              <th className="w-32 px-4 py-3">Last request</th>
              <th className="w-24 px-4 py-3">Requests</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-steel last:border-b-0 hover:bg-page-bg">
                <td className="px-4 py-3 align-top">
                  <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-brand-primary hover:underline">
                    {customer.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top text-slate">{customer.phone}</td>
                <td className="px-4 py-3 align-top text-slate">{customer.email ?? "—"}</td>
                <td className="px-4 py-3 align-top text-slate">{customer.zipCode ?? "—"}</td>
                <td className="px-4 py-3 align-top text-slate">{formatDate(customer.firstSeenAt)}</td>
                <td className="px-4 py-3 align-top text-slate">{formatDate(customer.lastRequestAt)}</td>
                <td className="px-4 py-3 align-top text-slate">{customer.totalRequests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        {customers.map((customer) => (
          <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="flex flex-col gap-2 rounded-panel border border-steel bg-surface p-5">
            <p className="font-semibold text-navy">{customer.fullName}</p>
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
