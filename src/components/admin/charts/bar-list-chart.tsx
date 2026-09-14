import { ChartEmptyState } from "./area-line-chart";

export type BarListItem = { label: string; value: number };

/** Horizontal bar-list (single series = single hue, ranked by magnitude) —
 * plain HTML/CSS rather than SVG since the bars are simple rects and this
 * keeps long category labels wrapping naturally at narrow widths. */
export function BarListChart({ items, ariaLabel }: { items: BarListItem[]; ariaLabel: string }) {
  if (items.length === 0) return <ChartEmptyState />;

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul aria-label={ariaLabel} className="flex flex-col gap-3.5">
      {items.map((item) => {
        const pct = Math.max(4, Math.round((item.value / max) * 100));
        return (
          <li key={item.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-ink">{item.label}</span>
              <span className="shrink-0 font-semibold text-navy">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-control bg-page-bg">
              <div className="h-full rounded-control bg-brand-primary" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
