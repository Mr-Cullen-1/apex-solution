import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { contact } from "@/content/company";
import { servicePricing } from "@/content/trust";

/** Sits directly beneath the hero so starting price + the primary Call CTA
 * are visible on the first screen, without cluttering the hero's own text
 * column. Also the single home for service-call pricing — do not repeat this
 * elsewhere on the homepage. */
export function PricingStrip() {
  return (
    <section className="bg-page-bg pb-6 sm:pb-8">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 rounded-panel border border-steel bg-surface p-6 shadow-soft sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-copper">Service call pricing</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.01em] text-navy sm:text-2xl">{servicePricing.headline}</p>
            <p className="mt-1.5 text-sm leading-6 text-slate">{servicePricing.detail}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {contact.phoneHref && (
              <a href={contact.phoneHref} className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-control bg-copper px-6 text-base font-semibold text-white shadow-soft transition-transform duration-300 hover:-translate-y-0.5">
                <PhoneIcon className="size-4" /> Call {contact.phone}
              </a>
            )}
            <BookingLink variant="secondary" className="w-full justify-center sm:w-auto" />
          </div>
        </div>
      </Container>
    </section>
  );
}
