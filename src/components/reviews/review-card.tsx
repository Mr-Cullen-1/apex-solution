"use client";

import { useState } from "react";
import { CheckIcon, QuoteMarkIcon } from "@/components/ui/icons";
import type { PublicReview } from "@/features/reviews/types";
import { ReviewMedia } from "./review-media";
import { StarRating } from "./star-rating";

/** "homepage" clamps long review text and hides the date to keep cards
 * compact and balanced in the section; "archive" (used on /reviews) shows
 * the complete, unclamped text and a larger media treatment. Both variants
 * share every other field — one component, not two parallel card
 * implementations.
 *
 * Client component (not just for ReviewMedia's sake): a review whose photo
 * fails to load client-side (a signed URL that 404s after the page was
 * already rendered/cached) falls all the way back to the intentional
 * text-only testimonial layout below, never a broken-image shell sitting
 * inside an otherwise photo-shaped card. */
export function ReviewCard({ review, variant }: { review: PublicReview; variant: "homepage" | "archive" }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(review.mediaUrl) && !photoFailed;

  const meta = [review.serviceLabel, review.locationText].filter(Boolean).join(" · ");
  const dateLabel = formatReviewDate(review.approvedAt ?? review.createdAt);

  const footer = (
    <figcaption className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-steel/70 pt-4 text-sm text-slate">
      <span className="flex items-center gap-2 font-semibold text-navy">{review.displayName}</span>
      {review.isVerifiedCustomer && (
        <span className="inline-flex items-center gap-1 rounded-control bg-brand-soft px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.06em] text-copper">
          <CheckIcon className="size-3" />
          Verified Customer
        </span>
      )}
      {meta && <span>{meta}</span>}
      {variant === "archive" && dateLabel && <span className="text-slate/70">{dateLabel}</span>}
    </figcaption>
  );

  if (hasPhoto) {
    return (
      <figure className="flex h-full flex-col overflow-hidden rounded-panel border border-steel bg-surface shadow-soft">
        <ReviewMedia src={review.mediaUrl as string} variant={variant} onError={() => setPhotoFailed(true)} />
        <div className="flex flex-1 flex-col p-6">
          <StarRating rating={review.rating} />
          {/* Plain text only — no dangerouslySetInnerHTML, no markdown parsing.
              `whitespace-pre-line` preserves the customer's own line breaks
              without treating the content as markup; anything like
              "<script>" renders as inert visible characters. */}
          <blockquote className={`mt-4 whitespace-pre-line leading-7 text-navy ${variant === "homepage" ? "text-base line-clamp-6" : "text-base sm:text-lg"}`}>{review.reviewText}</blockquote>
          {footer}
        </div>
      </figure>
    );
  }

  // Intentional testimonial design for a review with no photo — never a
  // large empty area below a short review. A restrained brand-tinted
  // surface + quote mark distinguish it as a deliberate variant, not a
  // photo card missing its image; wrapping the quote in a `flex-1
  // items-center` block vertically centers short text within the card's
  // available height while a long review simply fills the same space
  // top-to-bottom, so no length-specific branching is needed.
  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-panel border border-steel bg-brand-soft/50 p-7 shadow-soft sm:p-8">
      <QuoteMarkIcon className="size-7 text-brand-primary/35" />
      <StarRating rating={review.rating} />
      <div className="mt-5 flex flex-1 items-center">
        <blockquote className={`whitespace-pre-line leading-8 text-navy ${variant === "homepage" ? "text-lg line-clamp-6" : "text-lg sm:text-xl"}`}>{review.reviewText}</blockquote>
      </div>
      {footer}
    </figure>
  );
}

function formatReviewDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}
