import type { Metadata } from "next";
import { CustomerList } from "@/components/admin/customers/customer-list";
import { Pagination } from "@/components/admin/pagination";
import { AdminPageHeader } from "@/components/admin/ui/page-header";
import { listAdminCustomers } from "@/features/admin/customers/repository";

export const metadata: Metadata = { title: "Customers" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CustomersPageProps = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = (params.q ?? "").trim();

  const result = await listAdminCustomers({ page, search: search || undefined });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader eyebrow="Operations" title="Customers" description="Internal CRM directory — resolved from Book Now submissions." />

      <form method="get" action="/admin/customers" className="flex items-center gap-2 rounded-panel border border-steel bg-surface p-4 sm:p-5">
        <label htmlFor="customer-search" className="sr-only">
          Search customers
        </label>
        <input
          id="customer-search"
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search name, phone, email…"
          className="min-h-10 w-full max-w-sm rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none focus-visible:border-brand-primary"
        />
        <button type="submit" className="min-h-10 rounded-control border border-steel bg-surface px-4 text-sm font-semibold text-navy hover:border-navy">
          Search
        </button>
      </form>

      {!result.ok ? (
        <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>
      ) : (
        <>
          <CustomerList customers={result.customers} />
          <Pagination basePath="/admin/customers" params={{ q: search }} page={result.page} pageSize={result.pageSize} total={result.total} />
        </>
      )}
    </div>
  );
}
