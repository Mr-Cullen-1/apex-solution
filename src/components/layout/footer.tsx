"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { brandMark } from "@/content/brand";
import { company, contact } from "@/content/company";
import { getServiceCategory } from "@/content/services";

// Real, existing routes only — one column per active public service category.
// No invented service names.
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
        {/* Brand/description + the real service directory, one unified block.
            Below xl the service columns share one sub-grid; at xl the sub-grid
            dissolves (`xl:contents`) so all five columns (brand + 4 categories)
            sit in a single 1.3fr/0.9fr row. */}
        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_0.9fr] xl:gap-8">
          <BrandColumn />
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 xl:contents">
            {applianceRepair && <FooterGroup {...toGroup(applianceRepair)} />}
            {cooling && <FooterGroup {...toGroup(cooling)} />}
            {heating && <FooterGroup {...toGroup(heating)} />}
            {waterHeaterRepair && <FooterGroup {...toGroup(waterHeaterRepair)} />}
            {/* Call + Book Now: spans the last two columns (Heating +
                Water Heater Repair) so both buttons sit side by side at equal width —
                a single narrow column isn't wide enough for that and forced
                them to wrap/stack. Hidden below `md`: the fixed mobile
                action bar already shows the same Call | Book Now pair. */}
            <div className="hidden md:col-start-1 md:col-end-5 md:mt-2 md:flex md:w-full md:max-w-[440px] md:items-center md:justify-self-end md:gap-3 xl:col-start-4 xl:col-end-6">
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
