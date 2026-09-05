import Image from "next/image";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { media, type MediaId } from "@/content/media";
import { serviceVisitSteps } from "@/content/services";
import { serviceAreas, supportedBrands } from "@/content/site";
import type { Service, ServiceCategory, ServiceFAQ, ServiceProblem } from "@/types/content";

function getMedia(id: string) {
  return media[id as MediaId] ?? media.serviceDetail;
}

export function ServiceHero({ eyebrow, title, summary, mediaId, anchorLabel = "Explore this service", categoryId, serviceId }: { eyebrow: string; title: string; summary: string; mediaId: string; anchorLabel?: string; categoryId?: string; serviceId?: string }) {
  const asset = getMedia(mediaId);
  return (
    <section className="border-b border-steel bg-warm-white py-14 sm:py-20 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
        <div className="animate-[rise-in_650ms_ease-out_both]">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-balance text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-[0.87] tracking-[-0.07em] text-navy">{title}</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate sm:text-xl">{summary}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BookingLink categoryId={categoryId} serviceId={serviceId}>Request service</BookingLink>
            <a className="inline-flex min-h-12 items-center justify-center border border-steel px-6 text-sm font-semibold uppercase tracking-[0.08em] text-navy transition-colors hover:border-navy" href="#service-details">{anchorLabel}</a>
          </div>
        </div>
        <div className="relative min-h-[24rem] overflow-hidden border border-steel bg-steel sm:min-h-[32rem] lg:min-h-[39rem]">
          <Image src={asset.src} alt={asset.alt} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover animate-[image-in_750ms_ease-out_both]" style={{ objectPosition: asset.focalPoint }} />
          <span className="absolute bottom-0 left-0 bg-navy px-4 py-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white">Local home service</span>
        </div>
      </Container>
    </section>
  );
}

export function ServiceDirectory({ category }: { category: ServiceCategory }) {
  if (!category.children.length) {
    return (
      <div className="border-y border-steel py-8 text-lg leading-8 text-slate">
        This category is available as a direct service conversation. More specific service pages will be added only when the offering is confirmed.
      </div>
    );
  }
  return (
    <div className="grid border-t border-steel md:grid-cols-2">
      {category.children.map((service, index) => (
        <Link key={service.id} href={service.href} className={`group flex min-h-64 flex-col justify-between border-b border-steel p-7 transition-colors hover:bg-warm-white sm:p-9 ${index % 2 === 0 ? "md:border-r" : ""}`}>
          <span className="text-xs font-bold tracking-[0.16em] text-copper">{String(index + 1).padStart(2, "0")}</span>
          <span>
            <span className="block text-3xl font-semibold tracking-[-0.045em] text-navy">{service.name}</span>
            <span className="mt-3 block max-w-md leading-7 text-slate">{service.shortDescription}</span>
          </span>
          <ArrowRightIcon className="mt-8 size-5 text-navy transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
    </div>
  );
}

export function ProblemDiscovery({ items }: { items: readonly ServiceProblem[] }) {
  return (
    <section className="bg-navy py-20 text-white sm:py-28" aria-labelledby="problems-heading">
      <Container>
        <SectionHeading id="problems-heading" eyebrow="Start with what you notice" title="You do not need to diagnose it first." description="Choose the situation closest to yours. These are possible service paths, not remote diagnoses." theme="dark" />
        <div className="mt-14 grid border-t border-white/20 md:grid-cols-2">
          {items.map((problem) => (
            <Link key={problem.id} href={problem.href} className="group flex min-h-48 flex-col justify-between border-b border-white/15 p-6 transition-colors hover:bg-white/[0.06] md:odd:border-r sm:p-8">
              <span className="text-xl font-semibold tracking-[-0.025em]">{problem.label}</span>
              <span className="mt-6 flex items-end justify-between gap-5 text-sm leading-6 text-white/60"><span>{problem.description}</span><ArrowRightIcon className="size-4 shrink-0 text-copper transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function ServiceProcess() {
  return (
    <section className="border-b border-steel py-20 sm:py-28" aria-labelledby="process-heading">
      <Container>
        <SectionHeading id="process-heading" eyebrow="The service visit" title="Clarity at every step." description="The exact work depends on the request and findings. This is the shared service framework." />
        <ol className="mt-14 grid border-t border-steel md:grid-cols-5">
          {serviceVisitSteps.map((step) => <li key={step.number} className="border-b border-steel py-7 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0"><span className="text-xs font-bold tracking-[0.16em] text-copper">{step.number}</span><h3 className="mt-8 text-xl font-semibold tracking-[-0.03em]">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate">{step.description}</p></li>)}
        </ol>
      </Container>
    </section>
  );
}

export function RelevantBrands({ groupIds }: { groupIds: readonly string[] }) {
  const groups = supportedBrands.filter((group) => groupIds.includes(group.id));
  if (!groups.length) return null;
  return (
    <section className="bg-warm-white py-20 sm:py-28" aria-labelledby="brands-heading">
      <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <SectionHeading id="brands-heading" eyebrow="Brands we service" title="Broad equipment familiarity." description="The names below describe brands Apex works on. They do not imply factory authorization, certification, partnership, dealership, or warranty authorization." />
        <div className="space-y-10">{groups.map((group) => <div key={group.id}><h3 className="border-b border-navy pb-3 text-xs font-bold uppercase tracking-[0.16em] text-navy">{group.label}</h3><ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">{group.brands.map((brand) => <li key={brand} className="text-base text-slate">{brand}</li>)}</ul></div>)}</div>
      </Container>
    </section>
  );
}

export function ServiceRegion() {
  return (
    <section className="border-y border-steel py-16" aria-labelledby="region-heading"><Container className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-end"><div><p className="eyebrow">Regional service</p><h2 id="region-heading" className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-navy">Across five Northeast states.</h2><Link className="text-link mt-5 inline-flex" href="/service-areas">View service-area details</Link></div><div><ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">{serviceAreas.map((area) => <li key={area.code} className="border-t border-navy pt-3"><span className="block text-xs font-bold tracking-[0.16em] text-copper">{area.code}</span><span className="mt-2 block text-sm font-semibold text-navy">{area.state}</span></li>)}</ul><p className="mt-5 text-sm leading-6 text-slate">County coverage is confirmed in the service-area directory. Exact ZIP-level availability is confirmed when you request service.</p></div></Container></section>
  );
}

export function ServiceFaqs({ items }: { items: readonly ServiceFAQ[] }) {
  return (
    <section className="py-20 sm:py-28" aria-labelledby="service-faq-heading"><Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"><SectionHeading id="service-faq-heading" eyebrow="Service questions" title="Useful context before you book." /><div className="border-t border-navy">{items.map((item) => <details key={item.question} className="group border-b border-steel py-6"><summary className="cursor-pointer list-none pr-10 text-lg font-semibold tracking-[-0.02em] text-navy marker:hidden">{item.question}<span className="float-right text-copper transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-2xl pt-5 pr-10 leading-7 text-slate">{item.answer}</p></details>)}</div></Container></section>
  );
}

export function RelatedServices({ items }: { items: readonly (Service | ServiceCategory)[] }) {
  if (!items.length) return null;
  return <section className="bg-warm-white py-20 sm:py-28" aria-labelledby="related-heading"><Container><SectionHeading id="related-heading" eyebrow="Related services" title="Keep exploring." /><div className="mt-12 grid border-t border-navy md:grid-cols-3">{items.map((item) => <Link key={item.id} href={item.href} className="group border-b border-steel py-7 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"><h3 className="text-2xl font-semibold tracking-[-0.04em]">{item.name}</h3><p className="mt-3 leading-7 text-slate">{item.shortDescription}</p><ArrowRightIcon className="mt-7 size-5 transition-transform group-hover:translate-x-1" /></Link>)}</div></Container></section>;
}

export function FinalServiceCta({ title = "Ready for a clearer next step?", categoryId, serviceId }: { title?: string; categoryId?: string; serviceId?: string }) {
  return <section className="bg-navy py-20 text-white sm:py-28"><Container className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end"><div><p className="eyebrow">Request service</p><h2 className="mt-5 max-w-4xl text-balance text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.065em]">{title}</h2><p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Tell us what you are noticing. Service availability and scheduling are confirmed separately.</p></div><BookingLink categoryId={categoryId} serviceId={serviceId} className="border-white bg-white text-navy hover:border-copper hover:bg-copper hover:text-white">Request service</BookingLink></Container></section>;
}
