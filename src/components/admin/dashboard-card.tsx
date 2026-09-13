import Link from "next/link";

export function DashboardCard({
  label,
  value,
  href,
  cta,
  emphasize = false,
}: {
  label: string;
  value: number;
  href?: string;
  cta?: string;
  emphasize?: boolean;
}) {
  return (
    <div className={`flex flex-col justify-between rounded-panel border p-6 ${emphasize ? "border-brand-primary bg-brand-soft" : "border-steel bg-surface"}`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate">{label}</p>
        <p className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-navy">{value}</p>
      </div>
      {href && cta && (
        <Link href={href} className="mt-5 inline-flex text-sm font-semibold text-brand-primary hover:underline">
          {cta}
        </Link>
      )}
    </div>
  );
}
