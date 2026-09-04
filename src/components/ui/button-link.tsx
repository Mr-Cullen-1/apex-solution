import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { ArrowRightIcon } from "./icons";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & { variant?: "primary" | "secondary" };

const styles = {
  primary: "border-navy bg-navy text-white hover:border-copper hover:bg-copper",
  secondary: "border-steel bg-transparent text-navy hover:border-navy",
};

export function ButtonLink({ className = "", variant = "primary", children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`group inline-flex min-h-12 items-center justify-center gap-3 border px-6 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-300 ${styles[variant]} ${className}`} {...props}>
      {children}<ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
