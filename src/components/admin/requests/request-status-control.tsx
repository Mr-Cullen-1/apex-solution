"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setRequestStatusAction } from "@/features/admin/requests/actions";
import type { RequestStatus } from "@/features/admin/requests/types";

const STATUS_OPTIONS: RequestStatus[] = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELLED"];

/** Operational status change, reversible at any time (instruction: "Do not
 * make status transitions artificially irreversible") — every real change
 * records a customer_activity_events entry via admin_set_request_status. */
export function RequestStatusControl({ requestId, status }: { requestId: string; status: RequestStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleChange(next: RequestStatus) {
    if (next === status) return;
    startTransition(async () => {
      const result = await setRequestStatusAction(requestId, next);
      if (result.ok) {
        setFeedback(null);
        router.refresh();
      } else {
        setFeedback("Couldn't be updated. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="request-status" className="text-sm font-semibold text-navy">
        Operational status
      </label>
      <select
        id="request-status"
        value={status}
        disabled={pending}
        onChange={(event) => handleChange(event.target.value as RequestStatus)}
        className="min-h-10 w-full max-w-xs rounded-control border border-steel bg-surface px-3.5 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {pending && <p className="text-xs text-slate">Saving…</p>}
      {feedback && <p className="text-sm font-medium text-ink">{feedback}</p>}
    </div>
  );
}
