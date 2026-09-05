"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactEntry } from "@/content/cta";
import { serviceAreas } from "@/content/site";

export function ServiceAreaExplorer() {
  const [activeCode, setActiveCode] = useState<(typeof serviceAreas)[number]["code"]>(serviceAreas[0].code);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeArea = serviceAreas.find((area) => area.code === activeCode) ?? serviceAreas[0];

  function selectByKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % serviceAreas.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + serviceAreas.length) % serviceAreas.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = serviceAreas.length - 1;
    else return;

    event.preventDefault();
    setActiveCode(serviceAreas[nextIndex].code);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <section id="service-areas" className="scroll-mt-32 bg-soft-white py-24 sm:py-32 lg:py-40" aria-labelledby="service-area-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading id="service-area-heading" eyebrow="05 — Where we serve" title={<>Local professionals,<br />across five states.</>} description="Confirmed county coverage across New York, New Jersey, Connecticut, Massachusetts, and Rhode Island." />
            <ButtonLink className="mt-8" href="/service-areas" variant="secondary">Service area details</ButtonLink>
          </div>

          <div className="hidden border border-steel bg-warm-white md:block">
            <div role="tablist" aria-label="Service area states" className="grid grid-cols-5 border-b border-steel">
              {serviceAreas.map((area, index) => {
                const active = area.code === activeCode;
                return (
                  <button
                    key={area.code}
                    ref={(node) => { tabRefs.current[index] = node; }}
                    id={`state-tab-${area.code}`}
                    type="button"
                    role="tab"
                    aria-label={area.state}
                    aria-selected={active}
                    aria-controls={`state-panel-${area.code}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveCode(area.code)}
                    onKeyDown={(event) => selectByKeyboard(event, index)}
                    className={`min-h-16 border-r border-steel text-sm font-bold tracking-[0.14em] transition-colors last:border-r-0 ${active ? "bg-navy text-white" : "text-navy hover:bg-steel/35"}`}
                  >
                    {area.code}
                  </button>
                );
              })}
            </div>
            <div id={`state-panel-${activeArea.code}`} role="tabpanel" aria-labelledby={`state-tab-${activeArea.code}`} className="grid min-h-[22rem] grid-cols-[0.7fr_1.3fr]">
              <div className="flex flex-col justify-between border-r border-steel bg-navy p-8 text-white">
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-copper">{activeArea.code} service area</p><h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{activeArea.state}</h3></div>
                <p className="text-sm text-white/55">{activeArea.counties.length} confirmed counties</p>
              </div>
              <ul className="grid content-start sm:grid-cols-2">
                {activeArea.counties.map((county, index) => (
                  <li key={`${activeArea.code}-${county}`} className="flex min-h-16 items-center gap-4 border-b border-steel px-6 text-sm font-semibold text-navy sm:odd:border-r">
                    <span className="text-[0.65rem] text-copper">{String(index + 1).padStart(2, "0")}</span>{county}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-navy md:hidden">
            {serviceAreas.map((area) => (
              <section key={area.code} id={area.slug} className="border-b border-steel py-7" aria-labelledby={`mobile-state-${area.code}`}>
                <div className="flex items-baseline justify-between gap-5"><h3 id={`mobile-state-${area.code}`} className="text-2xl font-semibold tracking-[-0.035em] text-navy">{area.state}</h3><span className="text-xs font-bold tracking-[0.16em] text-copper">{area.code}</span></div>
                <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">{area.counties.map((county) => <li key={`${area.code}-${county}`} className="text-sm leading-5 text-slate">{county}</li>)}</ul>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-12 grid overflow-hidden border border-steel bg-warm-white lg:grid-cols-[1fr_1.1fr]">
          <div className="border-b border-steel p-7 sm:p-9 lg:border-b-0 lg:border-r">
            <p className="eyebrow">Check the next step</p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.035em] text-navy">Not sure if we service your area?</h3>
            <p className="mt-3 text-base leading-7 text-slate">Enter your ZIP code and we&apos;ll check availability.</p>
          </div>
          <form action={contactEntry.href} method="get" className="flex flex-col justify-center gap-4 p-7 sm:p-9" aria-describedby="zip-availability-note">
            <input type="hidden" name="intent" value="zip-coverage" />
            <label htmlFor="service-zip" className="text-xs font-bold uppercase tracking-[0.16em] text-navy">5-digit ZIP code</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input id="service-zip" name="zip" type="text" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" maxLength={5} required placeholder="ZIP code" title="Enter a 5-digit ZIP code" className="min-h-14 w-full border border-steel bg-soft-white px-5 text-base text-navy placeholder:text-slate/70 focus:border-navy focus:outline-none" />
              <button type="submit" className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-3 bg-navy px-6 text-sm font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-copper">Continue to contact <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></button>
            </div>
            <p id="zip-availability-note" className="text-xs leading-5 text-slate">ZIP-level coverage is confirmed by our team. This form does not return an automatic availability decision.</p>
          </form>
        </div>
      </Container>
    </section>
  );
}
