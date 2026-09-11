import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRightIcon } from "./icons";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "call" | "invert" | "outline-invert" | "footer-outline" | "header-compact" | "text";
  showArrow?: boolean;
};

export const buttonBase = "group inline-flex min-h-12 items-center justify-center gap-2.5 text-sm font-semibold transition-all duration-300";

// Note: variant color pairs are self-contained (never overridden via a caller's
// className) — Tailwind's generated rule order doesn't reliably respect className
// string order, so a caller-supplied bg/text utility can silently lose the cascade.
// Use "invert" for a solid CTA on a dark/brand-dark surface, "outline-invert" for
// a lower-emphasis (but still high-contrast) CTA on the same dark surface.
// Apex primary blue is dark enough that it always pairs with WHITE text, never ink.
export const buttonStyles: Record<NonNullable<ButtonLinkProps["variant"]>, string> = {
  call: `${buttonBase} rounded-control bg-copper px-6 text-white shadow-soft hover:bg-brand-dark`,
  primary: `${buttonBase} rounded-control bg-navy px-6 text-white hover:bg-copper`,
  secondary: `${buttonBase} rounded-control border border-steel bg-transparent px-6 text-navy hover:border-navy hover:bg-warm-white`,
  invert: `${buttonBase} rounded-control bg-white px-6 text-navy hover:bg-copper hover:text-white`,
  "outline-invert": `${buttonBase} rounded-control border border-white/35 px-6 text-white hover:border-white hover:bg-white/10`,
  // Same dark surface as "outline-invert" but a stronger default border/fill so
  // it unmistakably reads as a button at rest (not only on hover) next to a
  // solid white CTA — used where the two sit side by side at small sizes
  // (the footer), where the subtler "outline-invert" border reads too faint.
  "footer-outline": `${buttonBase} rounded-control border border-white/60 bg-white/5 px-6 text-white hover:border-white hover:bg-white/15`,
  // Fully self-contained (not a `primary` override via className — buttonBase's own
  // min-h-12/px-6 would silently win the cascade over a caller's smaller utilities).
  // Used for the mobile site-header Book Now trigger, which needs to be noticeably
  // smaller than the standard button at the smallest viewport widths.
  "header-compact": "group inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-control bg-navy px-3 text-xs font-bold text-white transition-all duration-300 hover:bg-copper sm:min-h-11 sm:gap-2.5 sm:px-5 sm:text-sm sm:font-semibold",
  text: "group inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors duration-300 hover:text-copper",
};

export function ButtonLink({ className = "", variant = "primary", showArrow = true, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${buttonStyles[variant]} ${className}`} {...props}>
      {children}
      {showArrow && <ArrowRightIcon className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />}
    </Link>
  );
}
