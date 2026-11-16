import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { primaryServices } from "@/content/services";
import { HomeExplorer } from "./home-explorer";

export function Hero() {
  return (
    <section className="service-workspace" aria-labelledby="home-heading">
      <Container>
        <div className="workspace-intro">
          <div>
            <p className="eyebrow">Apex Home Services · Your home, handled.</p>
            <h1 id="home-heading">Let’s get your home<br className="hidden sm:block" /> <span>back to comfortable.</span></h1>
          </div>
          <div className="workspace-intro-aside">
            <p>One place for appliance repair, heating, cooling and hot water. What needs a little attention?</p>
            <Link href="/service-areas" className="text-link inline-flex min-h-11 items-center gap-2">Check your service area <ArrowUpRightIcon className="size-4" /></Link>
          </div>
        </div>
        <HomeExplorer services={primaryServices.map(({ id, name, href, shortDescription }) => ({ id, name, href, shortDescription }))} />
        <nav aria-label="Quick information" className="workspace-shortcuts">
          <span className="hidden font-semibold text-navy sm:block">A little clarity goes a long way.</span>
          <Link href="/service-areas">Service areas <ArrowUpRightIcon /></Link>
          <Link href="/brands">Brands we service <ArrowUpRightIcon /></Link>
          <Link href="/reviews">Customer reviews <ArrowUpRightIcon /></Link>
        </nav>
      </Container>
    </section>
  );
}