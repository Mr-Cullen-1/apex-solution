import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactEntry } from "@/content/cta";
import { supportedBrands } from "@/content/site";

export function BrandsWeService() {
  return (
    <section className="section-y bg-page-bg" aria-labelledby="brands-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <SectionHeading id="brands-heading" eyebrow="Brands we service" title={<>Familiar systems.<br />Careful service.</>} description="Apex Home Services works on a wide range of appliance and HVAC brands without implying a manufacturer authorization or partnership." />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
              <ButtonLink href="/brands" variant="secondary">Browse all brands</ButtonLink>
              <ButtonLink href={contactEntry.href} variant="secondary">Contact us</ButtonLink>
            </div>
          </div>
          <div className="grid gap-4">
            {supportedBrands.map((group) => (
              <div key={group.id} className="rounded-panel border border-steel bg-surface p-6 shadow-soft sm:p-7">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-copper">{group.label}</h3>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5">
                  {group.brands.map((brand) => <li key={brand} className="text-base font-semibold tracking-[-0.01em] text-navy transition-colors hover:text-copper">{brand}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
