"use client";

import { useState } from "react";
import Link from "next/link";

const labels: Record<string, string> = {
  "appliance-repair": "Appliances", cooling: "Cooling", heating: "Heating", "water-heater-repair": "Hot water",
};

type ExplorerService = { id: string; name: string; href: string; shortDescription: string };

export function HomeExplorer({ services }: { services: ExplorerService[] }) {
  const [selectedId, setSelectedId] = useState(services[0].id);
  const [turned, setTurned] = useState(false);
  const selected = services.find((service) => service.id === selectedId) ?? services[0];

  return (
    <div className="home-explorer flex min-w-0 flex-col border-t border-steel bg-surface-soft p-6 sm:p-8 lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">A little care. A better home.</p>
        <span className="text-xs font-medium text-slate">01 — 04</span>
      </div>
      <div className="house-stage" aria-hidden="true">
        <div className={`house-world ${turned ? "house-world-turned" : ""}`}>
          <div className="house-floor" />
          <div className="house-wall house-wall-back"><i /><i /></div>
          <div className="house-wall house-wall-side"><i /></div>
          {services.map((service, index) => (
            <div key={service.id} className={`house-unit house-unit-${index} ${selectedId === service.id ? "house-unit-active" : ""}`}>
              <div className="house-unit-top" />
              <div className="house-unit-front"><span /><span /><span /></div>
              <div className="house-unit-side" />
              <span className="house-unit-marker">{String(index + 1).padStart(2, "0")}</span>
            </div>
          ))}
          <div className="house-path" />
        </div>
      </div>
      <div className="mb-5 hidden justify-end sm:flex">
        <button type="button" aria-pressed={turned} onClick={() => setTurned(!turned)} className="min-h-11 rounded-control border border-steel bg-surface px-4 text-xs font-semibold text-navy">{turned ? "Reset view ↶" : "Turn the home ↷"}</button>
      </div>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Explore home services">
        {services.map((service, index) => <button key={service.id} type="button" aria-pressed={selectedId === service.id} onClick={() => setSelectedId(service.id)} className={`flex min-h-12 items-center gap-2 rounded-card border px-3 text-left text-sm font-semibold transition-colors ${selectedId === service.id ? "border-brand-primary bg-brand-primary text-white" : "border-steel bg-surface text-navy hover:border-brand-primary"}`}><span className="text-xs opacity-70">0{index + 1}</span>{labels[service.id]}</button>)}
      </div>
      <div className="mt-5 border-t border-steel pt-5" aria-live="polite" aria-atomic="true">
        <p className="text-lg font-semibold text-navy">{selected.name}</p>
        <p className="mt-1 min-h-12 text-sm leading-6 text-slate">{selected.shortDescription}</p>
        <Link className="text-link mt-2 inline-flex min-h-11 items-center underline" href={selected.href}>Explore {selected.name.toLowerCase()} →</Link>
      </div>
    </div>
  );
}
