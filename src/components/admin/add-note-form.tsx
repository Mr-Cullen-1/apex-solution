"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addNoteAction } from "@/features/admin/activity/actions";

/** Shared internal-note composer for Request detail and Customer profile.
 * Notes are append-only and never public — see
 * supabase/migrations/20260914120000_customer_activity_events.sql. */
export function AddNoteForm({ customerId, serviceRequestId = null }: { customerId: string; serviceRequestId?: string | null }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await addNoteAction(customerId, serviceRequestId, text);
      if (result.ok) {
        setText("");
        setFeedback(null);
        router.refresh();
      } else {
        setFeedback({ tone: "error", text: result.message });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="admin-note" className="text-sm font-semibold text-navy">
        Add note
      </label>
      <textarea
        id="admin-note"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={pending}
        rows={3}
        placeholder="Customer prefers morning appointments…"
        className="min-h-20 rounded-control border border-steel bg-surface px-3.5 py-2.5 text-sm text-navy outline-none focus-visible:border-brand-primary disabled:opacity-60"
      />
      {feedback && <p className="text-sm font-medium text-ink">{feedback.text}</p>}
      <button
        type="submit"
        disabled={pending || !text.trim()}
        className="self-start rounded-control bg-navy px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-copper disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add Note"}
      </button>
    </form>
  );
}
