import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactEntry } from "@/content/cta";
import { supportedBrands } from "@/content/site";

export function BrandsWeService() {
  return (
    <section className="border-y border-steel bg-soft-white py-24 sm:py-32" aria-labelledby="brands-heading">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div>
            <SectionHeading id="brands-heading" eyebrow="Brands we service" title={<>Familiar systems.<br />Careful service.</>} description="Apex Home Services works on a wide range of appliance and HVAC brands without implying a manufacturer authorization or partnership." />
          </div>
          <div className="border-t border-navy">
            {supportedBrands.map((group) => (
              <div key={group.id} className="grid gap-5 border-b border-steel py-7 sm:grid-cols-[11rem_1fr] sm:py-9">
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-copper">{group.label}</h3>
                <ul className="flex flex-wrap gap-x-6 gap-y-3">
                  {group.brands.map((brand) => <li key={brand} className="text-lg font-semibold tracking-[-0.02em] text-navy transition-colors hover:text-copper">{brand}</li>)}
                </ul>
              </div>
            ))}
            <div className="pt-8"><p className="text-lg leading-8 text-slate">Don&apos;t see your brand? Contact us — we may still be able to help.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/brands" variant="secondary">Browse all brands</ButtonLink><ButtonLink href={contactEntry.href} variant="secondary">Contact us</ButtonLink></div></div>
          </div>
        </div>
      </Container>
    </section>
  );
}
