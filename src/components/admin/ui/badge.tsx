import type { ReactNode } from "react";

export type BadgeTone = "new" | "active" | "done" | "cancelled" | "success" | "critical" | "info" | "neutral" | "accent";

/** Shared status/tag chip used across Requests, Reviews, Customers, and
 * Admins — replaces the per-page STATUS_STYLES maps that used to duplicate
 * this styling. Text-only tones (never the request-pipeline chart ramp,
 * which is mark-contrast only, not text-contrast safe — see globals.css). */
const TONE_STYLES: Record<BadgeTone, string> = {
  new: "bg-brand-soft text-brand-primary",
  active: "bg-status-live/15 text-status-live",
  done: "bg-ink/10 text-ink-muted",
  cancelled: "bg-status-critical/12 text-status-critical",
  success: "bg-status-live/15 text-status-live",
  critical: "bg-status-critical/12 text-status-critical",
  info: "bg-brand-soft text-brand-primary",
  neutral: "bg-ink/10 text-ink-muted",
  accent: "bg-brand-accent/12 text-brand-accent",
};

export function Badge({ tone, children, icon }: { tone: BadgeTone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-control px-2.5 py-1 text-xs leading-none font-bold uppercase tracking-[0.06em] ${TONE_STYLES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
