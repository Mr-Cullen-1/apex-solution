import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OrganizationStructuredData } from "@/components/public/organization-structured-data";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { company } from "@/content/company";
import { apexStandard } from "@/content/homepage";
import { media } from "@/content/media";
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
  const image = media.northeastHvac;
  return (
    <main id="main-content" className="flex-1">
      <OrganizationStructuredData path="/about" />
      <section className="bg-warm-white py-16 sm:py-24"><Container className="grid gap-12 lg:grid-cols-12 lg:items-center"><div className="lg:col-span-7"><p className="eyebrow">About Apex Home Services</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(4rem,9vw,8rem)] font-semibold leading-[0.84] tracking-[-0.075em] text-navy">Reliable home service starts with clarity.</h1><p className="mt-8 max-w-2xl text-xl leading-8 text-slate">{company.tagline} Apex brings multiple home-service categories into one considered, understandable experience.</p><BookingLink className="mt-9">Request service</BookingLink></div><figure className="lg:col-span-5"><div className="relative aspect-[4/5] overflow-hidden border border-steel"><Image src={image.src} alt={image.alt} fill priority sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" style={{ objectPosition: image.focalPoint }} /></div><figcaption className="mt-3 text-xs leading-5 text-slate">Temporary conceptual service imagery; not presented as an Apex employee or completed project.</figcaption></figure></Container></section>

      <section className="border-y border-steel py-20 sm:py-28" aria-labelledby="purpose-heading"><Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24"><SectionHeading id="purpose-heading" eyebrow="What Apex is here to do" title="Make the next home-service decision easier to understand." /><div className="space-y-6 border-t border-navy pt-8 text-lg leading-8 text-slate"><p>Home systems and appliances can be technical. The service experience should still begin with clear questions, useful context, and practical next steps.</p><p>Apex organizes appliance, cooling, heating, plumbing, and indoor air quality requests around what homeowners notice—not around assumptions or remote diagnosis.</p><p>Recommendations, availability, and approved work belong to the service conversation. The website creates a straightforward way to reach that conversation without inventing answers in advance.</p></div></Container></section>

      <section className="bg-navy py-20 text-white sm:py-28" aria-labelledby="standard-heading"><Container><SectionHeading id="standard-heading" eyebrow="The Apex Standard" title="Precision in the work. Respect in the experience." theme="dark" /><ol className="mt-14 grid border-t border-white/20 md:grid-cols-3">{apexStandard.map((item) => <li key={item.number} className="border-b border-white/15 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"><span className="text-xs font-bold tracking-[0.16em] text-copper">{item.number}</span><h3 className="mt-10 text-3xl font-semibold tracking-[-0.04em]">{item.title}</h3><p className="mt-4 leading-7 text-white/60">{item.description}</p></li>)}</ol></Container></section>

      <section className="py-20 sm:py-28" aria-labelledby="systems-heading"><Container><SectionHeading id="systems-heading" eyebrow="Whole-home service" title="Help for the systems behind daily life." description="Explore the verified Apex service categories." /><div className="mt-14 border-t border-navy">{primaryServices.map((service, index) => <Link key={service.id} href={service.href} className="group grid gap-4 border-b border-steel py-7 sm:grid-cols-[4rem_0.8fr_1.2fr_auto] sm:items-center"><span className="text-xs font-bold text-copper">{String(index + 1).padStart(2, "0")}</span><h3 className="text-2xl font-semibold tracking-[-0.035em] text-navy">{service.name}</h3><p className="leading-7 text-slate">{service.shortDescription}</p><ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" /></Link>)}</div></Container></section>

      <section className="border-y border-steel bg-warm-white py-20 sm:py-24"><Container className="grid gap-12 md:grid-cols-2 md:gap-20"><div><p className="eyebrow">Regional footprint</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">Select counties across five states.</h2><p className="mt-5 leading-7 text-slate">{serviceAreas.map((area) => area.state).join(", ")}. Coverage is county-based and exact ZIP availability is confirmed separately.</p><Link className="text-link mt-7 inline-flex" href="/service-areas">Explore service areas</Link></div><div><p className="eyebrow">Equipment familiarity</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">A confirmed brand directory.</h2><p className="mt-5 leading-7 text-slate">Apex works on a documented range of appliance, premium-appliance, and HVAC brands without implying manufacturer authorization.</p><Link className="text-link mt-7 inline-flex" href="/brands">Browse brands we service</Link></div></Container></section>
      <section className="bg-navy py-20 text-white sm:py-24"><Container className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end"><div><p className="eyebrow">Your next step</p><h2 className="mt-5 max-w-4xl text-balance text-[clamp(3rem,7vw,6.3rem)] font-semibold leading-[0.9] tracking-[-0.065em]">Start with what your home needs.</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">Choose a service or describe what you are noticing. Availability and timing are reviewed separately.</p></div><BookingLink className="border-white bg-white text-navy hover:border-copper hover:bg-copper hover:text-white">Request service</BookingLink></Container></section>
    </main>
  );
}
