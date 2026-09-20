import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui/page-header";
import { CreateRequestForm } from "@/components/admin/requests/create-request-form";
import { getAdminCreateRequestServiceOptions } from "@/features/admin/requests/service-options";

export const metadata: Metadata = { title: "Create request" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

// For a customer who calls Apex directly by phone — creates a canonical
// request through the exact same pipeline as public Book Now (see
// createAdminRequestAction), just with source = "admin_phone" instead of
// "book_now". Protected by requireAdmin() inside the Server Action itself
// (and by the (dashboard) layout for the page render).
export default function AdminCreateRequestPage() {
  const serviceOptions = getAdminCreateRequestServiceOptions();
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader eyebrow="Operations" title="Create request" description="Log a request a customer called in about directly." />
      <div className="max-w-5xl">
        <CreateRequestForm serviceOptions={serviceOptions} />
      </div>
    </div>
  );
}
