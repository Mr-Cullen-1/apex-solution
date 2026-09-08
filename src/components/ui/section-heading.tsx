import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  theme?: "light" | "dark";
  /** "compact" is for headings sitting in a narrow sidebar-style column
   * (roughly 0.7–0.8fr of a two-column grid) — the default size wraps
   * long titles one word per line in that width. */
  size?: "default" | "compact";
  className?: string;
  id?: string;
};

const titleSize = {
  default: "text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.05]",
  compact: "text-[clamp(1.875rem,3.2vw,2.5rem)] leading-[1.15]",
};

export function SectionHeading({ eyebrow, title, description, theme = "light", size = "default", className = "", id }: SectionHeadingProps) {
  const dark = theme === "dark";
  return (
    <div className={className}>
      <p className={dark ? "text-xs font-bold uppercase tracking-[0.14em] text-white/75" : "eyebrow"}>{eyebrow}</p>
      <h2 id={id} className={`mt-5 text-balance font-semibold tracking-[-0.03em] ${titleSize[size]} ${dark ? "text-white" : "text-navy"}`}>{title}</h2>
      {description && <p className={`mt-6 max-w-2xl text-base leading-7 sm:text-lg ${dark ? "text-white/65" : "text-slate"}`}>{description}</p>}
    </div>
  );
}
