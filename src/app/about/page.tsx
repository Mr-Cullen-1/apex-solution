import type { Metadata } from "next";
import Link from "next/link";
import { OrganizationStructuredData } from "@/components/public/organization-structured-data";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { company } from "@/content/company";
import { apexStandard } from "@/content/homepage";
import { primaryServices } from "@/content/services";
import { serviceAreas } from "@/content/site";

export const metadata: Metadata = {
  title: "About Apex Home Services",
  description: "Learn how Apex Home Services approaches residential service through clear communication, thoughtful diagnosis, and careful workmanship.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Apex Home Services", description: company.tagline, url: "/about" },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <OrganizationStructuredData path="/about" />
      <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8"><Container><div className="max-w-5xl rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12"><p className="eyebrow">About Apex Home Services</p><h1 className="mt-5 text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">Reliable home service starts with clarity.</h1><p className="mt-8 max-w-2xl text-xl leading-8 text-slate">{company.tagline} Apex brings multiple home-service categories into one considered, understandable experience.</p><BookingLink className="mt-9">Request service</BookingLink></div></Container></section>

      <section className="bg-page-bg section-y" aria-labelledby="purpose-heading"><Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24"><SectionHeading id="purpose-heading" eyebrow="What Apex is here to do" title="Make the next home-service decision easier to understand." size="compact" /><div className="space-y-6 rounded-panel border border-steel bg-surface p-8 text-lg leading-8 text-slate shadow-soft"><p>Home systems and appliances can be technical. The service experience should still begin with clear questions, useful context, and practical next steps.</p><p>Apex organizes appliance, cooling, heating, plumbing, and indoor air quality requests around what homeowners notice—not around assumptions or remote diagnosis.</p><p>Recommendations, availability, and approved work belong to the service conversation. The website creates a straightforward way to reach that conversation without inventing answers in advance.</p></div></Container></section>

      <section className="bg-brand-dark section-y text-white" aria-labelledby="standard-heading"><Container><SectionHeading id="standard-heading" eyebrow="The Apex Standard" title="Precision in the work. Respect in the experience." theme="dark" /><ol className="mt-14 grid gap-4 md:grid-cols-3">{apexStandard.map((item) => <li key={item.number} className="rounded-panel border border-white/15 bg-white/[0.04] p-8"><span className="text-xs font-bold tracking-[0.16em] text-white/75">{item.number}</span><h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">{item.title}</h3><p className="mt-4 leading-7 text-white/60">{item.description}</p></li>)}</ol></Container></section>

      <section className="bg-page-bg section-y" aria-labelledby="systems-heading"><Container><SectionHeading id="systems-heading" eyebrow="Whole-home service" title="Help for the systems behind daily life." description="Explore the verified Apex service categories." /><div className="mt-14 grid gap-4">{primaryServices.map((service, index) => <Link key={service.id} href={service.href} className="group grid items-center gap-4 rounded-panel border border-steel bg-surface p-6 shadow-soft transition-transform duration-300 hover:-translate-y-0.5 sm:grid-cols-[4rem_0.8fr_1.2fr_auto]"><span className="text-xs font-bold text-copper">{String(index + 1).padStart(2, "0")}</span><h3 className="text-2xl font-semibold tracking-[-0.025em] text-navy">{service.name}</h3><p className="leading-7 text-slate">{service.shortDescription}</p><ArrowRightIcon className="size-5 text-navy transition-transform group-hover:translate-x-1" /></Link>)}</div></Container></section>

      <section className="bg-page-bg section-y"><Container><div className="grid gap-8 rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12 md:grid-cols-2 md:gap-20"><div><p className="eyebrow">Regional footprint</p><h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-navy">Select counties across five states.</h2><p className="mt-5 leading-7 text-slate">{serviceAreas.map((area) => area.state).join(", ")}. Coverage is county-based and exact ZIP availability is confirmed separately.</p><Link className="text-link mt-7 inline-flex" href="/service-areas">Explore service areas</Link></div><div><p className="eyebrow">Equipment familiarity</p><h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-navy">Brands we service.</h2><p className="mt-5 leading-7 text-slate">Browse appliance, premium-appliance, and HVAC brands without any implication of manufacturer authorization.</p><Link className="text-link mt-7 inline-flex" href="/brands">Browse brands we service</Link></div></div></Container></section>
      <section className="bg-page-bg section-y-bottom"><Container><div className="flex flex-col items-start justify-between gap-10 rounded-hero bg-brand-dark p-8 text-white sm:p-12 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">Your next step</p><h2 className="mt-5 max-w-4xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">Start with what your home needs.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Choose a service or describe what you are noticing. Availability and timing are reviewed separately.</p></div><BookingLink variant="invert">Request service</BookingLink></div></Container></section>
    </main>
  );
}
