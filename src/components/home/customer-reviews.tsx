import { ButtonLink } from "@/components/ui/button-link";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ReviewCard } from "@/components/reviews/review-card";
import { getHomepageReviews } from "@/features/reviews/repository";

const HOMEPAGE_REVIEW_LIMIT = 6;
// Below this count a carousel (with arrows scrolling through nothing) reads as
// broken rather than helpful — same threshold and reasoning ApexResults uses
// for its own before/after cards.
const CAROUSEL_MIN_ITEMS = 3;

/** Async Server Component: queries Supabase directly (repository is
 * server-only), never a client fetch. Renders nothing at all — not an
 * empty-state message — if there are zero approved+consented reviews yet,
 * or if the query itself fails; either way the rest of the homepage must
 * keep rendering normally, which a bare `return null` here guarantees. */
export async function CustomerReviews() {
  const result = await getHomepageReviews(HOMEPAGE_REVIEW_LIMIT);
  if (!result.ok || result.reviews.length === 0) return null;

  const reviews = result.reviews;
  const useCarousel = reviews.length >= CAROUSEL_MIN_ITEMS;

  return (
    // Top padding only — TrustStrip carries none of its own (see its
    // comment), and ServicesGrid's own `section-y` top padding provides
    // this section's bottom gap. Using `section-y` on both sides here would
    // double that gap, exactly the bug TrustStrip's comment describes.
    <section className="section-y-top bg-page-bg" aria-labelledby="reviews-heading">
      <Container>
        <SectionHeading
          id="reviews-heading"
          eyebrow="Customer reviews"
          title="What customers say"
          description="Real feedback from customers who connected with service professionals through Apex Home Services."
        />
        <div className="mt-10">
          {useCarousel ? (
            <Carousel ariaLabel="Customer reviews" arrowVariant="overlay" overlayArrowTopClassName="top-[6.5rem] sm:top-[7rem] -translate-y-1/2">
              {reviews.map((review) => (
                <CarouselItem key={review.id} className="w-full basis-full sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]">
                  <ReviewCard review={review} variant="homepage" />
                </CarouselItem>
              ))}
            </Carousel>
          ) : (
            // Same single-item/two-item balancing trick ApexResults uses: one
            // review centers in a readable column instead of stretching edge
            // to edge; two sit side by side with no empty third placeholder.
            <div className="grid gap-6 sm:grid-cols-2 sm:[&:has(>:only-child)]:mx-auto sm:[&:has(>:only-child)]:max-w-xl">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} variant="homepage" />
              ))}
            </div>
          )}
        </div>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ButtonLink href="/review" variant="secondary">
            Leave a review
          </ButtonLink>
          <ButtonLink href="/reviews" variant="text">
            Read all reviews
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
