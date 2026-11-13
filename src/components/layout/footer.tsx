import Image from "next/image";
import Link from "next/link";
import { FooterVisibility } from "@/components/layout/footer-visibility";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { brandMark } from "@/content/brand";
import { company, contact } from "@/content/company";
import { footerEquipmentGroups, footerSystemGroups } from "@/content/footer";
import { serviceAreas } from "@/content/site";

export function Footer() {
  return (
    <FooterVisibility>
      <footer className="site-footer pb-[calc(7rem+env(safe-area-inset-bottom))] pt-14 text-white md:pb-10 md:pt-16">
        <Container>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
            <BrandColumn />
            {footerEquipmentGroups.map((group) => (
              <nav key={group.id} aria-labelledby={`footer-${group.id}`} className={`min-w-0 ${group.id === "residential" ? "lg:col-span-3" : "lg:col-span-2"}`}>
                <FooterGroup {...group} />
              </nav>
            ))}
            <nav aria-label="HVAC & Heating" className="min-w-0 space-y-7 lg:col-span-3">
              {footerSystemGroups.map((group) => <FooterGroup key={group.id} {...group} />)}
            </nav>
          </div>

          <div className="mt-12 border-t border-footer-border pt-6 text-xs leading-6 text-footer-muted md:mt-16">
            <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </FooterVisibility>
  );
}

function BrandColumn() {
  return (
    <div className="min-w-0 lg:col-span-4 lg:pr-4">
      <Link href="/" className="inline-flex items-center gap-3" aria-label={`${company.name} home`}>
        <Image src={brandMark.white.src} alt="" width={40} height={40} className="size-10 shrink-0" />
        <span className="text-xl font-semibold tracking-[-0.02em]">{company.name}</span>
      </Link>
      <p className="mt-5 max-w-sm text-sm leading-6 text-footer-text">{company.description}</p>
      <Link href="/service-areas" className="mt-6 block max-w-sm rounded-xl border border-footer-border bg-footer-panel p-4" aria-label={`States served: ${serviceAreas.map((area) => area.state).join(", ")}. Explore service areas.`}>
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-footer-accent">States served</span>
        <span className="mt-1.5 block text-sm font-medium tracking-wide">{serviceAreas.map((area) => area.code).join(" · ")}</span>
      </Link>
      <div className="mt-6 flex max-w-sm flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
        {contact.phoneHref && (
          <a href={contact.phoneHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-control border border-footer-border bg-white/10 px-4 text-sm font-semibold hover:bg-white/15">
            <PhoneIcon className="size-4 shrink-0 text-footer-accent" />
            {contact.phone}
          </a>
        )}
        <BookingLink variant="footer-primary" className="flex-1 whitespace-nowrap" />
      </div>
    </div>
  );
}

function FooterGroup({ id, label, links }: { id: string; label: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 id={`footer-${id}`} className="border-b border-footer-border pb-3 text-xs font-bold uppercase leading-5 tracking-[0.1em] text-footer-accent">{label}</h2>
      <ul className="mt-3 space-y-1">
        {links.map((item) => (
          <li key={item.label}>
            <Link className="inline-block py-1.5 text-sm leading-6 text-footer-text" href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
