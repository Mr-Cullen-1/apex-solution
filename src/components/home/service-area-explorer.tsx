"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
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
    <section id="service-areas" className="section-y bg-page-bg" aria-labelledby="service-area-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <SectionHeading id="service-area-heading" eyebrow="Where we serve" title={<>Local professionals,<br />across five states.</>} description="Confirmed county coverage across New York, New Jersey, Connecticut, Massachusetts, and Rhode Island." />
          </div>

          <div className="hidden overflow-hidden rounded-panel border border-steel bg-surface shadow-soft md:flex md:flex-col">
            <div role="tablist" aria-label="Service area states" className="grid shrink-0 grid-cols-5 border-b border-steel">
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
                    className={`min-h-14 border-r border-steel text-sm font-bold tracking-[0.14em] transition-colors last:border-r-0 ${active ? "bg-navy text-white" : "text-navy hover:bg-steel/35"}`}
                  >
                    {area.code}
                  </button>
                );
              })}
            </div>
            <div id={`state-panel-${activeArea.code}`} role="tabpanel" aria-labelledby={`state-tab-${activeArea.code}`} className="grid flex-1 items-stretch grid-cols-[0.7fr_1.3fr]">
              <div className="flex flex-col justify-between border-r border-steel bg-navy p-7 text-white">
                <div><p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/75">{activeArea.code} service area</p><h3 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{activeArea.state}</h3></div>
                <p className="text-sm text-white/55">{activeArea.counties.length} confirmed counties</p>
              </div>
              <ul className="grid content-start sm:grid-cols-2">
                {activeArea.counties.map((county, index) => (
                  <li key={`${activeArea.code}-${county}`} className="flex min-h-14 items-center gap-4 border-b border-steel px-6 text-sm font-semibold text-navy sm:odd:border-r">
                    <span className="text-[0.65rem] text-copper">{String(index + 1).padStart(2, "0")}</span>{county}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 flex-col items-start justify-between gap-4 border-t border-steel p-7 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-copper">Not sure if we service your area?</p>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate">Enter your ZIP in the booking location step. It checks format only — Apex confirms actual availability after you submit a request.</p>
              </div>
              <BookingLink variant="primary" className="w-full shrink-0 justify-center sm:w-auto">Continue to request</BookingLink>
            </div>
          </div>

          <div className="border-t border-navy md:hidden">
            {serviceAreas.map((area) => (
              <section key={area.code} id={area.slug} className="border-b border-steel py-7" aria-labelledby={`mobile-state-${area.code}`}>
                <div className="flex items-baseline justify-between gap-5"><h3 id={`mobile-state-${area.code}`} className="text-2xl font-semibold tracking-[-0.035em] text-navy">{area.state}</h3><span className="text-xs font-bold tracking-[0.16em] text-copper">{area.code}</span></div>
                <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">{area.counties.map((county) => <li key={`${area.code}-${county}`} className="text-sm leading-5 text-slate">{county}</li>)}</ul>
              </section>
            ))}
            <div className="pt-7">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-copper">Not sure if we service your area?</p>
              <p className="mt-1.5 text-sm leading-6 text-slate">Enter your ZIP in the booking location step. It checks format only — Apex confirms actual availability after you submit a request.</p>
              <BookingLink variant="primary" className="mt-4 w-full justify-center">Continue to request</BookingLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
