import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { ServiceCategory } from "@/types/content";
import { CompactOffer, FinalServiceCta, ProblemDiscovery, RelevantBrands, ServiceDirectory, ServiceFaqs, ServiceHero, ServiceProcess, ServiceRegion } from "./service-sections";
import { ServiceStructuredData } from "./service-structured-data";

export function ServiceCategoryPage({ category }: { category: ServiceCategory }) {
  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <ServiceStructuredData name={`${category.name} Services`} description={category.description} path={category.href} />
      <ServiceHero eyebrow="Apex service category" title={category.name} summary={category.description} mediaId={category.mediaId} anchorLabel="Browse service options" categoryId={category.id} />
      <CompactOffer categoryId={category.id} />
      <section id="service-details" className="bg-page-bg section-y-bottom" aria-labelledby="category-services-heading">
        <Container className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <SectionHeading id="category-services-heading" eyebrow="Service directory" title={category.children.length ? "Focused help for the system in front of you." : "A careful place to begin."} description={category.shortDescription} size="compact" />
          <ServiceDirectory category={category} />
        </Container>
      </section>
      <ProblemDiscovery items={category.problems} categoryId={category.id} />
      <ServiceProcess />
      <RelevantBrands groupIds={category.brandGroupIds} />
      <ServiceRegion />
      <ServiceFaqs items={category.faqs} />
      <FinalServiceCta title={`Let’s talk about your ${category.name.toLowerCase()} needs.`} categoryId={category.id} />
    </main>
  );
}
