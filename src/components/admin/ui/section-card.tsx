import type { ReactNode } from "react";

/** Generic bordered panel wrapper — replaces the repeated
 * `rounded-panel border border-steel bg-surface p-6` markup that used to be
 * hand-typed on every detail-page section. Optional `title`/`action` render
 * a small section head consistent with the KPI/chart card headers. */
export function SectionCard({
  title,
  action,
  className = "",
  children,
}: {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-panel border border-steel bg-surface p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
