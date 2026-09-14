import { ChartEmptyState } from "./area-line-chart";

export type StackedBarSegment = { label: string; value: number; color: string };

/** Single-row proportional bar for a small state breakdown (e.g. one
 * delivery channel's pending/sent/failed split) — every segment is listed
 * in the legend even at 0, so "no failures" reads as an explicit, reassuring
 * fact rather than an absence. */
export function StackedBar({ title, segments, ariaLabel }: { title: string; segments: StackedBarSegment[]; ariaLabel: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate">{title}</p>
      {total === 0 ? (
        <ChartEmptyState />
      ) : (
        <>
          <div role="img" aria-label={ariaLabel} className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-control bg-page-bg">
            {segments
              .filter((s) => s.value > 0)
              .map((segment) => (
                <div key={segment.label} className="h-full first:rounded-l-control last:rounded-r-control" style={{ width: `${(segment.value / total) * 100}%`, backgroundColor: segment.color }} />
              ))}
          </div>
          {/* flex-wrap (not a fixed column count) so this stays readable
           * regardless of how narrow the chart card's actual column is —
           * see the DonutChart comment above for the same reasoning. */}
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-1.5 whitespace-nowrap text-ink">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
                {segment.label}
                <span className="font-semibold text-navy">{segment.value}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
