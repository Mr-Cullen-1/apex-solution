"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "./icons";

type CarouselProps = {
  ariaLabel: string;
  children: ReactNode;
  autoplayMs?: number;
  arrowClassName?: string;
  trackClassName?: string;
  showArrows?: boolean;
};

// Lightweight, dependency-free carousel built on native scroll-snap: swipe and
// keyboard scrolling come from the browser for free, and reduced-motion users get
// no autoplay and instant (non-smooth) scrolling via the global CSS override.
export function Carousel({ ariaLabel, children, autoplayMs = 0, arrowClassName = "", trackClassName = "", showArrows = true }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const scrollByOne = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const item = track.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = 20;
    const amount = ((item?.offsetWidth ?? track.clientWidth) + gap) * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!autoplayMs || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
      else scrollByOne(1);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, paused, scrollByOne]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        className={`flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${trackClassName}`}
      >
        {children}
      </div>
      {showArrows && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            aria-label={`Previous — ${ariaLabel}`}
            onClick={() => { setPaused(true); scrollByOne(-1); }}
            className={`grid size-11 place-items-center rounded-control border border-steel text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white ${arrowClassName}`}
          >
            <ArrowRightIcon className="size-4 rotate-180" />
          </button>
          <button
            type="button"
            aria-label={`Next — ${ariaLabel}`}
            onClick={() => { setPaused(true); scrollByOne(1); }}
            className={`grid size-11 place-items-center rounded-control border border-steel text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white ${arrowClassName}`}
          >
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function CarouselItem({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div data-carousel-item className={`shrink-0 snap-start ${className}`}>
      {children}
    </div>
  );
}
