import type { ReviewStatus } from "@/features/admin/reviews/types";

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-brand-soft text-brand-primary",
  approved: "bg-status-live/15 text-status-live",
  rejected: "bg-ink/10 text-ink-muted",
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return <span className={`inline-flex items-center rounded-control px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em] ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>;
}
