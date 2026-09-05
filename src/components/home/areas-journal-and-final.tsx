import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { media, type MediaId } from "@/content/media";
import { faqs, resources } from "@/content/site";
import { FAQAccordion } from "./faq-accordion";
import { ServiceAreaExplorer } from "./service-area-explorer";

export function AreasJournalAndFinal() {
  const finalImage = media.homeExterior;

  return (
    <>
      <ServiceAreaExplorer />

      <section className="bg-warm-white py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="The Apex Journal" title={<>Smarter home.<br />Better comfort.</>} description="Planned practical guidance for making clearer decisions about the systems behind your home." />
            <ButtonLink href="/resources" variant="secondary">View all insights</ButtonLink>
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {resources.slice(0, 3).map((article, index) => {
              const asset = media[article.mediaId as MediaId];
              return (
                <Link key={article.slug} href="/resources" className="group block">
                  <div className={`relative overflow-hidden bg-steel ${index === 1 ? "aspect-[4/5]" : "aspect-[5/4]"}`}>
                    <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" style={{ objectPosition: asset.focalPoint }} />
                  </div>
                  <div className="mt-5 flex items-start justify-between gap-5">
                    <div><span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-copper">Planned guide · {article.category}</span><h3 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.035em] text-navy">{article.title}</h3><p className="mt-3 text-sm leading-6 text-slate">{article.excerpt}</p></div>
                    <ArrowUpRightIcon className="mt-1 size-5 shrink-0 text-navy transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-soft-white py-24 sm:py-32 lg:py-40">
        <Container className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
          <div>
            <SectionHeading eyebrow="Questions, answered" title="A clearer way forward." description="Start with the essentials. Final service availability and commercial details are confirmed during the request process." />
            <ButtonLink className="mt-8" href="/faq" variant="secondary">Visit all FAQs</ButtonLink>
          </div>
          <FAQAccordion items={faqs} />
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
              <ButtonLink className="mt-9 border-white bg-white text-navy hover:border-copper hover:bg-copper hover:text-white" href="/book">Book service</ButtonLink>
            </div>
          </Container>
        </div>
      </section>
    </>
  );
}
