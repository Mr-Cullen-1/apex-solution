"use client";

import { useState, useTransition } from "react";
import { generateReviewInvitationAction } from "@/features/admin/reviews/invitations-actions";
import type { AdminReviewInvitation } from "@/features/admin/reviews/invitations-repository";
import { Badge } from "@/components/admin/ui/badge";
import { CheckIcon } from "@/components/ui/icons";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

/** Generates a one-time review invitation link for this request. The raw
 * link is shown exactly once, right here in component state -- reloading
 * or navigating away makes it unrecoverable (same "shown once" pattern as
 * the admin temporary-password reveal, src/components/admin/admins/admins-board.tsx),
 * because the server never stores anything but the link's SHA-256 hash. */
export function ReviewInvitationCard({ requestId, invitation }: { requestId: string; invitation: AdminReviewInvitation | null }) {
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deliberately no router.refresh() here: the raw link only ever exists in
  // this component's own state (the server never stores it, only its
  // hash -- see the file-level comment above), so refreshing the page's
  // server data has nothing useful to add and previously risked resetting
  // this client component's state, making the just-generated URL vanish.
  // The `invitation` prop (server-rendered, used only in the pre-generation
  // view below) will simply reflect the new invitation next time this page
  // is actually reloaded/navigated to -- never invented or reconstructed
  // client-side.
  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateReviewInvitationAction(requestId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setLink(`${window.location.origin}/review/${result.token}`);
    });
  }

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable — the link is still visible to copy manually.
    }
  }

  // Once a link has been generated in this session, it replaces the
  // primary CTA entirely (a small "Generate new link" text action takes its
  // place below) rather than sitting alongside it -- flat, single hierarchy
  // (status -> link + copy -> helper text), no nested rounded/colored panel
  // inside the card.
  if (link) {
    return (
      <div className="flex flex-col gap-2.5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-status-live">
          <CheckIcon className="size-4" />
          Review link generated
        </p>

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1 truncate rounded-control border border-steel bg-page-bg px-3 py-2 font-mono text-xs text-navy" title={link}>
            {link}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-control border border-steel bg-surface px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-navy"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        <p className="text-xs text-slate">This link is shown once. Copy it now and send it to the customer.</p>

        {error && <p className="text-sm font-medium text-ink">{error}</p>}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="self-start text-xs font-semibold text-brand-primary transition-colors hover:underline disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Generating…" : "Generate new link"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {invitation ? (
        <p className="flex flex-wrap items-center gap-1.5 text-sm text-slate">
          <Badge tone={invitation.status === "used" ? "done" : invitation.status === "revoked" ? "neutral" : "active"}>{invitation.status}</Badge>
          <span className="text-xs text-steel">{formatDate(invitation.createdAt)}</span>
        </p>
      ) : (
        <p className="text-sm text-slate">Generate a secure review link for this customer.</p>
      )}

      {error && <p className="text-sm font-medium text-ink">{error}</p>}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="inline-flex min-h-9 items-center justify-center self-start rounded-control bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-primary disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Generating…" : "Generate review link"}
      </button>
    </div>
  );
}
