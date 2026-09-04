import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { media, type MediaId } from "@/content/media";
import { faqs, resources, serviceAreas } from "@/content/site";
import { FAQAccordion } from "./faq-accordion";

export function AreasJournalAndFinal() {
  const finalImage = media.homeExterior;

  return (
    <>
      <section className="bg-soft-white py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="grid overflow-hidden border border-steel lg:grid-cols-[0.85fr_1.15fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <SectionHeading eyebrow="05 — Where we serve" title={<>Local expertise,<br />across the Valley.</>} description="Explore the initial city routes prepared for the Phoenix metropolitan service area." />
              <div className="mt-10 grid sm:grid-cols-2">
                {serviceAreas.map((area, index) => (
                  <Link key={area.slug} href={`/service-areas/${area.slug}`} className="group flex min-h-14 items-center justify-between border-b border-steel text-sm font-semibold text-navy transition-colors hover:border-navy hover:text-copper sm:odd:mr-6">
                    <span><span className="mr-3 text-xs text-copper">0{index + 1}</span>{area.name}</span><ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
              <ButtonLink className="mt-9" href="/service-areas" variant="secondary">All service areas</ButtonLink>
            </div>
            <div className="relative min-h-[30rem] overflow-hidden border-t border-steel bg-navy lg:min-h-0 lg:border-l lg:border-t-0" aria-label="Stylized Phoenix Valley service-area diagram">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
              <div className="absolute -bottom-20 -right-8 text-[20rem] font-semibold leading-none tracking-[-0.1em] text-white/[0.04]" aria-hidden="true">A</div>
              <div className="absolute left-[15%] top-[18%] h-[58%] w-[68%] rounded-[50%] border border-dashed border-copper/60" aria-hidden="true" />
              {serviceAreas.map((area, index) => {
                const positions = ["left-[32%] top-[25%]", "left-[54%] top-[32%]", "left-[68%] top-[49%]", "left-[45%] top-[58%]", "left-[63%] top-[69%]", "left-[24%] top-[47%]"];
                return <Link key={area.slug} href={`/service-areas/${area.slug}`} className={`group absolute ${positions[index]} flex items-center gap-2 text-xs font-semibold text-white`}><span className="relative size-3 rounded-full border border-copper bg-navy before:absolute before:-inset-2 before:rounded-full before:border before:border-copper/25" /><span className="bg-navy/80 px-2 py-1 transition-colors group-hover:bg-copper">{area.name}</span></Link>;
              })}
              <p className="absolute bottom-7 left-7 text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Concept diagram · Not to scale</p>
            </div>
          </div>
        </Container>
      </section>

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
