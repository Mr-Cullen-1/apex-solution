import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { BookingFlow } from "@/features/booking/booking-flow";
import { parseBookingPreselection } from "@/features/booking/model";

export const metadata: Metadata = {
  title: "Request Service",
  description: "Prepare a home-service request for Apex Home Services. Choose a service, describe the issue, and share preferred timing for follow-up.",
  alternates: { canonical: "/book" },
  openGraph: { title: "Request Service", description: "Prepare a service request for Apex Home Services. Appointment timing and availability are confirmed separately.", url: "/book" },
  robots: { index: true, follow: true },
};

type BookPageProps = { searchParams: Promise<{ service?: string | string[]; category?: string | string[] }> };

export default async function BookPage({ searchParams }: BookPageProps) {
  const initialSelection = parseBookingPreselection(await searchParams);
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-8 pt-6 sm:pt-8">
        <Container><div className="rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12"><p className="eyebrow">Request service</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">Tell us what your home needs.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate">Prepare a clear service request in a few focused steps. This does not reserve an appointment or confirm service availability.</p></div></Container>
      </section>
      <section className="section-y"><Container><BookingFlow initialSelection={initialSelection} /></Container></section>
    </main>
  );
}
