import type { Metadata } from "next";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ReviewList } from "@/components/reviews/review-list";
import { reviews } from "@/content/site";

// Real, customer-approved reviews are not yet available (see src/content/site.ts).
// The route stays noindex until verified content exists so this is never presented
// as thin, fabricated social proof — see docs/PROJECT.md decision log.
export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Verified Apex Home Services customer reviews.",
  alternates: { canonical: "/reviews" },
  robots: { index: reviews.length > 0, follow: true },
};

export default function ReviewsPage() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8">
        <Container>
          <div className="max-w-5xl rounded-hero border border-steel bg-surface p-8 shadow-hero sm:p-12">
            <p className="eyebrow">Customer reviews</p>
            <h1 className="mt-5 text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">What homeowners say about Apex.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate">Only verified, customer-approved reviews are published here. Apex does not invent testimonials, ratings, or attribution.</p>
            <BookingLink className="mt-9">Request service</BookingLink>
          </div>
        </Container>
      </section>
      <section className="bg-page-bg section-y-bottom"><Container><ReviewList reviews={reviews} /></Container></section>
    </main>
  );
}
