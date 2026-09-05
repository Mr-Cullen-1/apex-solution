import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { company } from "@/content/company";
import { footerGroups } from "@/content/navigation";
import { primaryServices } from "@/content/services";
import { serviceAreas } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-navy pb-28 pt-16 text-white lg:pb-10 lg:pt-20">
      <Container>
        <div className="grid gap-12 border-b border-white/15 pb-14 lg:grid-cols-[1.2fr_2fr] lg:gap-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-3" aria-label={`${company.name} home`}>
              <span className="grid size-10 place-items-center bg-white text-sm font-bold text-navy">A</span>
              <span className="text-xl font-semibold tracking-[-0.035em]">{company.name}</span>
            </Link>
            <p className="mt-8 max-w-sm text-[clamp(2.4rem,4vw,4.5rem)] font-semibold leading-[0.92] tracking-[-0.06em]">{company.tagline}</p>
            <p className="mt-6 max-w-sm text-sm leading-6 text-white/55">{company.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 xl:grid-cols-5">
            <FooterGroup label="Services" links={primaryServices.map((service) => ({ label: service.name, href: service.href }))} />
            {footerGroups.map((group) => <FooterGroup key={group.label} {...group} />)}
            <FooterGroup label="Locations" links={serviceAreas.map((area) => ({ label: area.state, href: "/#service-areas" }))} />
          </div>
        </div>
        <div className="flex flex-col gap-5 border-b border-white/15 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/55">Ready to take the next step?</p>
          <Link href="/book" className="group inline-flex items-center gap-4 text-lg font-semibold">Book a service <ArrowUpRightIcon className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></Link>
        </div>
        <div className="flex flex-col gap-4 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}</p>
          <div className="flex gap-6"><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></div>
          <p>Contact details pending business verification.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterGroup({ label, links }: { label: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-copper">{label}</h2>
      <ul className="mt-5 space-y-3">{links.map((item) => <li key={item.href}><Link className="text-sm text-white/62 transition-colors hover:text-white" href={item.href}>{item.label}</Link></li>)}</ul>
    </div>
  );
}
