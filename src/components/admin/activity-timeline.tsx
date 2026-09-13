import type { ActivityEvent } from "@/features/admin/activity/types";

const EVENT_LABELS: Record<ActivityEvent["eventType"], string> = {
  request_created: "Request created",
  request_status_changed: "Status changed",
  admin_note_added: "Note added",
  telegram_sent: "Telegram sent",
  telegram_failed: "Telegram failed",
  email_sent: "Confirmation email sent",
  email_failed: "Confirmation email failed",
};

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

function describeMetadata(event: ActivityEvent): string | null {
  if (event.eventType === "request_status_changed" && event.metadata) {
    const previous = event.metadata.previous_status;
    const next = event.metadata.new_status;
    if (typeof previous === "string" && typeof next === "string") return `${previous} → ${next}`;
  }
  return null;
}

/** Read-only chronological event list — shared by the Request detail
 * (scoped to one request) and Customer profile (all of a customer's
 * history) screens. No call-tracking event types exist to render here by
 * design (see docs/ADMIN_ARCHITECTURE.md — telephony is a future phase). */
export function ActivityTimeline({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate">No activity yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {events.map((event) => {
        const detail = describeMetadata(event);
        return (
          <li key={event.id} className="border-l-2 border-steel pl-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-semibold text-navy">{EVENT_LABELS[event.eventType]}</p>
              <p className="text-xs text-slate">{formatDateTime(event.createdAt)}</p>
            </div>
            {detail && <p className="mt-1 text-sm text-slate">{detail}</p>}
            {event.note && <p className="mt-1 whitespace-pre-line text-sm text-ink">{event.note}</p>}
            {event.actorEmail && <p className="mt-1 text-xs text-slate">by {event.actorEmail}</p>}
          </li>
        );
      })}
    </ol>
  );
}
