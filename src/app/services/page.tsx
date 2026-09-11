import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FinalServiceCta } from "@/components/services/service-sections";
import { BookingLink } from "@/components/ui/booking-link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { media } from "@/content/media";
import { customerProblems, primaryServices } from "@/content/services";
import { serviceAreas, supportedBrands } from "@/content/site";
import { sharedOpenGraph } from "@/content/social-meta";

export const metadata: Metadata = {
  title: "Home Services",
  description: "Explore appliance repair, cooling, heating, and water-heater repair services from Apex Home Services.",
  alternates: { canonical: "/services" },
  openGraph: { ...sharedOpenGraph, title: "Home Services", description: "Explore appliance repair, cooling, heating, and water-heater repair services from Apex Home Services.", url: "/services" },
  robots: { index: true, follow: true },
};

export default function ServicesPage() {
  const brandCount = supportedBrands.reduce((total, group) => total + group.brands.length, 0);
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-16 pt-6 sm:pb-24 sm:pt-8">
        <Container>
          <div className="grid gap-12 overflow-hidden rounded-hero border border-steel bg-surface p-8 shadow-hero sm:p-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:p-0">
            <div className="lg:p-14"><p className="eyebrow">Apex service directory</p><h1 className="mt-5 max-w-xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">The right care for the systems behind your home.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate">Explore confirmed Apex service categories, or start with the symptom you are noticing. Specific availability is confirmed during the request process.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><BookingLink /><ButtonLink href="#category-heading" variant="secondary" showArrow={false}>Browse services</ButtonLink></div></div>
            <div className="relative min-h-72 overflow-hidden lg:min-h-[28rem]"><Image src={media.applianceService.src} alt={media.applianceService.alt} fill priority sizes="(min-width:1024px) 42vw, 100vw" className="object-cover" style={{ objectPosition: media.applianceService.focalPoint }} /></div>
          </div>
        </Container>
      </section>

      <section className="bg-page-bg section-y" aria-labelledby="category-heading"><Container><SectionHeading id="category-heading" eyebrow="Core services" title="One home. Four service categories." description="Each category provides a practical starting point without asking you to diagnose the issue first." /><div className="mt-14 grid gap-4 sm:grid-cols-2">{primaryServices.map((category, index) => <Link key={category.id} href={category.href} className="group flex items-center gap-5 rounded-panel border border-steel bg-surface p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1"><span className="text-xs font-bold tracking-[0.16em] text-copper">{String(index + 1).padStart(2, "0")}</span><span className="flex-1"><h2 className="text-2xl font-semibold tracking-[-0.03em] text-navy">{category.name}</h2><p className="mt-1 leading-6 text-slate">{category.shortDescription}</p></span><span className="grid size-11 shrink-0 place-items-center rounded-control border border-steel transition-colors group-hover:border-navy group-hover:bg-navy group-hover:text-white"><ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" /></span></Link>)}</div></Container></section>

      <section className="bg-brand-dark section-y text-white" aria-labelledby="symptom-heading"><Container><SectionHeading id="symptom-heading" eyebrow="Problem discovery" title="Start with what changed." description="These observations suggest a place to begin. They are not diagnoses." theme="dark" /><div className="mt-12 grid gap-4 sm:grid-cols-2">{customerProblems.map((problem) => <Link key={problem.id} href={problem.href} className="group flex min-h-40 flex-col justify-between rounded-panel border border-white/15 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.08]"><span className="text-lg font-semibold">{problem.label}</span><span className="mt-6 flex items-end justify-between gap-4 text-sm leading-6 text-white/55"><span>{problem.description}</span><ArrowRightIcon className="size-4 shrink-0 text-copper transition-transform group-hover:translate-x-1" /></span></Link>)}</div></Container></section>

      <section className="bg-page-bg section-y" aria-labelledby="coverage-heading"><Container className="grid gap-12 lg:grid-cols-2 lg:gap-20"><div><SectionHeading id="coverage-heading" eyebrow="Regional coverage" title="Local service across the Northeast." description="Confirmed county coverage spans five states. Exact ZIP-level availability is checked when service is requested." size="compact" /><ul className="mt-10 flex flex-wrap gap-3">{serviceAreas.map((area) => <li key={area.code} className="rounded-control border border-steel bg-surface px-4 py-3 text-sm font-semibold text-navy">{area.state}</li>)}</ul></div><div className="rounded-panel border-l-2 border-copper bg-surface p-8 shadow-soft sm:p-10"><p className="eyebrow">Equipment familiarity</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-navy">Brands we service</h2><p className="mt-5 leading-7 text-slate">The confirmed catalog currently includes {brandCount} appliance, premium-appliance, and HVAC brand names. Listing a brand does not imply factory authorization or partnership.</p><Link className="text-link mt-7 inline-flex" href="/brands">View the confirmed brand directory</Link></div></Container></section>
      <FinalServiceCta title="Tell us what your home needs." />
    </main>
  );
}
