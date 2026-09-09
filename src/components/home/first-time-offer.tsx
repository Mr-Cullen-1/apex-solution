import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { CheckIcon } from "@/components/ui/icons";
import { firstTimeOffer } from "@/content/offers";

export function FirstTimeOffer() {
  return (
    <section className="section-y bg-page-bg" aria-labelledby="offer-heading">
      <Container>
        <div className="overflow-hidden rounded-hero border border-steel shadow-soft">
          <div className="grid lg:grid-cols-[1.3fr_1fr]">
            <div className="bg-surface-soft p-8 sm:p-12 lg:p-14">
              <p className="eyebrow">{firstTimeOffer.title}</p>
              <h2 id="offer-heading" className="mt-4 text-balance text-[clamp(2rem,3.6vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.03em] text-navy">
                Save 10% on your first
                <br />
                maintenance service.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-slate">{firstTimeOffer.disclaimer}</p>
            </div>
            <div className="flex flex-col justify-between gap-8 bg-brand-soft p-8 sm:p-12 lg:p-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Your savings</p>
                <p className="mt-5 text-[clamp(4.5rem,9vw,7rem)] font-bold leading-[0.85] tracking-[-0.05em] text-navy">10%</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-copper">Off your first visit</p>
                <p className="mt-5 max-w-xs text-sm leading-6 text-navy/70">Valid on {firstTimeOffer.eligibility.length} eligible maintenance services — confirmed when you book.</p>
              </div>
              <BookingLink offer variant="primary" className="w-full justify-center lg:w-auto lg:self-start">Claim this offer</BookingLink>
            </div>
          </div>
          <div className="border-t border-steel bg-surface p-6 sm:p-8 lg:px-14 lg:py-8">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">Eligible services</p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {firstTimeOffer.eligibility.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="group flex min-h-12 items-center gap-2.5 rounded-control border border-steel bg-page-bg px-3.5 text-sm font-medium leading-tight text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white">
                    <CheckIcon className="size-3.5 shrink-0 text-copper transition-colors group-hover:text-white" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
