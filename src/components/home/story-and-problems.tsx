import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { aboutValues } from "@/content/homepage";
import { media } from "@/content/media";
import { customerProblems } from "@/content/services";
import { company } from "@/content/company";

export function StoryAndProblems() {
  const interior = media.homeInterior;

  return (
    <>
      <section className="overflow-hidden bg-soft-white py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-7 lg:pr-14">
              <div className="relative aspect-[4/5] overflow-hidden bg-steel sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image src={interior.src} alt={interior.alt} fill sizes="(max-width: 1023px) 100vw, 54vw" className="object-cover" style={{ objectPosition: interior.focalPoint }} />
              </div>
              <div className="absolute -bottom-8 -right-2 hidden w-52 bg-navy p-7 text-white sm:block lg:right-0">
                <span className="block text-4xl font-semibold tracking-[-0.05em]">Apex</span>
                <span className="mt-2 block text-xs uppercase tracking-[0.17em] text-white/55">{company.tagline}</span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <SectionHeading eyebrow="02 — About Apex" title={<>Built on expertise.<br />Driven by trust.</>} description="Home comfort is technical. The experience of caring for it should still feel clear, calm, and considered." />
              <ul className="mt-9 border-t border-steel">
                {aboutValues.map((value, index) => (
                  <li key={value} className="flex items-center gap-5 border-b border-steel py-4 text-sm font-semibold text-navy"><span className="text-xs text-copper">0{index + 1}</span>{value}</li>
                ))}
              </ul>
              <ButtonLink className="mt-9" href="/about" variant="secondary">Our story</ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-warm-white py-24 sm:py-32 lg:py-36">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <p className="eyebrow">Find your next step</p>
            <h2 className="mt-5 text-balance text-[clamp(2.75rem,5.5vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-navy">Not sure what service you need?</h2>
            <p className="mt-6 text-lg text-slate">Tell us what&apos;s happening.</p>
          </div>
          <div className="border-t border-navy">
            {customerProblems.map((problem, index) => (
              <Link key={problem.id} href={problem.href} className="group flex min-h-20 items-center justify-between gap-6 border-b border-steel py-4 text-navy transition-colors duration-300 hover:border-navy hover:bg-soft-white sm:min-h-24 sm:px-5">
                <span className="flex items-center gap-5"><span className="text-xs font-bold tracking-[0.16em] text-copper">0{index + 1}</span><span className="text-lg font-semibold tracking-[-0.02em] sm:text-2xl">{problem.label}</span></span>
                <ArrowRightIcon className="size-6 shrink-0 transition-transform group-hover:translate-x-2" />
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
