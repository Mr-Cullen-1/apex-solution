import { CheckIcon } from "@/components/ui/icons";
import type { PublicReview } from "@/features/reviews/types";
import { ReviewMedia } from "./review-media";
import { StarRating } from "./star-rating";

/** "homepage" clamps long review text and hides the date to keep cards
 * compact and balanced in the section; "archive" (used on /reviews) shows
 * the complete, unclamped text and a larger media treatment. Both variants
 * share every other field — one component, not two parallel card
 * implementations. */
export function ReviewCard({ review, variant }: { review: PublicReview; variant: "homepage" | "archive" }) {
  const meta = [review.serviceLabel, review.locationText].filter(Boolean).join(" · ");
  const dateLabel = formatReviewDate(review.approvedAt ?? review.createdAt);

  return (
    <figure className="flex h-full flex-col overflow-hidden rounded-panel border border-steel bg-surface shadow-soft">
      {review.mediaUrl && <ReviewMedia src={review.mediaUrl} variant={variant} />}
      <div className="flex flex-1 flex-col p-6">
        <StarRating rating={review.rating} />
        {/* Plain text only — no dangerouslySetInnerHTML, no markdown parsing.
            `whitespace-pre-line` preserves the customer's own line breaks
            without treating the content as markup; anything like
            "<script>" renders as inert visible characters. */}
        <blockquote className={`mt-4 whitespace-pre-line leading-7 text-navy ${variant === "homepage" ? "text-base line-clamp-6" : "text-base sm:text-lg"}`}>
          {review.reviewText}
        </blockquote>
        <figcaption className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-steel pt-4 text-sm text-slate">
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
      </div>
    </figure>
  );
}

function formatReviewDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}
