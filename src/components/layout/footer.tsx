"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { applianceRepairGroups } from "@/content/appliance-repair";
import { brandMark } from "@/content/brand";
import { company, contact } from "@/content/company";
import { getServiceCategory } from "@/content/services";

// Service links use existing routes; equipment coverage is descriptive content.
const applianceRepair = getServiceCategory("appliance-repair");
const cooling = getServiceCategory("cooling");
const heating = getServiceCategory("heating");
const waterHeaterRepair = getServiceCategory("water-heater-repair");

const toGroup = (category: NonNullable<ReturnType<typeof getServiceCategory>>) => ({
  label: category.name,
  links: category.children.length ? category.children.map((service) => ({ label: service.name, href: service.href })) : [{ label: category.name, href: category.href }],
});

export function Footer() {
  // `/review` (and its tokenized invitation variant, `/review/<token>`) is
  // a focused, one-screen customer submission flow — the global footer
  // isn't needed there and would force scrolling past the review card.
  // Every other route keeps it.
  const pathname = usePathname();
  if (pathname === "/review" || pathname.startsWith("/review/")) return null;

  return (
    <footer className="bg-brand-dark pb-24 pt-10 text-white md:pb-10 md:pt-12">
      <Container>
        {/* Equipment gets a full directory row so long names stay readable.
            The brand sits beside the directory only when there is room. */}
        <div className="grid gap-8 xl:grid-cols-[1fr_3fr] xl:gap-12">
          <BrandColumn />
          <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {applianceRepair && <ApplianceRepairGroup />}
            {cooling && <FooterGroup {...toGroup(cooling)} />}
            {heating && <FooterGroup {...toGroup(heating)} />}
            {waterHeaterRepair && <FooterGroup {...toGroup(waterHeaterRepair)} />}
            {/* The fixed mobile action bar supplies these actions below md. */}
            <div className="col-span-full hidden md:mt-2 md:flex md:w-full md:max-w-[440px] md:items-center md:justify-self-end md:gap-3">
              {contact.phoneHref && (
                <a href={contact.phoneHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-control bg-white px-6 text-sm font-bold text-navy transition-colors hover:bg-copper hover:text-white">
                  <PhoneIcon className="size-4" />
                  {contact.phone}
                </a>
              )}
              <BookingLink variant="footer-outline" className="flex-1" />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 text-xs text-white/45 md:mt-10">
          <p>© {new Date().getFullYear()} {company.name}</p>
        </div>
      </Container>
    </footer>
  );
}

function ApplianceRepairGroup() {
  if (!applianceRepair) return null;

  return (
    <section className="col-span-full border-b border-white/15 pb-8" aria-labelledby="footer-appliance-heading">
      <h2 id="footer-appliance-heading" className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/75">
        <Link href={applianceRepair.href} className="underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-white">
          {applianceRepair.name}
        </Link>
      </h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-3">
        {applianceRepairGroups.map((group) => (
          <div key={group.id} className={group.id === "residential" ? "sm:col-span-2" : undefined}>
            <h3 className="text-xs font-semibold text-white">{group.label}</h3>
            <ul className={`mt-3 grid gap-x-6 gap-y-2 text-sm leading-6 text-white/75 ${group.id === "residential" ? "sm:grid-cols-2" : ""}`}>
              {group.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandColumn() {
  return (
    <div>
      <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${company.name} home`}>
        <Image src={brandMark.white.src} alt={brandMark.white.alt} width={32} height={32} className="size-8" />
        <span className="text-lg font-semibold tracking-[-0.02em]">{company.name}</span>
      </Link>
      <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">{company.description}</p>
    </div>
  );
}

function FooterGroup({ label, links }: { label: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/75">{label}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((item) => <li key={item.href}><Link className="text-sm text-white/62 transition-colors hover:text-white" href={item.href}>{item.label}</Link></li>)}
      </ul>
    </div>
  );
}
