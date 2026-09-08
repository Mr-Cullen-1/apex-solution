import Image from "next/image";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { apexResults } from "@/content/results";
import { media, type MediaId } from "@/content/media";

export function ApexResults() {
  return (
    <section className="section-y bg-page-bg" aria-labelledby="results-heading">
      <Container>
        <SectionHeading id="results-heading" eyebrow="Apex Results" title="Real work. Real results." description="Customer-approved before-and-after results will appear here as real projects are cleared for publication." />
        <div className="mt-10">
          <Carousel ariaLabel="Apex results" autoplayMs={9500}>
            {apexResults.map((result) => {
              const before = result.beforeMediaId ? media[result.beforeMediaId as MediaId] : null;
              const after = result.afterMediaId ? media[result.afterMediaId as MediaId] : null;
              return (
                <CarouselItem key={result.id} className="w-full basis-full sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]">
                  <div className="flex h-full flex-col overflow-hidden rounded-panel border border-steel bg-surface shadow-soft">
                    {before || after ? (
                      <div className="grid grid-cols-2">
                        <ResultFrame label="Before" asset={before} />
                        <ResultFrame label="After" asset={after} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-3 bg-surface-soft py-10">
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">Before</span>
                        <span aria-hidden="true" className="h-px w-6 bg-steel" />
                        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">After</span>
                        <span className="ml-2 rounded-control bg-surface px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.06em] text-copper">Awaiting approval</span>
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-copper">{result.category}</p>
                      <h3 className="mt-1.5 text-lg font-semibold text-navy">{result.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate">{result.caption}</p>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </Carousel>
        </div>
      </Container>
    </section>
  );
}

function ResultFrame({ label, asset }: { label: string; asset: { src: string; alt: string; focalPoint: string } | null }) {
  return (
    <div className="relative aspect-[4/3] bg-surface-muted/25">
      {asset && <Image src={asset.src} alt={asset.alt} fill sizes="20rem" className="object-cover" style={{ objectPosition: asset.focalPoint }} />}
      <span className="absolute bottom-1.5 left-1.5 rounded-control bg-ink/80 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white">{label}</span>
    </div>
  );
}
