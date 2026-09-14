import { Badge, type BadgeTone } from "@/components/admin/ui/badge";
import { ClockIcon, CheckIcon, AlertTriangleIcon } from "@/components/ui/icons";

type DeliveryStatus = "not_requested" | "pending" | "sent" | "failed";

const TONE: Record<DeliveryStatus, BadgeTone> = {
  not_requested: "neutral",
  pending: "info",
  sent: "success",
  failed: "critical",
};

const LABEL: Record<DeliveryStatus, string> = {
  not_requested: "Not requested",
  pending: "Pending",
  sent: "Sent",
  failed: "Failed",
};

const ICON: Record<DeliveryStatus, typeof ClockIcon> = {
  not_requested: ClockIcon,
  pending: ClockIcon,
  sent: CheckIcon,
  failed: AlertTriangleIcon,
};

/** Shared Telegram/Email delivery chip — every status pairs a reserved
 * color with an icon and a label (never color alone), per the dataviz
 * status-scale rule. `not_requested` is an absence, not a state, so it
 * renders as quiet plain text instead of a full pill — the same pattern
 * "No offer" already uses in the Requests table — which also keeps it
 * short enough to never wrap/crowd a narrow table column. */
export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  if (status === "not_requested") {
    return <span className="text-xs whitespace-nowrap text-steel">{LABEL[status]}</span>;
  }
  const Icon = ICON[status];
  return (
    <Badge tone={TONE[status]} icon={<Icon className="size-3" />}>
      {LABEL[status]}
    </Badge>
  );
}
