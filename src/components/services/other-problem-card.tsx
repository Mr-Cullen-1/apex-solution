"use client";

import { ArrowRightIcon } from "@/components/ui/icons";
import { useBookNow } from "@/features/booking/book-now-context";

/** The peer of the symptom cards in ProblemDiscovery for customers whose issue isn't
 * listed. Not a service category — it has no route of its own and simply opens the
 * existing Book Now modal with whatever category context the page already has,
 * so the customer isn't asked to re-select anything before describing the issue. */
export function OtherProblemCard({ categoryId }: { categoryId?: string }) {
  const { open } = useBookNow();
  return (
    <button
      type="button"
      onClick={() => open({ categoryId, issue: "Other" })}
      className="group flex min-h-44 flex-col justify-between rounded-panel border border-white/15 bg-white/[0.04] p-6 text-left transition-colors hover:bg-white/[0.08] sm:p-8"
    >
      <span className="text-xl font-semibold tracking-[-0.02em]">Other</span>
      <span className="mt-6 flex items-end justify-between gap-5 text-sm leading-6 text-white/60">
        <span>Something else going on? Tell us what you’re experiencing.</span>
        <ArrowRightIcon className="size-4 shrink-0 text-copper transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
