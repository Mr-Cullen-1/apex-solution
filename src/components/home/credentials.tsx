import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { CheckIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { credentials, servicePricing } from "@/content/trust";

export function Credentials() {
  const [primary, ...supporting] = credentials;

  return (
    <section className="section-y bg-page-bg" aria-labelledby="credentials-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:items-start">
          <SectionHeading id="credentials-heading" eyebrow="Why Apex" title="Trained, licensed, and ready to help." description="Precision diagnosis, clear options, and craftsmanship built to last." />
          <div className="grid gap-4">
            <div className="flex items-center gap-5 rounded-panel bg-brand-dark p-7 text-white sm:p-8">
              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-copper text-white"><CheckIcon className="size-5" /></span>
              <p className="text-xl font-semibold leading-snug tracking-[-0.02em] sm:text-2xl">{primary}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {supporting.map((item) => (
                <div key={item} className="flex items-start gap-4 rounded-panel border border-steel bg-surface p-5 shadow-soft">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-control bg-brand-soft text-copper"><CheckIcon className="size-4" /></span>
                  <span className="text-base leading-6 text-navy">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-panel border border-steel bg-surface p-6 shadow-soft sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-copper">Before you book</p>
            <p className="mt-1.5 text-lg font-semibold text-navy">{servicePricing.headline}</p>
            <p className="mt-1 text-sm leading-6 text-slate">{servicePricing.detail}</p>
          </div>
          <BookingLink variant="primary" className="w-full justify-center sm:w-auto">Request service</BookingLink>
        </div>
      </Container>
    </section>
  );
}
