import type { Metadata } from "next";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { supportedBrands } from "@/content/site";

export const metadata: Metadata = {
  title: "Brands We Service",
  description: "Browse appliance, premium-appliance, and HVAC brands serviced by Apex Home Services.",
  alternates: { canonical: "/brands" },
  openGraph: { title: "Brands We Service", description: "A directory of appliance and HVAC brands serviced by Apex Home Services.", url: "/brands" },
  robots: { index: true, follow: true },
};

const relationships = {
  appliances: [{ label: "Appliance Repair", href: "/services/appliance-repair" }],
  "premium-appliances": [{ label: "Appliance Repair", href: "/services/appliance-repair" }],
  hvac: [{ label: "Cooling", href: "/services/cooling" }, { label: "Heating", href: "/services/heating" }, { label: "Indoor Air Quality", href: "/services/air-quality" }],
} as const;

export default function BrandsPage() {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8"><Container><div className="grid gap-12 rounded-hero bg-brand-dark p-8 text-white shadow-hero sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">Brands we service</p><h1 className="mt-5 max-w-5xl text-balance text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Familiar equipment. Thoughtful service.</h1></div><div><p className="text-lg leading-8 text-white/65">Apex works on a range of common and premium appliance brands and residential HVAC brands. The directory describes service familiarity—not manufacturer authorization.</p><BookingLink variant="invert" className="mt-8">Request service</BookingLink></div></div></Container></section>

      <section className="bg-page-bg section-y" aria-labelledby="brand-directory-heading"><Container><SectionHeading id="brand-directory-heading" eyebrow="Brand directory" title="Find the category behind your equipment." description="Browse brands by service category, then tell us what you are noticing." /><div className="mt-16 grid gap-6">{supportedBrands.map((group, groupIndex) => <section key={group.id} id={group.id} className="grid gap-10 rounded-panel border border-steel bg-surface p-8 shadow-soft sm:p-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20" aria-labelledby={`${group.id}-heading`}><div><span className="text-xs font-bold tracking-[0.18em] text-copper">{String(groupIndex + 1).padStart(2, "0")}</span><h2 id={`${group.id}-heading`} className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-navy sm:text-4xl">{group.label}</h2><p className="mt-5 max-w-md leading-7 text-slate">Apex lists service experience with the brands shown below. Exact equipment and request details are reviewed separately.</p><nav className="mt-7 flex flex-wrap gap-x-6 gap-y-3" aria-label={`${group.label} related services`}>{relationships[group.id].map((service) => <Link key={service.href} className="text-link inline-flex items-center gap-2" href={service.href}>{service.label}<ArrowRightIcon className="size-4" /></Link>)}</nav></div><ol className="grid content-start sm:grid-cols-2">{group.brands.map((brand, index) => <li key={brand} className="flex min-h-20 items-center gap-5 border-b border-steel py-4 sm:odd:border-r sm:odd:pr-7 sm:even:pl-7"><span className="text-xs font-bold tracking-[0.14em] text-copper">{String(index + 1).padStart(2, "0")}</span><span className="text-xl font-semibold tracking-[-0.025em] text-navy">{brand}</span></li>)}</ol></section>)}</div></Container></section>

      <section className="bg-page-bg section-y-bottom"><Container className="grid gap-10 rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12 lg:grid-cols-[1fr_0.7fr] lg:items-end"><div><p className="eyebrow">A practical next step</p><h2 className="mt-5 max-w-4xl text-balance text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-navy">Don’t see your brand?</h2><p className="mt-6 max-w-2xl text-lg leading-8 text-slate">Contact us—we may still be able to help. A brand not shown here does not automatically prevent a service request.</p></div><div className="flex flex-col gap-3 lg:items-start"><Link href="/contact" className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-control border border-navy px-6 text-sm font-semibold text-navy hover:bg-navy hover:text-white">Contact us <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></Link><BookingLink variant="secondary">Request service</BookingLink></div></Container></section>
    </main>
  );
}
