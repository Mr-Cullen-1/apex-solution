import { StarIcon } from "@/components/ui/icons";
import type { Review } from "@/types/content";

export function ReviewList({ reviews }: { reviews: readonly Review[] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-panel border border-steel bg-surface p-8 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">Verified reviews coming soon</p>
        <p className="mt-5 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.025em] text-navy">Real customer experiences will appear here once source, wording, and attribution are confirmed.</p>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate">Apex does not publish invented testimonials. This section is ready for Trustpilot, Facebook, or direct customer reviews as soon as they are approved.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex flex-col justify-between rounded-panel border border-steel bg-surface p-7 shadow-soft">
      <div>
        <div className="flex items-center gap-2" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => (
            <StarIcon key={index} className={`size-4 ${index < review.rating ? "text-copper" : "text-steel"}`} />
          ))}
        </div>
        <blockquote className="mt-5 text-lg leading-7 text-navy">&ldquo;{review.quote}&rdquo;</blockquote>
      </div>
      <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-steel pt-4 text-sm text-slate">
        <span>{review.author}{review.location ? ` · ${review.location}` : ""}</span>
        {review.verified && <span className="rounded-control bg-surface-muted/40 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink">Verified Customer</span>}
      </figcaption>
    </figure>
  );
}
