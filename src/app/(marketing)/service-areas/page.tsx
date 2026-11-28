import type { Metadata } from "next";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { serviceAreas, coverageZipCount, coverageCountyCount } from "@/content/service-coverage";
import { ZipCoverageChecker } from "@/components/service-areas/zip-coverage-checker";
import { sharedOpenGraph } from "@/content/social-meta";

export const metadata: Metadata = {
  title: "Service Areas",
  description: "Check ZIP coverage for Apex Home Services in New York, New Jersey, and Connecticut, and browse our 18-county service directory.",
  alternates: { canonical: "/service-areas" },
  openGraph: { ...sharedOpenGraph, title: "Service Areas", description: "Check listed ZIP coverage in New York, New Jersey, and Connecticut.", url: "/service-areas" },
  robots: { index: true, follow: true },
};

export default function ServiceAreasPage() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8"><Container><div className="grid gap-12 rounded-hero border border-steel bg-surface p-8 shadow-hero sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div><p className="eyebrow">Where we serve</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">Local service across select Northeast communities.</h1></div><div className="rounded-panel border-l-2 border-copper bg-page-bg p-6"><p className="text-lg leading-8 text-slate">Apex serves listed ZIP codes in New York, New Jersey, and Connecticut. Check your ZIP below; service details and appointment availability are confirmed by our team.</p><BookingLink placement="coverage_hero" className="mt-8" /></div></div></Container></section>

      <section id="zip-coverage" className="pb-16 sm:pb-20" aria-label="ZIP coverage checker"><Container><ZipCoverageChecker placement="coverage_hero" /></Container></section>

      <nav className="sticky top-28 z-20 border-b border-steel bg-page-bg/95 backdrop-blur" aria-label="Service area states"><Container><ul className="flex snap-x gap-7 overflow-x-auto py-5">{serviceAreas.map((area) => <li key={area.code} className="shrink-0 snap-start"><a className="inline-flex min-h-11 items-center gap-2 rounded-control bg-surface px-3 text-sm font-semibold text-navy hover:text-copper" href={`#${area.slug}`}><span className="text-xs font-bold tracking-[0.14em] text-copper">{area.code}</span>{area.state}</a></li>)}</ul></Container></nav>

      <section className="bg-page-bg section-y" aria-labelledby="coverage-directory-heading"><Container><SectionHeading id="coverage-directory-heading" eyebrow="County directory" title={`Three states. ${coverageCountyCount} counties.`} description={`Our current list includes ${coverageZipCount} ZIP codes. A listed county does not imply coverage in every ZIP within it. Use the ZIP checker for your location.`} /><div className="mt-16 grid gap-6">{serviceAreas.map((area, areaIndex) => <section key={area.code} id={area.slug} className="scroll-mt-48 grid gap-8 rounded-panel border border-steel bg-surface p-8 shadow-soft sm:p-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20" aria-labelledby={`${area.slug}-heading`}><div><span className="text-xs font-bold tracking-[0.18em] text-copper">{String(areaIndex + 1).padStart(2, "0")} / {area.code}</span><h2 id={`${area.slug}-heading`} className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-navy sm:text-4xl">{area.state}</h2><p className="mt-5 max-w-md leading-7 text-slate">Coverage varies within each county. Use the ZIP checker for your address before requesting service.</p><BookingLink placement="coverage_directory" className="mt-7" variant="secondary" /></div><ol className="grid content-start sm:grid-cols-2">{area.counties.map((county, index) => <li key={`${area.code}-${county}`} className="flex min-h-16 items-center gap-4 border-b border-steel py-4 sm:odd:border-r sm:odd:pr-6 sm:even:pl-6"><span className="text-xs font-bold tracking-[0.14em] text-copper">{String(index + 1).padStart(2, "0")}</span><span className="font-semibold text-navy">{county}</span></li>)}</ol></section>)}</div></Container></section>

      <section className="bg-page-bg section-y-bottom"><Container><div className="grid gap-10 rounded-hero bg-brand-dark p-8 text-white sm:p-12 lg:grid-cols-[1fr_0.8fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">Location confirmation</p><h2 className="mt-5 max-w-4xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">Not sure if we service your area?</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Check your ZIP against our current coverage list. Contact our team with location questions; service details and scheduling are confirmed separately.</p></div><div className="lg:justify-self-end"><BookingLink placement="coverage_cta" variant="invert" /><Link className="mt-5 flex min-h-11 items-center gap-3 text-sm font-semibold text-white" href="/contact">Other location questions <ArrowRightIcon className="size-4" /></Link></div></div></Container></section>
    </main>
  );
}
