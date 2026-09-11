import type { Metadata } from "next";
import { ApexResults } from "@/components/home/apex-results";
import { AreasJournalAndFinal } from "@/components/home/areas-journal-and-final";
import { BrandsWeService } from "@/components/home/brands-we-service";
import { CustomerReviews } from "@/components/home/customer-reviews";
import { ServicesGrid } from "@/components/home/expertise-and-standard";
import { FirstTimeOffer } from "@/components/home/first-time-offer";
import { Hero } from "@/components/home/hero-and-selector";
import { PricingStrip } from "@/components/home/pricing-strip";
import { TrustStrip } from "@/components/home/trust-strip";
import { homeMeta } from "@/content/company";

export const metadata: Metadata = {
  title: homeMeta.title,
  description: homeMeta.description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

// Reviews (Phase 3) reads approved+consented reviews from Supabase — the
// rest of the homepage is static content with nothing to revalidate, but
// this segment-level setting applies to the whole route. 120s comfortably
// clears within the 600s signed-media-URL expiry (see repository.ts) and
// matches the spec's "a moderator's approval may take a few minutes to
// appear" expectation.
export const revalidate = 120;

export default function Home() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <Hero />
      <PricingStrip />
      <TrustStrip />
      <CustomerReviews />
      <ServicesGrid />
      <FirstTimeOffer />
      <ApexResults />
      <BrandsWeService />
      <AreasJournalAndFinal />
    </main>
  );
}
