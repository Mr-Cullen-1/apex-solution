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
    <main id="main-content" className="flex-1 bg-soft-white">
      <section className="border-b border-steel bg-warm-white py-14 sm:py-20">
        <Container><p className="eyebrow">Request service</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(3.8rem,8vw,7.5rem)] font-semibold leading-[0.86] tracking-[-0.07em] text-navy">Tell us what your home needs.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate sm:text-xl">Prepare a clear service request in a few focused steps. This does not reserve an appointment or confirm service availability.</p></Container>
      </section>
      <section className="py-12 sm:py-16 lg:py-20"><Container><BookingFlow initialSelection={initialSelection} /></Container></section>
    </main>
  );
}
