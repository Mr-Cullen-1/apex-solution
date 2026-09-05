import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FinalServiceCta } from "@/components/services/service-sections";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { media } from "@/content/media";
import { customerProblems, primaryServices } from "@/content/services";
import { serviceAreas, supportedBrands } from "@/content/site";

export const metadata: Metadata = {
  title: "Home Services",
  description: "Explore appliance repair, cooling, heating, plumbing, and indoor air quality services from Apex Home Services.",
  alternates: { canonical: "/services" },
  openGraph: { title: "Home Services", description: "Explore appliance repair, cooling, heating, plumbing, and indoor air quality services from Apex Home Services.", url: "/services" },
  robots: { index: true, follow: true },
};

export default function ServicesPage() {
  const brandCount = supportedBrands.reduce((total, group) => total + group.brands.length, 0);
  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-steel bg-warm-white py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div><p className="eyebrow">Apex service directory</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(4rem,9vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.075em] text-navy">The right care for the systems behind your home.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-slate sm:text-xl">Explore confirmed Apex service categories, or start with the symptom you are noticing. Specific availability is confirmed during the request process.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><BookingLink>Request service</BookingLink><a className="inline-flex min-h-12 items-center justify-center border border-steel px-6 text-sm font-semibold uppercase tracking-[0.08em] text-navy transition-colors hover:border-navy" href="#category-heading">Browse services</a></div></div>
          <div className="relative min-h-96 overflow-hidden border border-steel lg:min-h-[34rem]"><Image src={media.applianceService.src} alt={media.applianceService.alt} fill priority sizes="(min-width:1024px) 42vw, 100vw" className="object-cover" style={{ objectPosition: media.applianceService.focalPoint }} /></div>
        </Container>
      </section>

      <section className="py-20 sm:py-28" aria-labelledby="category-heading"><Container><SectionHeading id="category-heading" eyebrow="Core services" title="One home. Five service categories." description="Each category provides a practical starting point without asking you to diagnose the issue first." /><div className="mt-14 border-t border-navy">{primaryServices.map((category, index) => <Link key={category.id} href={category.href} className="group grid gap-5 border-b border-steel py-8 sm:grid-cols-[5rem_0.8fr_1.2fr_auto] sm:items-center"><span className="text-xs font-bold tracking-[0.16em] text-copper">{String(index + 1).padStart(2, "0")}</span><h2 className="text-3xl font-semibold tracking-[-0.045em] text-navy sm:text-4xl">{category.name}</h2><p className="max-w-xl leading-7 text-slate">{category.shortDescription}</p><span className="grid size-11 place-items-center border border-steel transition-colors group-hover:border-navy group-hover:bg-navy group-hover:text-white"><ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-0.5" /></span></Link>)}</div></Container></section>

      <section className="bg-navy py-20 text-white sm:py-28" aria-labelledby="symptom-heading"><Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"><SectionHeading id="symptom-heading" eyebrow="Problem discovery" title="Start with what changed." description="These observations suggest a place to begin. They are not diagnoses." theme="dark" /><div className="grid border-t border-white/20 sm:grid-cols-2">{customerProblems.map((problem) => <Link key={problem.id} href={problem.href} className="group flex min-h-44 flex-col justify-between border-b border-white/15 p-6 sm:odd:border-r"><span className="text-lg font-semibold">{problem.label}</span><span className="mt-6 flex items-end justify-between gap-4 text-sm leading-6 text-white/55"><span>{problem.description}</span><ArrowRightIcon className="size-4 shrink-0 text-copper transition-transform group-hover:translate-x-1" /></span></Link>)}</div></Container></section>

      <section className="py-20 sm:py-28" aria-labelledby="coverage-heading"><Container className="grid gap-12 lg:grid-cols-2 lg:gap-20"><div><SectionHeading id="coverage-heading" eyebrow="Regional coverage" title="Local service across the Northeast." description="Confirmed county coverage spans five states. Exact ZIP-level availability is checked when service is requested." /><ul className="mt-10 flex flex-wrap gap-3">{serviceAreas.map((area) => <li key={area.code} className="border border-steel px-4 py-3 text-sm font-semibold text-navy">{area.state}</li>)}</ul></div><div className="border-l-2 border-copper bg-warm-white p-8 sm:p-10"><p className="eyebrow">Equipment familiarity</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">Brands we service</h2><p className="mt-5 leading-7 text-slate">The confirmed catalog currently includes {brandCount} appliance, premium-appliance, and HVAC brand names. Listing a brand does not imply factory authorization or partnership.</p><Link className="text-link mt-7 inline-flex" href="/#brands">View the confirmed brand directory</Link></div></Container></section>
      <FinalServiceCta title="Tell us what your home needs." />
    </main>
  );
}
