import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { company } from "@/content/company";
import { sharedOpenGraph } from "@/content/social-meta";
import { ReviewForm } from "@/features/reviews/review-form";

export const metadata: Metadata = {
  title: `Leave a Review | ${company.name}`,
  description: `Share your experience with ${company.name}. Submitted reviews are reviewed before they appear publicly.`,
  alternates: { canonical: "/review" },
  openGraph: { ...sharedOpenGraph, title: `Leave a Review | ${company.name}`, description: `Share your experience with ${company.name}. Submitted reviews are reviewed before they appear publicly.`, url: "/review" },
  robots: { index: false, follow: true },
};

// A direct customer link, not a marketing/landing page: no pricing, no
// service carousel, no Results carousel, no homepage sections. `/review`
// does not fetch any existing reviews (it's submission-only) — the
// interactive form is isolated to <ReviewForm>, everything else here stays
// a plain server component.
//
// The card's outer width intentionally matches the navbar's outer width —
// no extra `max-w-*` wrapper around it, just the same `Container` the
// header itself sits in (see src/components/navigation/site-header.tsx).
// The eyebrow/heading/intro copy live inside <ReviewForm> itself (Phase
// 2.5's split-composer layout) — the review card is the page's whole
// interface, not a form below a separate hero section.
export default function ReviewPage() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      {/* pb-24 below md: matches Footer's own reserved bottom padding for
          the fixed mobile Call/Book Now bar (MobileActionBar, `md:hidden`,
          ~81px tall with safe-area inset). The bar is `position: fixed`, so
          it stays pinned over the last ~81px of the viewport regardless of
          scroll position — without this padding, scrolling all the way to
          the bottom of a footer-less page (see footer.tsx's own
          `/review` exclusion) leaves nothing after the Submit button to
          scroll past, so the button ends up permanently stuck behind the
          bar with no way to reach it. */}
      <section className="pt-2 pb-24 sm:pt-4 md:pb-4">
        <Container>
          <ReviewForm />
        </Container>
      </section>
    </main>
  );
}
