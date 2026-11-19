"use client";

import { useState } from "react";
import { trackEvent } from "@/features/analytics/events";
import Link from "next/link";
import { BookingLink } from "@/components/ui/booking-link";
import { ArrowRightIcon, CheckIcon, PhoneIcon } from "@/components/ui/icons";
import { ServiceIcon } from "@/components/ui/service-icon";
import { contact } from "@/content/company";
import { serviceExperience } from "@/content/service-experience";
import { useBookNow } from "@/features/booking/book-now-context";

type ExplorerService = { id: string; name: string; href: string; shortDescription: string };

export function HomeExplorer({ services }: { services: ExplorerService[] }) {
  const { homeCategoryId: selectedId, setHomeCategoryId: setSelectedId } = useBookNow();
  const [flat, setFlat] = useState(false);
  const [turned, setTurned] = useState(false);
  const [sceneOpen, setSceneOpen] = useState(false);
  const selected = services.find((service) => service.id === selectedId) ?? services[0];
  const experience = serviceExperience[selected.id];

  return (
    <div data-analytics-placement="home_explorer" className="home-workspace">
      <div className="workspace-picker">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-navy">What can we help with?</h2>
          <span className="text-xs text-slate">Choose a service</span>
        </div>
        <div className="workspace-options" role="group" aria-label="Choose your home service">
          {services.map((service) => {
            const item = serviceExperience[service.id];
            const active = selected.id === service.id;
            return (
              <button key={service.id} type="button" aria-pressed={active} aria-controls="selected-service" onClick={(event) => { if (event.nativeEvent.isTrusted && !active) trackEvent("service_select", { placement: "home_explorer", initiator: "picker", category_id: service.id }); setSelectedId(service.id); }} className={`workspace-option ${active ? "is-selected" : ""}`}>
                <ServiceIcon service={service.id} className="service-option-icon" />
                <span><span className="block font-semibold">{item.label}</span><span className="service-option-detail">{item.detail}</span></span>
                <span className="service-option-check">{active && <CheckIcon className="size-3.5" />}</span>
              </button>
            );
          })}
        </div>
        <div id="selected-service" className="workspace-selection">
          <div aria-live="polite" aria-atomic="true">
            <p className="text-sm font-semibold text-navy">{selected.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate">{experience.prompt}</p>
          </div>
          <div className="workspace-actions">
            <BookingLink placement="home_explorer" categoryId={selected.id} variant="call">Book {experience.label.toLowerCase()}</BookingLink>
            <Link href={selected.href} className="text-link inline-flex min-h-12 items-center justify-center gap-2">Service details <ArrowRightIcon className="size-4" /></Link>
          </div>
          <p className="workspace-followup">Request a visit. We’ll follow up to confirm availability.</p>
        </div>
        <div className="workspace-help">
          <span>Not sure which service?</span>
          {contact.phoneHref ? <a data-analytics-placement="home_explorer" href={contact.phoneHref}><PhoneIcon className="size-4" />Talk to Apex</a> : <Link href="/contact">Contact Apex</Link>}
        </div>
        <button type="button" className="scene-disclosure" aria-expanded={sceneOpen} aria-controls="home-scene" onClick={() => setSceneOpen(!sceneOpen)}>{sceneOpen ? "Hide home explorer −" : "Explore your home in 2D / 3D +"}</button>
      </div>
      <div id="home-scene" className={`home-explorer ${sceneOpen ? "scene-is-open" : ""}`}>
        <div className="scene-toolbar">
          <div><span className="scene-overline">THE APEX HOME</span><p>Every essential. Connected.</p></div>
          <div className="scene-view-switch" role="group" aria-label="Home illustration view">
            <button type="button" aria-pressed={!flat} onClick={() => setFlat(false)}>3D</button>
            <button type="button" aria-pressed={flat} onClick={() => setFlat(true)}>2D</button>
          </div>
        </div>
        <div className={`house-stage ${flat ? "house-stage-flat" : ""}`} aria-hidden="true">
          <div className={`house-world ${turned ? "house-world-turned" : ""}`}>
            <div className="house-floor" />
            <div className="house-wall house-wall-back"><i /><i /></div>
            <div className="house-wall house-wall-side"><i /></div>
            <div className="house-rug" /><div className="house-divider" />
            {services.map((service, index) => (
              <div key={service.id} className={`house-unit house-unit-${index} ${selectedId === service.id ? "house-unit-active" : ""}`}>
                <div className="house-unit-top" />
                <div className="house-unit-front"><ServiceIcon service={service.id} /><span /><span /></div>
                <div className="house-unit-side" />
                <span className="house-unit-marker">{serviceExperience[service.id].label}</span>
              </div>
            ))}
            <div className="house-path" />
          </div>
        </div>
        <div className="scene-caption">
          <span><span className="scene-caption-dot" />{experience.label}<span className="scene-caption-muted"> · Selected service</span></span>
          {!flat && <button type="button" aria-pressed={turned} onClick={() => setTurned(!turned)} aria-label={turned ? "Reset home angle" : "Rotate home illustration"}>{turned ? "Reset ↶" : "Rotate ↻"}</button>}
        </div>
        <p className="scene-footnote">An illustration of the systems that make a home.</p>
      </div>
    </div>
  );
}
