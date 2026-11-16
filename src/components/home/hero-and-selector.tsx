import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { PhoneIcon } from "@/components/ui/icons";
import { contact } from "@/content/company";
import { serviceAreas } from "@/content/site";
import { primaryServices } from "@/content/services";
import { HomeExplorer } from "./home-explorer";

export function Hero() {
  return (
    <section className="bg-page-bg pb-8 pt-5 sm:pb-12 sm:pt-8">
      <Container>
        <div className="grid overflow-hidden rounded-hero border border-steel bg-surface lg:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14">
            <p className="eyebrow">New York homes. Everyday essentials.</p>
            <h1 className="mt-5 max-w-[12ch] text-balance text-[clamp(2.75rem,5.5vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.045em] text-navy">
              Get back to <span className="text-brand-primary">feeling at home.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate">Appliance repair, heating, cooling and water-heater service. Tell Apex what&apos;s happening. We&apos;ll help you take the next step.</p>
            <div className="mt-8 flex flex-col gap-3 sm:items-start">
              {contact.phoneHref && <a href={contact.phoneHref} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-control bg-brand-primary px-6 text-base font-semibold text-white transition-colors hover:bg-navy"><PhoneIcon className="size-5" />Call {contact.phone}</a>}
              <BookingLink variant="secondary" className="min-h-12">Request a service visit</BookingLink>
            </div>
            <div className="mt-8 border-t border-steel pt-5">
              <p className="max-w-md text-sm leading-6 text-slate">Serving listed counties in {new Intl.ListFormat("en-US", { type: "conjunction" }).format(serviceAreas.map((area) => area.state))}.</p>
              <Link href="/service-areas" className="text-link mt-2 inline-flex min-h-11 items-center underline">Check your service area &rarr;</Link>
            </div>
          </div>
          <HomeExplorer services={primaryServices.map(({ id, name, href, shortDescription }) => ({ id, name, href, shortDescription }))} />
        </div>
      </Container>
    </section>
  );
}
