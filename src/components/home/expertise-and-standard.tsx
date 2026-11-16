import Image from "next/image";
import Link from "next/link";
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
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading id="services-grid-heading" eyebrow="What can we help with?" title="The systems your day depends on." description="Choose a category to see common situations, or call now and describe what you're noticing." />
          {contact.phoneHref && (
            <a href={contact.phoneHref} className="inline-flex min-h-12 shrink-0 self-start items-center gap-2 rounded-control bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-copper lg:mr-16 lg:self-auto">
              <PhoneIcon className="size-4" />{contact.phone}
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {primaryServices.map((service) => {
              const asset = media[(service.cardMediaId ?? service.mediaId) as MediaId] ?? media.realApplianceOven;
              return (
                <div key={service.id}>
                  <Link href={service.href} className="group flex h-full flex-col overflow-hidden rounded-card border border-steel bg-surface motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-1">
                    <div className="relative h-44 shrink-0 overflow-hidden">
                      <Image src={asset.src} alt={asset.alt} fill sizes="(min-width:1280px) 23vw, (min-width:640px) 46vw, 90vw" className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105" style={{ objectPosition: asset.focalPoint }} />
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-6 p-6">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-0.025em] text-navy">{service.name}</h3>
                        <p className="mt-2 leading-6 text-slate">{service.shortDescription}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy">Explore {service.name.toLowerCase()} <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                    </div>
                  </Link>
                </div>
              );
            })}
        </div>
      </Container>
    </section>
  );
}
