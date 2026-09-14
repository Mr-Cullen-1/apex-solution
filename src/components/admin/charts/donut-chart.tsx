import { ChartEmptyState } from "./area-line-chart";

export type DonutSegment = { label: string; value: number; color: string };

const SIZE = 176;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

/** Status-scale donut — each segment is a fixed, reserved status color (see
 * globals.css), never an arbitrary categorical hue. Because some segment
 * colors alone don't clear 3:1 mark contrast at every step, every segment is
 * always paired with a swatch + label + exact count in the legend (never
 * color-alone), per the dataviz relief rule. */
export function DonutChart({ segments, ariaLabel, centerLabel }: { segments: DonutSegment[]; ariaLabel: string; centerLabel?: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0);

  if (total === 0) return <ChartEmptyState />;

  const gap = visible.length > 1 ? GAP : 0;
  const cumulativeOffsets = visible.reduce<number[]>((offsets, segment, i) => {
    const previous = i === 0 ? 0 : offsets[i - 1] + (visible[i - 1].value / total) * CIRCUMFERENCE;
    return [...offsets, previous];
  }, []);
  const arcs = visible.map((segment, i) => ({
    ...segment,
    length: Math.max(0, (segment.value / total) * CIRCUMFERENCE - gap),
    offset: -cumulativeOffsets[i],
  }));

  return (
    // Deliberately always column, never a viewport-based sm:flex-row: this
    // chart sits in grid columns of very different actual widths depending
    // on how many chart cards share the row, and a viewport breakpoint has
    // no idea which one it's in — a row layout looked fine at some widths
    // and crushed the legend at others. Stacking is safe at every width.
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={ariaLabel} className="size-36 shrink-0">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--steel)" strokeWidth={STROKE} />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={arc.offset}
            >
              <title>
                {arc.label}: {arc.value}
              </title>
            </circle>
          ))}
        </g>
        <text x={SIZE / 2} y={SIZE / 2 - 4} textAnchor="middle" fill="var(--ink)" fontSize="24" fontWeight="700">
          {total}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" fill="var(--ink-muted)" fontSize="10.5">
          {centerLabel ?? "Total"}
        </text>
      </svg>

      <ul className="flex w-full flex-col gap-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink">
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </span>
            <span className="font-semibold text-navy">
              {segment.value} <span className="font-normal text-slate">({total > 0 ? Math.round((segment.value / total) * 100) : 0}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
