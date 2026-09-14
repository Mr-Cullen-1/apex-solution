import type { ReactNode } from "react";

/** Honest "nothing to show" panel — used for both list-page empty results
 * and chart cards that have no data yet. Never a fake/placeholder chart
 * (instruction: "if data is missing, show a clean empty state rather than
 * fake visuals"). */
export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-control border border-dashed border-steel bg-page-bg px-6 py-6 text-center">
      {icon && <span className="text-steel">{icon}</span>}
      <p className="text-sm font-semibold text-navy">{title}</p>
      {description && <p className="max-w-xs text-xs text-slate">{description}</p>}
    </div>
  );
}
