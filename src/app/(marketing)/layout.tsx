import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { BookNowProvider } from "@/features/booking/book-now-context";
import { ChatProvider } from "@/features/chat/chat-context";
import { ChatLauncher } from "@/components/chat/chat-launcher";
import { ChatPanel } from "@/components/chat/chat-panel";

// Public marketing shell (SiteHeader, Footer, sticky mobile action bar, the
// Book Now modal context, and the chat assistant) — opted into only by the
// public routes physically inside this (marketing) route group. /admin/**
// is a sibling of this group under the true root layout
// (src/app/layout.tsx) and never renders any of this, per instruction #17
// ("Do NOT render the public marketing header/footer inside Admin").
// ChatProvider is nested inside BookNowProvider (not the reverse) so the
// chat's "Book a service" quick action can call useBookNow() directly and
// reuse the one real booking modal instead of a second booking UI.
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <BookNowProvider>
      <ChatProvider>
        <SiteHeader />
        {children}
        <Footer />
        <MobileActionBar />
        <ChatLauncher />
        <ChatPanel />
      </ChatProvider>
    </BookNowProvider>
  );
}
