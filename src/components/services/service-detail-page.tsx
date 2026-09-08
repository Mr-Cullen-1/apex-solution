import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getServiceById } from "@/content/services";
import type { Service, ServiceCategory } from "@/types/content";
import { CompactOffer, FinalServiceCta, RelatedServices, RelevantBrands, ServiceFaqs, ServiceHero, ServiceProcess, ServiceRegion } from "./service-sections";
import { ServiceStructuredData } from "./service-structured-data";

export function ServiceDetailPage({ category, service }: { category: ServiceCategory; service: Service }) {
  const related = service.relatedServiceIds.map(getServiceById).filter((item): item is Service | ServiceCategory => Boolean(item));
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <ServiceStructuredData name={service.name} description={service.description} path={service.href} />
      <ServiceHero eyebrow={`${category.name} service`} title={service.name} summary={service.summary} mediaId={service.mediaId} serviceId={service.id} />
      <CompactOffer categoryId={category.id} serviceId={service.id} />
      <section id="service-details" className="bg-page-bg section-y-bottom" aria-labelledby="overview-heading">
        <Container>
          <Link className="text-link" href={category.href}>← All {category.name.toLowerCase()} services</Link>
          <div className="mt-10 grid gap-12 rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <SectionHeading id="overview-heading" eyebrow="Service overview" title="Start with the full picture." description={service.description} />
            <div>
              <div className="space-y-5 border-t border-steel pt-7">{service.overview.map((paragraph) => <p key={paragraph} className="text-lg leading-8 text-slate">{paragraph}</p>)}</div>
              <div className="mt-12 rounded-panel border-l-2 border-copper bg-page-bg p-7 sm:p-9"><h3 className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Reasons to request service</h3><ul className="mt-6 space-y-4">{service.signs.map((sign) => <li key={sign} className="flex gap-4 leading-7 text-navy"><span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-copper" />{sign}</li>)}</ul><p className="mt-7 text-sm leading-6 text-slate">These observations can support a service request, but they do not confirm a specific diagnosis.</p></div>
            </div>
          </div>
        </Container>
      </section>
      <ServiceProcess />
      <RelatedServices items={related} />
      <RelevantBrands groupIds={service.brandGroupIds} />
      <ServiceRegion />
      <ServiceFaqs items={service.faqs} />
      <FinalServiceCta title={`Request ${service.name.toLowerCase()} service.`} serviceId={service.id} />
    </main>
  );
}
