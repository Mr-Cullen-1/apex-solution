import type { Metadata } from "next";
import { ApexResults } from "@/components/home/apex-results";
import { AreasJournalAndFinal } from "@/components/home/areas-journal-and-final";
import { BrandsWeService } from "@/components/home/brands-we-service";
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

export default function Home() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <Hero />
      <PricingStrip />
      <TrustStrip />
      <ServicesGrid />
      <FirstTimeOffer />
      <ApexResults />
      <BrandsWeService />
      <AreasJournalAndFinal />
    </main>
  );
}
