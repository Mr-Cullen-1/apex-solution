import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { BookNowProvider } from "@/features/booking/book-now-context";

// Public marketing shell (SiteHeader, Footer, sticky mobile action bar, and
// the Book Now modal context they all share) — opted into only by the
// public routes physically inside this (marketing) route group. /admin/**
// is a sibling of this group under the true root layout
// (src/app/layout.tsx) and never renders any of this, per instruction #17
// ("Do NOT render the public marketing header/footer inside Admin").
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <BookNowProvider>
      <SiteHeader />
      {children}
      <Footer />
      <MobileActionBar />
    </BookNowProvider>
  );
}
