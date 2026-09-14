import { Badge, type BadgeTone } from "@/components/admin/ui/badge";
import type { RequestStatus } from "@/features/admin/requests/types";

/** Shared request-status chip — CANCELLED gets its own critical tone here
 * (previously identical gray to COMPLETED), so a cancelled request reads as
 * a distinct, attention-worthy outcome rather than blending in with
 * "closed" (instruction #9: "destructive actions stay obvious"). */
const STATUS_TONE: Record<RequestStatus, BadgeTone> = {
  NEW: "new",
  CONTACTED: "active",
  SCHEDULED: "active",
  COMPLETED: "done",
  CANCELLED: "cancelled",
};

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status}</Badge>;
}
