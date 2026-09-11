import { Container } from "@/components/ui/container";
import { CheckIcon } from "@/components/ui/icons";
import { credentials } from "@/content/trust";

/** Compact trust signals, moved high in the homepage journey per client
 * request. This is the single home for these four credential claims — do
 * not repeat them again later in a duplicate "Why Apex" section. */
export function TrustStrip() {
  return (
    // No bottom padding here — the next section's own top padding already
    // provides the gap below (CustomerReviews's `section-y-top` when it
    // renders, or ServicesGrid's `section-y` when there are no reviews to
    // show yet). Stacking both sides would double the gap, which read as a
    // layout bug before this comment was written.
    <section className="bg-page-bg">
      <Container>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {credentials.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-panel border border-steel bg-surface p-4 shadow-soft sm:p-5">
              <span className="grid size-9 shrink-0 place-items-center rounded-control bg-brand-soft text-copper"><CheckIcon className="size-4" /></span>
              <span className="text-sm font-semibold leading-tight text-navy">{item}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
