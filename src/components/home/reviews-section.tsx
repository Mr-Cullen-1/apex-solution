import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ReviewList } from "@/components/reviews/review-list";
import { reviews } from "@/content/site";

export function ReviewsSection() {
  return (
    <section className="bg-page-bg section-y-bottom" aria-labelledby="reviews-heading">
      <Container>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading id="reviews-heading" eyebrow="Customer perspective" title="Trust is earned in the details." description="No invented testimonials — only verified, customer-approved reviews appear here." />
          <Link href="/reviews" className="text-link shrink-0">View all reviews</Link>
        </div>
        <div className="mt-12"><ReviewList reviews={reviews} /></div>
      </Container>
    </section>
  );
}
