import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRightIcon } from "./icons";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "call" | "invert" | "text";
  showArrow?: boolean;
};

const base = "group inline-flex min-h-12 items-center justify-center gap-2.5 text-sm font-semibold transition-all duration-300";

// Note: variant color pairs are self-contained (never overridden via a caller's
// className) — Tailwind's generated rule order doesn't reliably respect className
// string order, so a caller-supplied bg/text utility can silently lose the cascade.
// Use the "invert" variant for a CTA placed on a dark/brand-dark surface.
// Apex primary blue is dark enough that it always pairs with WHITE text, never ink.
const styles: Record<NonNullable<ButtonLinkProps["variant"]>, string> = {
  call: `${base} rounded-control bg-copper px-6 text-white shadow-soft hover:bg-brand-dark`,
  primary: `${base} rounded-control bg-navy px-6 text-white hover:bg-copper`,
  secondary: `${base} rounded-control border border-steel bg-transparent px-6 text-navy hover:border-navy hover:bg-warm-white`,
  invert: `${base} rounded-control bg-white px-6 text-navy hover:bg-copper hover:text-white`,
  text: "group inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors duration-300 hover:text-copper",
};

export function ButtonLink({ className = "", variant = "primary", showArrow = true, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${styles[variant]} ${className}`} {...props}>
      {children}
      {showArrow && <ArrowRightIcon className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />}
    </Link>
  );
}
