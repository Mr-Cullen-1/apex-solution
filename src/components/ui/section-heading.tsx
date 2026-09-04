import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  theme?: "light" | "dark";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, theme = "light", className = "" }: SectionHeadingProps) {
  const dark = theme === "dark";
  return (
    <div className={className}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className={`mt-5 text-balance text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] ${dark ? "text-white" : "text-navy"}`}>{title}</h2>
      {description && <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/65" : "text-slate"}`}>{description}</p>}
    </div>
  );
}
