import { Container } from "@/components/ui/container";
import { CheckIcon } from "@/components/ui/icons";
import { credentials } from "@/content/trust";

/** Compact trust signals, moved high in the homepage journey per client
 * request. This is the single home for these four credential claims — do
 * not repeat them again later in a duplicate "Why Apex" section. */
export function TrustStrip() {
  return (
    // No bottom padding here — ServicesGrid's own `section-y` top padding already
    // provides the gap below. Stacking both (as before) doubled up to ~7rem of blank
    // bg-page-bg space between the two sections, which read as a layout bug.
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
