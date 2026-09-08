import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { CheckIcon } from "@/components/ui/icons";
import { firstTimeOffer } from "@/content/offers";

export function FirstTimeOffer() {
  return (
    <section className="section-y bg-page-bg" aria-labelledby="offer-heading">
      <Container>
        <div className="grid gap-10 rounded-hero border border-steel bg-surface-soft p-8 shadow-soft sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-14">
          <div>
            <p className="eyebrow">{firstTimeOffer.title}</p>
            <h2 id="offer-heading" className="mt-4 max-w-lg text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-navy">{firstTimeOffer.headline}</h2>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {firstTimeOffer.eligibility.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group inline-flex items-center gap-2 rounded-control border border-steel bg-surface px-4 py-2 text-sm font-medium text-navy shadow-soft transition-colors hover:border-navy hover:bg-navy hover:text-white">
                    <CheckIcon className="size-3.5 text-copper transition-colors group-hover:text-white" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-7 max-w-md text-sm leading-6 text-slate">{firstTimeOffer.disclaimer}</p>
          </div>
          <div className="lg:justify-self-end">
            <BookingLink className="w-full justify-center sm:w-auto">Claim this offer</BookingLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
