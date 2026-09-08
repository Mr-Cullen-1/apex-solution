import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { media, type MediaId } from "@/content/media";
import { membership, projects, reviews } from "@/content/site";
import type { Review } from "@/types/content";

export function WorkCareAndProof() {
  return (
    <>
      <section className="bg-soft-white section-y">
        <Container>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHeading eyebrow="03 — Project presentation" title="Project stories, in preparation." description="Concept layouts are reserved for future projects with verified photography, locations, and service details." />
            <ButtonLink href="/projects" variant="secondary">Project page foundation</ButtonLink>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-12">
            {projects.map((project, index) => {
              const asset = media[project.mediaId as MediaId];
              const large = index === 0;
              return (
                <Link key={project.id} href="/projects" className={`group relative overflow-hidden bg-navy ${large ? "min-h-[34rem] lg:col-span-7 lg:row-span-2" : "min-h-[22rem] lg:col-span-5"}`}>
                  <Image src={asset.src} alt={asset.alt} fill sizes={large ? "(max-width: 1023px) 100vw, 58vw" : "(max-width: 1023px) 100vw, 42vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" style={{ objectPosition: asset.focalPoint }} />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,29,44,0.9),transparent_65%)]" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 text-white sm:p-8">
                    <div><span className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-copper">Visual concept · Not completed Apex work</span><h3 className={`mt-2 font-semibold tracking-[-0.04em] ${large ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{project.title}</h3><p className="mt-2 text-sm text-white/60">{project.service}</p></div>
                    <ArrowUpRightIcon className="size-6 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-warm-white section-y">
        <Container>
          <div className="relative overflow-hidden bg-navy text-white">
            <div className="absolute -right-12 -top-24 select-none text-[24rem] font-semibold leading-none tracking-[-0.12em] text-white/[0.035]" aria-hidden="true">A</div>
            <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-12 lg:p-16 xl:p-20">
                <p className="eyebrow">{membership.name}</p>
                <h2 className="mt-6 max-w-3xl text-balance text-[clamp(3rem,6.2vw,6rem)] font-semibold leading-[0.93] tracking-[-0.06em]">Comfort shouldn&apos;t require a second thought.</h2>
                <p className="mt-7 max-w-xl text-base leading-7 text-white/65">{membership.description} Final benefits and commercial terms remain subject to confirmation.</p>
                <ButtonLink className="mt-9 border-white bg-white text-navy hover:border-copper hover:bg-copper hover:text-white" href="/membership">Explore Apex Care</ButtonLink>
              </div>
              <div className="flex flex-col justify-end border-t border-white/15 bg-white/[0.035] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Program status</p>
                <p className="mt-7 border-t border-white/20 pt-7 text-xl leading-8 text-white/70">Scope, eligibility, maintenance inclusions, pricing, and terms are not yet confirmed. The route remains an unindexed product foundation.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-soft-white section-y">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-24">
          <SectionHeading eyebrow="04 — Customer perspective" title={<>Trust is earned<br />in the details.</>} description="The review system is ready for verified customer feedback. No names, ratings, or testimonials are displayed until they are approved." />
          {reviews.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
          ) : (
            <div className="border-y border-steel py-10 sm:p-10 sm:ring-1 sm:ring-steel">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">Verified reviews coming soon</p>
              <p className="mt-5 max-w-xl text-2xl font-semibold leading-snug tracking-[-0.035em] text-navy">Real customer experiences will live here once source, wording, and attribution are confirmed.</p>
              <Link className="text-link mt-7 inline-flex" href="/reviews">Review page foundation →</Link>
            </div>
          )}
        </Container>
      </section>

      <section className="border-y border-steel bg-warm-white section-y">
        <Container className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div><p className="eyebrow">Financing information</p><h2 className="mt-4 text-balance text-[clamp(2.6rem,5vw,5rem)] font-semibold leading-none tracking-[-0.055em] text-navy">Details follow<br />verified terms.</h2></div>
          <div className="lg:justify-self-end"><p className="max-w-md text-base leading-7 text-slate">Explore the financing experience. Providers, eligibility, rates, and terms will be published only after verification.</p><ButtonLink className="mt-7" href="/financing" variant="secondary">Explore financing</ButtonLink></div>
        </Container>
      </section>
    </>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="border border-steel p-8">
      <p className="text-sm font-semibold text-copper">{review.rating}/5 · {review.source}</p>
      <blockquote className="mt-5 text-xl leading-8 text-navy">“{review.quote}”</blockquote>
      <figcaption className="mt-6 text-sm text-slate">{review.author}{review.location ? ` · ${review.location}` : ""}</figcaption>
    </figure>
  );
}
