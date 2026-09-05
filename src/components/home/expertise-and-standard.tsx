import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { apexStandard } from "@/content/homepage";
import { media } from "@/content/media";
import { primaryServices } from "@/content/services";

export function ExpertiseAndStandard() {
  const image = media.serviceDetail;
  const cooling = primaryServices.find((service) => service.id === "cooling")!;
  const heating = primaryServices.find((service) => service.id === "heating")!;
  const plumbing = primaryServices.find((service) => service.id === "plumbing")!;
  const airQuality = primaryServices.find((service) => service.id === "air-quality")!;

  return (
    <>
      <section className="bg-warm-white py-24 sm:py-32 lg:py-40">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <SectionHeading eyebrow="01 — Our expertise" title={<>Complete comfort.<br />One trusted team.</>} />
            <p className="max-w-xl text-base leading-7 text-slate lg:justify-self-end">From the first diagnostic question to the finishing details, the service experience is designed to make complex home systems easier to understand.</p>
          </div>

          <div className="mt-14 grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
            <Link href={cooling.href} className="group relative min-h-[34rem] overflow-hidden bg-navy lg:col-span-7 lg:row-span-2">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1023px) 100vw, 58vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" style={{ objectPosition: image.focalPoint }} />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,29,44,0.92),rgba(16,29,44,0.04)_65%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-7 text-white sm:p-10">
                <div><span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Primary expertise</span><h3 className="mt-2 text-4xl font-semibold tracking-[-0.045em]">{cooling.name}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-white/70">{cooling.shortDescription}</p></div>
                <span className="grid size-12 shrink-0 place-items-center border border-white/35 transition-colors group-hover:bg-white group-hover:text-navy"><ArrowUpRightIcon className="size-5" /></span>
              </div>
            </Link>

            <ServicePanel service={heating} className="bg-soft-white lg:col-span-5" index="02" />
            <ServicePanel service={plumbing} className="bg-navy text-white lg:col-span-3" index="03" dark />
            <ServicePanel service={airQuality} className="bg-soft-white lg:col-span-2" index="04" compact />
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-navy py-24 text-white sm:py-32 lg:py-40">
        <div className="absolute -right-24 -top-40 select-none text-[32rem] font-semibold leading-none tracking-[-0.1em] text-white/[0.025]" aria-hidden="true">A</div>
        <Container className="relative">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <SectionHeading theme="dark" eyebrow="The Apex Standard" title={<>Reliable care.<br />Thoughtfully delivered.</>} description="A simple operating idea: understand the home, explain the options, and take pride in the details." />
            <div className="border-t border-white/20">
              {apexStandard.map((principle) => (
                <div key={principle.number} className="grid gap-4 border-b border-white/20 py-8 sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline sm:py-10">
                  <span className="text-sm font-semibold tracking-[0.16em] text-copper">{principle.number}</span>
                  <h3 className="text-2xl font-semibold tracking-[-0.035em]">{principle.title}</h3>
                  <p className="text-base leading-7 text-white/60">{principle.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

type ServicePanelProps = {
  service: (typeof primaryServices)[number];
  index: string;
  className: string;
  dark?: boolean;
  compact?: boolean;
};

function ServicePanel({ service, index, className, dark = false, compact = false }: ServicePanelProps) {
  return (
    <Link href={service.href} className={`group flex min-h-64 flex-col justify-between border border-steel p-7 transition-transform duration-300 hover:-translate-y-1 sm:p-9 ${className}`}>
      <div className="flex items-start justify-between gap-4"><span className="text-xs font-bold tracking-[0.18em] text-copper">{index}</span><ArrowUpRightIcon className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
      <div><h3 className={`text-3xl font-semibold tracking-[-0.04em] ${dark ? "text-white" : "text-navy"}`}>{service.name}</h3>{!compact && <p className={`mt-3 max-w-sm text-sm leading-6 ${dark ? "text-white/60" : "text-slate"}`}>{service.shortDescription}</p>}</div>
    </Link>
  );
}
