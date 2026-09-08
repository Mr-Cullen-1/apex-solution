import Image from "next/image";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { contact } from "@/content/company";
import { media, type MediaId } from "@/content/media";
import { firstTimeOffer, isOfferEligible } from "@/content/offers";
import { serviceVisitSteps } from "@/content/services";
import { serviceAreas, supportedBrands } from "@/content/site";
import type { Service, ServiceCategory, ServiceFAQ, ServiceProblem } from "@/types/content";

function getMedia(id: string) {
  return media[id as MediaId] ?? media.serviceDetail;
}

export function ServiceHero({ eyebrow, title, summary, mediaId, anchorLabel = "Explore this service", categoryId, serviceId }: { eyebrow: string; title: string; summary: string; mediaId: string; anchorLabel?: string; categoryId?: string; serviceId?: string }) {
  const asset = getMedia(mediaId);
  return (
    <section className="bg-page-bg pb-16 pt-6 sm:pb-20 sm:pt-8">
      <Container>
        <div className="grid gap-10 overflow-hidden rounded-hero border border-steel bg-surface shadow-hero lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
          <div className="p-7 sm:p-10 lg:p-14">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-5 max-w-xl text-balance text-[clamp(2.5rem,5.5vw,4.25rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-navy">{title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate">{summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BookingLink categoryId={categoryId} serviceId={serviceId}>Request service</BookingLink>
              {contact.phoneHref && (
                <a href={contact.phoneHref} className="inline-flex min-h-12 items-center gap-2 rounded-control bg-copper px-6 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"><PhoneIcon className="size-4" />{contact.phone}</a>
              )}
              <ButtonLink href="#service-details" variant="secondary" showArrow={false}>{anchorLabel}</ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[20rem] overflow-hidden sm:min-h-[26rem] lg:min-h-[34rem]">
            <Image src={asset.src} alt={asset.alt} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover" style={{ objectPosition: asset.focalPoint }} />
            <span className="absolute bottom-4 left-4 rounded-control bg-ink/85 px-4 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white">Local home service</span>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function CompactOffer({ categoryId, serviceId }: { categoryId?: string; serviceId?: string }) {
  if (!isOfferEligible({ categoryId, serviceId })) return null;
  return (
    <section className="bg-page-bg pb-16 sm:pb-20">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 rounded-panel border border-steel bg-surface p-7 shadow-soft sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">{firstTimeOffer.title}</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.02em] text-navy">{firstTimeOffer.headline}</p>
          </div>
          <BookingLink categoryId={categoryId} serviceId={serviceId} variant="primary">Claim this offer</BookingLink>
        </div>
      </Container>
    </section>
  );
}

export function ServiceDirectory({ category }: { category: ServiceCategory }) {
  if (!category.children.length) {
    return (
      <div className="rounded-panel border border-steel bg-surface p-8 text-lg leading-8 text-slate">
        This category is available as a direct service conversation. More specific service pages will be added only when the offering is confirmed.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {category.children.map((service, index) => (
        <Link key={service.id} href={service.href} className="group flex min-h-56 flex-col justify-between rounded-panel border border-steel bg-surface p-7 shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:p-8">
          <span className="text-xs font-bold tracking-[0.16em] text-copper">{String(index + 1).padStart(2, "0")}</span>
          <span>
            <span className="block text-2xl font-semibold tracking-[-0.03em] text-navy">{service.name}</span>
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
    <section className="bg-brand-dark section-y text-white" aria-labelledby="problems-heading">
      <Container>
        <SectionHeading id="problems-heading" eyebrow="Start with what you notice" title="You do not need to diagnose it first." description="Choose the situation closest to yours. These are possible service paths, not remote diagnoses." theme="dark" />
        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {items.map((problem) => (
            <Link key={problem.id} href={problem.href} className="group flex min-h-44 flex-col justify-between rounded-panel border border-white/15 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.08] sm:p-8">
              <span className="text-xl font-semibold tracking-[-0.02em]">{problem.label}</span>
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
    <section className="bg-page-bg section-y" aria-labelledby="process-heading">
      <Container>
        <SectionHeading id="process-heading" eyebrow="The service visit" title="Clarity at every step." description="The exact work depends on the request and findings. This is the shared service framework." />
        <ol className="mt-14 grid gap-4 md:grid-cols-5">
          {serviceVisitSteps.map((step) => <li key={step.number} className="rounded-panel border border-steel bg-surface p-6 shadow-soft"><span className="text-xs font-bold tracking-[0.16em] text-copper">{step.number}</span><h3 className="mt-6 text-lg font-semibold tracking-[-0.02em] text-navy">{step.title}</h3><p className="mt-3 text-sm leading-6 text-slate">{step.description}</p></li>)}
        </ol>
      </Container>
    </section>
  );
}

export function RelevantBrands({ groupIds }: { groupIds: readonly string[] }) {
  const groups = supportedBrands.filter((group) => groupIds.includes(group.id));
  if (!groups.length) return null;
  return (
    <section className="bg-page-bg section-y" aria-labelledby="brands-heading">
      <Container>
        <div className="grid gap-12 rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <SectionHeading id="brands-heading" eyebrow="Brands we service" title="Broad equipment familiarity." description="The names below describe brands Apex works on. They do not imply factory authorization, certification, partnership, dealership, or warranty authorization." size="compact" />
          <div className="space-y-10">{groups.map((group) => <div key={group.id}><h3 className="border-b border-steel pb-3 text-xs font-bold uppercase tracking-[0.16em] text-navy">{group.label}</h3><ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">{group.brands.map((brand) => <li key={brand} className="text-base text-slate">{brand}</li>)}</ul></div>)}</div>
        </div>
      </Container>
    </section>
  );
}

export function ServiceRegion() {
  return (
    <section className="bg-page-bg section-y-bottom" aria-labelledby="region-heading">
      <Container>
        <div className="grid gap-8 rounded-panel border border-steel bg-surface p-8 shadow-soft sm:p-10 lg:grid-cols-[1fr_2fr] lg:items-end">
          <div><p className="eyebrow">Regional service</p><h2 id="region-heading" className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-navy">Across five Northeast states.</h2><Link className="text-link mt-5 inline-flex" href="/service-areas">View service-area details</Link></div>
          <div><ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">{serviceAreas.map((area) => <li key={area.code} className="border-t border-steel pt-3"><span className="block text-xs font-bold tracking-[0.16em] text-copper">{area.code}</span><span className="mt-2 block text-sm font-semibold text-navy">{area.state}</span></li>)}</ul><p className="mt-5 text-sm leading-6 text-slate">County coverage is confirmed in the service-area directory. Exact ZIP-level availability is confirmed when you request service.</p></div>
        </div>
      </Container>
    </section>
  );
}

export function ServiceFaqs({ items }: { items: readonly ServiceFAQ[] }) {
  return (
    <section className="bg-page-bg section-y" aria-labelledby="service-faq-heading">
      <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <SectionHeading id="service-faq-heading" eyebrow="Service questions" title="Useful context before you book." size="compact" />
        <div className="space-y-3">{items.map((item) => <details key={item.question} className="group rounded-panel border border-steel bg-surface p-6 open:shadow-soft"><summary className="cursor-pointer list-none pr-10 text-lg font-semibold tracking-[-0.015em] text-navy marker:hidden">{item.question}<span className="float-right text-copper transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-2xl pt-5 pr-10 leading-7 text-slate">{item.answer}</p></details>)}</div>
      </Container>
    </section>
  );
}

export function RelatedServices({ items }: { items: readonly (Service | ServiceCategory)[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-page-bg section-y" aria-labelledby="related-heading">
      <Container>
        <SectionHeading id="related-heading" eyebrow="Related services" title="Keep exploring." />
        <div className="mt-12 grid gap-4 md:grid-cols-3">{items.map((item) => <Link key={item.id} href={item.href} className="group rounded-panel border border-steel bg-surface p-7 shadow-soft transition-transform duration-300 hover:-translate-y-1"><h3 className="text-2xl font-semibold tracking-[-0.03em] text-navy">{item.name}</h3><p className="mt-3 leading-7 text-slate">{item.shortDescription}</p><ArrowRightIcon className="mt-7 size-5 text-navy transition-transform group-hover:translate-x-1" /></Link>)}</div>
      </Container>
    </section>
  );
}

export function FinalServiceCta({ title = "Ready for a clearer next step?", categoryId, serviceId }: { title?: string; categoryId?: string; serviceId?: string }) {
  return (
    <section className="bg-page-bg section-y-bottom">
      <Container>
        <div className="flex flex-col items-start justify-between gap-10 rounded-hero bg-brand-dark p-8 text-white sm:p-12 lg:flex-row lg:items-end lg:p-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/75">Request service</p>
            <h2 className="mt-5 max-w-4xl text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">{title}</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">Tell us what you are noticing. Service availability and scheduling are confirmed separately.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {contact.phoneHref && <a href={contact.phoneHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-control bg-white px-6 text-sm font-semibold text-navy transition-colors hover:bg-copper hover:text-white"><PhoneIcon className="size-4" />{contact.phone}</a>}
            <BookingLink categoryId={categoryId} serviceId={serviceId} variant="invert">Request service</BookingLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
