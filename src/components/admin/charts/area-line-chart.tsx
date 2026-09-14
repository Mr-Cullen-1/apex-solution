export type AreaLineChartPoint = { label: string; value: number };

const WIDTH = 680;
const HEIGHT = 220;
const PAD = { top: 16, right: 12, bottom: 26, left: 34 };

function niceMax(value: number): number {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Zero-dependency, server-rendered line/area chart (one series = one hue,
 * per the dataviz method — no categorical color needed). Native <title>
 * elements on each point stand in for a hover tooltip without shipping any
 * client JS, which keeps this chart free (no chart library dependency, per
 * AGENTS.md: "Do not add a dependency when a small accessible platform or
 * React solution is sufficient"). */
export function AreaLineChart({ points, ariaLabel }: { points: AreaLineChartPoint[]; ariaLabel: string }) {
  const total = points.reduce((sum, p) => sum + p.value, 0);
  if (points.length === 0 || total === 0) {
    return <ChartEmptyState />;
  }

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const max = niceMax(Math.max(...points.map((p) => p.value)));

  const xFor = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yFor = (value: number) => PAD.top + innerH - (value / max) * innerH;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)},${yFor(p.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${xFor(points.length - 1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${xFor(0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`;

  const gridSteps = [0, 0.5, 1];
  const labelEvery = Math.max(1, Math.ceil(points.length / 7));
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel} className="w-full">
      <defs>
        <linearGradient id="area-line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridSteps.map((step) => {
        const y = PAD.top + innerH * (1 - step);
        return (
          <g key={step}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} stroke="var(--steel)" strokeWidth="1" />
            <text x={PAD.left - 8} y={y + 3} textAnchor="end" fill="var(--ink-muted)" fontSize="10">
              {Math.round(max * step)}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#area-line-fill)" stroke="none" />
      <path d={linePath} fill="none" stroke="var(--brand-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={p.label + i}>
          <circle cx={xFor(i)} cy={yFor(p.value)} r={8} fill="transparent">
            <title>
              {p.label}: {p.value}
            </title>
          </circle>
          {i === points.length - 1 && <circle cx={xFor(i)} cy={yFor(p.value)} r={3.5} fill="var(--brand-primary)" />}
          {(i % labelEvery === 0 || i === points.length - 1) && (
            <text x={xFor(i)} y={HEIGHT - 6} textAnchor="middle" fill="var(--ink-muted)" fontSize="10">
              {p.label}
            </text>
          )}
        </g>
      ))}

      <text x={xFor(points.length - 1)} y={yFor(last.value) - 10} textAnchor="end" fill="var(--ink)" fontSize="12" fontWeight="700">
        {last.value}
      </text>
    </svg>
  );
}

export function ChartEmptyState() {
  return <div className="flex h-[160px] items-center justify-center text-center text-sm text-slate">Not enough data yet to chart this.</div>;
}
