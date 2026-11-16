import type { Metadata } from "next";
import { ServiceFinder } from "@/components/services/service-finder";
import Link from "next/link";
import { FinalServiceCta } from "@/components/services/service-sections";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
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
      <section className="bg-page-bg py-4 sm:py-8" aria-labelledby="directory-heading">
        <Container>
          <p className="eyebrow">The Apex service directory</p>
          <h1 id="directory-heading" className="mt-3 text-balance text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-navy">What needs attention?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate">Choose a service or tell us what’s happening.</p>
          <div className="mt-6">
            <ServiceFinder categories={primaryServices.map(({ id, name, href, shortDescription, children }) => ({ id, name, href, shortDescription, children: children.map(({ id, name, href, shortDescription }) => ({ id, name, href, shortDescription })) }))} />
          </div>
        </Container>
      </section>
      <section className="bg-brand-dark section-y text-white" aria-labelledby="symptom-heading"><Container><SectionHeading id="symptom-heading" eyebrow="Problem discovery" title="Start with what changed." description="These observations suggest a place to begin. They are not diagnoses." theme="dark" /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{customerProblems.map((problem) => <Link key={problem.id} href={problem.href} className="group flex min-h-40 flex-col justify-between rounded-panel border border-white/15 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.08]"><span className="text-lg font-semibold">{problem.label}</span><span className="mt-6 flex items-end justify-between gap-4 text-sm leading-6 text-white/80"><span>{problem.description}</span><ArrowRightIcon className="size-4 shrink-0 text-copper transition-transform group-hover:translate-x-1" /></span></Link>)}</div></Container></section>

      <section className="bg-page-bg section-y" aria-labelledby="coverage-heading"><Container className="grid gap-12 lg:grid-cols-2 lg:gap-20"><div><SectionHeading id="coverage-heading" eyebrow="Regional coverage" title="Local service across the Northeast." description="Confirmed county coverage spans five states. Exact ZIP-level availability is checked when service is requested." size="compact" /><ul className="mt-10 flex flex-wrap gap-3">{serviceAreas.map((area) => <li key={area.code} className="rounded-control border border-steel bg-surface px-4 py-3 text-sm font-semibold text-navy">{area.state}</li>)}</ul></div><div className="rounded-panel border-l-2 border-copper bg-surface p-8 shadow-soft sm:p-10"><p className="eyebrow">Equipment familiarity</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-navy">Brands we service</h2><p className="mt-5 leading-7 text-slate">The confirmed catalog currently includes {brandCount} appliance, premium-appliance, and HVAC brand names. Listing a brand does not imply factory authorization or partnership.</p><Link className="text-link mt-7 inline-flex" href="/brands">View the confirmed brand directory</Link></div></Container></section>
      <FinalServiceCta title="Tell us what your home needs." />
    </main>
  );
}
