import type { ReactNode } from "react";

/** Wrapper for every analytics chart on the dashboard — consistent header
 * (title + optional subtitle/action) and body padding so charts of very
 * different shapes (line, donut, bar list) still sit in a uniform card. */
export function ChartCard({
  title,
  subtitle,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-4 rounded-panel border border-steel bg-surface p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-navy">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
