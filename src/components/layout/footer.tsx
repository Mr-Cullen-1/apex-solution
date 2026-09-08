import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { brandMark } from "@/content/brand";
import { company, contact } from "@/content/company";
import { bookingEntry } from "@/content/cta";
import { footerGroups } from "@/content/navigation";
import { primaryServices } from "@/content/services";
import { serviceAreas } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-brand-dark pb-28 pt-12 text-white lg:pb-10 lg:pt-14">
      <Container>
        <div className="grid gap-10 border-b border-white/15 pb-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label={`${company.name} home`}>
              <Image src={brandMark.white.src} alt={brandMark.white.alt} width={32} height={32} className="size-8" />
              <span className="text-lg font-semibold tracking-[-0.02em]">{company.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">{company.description}</p>
            {contact.phoneHref && (
              <a href={contact.phoneHref} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control bg-white px-4 text-sm font-bold text-navy transition-colors hover:bg-copper hover:text-white"><PhoneIcon className="size-4" />{contact.phone}</a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            <FooterGroup label="Services" links={primaryServices.map((service) => ({ label: service.name, href: service.href }))} />
            {footerGroups.map((group) => <FooterGroup key={group.label} {...group} />)}
            <FooterGroup label="Locations" links={serviceAreas.map((area) => ({ label: area.state, href: `/service-areas#${area.slug}` }))} />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-b border-white/15 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">Ready to take the next step?</p>
          <ButtonLink href={bookingEntry.href} variant="invert">Request service</ButtonLink>
        </div>
        <div className="flex flex-col gap-2 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}</p>
          <p>Select-county service across five Northeast states.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterGroup({ label, links }: { label: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/75">{label}</h2>
      <ul className="mt-4 space-y-2.5">{links.map((item) => <li key={item.href}><Link className="text-sm text-white/62 transition-colors hover:text-white" href={item.href}>{item.label}</Link></li>)}</ul>
    </div>
  );
}
