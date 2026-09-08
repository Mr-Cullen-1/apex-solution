import Image from "next/image";
import Link from "next/link";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Container } from "@/components/ui/container";
import { ArrowUpRightIcon, PhoneIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { contact } from "@/content/company";
import { media, type MediaId } from "@/content/media";
import { primaryServices } from "@/content/services";

export function ServicesGrid() {
  return (
    <section className="section-y bg-page-bg" aria-labelledby="services-grid-heading">
      <Container>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading id="services-grid-heading" eyebrow="What can we help with?" title="One home. Every system covered." description="Choose a category to see common situations, or call now and describe what you're noticing." />
          {contact.phoneHref && (
            <a href={contact.phoneHref} className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-control bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-copper">
              <PhoneIcon className="size-4" />{contact.phone}
            </a>
          )}
        </div>

        <div className="mt-10">
          <Carousel ariaLabel="Service categories" autoplayMs={9000}>
            {primaryServices.map((service) => {
              const asset = media[service.mediaId as MediaId] ?? media.serviceDetail;
              return (
                <CarouselItem key={service.id} className="w-full basis-full sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]">
                  <Link href={service.href} className="group flex h-full flex-col overflow-hidden rounded-panel border border-steel bg-surface shadow-soft transition-transform duration-300 hover:-translate-y-1">
                    <div className="relative h-44 shrink-0 overflow-hidden">
                      <Image src={asset.src} alt={asset.alt} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: asset.focalPoint }} />
                      <span className="absolute left-3 top-3 rounded-control bg-surface/95 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-ink">Same-day available</span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-6 p-6">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.025em] text-navy">{service.name}</h3>
                        <p className="mt-2 leading-6 text-slate">{service.shortDescription}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">Explore {service.name.toLowerCase()} <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </Carousel>
        </div>
      </Container>
    </section>
  );
}
