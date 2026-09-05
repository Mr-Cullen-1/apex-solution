import Image from "next/image";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { media } from "@/content/media";
import { faqs } from "@/content/site";
import { FAQAccordion } from "./faq-accordion";
import { ServiceAreaExplorer } from "./service-area-explorer";

export function AreasJournalAndFinal() {
  const finalImage = media.homeExterior;
  const publicFaqs = faqs.filter(({ id }) => id !== "apex-care" && id !== "financing");

  return (
    <>
      <ServiceAreaExplorer />

      <section className="bg-soft-white py-24 sm:py-32 lg:py-40">
        <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <SectionHeading eyebrow="Questions, answered" title="A clearer way forward." description="Start with the essentials about choosing a service, coverage, and preparing your request." />
          </div>
          <FAQAccordion items={publicFaqs} />
        </Container>
      </section>

      <section className="bg-soft-white px-page pb-8 sm:pb-12">
        <div className="relative mx-auto min-h-[40rem] max-w-[96rem] overflow-hidden bg-navy">
          <Image src={finalImage.src} alt={finalImage.alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: finalImage.focalPoint }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,29,44,0.96)_0%,rgba(16,29,44,0.78)_45%,rgba(16,29,44,0.12)_100%)]" />
          <Container className="relative flex min-h-[40rem] items-center py-16">
            <div className="max-w-3xl text-white">
              <p className="eyebrow">Your home. At its best.</p>
              <h2 className="mt-6 text-balance text-[clamp(4rem,9vw,8.5rem)] font-semibold leading-[0.83] tracking-[-0.07em]">Come home<br />to comfort.</h2>
              <p className="mt-8 max-w-lg text-lg leading-8 text-white/70">Start with a few details about your home and what you are experiencing.</p>
              <BookingLink className="mt-9 border-white bg-white text-navy hover:border-copper hover:bg-copper hover:text-white">Request service</BookingLink>
            </div>
          </Container>
        </div>
      </section>
    </>
  );
}
