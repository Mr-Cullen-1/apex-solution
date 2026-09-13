"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CheckIcon, ImageIcon } from "@/components/ui/icons";
import { StarRating } from "@/components/reviews/star-rating";
import { StatusBadge } from "@/components/admin/status-badge";
import { setReviewFeaturedAction, setReviewStatusAction, setReviewVerifiedAction } from "@/features/admin/reviews/actions";
import type { AdminReview, ReviewStatus } from "@/features/admin/reviews/types";

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date) + " UTC";
}

/** Server-rendered dates only, formatted with a fixed timeZone so the
 * server-rendered and client-hydrated output always match — avoids the
 * hydration mismatch a browser-locale/timezone-dependent format could
 * cause (instruction #65). */
export function ReviewBoard({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const selected = useMemo(() => reviews.find((r) => r.id === selectedId) ?? null, [reviews, selectedId]);
  const confirmReject = useMemo(() => reviews.find((r) => r.id === confirmRejectId) ?? null, [reviews, confirmRejectId]);

  function runAction(key: string, task: () => Promise<{ ok: boolean; status?: string; message?: string }>, opts: { closeOnSuccess?: boolean } = {}) {
    setPendingAction(key);
    startTransition(async () => {
      const result = await task();
      setPendingAction(null);
      if (result.ok) {
        setFeedback({ tone: "success", text: "Saved." });
        if (opts.closeOnSuccess) setSelectedId(null);
        router.refresh();
      } else {
        const message = result.status === "not_found" ? "This review no longer exists." : (result.message ?? "Something went wrong.");
        setFeedback({ tone: "error", text: message });
      }
    });
  }

  function handleStatusChange(reviewId: string, newStatus: ReviewStatus) {
    runAction(`status:${reviewId}:${newStatus}`, () => setReviewStatusAction(reviewId, newStatus), { closeOnSuccess: true });
  }

  function handleVerified(reviewId: string, value: boolean) {
    runAction(`verified:${reviewId}`, () => setReviewVerifiedAction(reviewId, value));
  }

  function handleFeatured(reviewId: string, value: boolean) {
    runAction(`featured:${reviewId}`, () => setReviewFeaturedAction(reviewId, value));
  }

  if (reviews.length === 0) {
    return <div className="rounded-panel border border-steel bg-surface p-8 text-center text-sm text-slate">No reviews match this view.</div>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-panel border border-steel bg-surface lg:block">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-steel text-left text-xs font-bold uppercase tracking-[0.06em] text-slate">
              <th className="w-24 px-4 py-3">Rating</th>
              <th className="w-40 px-4 py-3">Customer</th>
              <th className="px-4 py-3">Review</th>
              <th className="w-36 px-4 py-3">Service</th>
              <th className="w-32 px-4 py-3">Submitted</th>
              <th className="w-28 px-4 py-3">Flags</th>
              <th className="w-24 px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-b border-steel last:border-b-0 hover:bg-page-bg">
                <td className="px-4 py-3 align-top">
                  <StarRating rating={review.rating} />
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="truncate font-semibold text-navy">{review.fullName}</p>
                  <StatusBadge status={review.status} />
                </td>
                <td className="px-4 py-3 align-top">
                  <p className="line-clamp-2 text-slate">{review.reviewText}</p>
                </td>
                <td className="px-4 py-3 align-top text-slate">{review.serviceLabel ?? "—"}</td>
                <td className="px-4 py-3 align-top text-xs text-slate">{formatDateTime(review.createdAt)}</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-col gap-1 text-xs font-semibold">
                    {review.isVerifiedCustomer && <span className="text-brand-primary">Verified</span>}
                    {review.isFeatured && <span className="text-copper">Featured</span>}
                    {review.hasMedia && <span className="inline-flex items-center gap-1 text-slate"><ImageIcon className="size-3.5" />Photo</span>}
                    {!review.consentToPublish && <span className="text-ink-muted">No consent</span>}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <button type="button" onClick={() => setSelectedId(review.id)} className="text-sm font-semibold text-brand-primary hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/tablet cards */}
      <div className="flex flex-col gap-4 lg:hidden">
        {reviews.map((review) => (
          <button
            key={review.id}
            type="button"
            onClick={() => setSelectedId(review.id)}
            className="flex flex-col gap-3 rounded-panel border border-steel bg-surface p-5 text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{review.fullName}</p>
                <p className="text-xs text-slate">{formatDateTime(review.createdAt)}</p>
              </div>
              <StatusBadge status={review.status} />
            </div>
            <StarRating rating={review.rating} />
            <p className="line-clamp-3 text-sm text-slate">{review.reviewText}</p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {review.serviceLabel && <span className="rounded-control bg-page-bg px-2 py-1 text-slate">{review.serviceLabel}</span>}
              {review.isVerifiedCustomer && <span className="rounded-control bg-brand-soft px-2 py-1 text-brand-primary">Verified</span>}
              {review.isFeatured && <span className="rounded-control bg-brand-soft px-2 py-1 text-copper">Featured</span>}
              {review.hasMedia && <span className="rounded-control bg-page-bg px-2 py-1 text-slate">Photo</span>}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <ReviewDetailDrawer
          review={selected}
          onClose={() => setSelectedId(null)}
          onApprove={() => handleStatusChange(selected.id, "approved")}
          onReject={() => setConfirmRejectId(selected.id)}
          onRestoreToPending={() => handleStatusChange(selected.id, "pending")}
          onToggleVerified={(value) => handleVerified(selected.id, value)}
          onToggleFeatured={(value) => handleFeatured(selected.id, value)}
          pendingAction={pendingAction}
          disabled={pending}
          feedback={feedback}
        />
      )}

      {confirmReject && (
        <ConfirmDialog
          title="Reject this review?"
          description="It will remain stored but will not appear publicly."
          confirmLabel="Reject review"
          onCancel={() => setConfirmRejectId(null)}
          onConfirm={() => {
            setConfirmRejectId(null);
            handleStatusChange(confirmReject.id, "rejected");
          }}
        />
      )}
    </>
  );
}

function ReviewDetailDrawer({
  review,
  onClose,
  onApprove,
  onReject,
  onRestoreToPending,
  onToggleVerified,
  onToggleFeatured,
  pendingAction,
  disabled,
  feedback,
}: {
  review: AdminReview;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRestoreToPending: () => void;
  onToggleVerified: (value: boolean) => void;
  onToggleFeatured: (value: boolean) => void;
  pendingAction: string | null;
  disabled: boolean;
  feedback: { tone: "success" | "error"; text: string } | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review.id]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Review detail"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="fixed inset-y-0 right-0 top-0 left-auto m-0 h-full max-h-full w-full max-w-md rounded-none border-l border-steel bg-surface p-0 shadow-hero backdrop:bg-ink/40 open:flex open:flex-col"
    >
      <div className="flex h-full flex-col overflow-y-auto p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusBadge status={review.status} />
            <h2 className="mt-3 text-xl font-semibold text-navy">{review.fullName}</h2>
            <p className="text-sm text-slate">Public display name: {review.displayName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-control border border-steel px-2.5 py-1.5 text-sm text-slate hover:text-navy">
            Close
          </button>
        </div>

        <StarRating rating={review.rating} />
        <p className="mt-4 whitespace-pre-line text-sm leading-6 text-navy">{review.reviewText}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-slate">Service</dt>
          <dd className="text-navy">{review.serviceLabel ?? "—"}</dd>
          <dt className="text-slate">Location</dt>
          <dd className="text-navy">{review.locationText ?? "—"}</dd>
          <dt className="text-slate">Submitted</dt>
          <dd className="text-navy">{formatDateTime(review.createdAt)}</dd>
          <dt className="text-slate">Source</dt>
          <dd className="text-navy">{review.source}</dd>
        </dl>

        {review.hasMedia && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate">Photo</p>
            {review.mediaUrl && !imageFailed ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-steel">
                <Image src={review.mediaUrl} alt="Customer-submitted review photo" fill sizes="400px" className="object-cover" onError={() => setImageFailed(true)} />
              </div>
            ) : (
              <p className="rounded-control border border-steel bg-page-bg px-3 py-2 text-xs text-slate">Photo unavailable</p>
            )}
          </div>
        )}

        {!review.consentToPublish && (
          <p className="mt-6 rounded-control bg-brand-soft px-4 py-3 text-sm font-medium text-ink">
            Consent to publish was not given. This review cannot appear publicly even if approved, and this cannot be changed from Admin.
          </p>
        )}

        {feedback && (
          <p role="status" className={`mt-6 rounded-control px-4 py-2.5 text-sm font-medium ${feedback.tone === "success" ? "bg-status-live/15 text-status-live" : "bg-brand-soft text-ink"}`}>
            {feedback.text}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 border-t border-steel pt-6">
          <div className="flex gap-3">
            {review.status !== "approved" && (
              <button
                type="button"
                disabled={disabled}
                onClick={onApprove}
                className="flex-1 rounded-control bg-status-live px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              >
                {pendingAction?.startsWith(`status:${review.id}:approved`) ? "Approving…" : "Approve"}
              </button>
            )}
            {review.status !== "rejected" && (
              <button
                type="button"
                disabled={disabled}
                onClick={onReject}
                className="flex-1 rounded-control border border-ink-muted px-4 py-2.5 text-sm font-semibold text-ink transition-opacity disabled:opacity-60"
              >
                Reject
              </button>
            )}
          </div>
          {review.status !== "pending" && (
            <button
              type="button"
              disabled={disabled}
              onClick={onRestoreToPending}
              className="rounded-control border border-steel px-4 py-2.5 text-sm font-semibold text-slate transition-opacity hover:text-navy disabled:opacity-60"
            >
              {pendingAction?.startsWith(`status:${review.id}:pending`) ? "Moving…" : "Move back to Pending"}
            </button>
          )}

          <label className="flex items-center justify-between rounded-control border border-steel px-4 py-3 text-sm font-semibold text-navy">
            <span className="inline-flex items-center gap-2">
              <CheckIcon className="size-4" /> Verified Customer
            </span>
            <input
              type="checkbox"
              checked={review.isVerifiedCustomer}
              disabled={disabled}
              onChange={(event) => onToggleVerified(event.target.checked)}
              className="size-4"
            />
          </label>

          <label className={`flex items-center justify-between rounded-control border px-4 py-3 text-sm font-semibold ${review.status === "approved" ? "border-steel text-navy" : "border-steel text-steel"}`}>
            <span>Featured</span>
            <input
              type="checkbox"
              checked={review.isFeatured}
              disabled={disabled || review.status !== "approved"}
              onChange={(event) => onToggleFeatured(event.target.checked)}
              className="size-4"
            />
          </label>
          {review.status !== "approved" && <p className="text-xs text-slate">Only approved reviews can be featured.</p>}
        </div>
      </div>
    </dialog>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCancel();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-dialog-title"
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      className="z-[60] w-full max-w-sm rounded-panel border border-steel bg-surface p-6 shadow-hero backdrop:bg-ink/50"
    >
      <h3 id="confirm-dialog-title" className="text-lg font-semibold text-navy">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-control border border-steel px-4 py-2 text-sm font-semibold text-navy">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} autoFocus className="rounded-control bg-ink px-4 py-2 text-sm font-semibold text-white">
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
