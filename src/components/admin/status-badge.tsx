import type { ReviewStatus } from "@/features/admin/reviews/types";
import { Badge, type BadgeTone } from "@/components/admin/ui/badge";

const STATUS_TONE: Record<ReviewStatus, BadgeTone> = {
  pending: "info",
  approved: "success",
  rejected: "neutral",
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function StatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABELS[status]}</Badge>;
}
