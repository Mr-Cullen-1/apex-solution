import Link from "next/link";
import type { ReactNode } from "react";

export type KpiTone = "brand" | "success" | "critical" | "neutral";

const TONE_ICON_STYLES: Record<KpiTone, string> = {
  brand: "bg-brand-soft text-brand-primary",
  success: "bg-status-live/15 text-status-live",
  critical: "bg-status-critical/12 text-status-critical",
  neutral: "bg-ink/8 text-ink-muted",
};

/** KPI summary card for the dashboard's top row. Distinct from the generic
 * SectionCard: fixed icon chip + big number + optional caption + optional
 * footer link, sized to read at a glance across an 8-up grid. */
export function KpiCard({
  label,
  value,
  caption,
  href,
  cta,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  caption?: string;
  href?: string;
  cta?: string;
  icon?: ReactNode;
  tone?: KpiTone;
}) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-panel border border-steel bg-surface p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate">{label}</p>
        {icon && <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-control ${TONE_ICON_STYLES[tone]}`}>{icon}</span>}
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-[-0.02em] text-navy">{value.toLocaleString("en-US")}</p>
        {caption && <p className="mt-1 text-xs text-slate">{caption}</p>}
      </div>
      {href && cta && (
        <Link href={href} className="mt-auto inline-flex text-sm font-semibold text-brand-primary hover:underline">
          {cta}
        </Link>
      )}
    </div>
  );
}
