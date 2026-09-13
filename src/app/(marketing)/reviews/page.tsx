import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ReviewCard } from "@/components/reviews/review-card";
import { sharedOpenGraph } from "@/content/social-meta";
import { getApprovedReviews } from "@/features/reviews/repository";

const ARCHIVE_REVIEW_LIMIT = 20;

// No fabricated review count or star average anywhere in this metadata — see
// docs/REVIEWS_ARCHITECTURE.md, "No aggregate rating."
export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Read approved customer feedback about service experiences coordinated through Apex Home Services.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    ...sharedOpenGraph,
    title: "Customer Reviews",
    description: "Read approved customer feedback about service experiences coordinated through Apex Home Services.",
    url: "/reviews",
  },
  robots: { index: true, follow: true },
};

// Same reasoning as the homepage's Reviews section: this route reads
// Supabase directly (server-only repository), and a couple of minutes of
// staleness is an acceptable trade for not hitting the database on every
// request. Comfortably clears the 600s signed-media-URL expiry.
export const revalidate = 120;

export default async function ReviewsPage() {
  const result = await getApprovedReviews({ limit: ARCHIVE_REVIEW_LIMIT });

  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8">
        <Container>
          <div className="max-w-5xl rounded-hero border border-steel bg-surface p-8 shadow-hero sm:p-12">
            <p className="eyebrow">Customer reviews</p>
            <h1 className="mt-5 text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">What customers say</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate">
              Real feedback from customers who used Apex Home Services to connect with local service professionals.
            </p>
            <ButtonLink href="/review" className="mt-9">
              Leave a review
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-page-bg section-y-bottom">
        <Container>
          {!result.ok ? (
            <FetchErrorState />
          ) : result.reviews.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {result.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} variant="archive" />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-panel border border-steel bg-surface p-8 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">No published reviews yet</p>
      <p className="mt-5 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.025em] text-navy">Customer reviews will appear here after they are submitted and approved.</p>
      <ButtonLink href="/review" variant="secondary" className="mt-6">
        Leave a review
      </ButtonLink>
    </div>
  );
}

function FetchErrorState() {
  return (
    <div className="rounded-panel border border-steel bg-surface p-8 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">Reviews are temporarily unavailable</p>
      <p className="mt-5 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.025em] text-navy">Please try again later.</p>
      <ButtonLink href="/review" variant="secondary" className="mt-6">
        Leave a review
      </ButtonLink>
    </div>
  );
}
