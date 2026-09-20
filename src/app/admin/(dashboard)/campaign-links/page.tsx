import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/ui/page-header";
import { listCampaignLinks } from "@/features/admin/campaign-links/repository";
import { getAdminCreateRequestServiceOptions } from "@/features/admin/requests/service-options";
import { CampaignLinksBoard } from "@/components/admin/campaign-links/campaign-links-board";

export const metadata: Metadata = { title: "Campaign links" };

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ADMIN or SUPER_ADMIN — same authorization tier as Requests/Customers
// (not account management). A generated link only ever resolves into the
// existing public Book Now experience (see src/app/l/[token]/route.ts) —
// this page never builds a second booking form.
export default async function AdminCampaignLinksPage() {
  const [result, serviceOptions] = await Promise.all([listCampaignLinks(), Promise.resolve(getAdminCreateRequestServiceOptions())]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        eyebrow="Operations"
        title="Campaign links"
        description="Generate a trackable link for Instagram or Facebook ads that opens Book Now with a service pre-selected."
      />

      {!result.ok ? (
        <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm font-medium text-ink">{result.message}</div>
      ) : (
        <CampaignLinksBoard links={result.links} serviceOptions={serviceOptions} />
      )}
    </div>
  );
}
