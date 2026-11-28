import { BookingLink } from "@/components/ui/booking-link";
import { ButtonLink } from "@/components/ui/button-link";
import { contact, serviceCallTerms } from "@/content/company";

export function ResourceCTA({ title = "Ready for the next step?", description = "Tell Apex Home Services about your equipment and your ZIP code. We connect you with independent local professionals." }: { title?: string; description?: string }) {
  return <aside aria-label="Find service through Apex" className="rounded-panel border border-steel bg-surface p-6 sm:p-10">
    <p className="eyebrow">Apex Home Services</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
    <p className="mt-4 max-w-2xl leading-7 text-slate">{description}</p>
    <p className="mt-3 text-sm leading-6 text-slate">{contact.hours}. Service calls start at {serviceCallTerms.startingPrice}, {serviceCallTerms.locationNote}. {serviceCallTerms.credit}</p>
    <div className="mt-6 flex flex-wrap gap-3"><BookingLink placement="public_content">Book a Service</BookingLink>{contact.phoneHref && <ButtonLink href={contact.phoneHref} variant="secondary">Call Now</ButtonLink>}<ButtonLink href="/service-areas" variant="text">Check your ZIP</ButtonLink></div>
  </aside>;
}
