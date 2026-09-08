import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  theme?: "light" | "dark";
  className?: string;
  id?: string;
};

export function SectionHeading({ eyebrow, title, description, theme = "light", className = "", id }: SectionHeadingProps) {
  const dark = theme === "dark";
  return (
    <div className={className}>
      <p className={dark ? "text-xs font-bold uppercase tracking-[0.14em] text-white/75" : "eyebrow"}>{eyebrow}</p>
      <h2 id={id} className={`mt-5 text-balance text-[clamp(2.25rem,5vw,4.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] ${dark ? "text-white" : "text-navy"}`}>{title}</h2>
      {description && <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/65" : "text-slate"}`}>{description}</p>}
    </div>
  );
}
