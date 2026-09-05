import Image from "next/image";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ArrowUpRightIcon } from "@/components/ui/icons";
import { company } from "@/content/company";
import { bookingEntry } from "@/content/cta";
import { media } from "@/content/media";
import { primaryServices } from "@/content/services";
import { trustPrinciples } from "@/content/homepage";

const helpOptions = [
  ...primaryServices.map((service) => ({ label: service.name, href: service.href })),
  { label: "Other", href: bookingEntry.href },
];

export function HeroAndSelector() {
  const hero = media.heroTechnician;

  return (
    <>
      <section className="relative overflow-hidden bg-warm-white pb-24 pt-12 sm:pt-16 lg:pb-32 lg:pt-20">
        <Container className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center xl:gap-20">
          <div className="relative z-10 animate-[rise-in_700ms_ease-out_both]">
            <p className="eyebrow">Premium home comfort</p>
            <h1 className="mt-6 max-w-[12ch] text-balance text-[clamp(3.5rem,7.6vw,7.65rem)] font-semibold leading-[0.88] tracking-[-0.067em] text-navy">
              Precision comfort.<br className="hidden sm:block" /> Built around you.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate sm:text-xl">{company.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <BookingLink>Request service</BookingLink>
              <ButtonLink href="/services" variant="secondary">Explore services</ButtonLink>
            </div>
            <div className="mt-12 flex items-center gap-4 border-t border-steel pt-5 text-sm text-slate">
              <span className="block h-px w-10 bg-copper" aria-hidden="true" />
              Heating · Cooling · Plumbing · Air quality
            </div>
          </div>

          <div className="relative animate-[image-in_900ms_150ms_ease-out_both] lg:ml-auto lg:w-[min(100%,39rem)]">
            <div className="absolute -left-5 top-10 hidden h-28 w-px bg-copper lg:block" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden bg-steel">
              <Image
                src={hero.src}
                alt={hero.alt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 44vw"
                className="object-cover"
                style={{ objectPosition: hero.focalPoint }}
              />
              <span className="absolute right-0 top-0 bg-navy px-4 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white">Technical precision</span>
            </div>
            <Link href={bookingEntry.href} className="group absolute -bottom-7 left-4 right-4 flex items-center justify-between gap-5 bg-soft-white p-5 shadow-[0_18px_50px_rgba(16,29,44,0.16)] transition-transform duration-300 hover:-translate-y-1 sm:left-8 sm:right-auto sm:w-[22rem] sm:p-6">
              <span><span className="block text-xs font-bold uppercase tracking-[0.16em] text-copper">Need service?</span><span className="mt-1 block text-lg font-semibold text-navy">Start your request</span></span>
              <span className="grid size-11 shrink-0 place-items-center border border-steel text-navy transition-colors group-hover:border-navy group-hover:bg-navy group-hover:text-white"><ArrowUpRightIcon className="size-5" /></span>
            </Link>
          </div>
        </Container>
      </section>

      <section className="relative z-10 bg-soft-white" aria-labelledby="service-selector-title">
        <Container>
          <div className="border border-steel bg-soft-white lg:grid lg:grid-cols-[1fr_2.2fr]">
            <div className="border-b border-steel p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <p className="eyebrow">Start here</p>
              <h2 id="service-selector-title" className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-navy sm:text-3xl">What can we help with?</h2>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-6">
              {helpOptions.map((option, index) => (
                <Link key={option.label} href={option.href} className="group flex min-h-24 items-center justify-between gap-4 border-b border-steel px-6 text-base font-semibold text-navy transition-colors duration-300 hover:bg-navy hover:text-white focus-visible:bg-navy focus-visible:text-white sm:border-r xl:border-b-0 xl:last:border-r-0">
                  <span><span className="mb-1 block text-[0.65rem] font-bold tracking-[0.16em] text-copper">0{index + 1}</span>{option.label}</span>
                  <ArrowRightIcon className="size-5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-soft-white py-14 sm:py-20" aria-label="Apex service principles">
        <Container>
          <div className="grid gap-y-8 border-y border-steel py-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustPrinciples.map((item) => (
              <div key={item.number} className="sm:px-6 sm:not-first:border-l lg:px-8 lg:first:pl-0">
                <p className="text-xs font-bold tracking-[0.18em] text-copper">{item.number}</p>
                <h2 className="mt-3 text-base font-semibold text-navy">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
