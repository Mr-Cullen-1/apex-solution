"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaignLinkAction, setCampaignLinkActiveAction } from "@/features/admin/campaign-links/actions";
import type { AdminCampaignLink, CampaignPlatform } from "@/features/admin/campaign-links/types";
import { encodeServiceSelection, resolveServiceSelection } from "@/features/admin/requests/service-options";
import type { AdminCreateRequestServiceOption, ServiceSelection } from "@/features/admin/requests/service-options";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { TagIcon } from "@/components/ui/icons";

const EMPTY_SELECTION: ServiceSelection = { categoryId: "", serviceId: "" };

const fieldClass =
  "min-h-10 w-full rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none transition-colors focus-visible:border-brand-primary";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

export function CampaignLinksBoard({ links, serviceOptions }: { links: AdminCampaignLink[]; serviceOptions: AdminCreateRequestServiceOption[] }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<CampaignPlatform>("instagram");
  const [campaignName, setCampaignName] = useState("");
  const [selection, setSelection] = useState<ServiceSelection>(EMPTY_SELECTION);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  function linkUrl(token: string) {
    return `${window.location.origin}/l/${token}`;
  }

  async function handleCopy(token: string) {
    try {
      await navigator.clipboard.writeText(linkUrl(token));
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      // Clipboard API can be unavailable — the link is still visible to copy manually.
    }
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createCampaignLinkAction({ platform, campaignName, ...selection });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setJustCreated(result.link.token);
      setCampaignName("");
      setSelection(EMPTY_SELECTION);
      router.refresh();
    });
  }

  function handleToggleActive(id: string, next: boolean) {
    startTransition(async () => {
      await setCampaignLinkActiveAction(id, next);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="rounded-panel border border-steel bg-surface p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="cl-platform" className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate">
              Platform
            </label>
            <select id="cl-platform" className={fieldClass} value={platform} onChange={(event) => setPlatform(event.target.value as CampaignPlatform)}>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          <div>
            <label htmlFor="cl-service" className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate">
              Service
            </label>
            <select
              id="cl-service"
              className={fieldClass}
              value={encodeServiceSelection(selection)}
              onChange={(event) => setSelection(resolveServiceSelection(serviceOptions, event.target.value))}
            >
              <option value="">Any service</option>
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cl-name" className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate">
              Campaign name <span className="font-normal normal-case text-slate">Optional</span>
            </label>
            <input id="cl-name" className={fieldClass} value={campaignName} onChange={(event) => setCampaignName(event.target.value)} placeholder="e.g. AC Repair September" />
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-navy">{error}</p>}
        {justCreated && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-control border border-brand-primary bg-brand-soft p-3">
            <code className="min-w-0 flex-1 truncate rounded-control border border-steel bg-surface px-2.5 py-2 font-mono text-xs text-navy">{linkUrl(justCreated)}</code>
            <button type="button" onClick={() => handleCopy(justCreated)} className="shrink-0 rounded-control border border-steel bg-surface px-3 py-2 text-xs font-semibold text-navy hover:border-navy">
              {copiedToken === justCreated ? "Copied" : "Copy link"}
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-control bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-primary disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Generating…" : "Generate link"}
        </button>
      </form>

      {links.length === 0 ? (
        <div className="rounded-panel border border-steel bg-surface p-6">
          <EmptyState icon={<TagIcon className="size-6" />} title="No campaign links yet" description="Generate one above to start tracking a campaign." />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-panel border border-steel bg-surface">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-steel bg-page-bg text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
                <th className="w-[110px] px-4 py-3">Platform</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="w-[240px] px-4 py-3">Link</th>
                <th className="w-[110px] px-4 py-3">Created</th>
                <th className="w-[100px] px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-steel last:border-b-0">
                  <td className="px-4 py-3.5 align-top">
                    <Badge tone="info">{link.platform === "instagram" ? "Instagram" : "Facebook"}</Badge>
                  </td>
                  <td className="px-4 py-3.5 align-top text-navy">{link.campaignName ?? "—"}</td>
                  <td className="px-4 py-3.5 align-top">
                    <div className="flex items-center gap-2">
                      <code className="truncate text-xs text-slate">/l/{link.token}</code>
                      <button type="button" onClick={() => handleCopy(link.token)} className="shrink-0 text-xs font-semibold text-brand-primary hover:underline">
                        {copiedToken === link.token ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-top text-xs text-slate">{formatDate(link.createdAt)}</td>
                  <td className="px-4 py-3.5 align-top">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleToggleActive(link.id, !link.isActive)}
                      className="disabled:opacity-60"
                    >
                      <Badge tone={link.isActive ? "active" : "neutral"}>{link.isActive ? "Active" : "Inactive"}</Badge>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
