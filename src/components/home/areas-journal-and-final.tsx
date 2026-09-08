import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/site";
import { FAQAccordion } from "./faq-accordion";
import { ServiceAreaExplorer } from "./service-area-explorer";

export function AreasJournalAndFinal() {
  const publicFaqs = faqs.filter(({ id }) => id !== "apex-care" && id !== "financing");

  return (
    <>
      <ServiceAreaExplorer />

      <section className="section-y bg-page-bg">
        <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <SectionHeading eyebrow="Questions, answered" title="A clearer way forward." description="Start with the essentials about choosing a service, coverage, and preparing your request." />
          </div>
          <FAQAccordion items={publicFaqs} />
        </Container>
      </section>
    </>
  );
}
