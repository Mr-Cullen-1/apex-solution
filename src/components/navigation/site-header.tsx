"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { primaryNavigation } from "@/content/navigation";
import { primaryServices } from "@/content/services";
import { company, contact } from "@/content/company";
import { brandMark } from "@/content/brand";
import { availability } from "@/content/trust";
import { BookingLink } from "@/components/ui/booking-link";
import { useBookNow } from "@/features/booking/book-now-context";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, ChevronDownIcon, CloseIcon, MenuIcon, PhoneIcon } from "@/components/ui/icons";

export function SiteHeader() {
  const { open: openBookNow } = useBookNow();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedService, setExpandedService] = useState<string | null>("services");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (megaOpen && !headerRef.current?.contains(event.target as Node)) setMegaOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && megaOpen) {
        setMegaOpen(false);
        servicesButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [megaOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const mobileTrigger = mobileButtonRef.current;
    document.body.style.overflow = "hidden";

    const panel = mobilePanelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      (previouslyFocused ?? mobileTrigger)?.focus();
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 pt-3 transition-[padding] duration-300 sm:pt-4">
      <Container>
        <div className={`flex h-16 items-center justify-between gap-2 rounded-hero px-3 transition-all duration-300 sm:h-18 sm:gap-6 sm:px-4 md:px-6 ${scrolled ? "border border-steel/50 bg-surface/55 shadow-none backdrop-blur-md hover:border-steel hover:bg-surface/90 hover:shadow-soft" : "border border-steel bg-surface shadow-soft"}`}>
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${company.name} home`}>
            <Image src={brandMark.colored.src} alt={brandMark.colored.alt} width={36} height={36} className="size-9" priority />
            <span className="hidden text-lg font-semibold tracking-[-0.02em] text-navy sm:inline">{company.name}</span>
          </Link>

          <nav className="hidden xl:block" aria-label="Primary navigation">
            <ul className="flex items-center gap-5 2xl:gap-7">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  {item.href === "/services" ? (
                    <button
                      ref={servicesButtonRef}
                      type="button"
                      className="flex min-h-11 items-center gap-1.5 text-sm font-medium text-navy transition-colors hover:text-copper"
                      aria-expanded={megaOpen}
                      aria-controls="services-mega-menu"
                      onClick={() => setMegaOpen((open) => !open)}
                    >
                      {item.label}
                      <ChevronDownIcon className={`size-4 transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} />
                    </button>
                  ) : (
                    <Link className="inline-flex min-h-11 items-center text-sm font-medium text-navy transition-colors hover:text-copper" href={item.href}>{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Conversion actions: Call + Book Now are visible at every width, including
             the smallest mobile — per the client requirement that they never hide behind
             the hamburger. Below sm they use compact sizing so the pair plus the logo mark
             and hamburger all fit one row without overflow or wrapping. Live Now and the
             full nav stay desktop-only (xl). */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <span className="hidden items-center gap-1.5 text-xs font-semibold text-ink-muted xl:inline-flex">
              <span className="relative flex size-1.5"><span aria-hidden="true" className="absolute inline-flex size-1.5 rounded-full bg-status-live motion-safe:animate-[pulse-dot_1.8s_ease-in-out_infinite]" /></span>
              {availability.liveNowLabel}
            </span>
            {contact.phoneHref && (
              <a href={contact.phoneHref} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-control bg-copper px-2.5 text-xs font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 sm:min-h-11 sm:gap-2 sm:px-4 sm:text-sm">
                <PhoneIcon className="size-3.5 shrink-0 sm:size-4" />
                <span className="whitespace-nowrap">{contact.phone}</span>
              </a>
            )}
            <BookingLink variant="header-compact" showArrow={false} />
            <button
              ref={mobileButtonRef}
              type="button"
              className="grid size-10 shrink-0 place-items-center rounded-control text-navy sm:size-12 xl:hidden"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon className="size-5 sm:size-6" />
            </button>
          </div>
        </div>
      </Container>

      <div
        id="services-mega-menu"
        className={`absolute inset-x-0 top-full hidden origin-top pt-3 transition duration-300 xl:block ${megaOpen ? "visible scale-y-100 opacity-100" : "invisible scale-y-[0.98] opacity-0"}`}
        aria-hidden={!megaOpen}
      >
        <Container>
          <div className="grid grid-cols-[1fr_3fr] gap-12 rounded-panel border border-steel bg-surface p-10 shadow-card">
          <div className="border-r border-steel pr-10">
            <p className="eyebrow">How can we help?</p>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-navy">Comfort starts with clarity.</p>
            <p className="mt-4 text-sm leading-6 text-slate">Not sure where to begin? Tell us what is happening and start a guided service request.</p>
            <button type="button" className="group mt-7 inline-flex items-center gap-3 text-sm font-semibold text-navy" onClick={() => { setMegaOpen(false); openBookNow(); }}>
              Book Now <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-7">
            {primaryServices.map((service) => (
              <div key={service.id}>
                <Link className="text-xs font-bold uppercase tracking-[0.16em] text-copper hover:text-navy" href={service.href} onClick={() => setMegaOpen(false)}>{service.name}</Link>
                {service.children?.length ? (
                  <ul className="mt-5 space-y-3">
                    {service.children.map((child) => (
                      <li key={child.id}><Link className="text-sm text-slate transition-colors hover:text-navy" href={child.href} onClick={() => setMegaOpen(false)}>{child.name}</Link></li>
                    ))}
                  </ul>
                ) : <p className="mt-5 text-sm leading-6 text-slate">{service.shortDescription}</p>}
              </div>
            ))}
          </div>
          </div>
        </Container>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 bottom-[72px] z-50 bg-navy/45 xl:hidden" onMouseDown={(event) => event.target === event.currentTarget && closeMobile()}>
          <div ref={mobilePanelRef} role="dialog" aria-modal="true" aria-label="Site navigation" className="ml-auto flex h-full w-[min(92vw,31rem)] animate-[drawer-in_300ms_ease-out] flex-col overflow-y-auto bg-surface">
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-steel px-6">
              <span className="text-lg font-semibold tracking-[-0.02em] text-navy">Explore Apex</span>
              <button type="button" className="grid size-12 place-items-center rounded-control text-navy" onClick={closeMobile} aria-label="Close navigation"><CloseIcon className="size-6" /></button>
            </div>
            {contact.phoneHref && (
              <div className="flex items-center justify-between gap-3 border-b border-steel bg-page-bg/60 px-6 py-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                  <span className="relative flex size-1.5"><span aria-hidden="true" className="absolute inline-flex size-1.5 rounded-full bg-status-live motion-safe:animate-[pulse-dot_1.8s_ease-in-out_infinite]" /></span>
                  {availability.liveNowLabel}
                </span>
                <a href={contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-copper px-4 text-sm font-bold text-white"><PhoneIcon className="size-4" />{contact.phone}</a>
              </div>
            )}
            <nav className="flex-1 px-6 py-5" aria-label="Mobile navigation">
              <div className="border-b border-steel pb-3">
                <button type="button" className="flex min-h-14 w-full items-center justify-between text-left text-2xl font-semibold tracking-[-0.035em] text-navy" aria-expanded={expandedService === "services"} onClick={() => setExpandedService((value) => value === "services" ? null : "services")}>
                  Services <ChevronDownIcon className={`size-5 transition-transform ${expandedService === "services" ? "rotate-180" : ""}`} />
                </button>
                {expandedService === "services" && (
                  <div className="pb-5">
                    {primaryServices.map((service) => (
                      <div key={service.id} className="border-t border-steel/70 py-2 first:border-t-0">
                        {service.children?.length ? (
                          <>
                            <button type="button" className="flex min-h-11 w-full items-center justify-between text-left text-sm font-bold uppercase tracking-[0.12em] text-copper" aria-expanded={expandedService === service.id} onClick={() => setExpandedService((value) => value === service.id ? "services" : service.id)}>
                              {service.name}<ChevronDownIcon className={`size-4 transition-transform ${expandedService === service.id ? "rotate-180" : ""}`} />
                            </button>
                            {expandedService === service.id && <ul className="space-y-1 pb-2">{service.children.map((child) => <li key={child.id}><Link className="flex min-h-11 items-center text-base text-slate" href={child.href} onClick={closeMobile}>{child.name}</Link></li>)}</ul>}
                          </>
                        ) : <Link className="flex min-h-11 items-center text-sm font-bold uppercase tracking-[0.12em] text-copper" href={service.href} onClick={closeMobile}>{service.name}</Link>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {primaryNavigation.filter((item) => item.href !== "/services").map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMobile} className="flex min-h-16 items-center justify-between border-b border-steel text-2xl font-semibold tracking-[-0.035em] text-navy">
                  {item.label}<ArrowRightIcon className="size-5" />
                </Link>
              ))}
            </nav>
            <div className="border-t border-steel p-6"><BookingLink className="w-full" onClick={closeMobile} /></div>
          </div>
        </div>
      )}
    </header>
  );
}
