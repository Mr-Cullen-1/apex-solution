"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { src: string; alt: string; focalPoint: string };

export function HeroImageCarousel({ slides, intervalMs = 8000 }: { slides: Slide[]; intervalMs?: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((current) => (current + 1) % slides.length), intervalMs);
    return () => window.clearInterval(id);
  }, [paused, slides.length, intervalMs]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(max-width: 1023px) 100vw, 52vw"
          className={`object-cover transition-opacity duration-1000 ease-in-out ${index === active ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: slide.focalPoint }}
        />
      ))}
      {slides.length > 1 && (
        <div role="tablist" aria-label="Hero photo selection" className="absolute right-5 top-5 z-10 flex gap-1.5 sm:right-7 sm:top-7">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              aria-label={`Show photo ${index + 1} of ${slides.length}`}
              aria-selected={index === active}
              onClick={() => { setActive(index); setPaused(true); }}
              className={`h-1.5 rounded-control transition-all duration-300 ${index === active ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
