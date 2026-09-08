import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { HeroImageCarousel } from "@/components/ui/hero-image-carousel";
import { PhoneIcon, SparkleIcon } from "@/components/ui/icons";
import { contact } from "@/content/company";
import { media } from "@/content/media";
import { primaryServices } from "@/content/services";
import { serviceAreas } from "@/content/site";
import { availability } from "@/content/trust";

export function Hero() {
  const slides = [media.northeastHvac, media.applianceService, media.serviceDetail].map((asset) => ({
    src: asset.src,
    alt: asset.alt,
    focalPoint: asset.focalPoint,
  }));

  return (
    <section className="relative bg-page-bg pb-6 pt-6 sm:pb-8 sm:pt-8">
      <Container>
        <div className="grid overflow-hidden rounded-hero border border-steel bg-surface shadow-hero lg:grid-cols-[1fr_1.05fr]">
          {/* Left panel — content */}
          <div className="flex flex-col justify-between gap-10 p-7 sm:p-10 lg:p-14 xl:p-16">
            <div>
              <h1 className="max-w-[13ch] text-balance text-[clamp(2.75rem,6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-navy">
                Home repairs,<br />
                <span className="inline-flex items-center gap-2 text-copper">
                  <SparkleIcon className="size-7 shrink-0 sm:size-9" aria-hidden="true" />
                  fast and reliable.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate sm:text-lg">
                Heating, cooling, plumbing, appliance, and air-quality service from local Northeast technicians. Call now and talk to a real person today.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                {contact.phoneHref && (
                  <a href={contact.phoneHref} className="group inline-flex min-h-12 items-center gap-2.5 rounded-control bg-copper px-6 text-base font-semibold text-white shadow-soft transition-transform duration-300 hover:-translate-y-0.5">
                    <PhoneIcon className="size-4" /> Call Now — {contact.phone}
                  </a>
                )}
                <BookingLink variant="text">Request service</BookingLink>
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-slate">
                <span className="relative flex size-2"><span aria-hidden="true" className="absolute inline-flex size-2 rounded-full bg-status-live motion-safe:animate-[pulse-dot_1.8s_ease-in-out_infinite]" /></span>
                {availability.liveNowDetail}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t border-steel pt-6">
              <div className="flex -space-x-2" aria-hidden="true">
                {primaryServices.map((service) => (
                  <span key={service.id} className="grid size-9 place-items-center rounded-full border-2 border-surface bg-brand-dark text-[0.6rem] font-bold text-white">
                    {service.name.slice(0, 2).toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-slate">
                Serving homeowners across {serviceAreas.map((area) => area.code).join(" · ")}
              </p>
            </div>
          </div>

          {/* Right panel — image carousel composition */}
          <div className="relative min-h-[22rem] overflow-hidden border-t border-steel sm:min-h-[28rem] lg:min-h-[40rem] lg:border-l lg:border-t-0">
            <HeroImageCarousel slides={slides} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,33,58,0.05),rgba(1,33,58,0.35))]" />

            <div className="pointer-events-none absolute left-5 top-5 animate-[float-soft_7s_ease-in-out_infinite] rounded-control bg-surface/95 px-4 py-2.5 shadow-card backdrop-blur sm:left-7 sm:top-7">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-ink">
                <span className="relative flex size-2"><span aria-hidden="true" className="absolute inline-flex size-2 rounded-full bg-status-live motion-safe:animate-[pulse-dot_1.8s_ease-in-out_infinite]" /></span>
                {availability.liveNowLabel} · Instant Response
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-5 left-5 right-5 animate-[float-soft_8s_1s_ease-in-out_infinite] rounded-panel bg-surface p-5 shadow-card sm:left-7 sm:right-auto sm:w-72">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-copper">{availability.emergencyLabel}</p>
              <p className="mt-2 text-lg font-semibold leading-snug text-navy">{availability.emergencyDetail}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate">{availability.heroExperience}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
