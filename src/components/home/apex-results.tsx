import Image from "next/image";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { Container } from "@/components/ui/container";
import { ImageIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { apexResults } from "@/content/results";
import { media, type MediaId } from "@/content/media";

const MEDIA_HEIGHT = "h-60 sm:h-64 lg:h-72";

export function ApexResults() {
  return (
    <section className="section-y bg-page-bg" aria-labelledby="results-heading">
      <Container>
        <SectionHeading id="results-heading" eyebrow="Apex Results" title="See the difference Apex makes." description="Customer-approved before-and-after results will appear here as real projects are cleared for publication." />
        <div className="mt-10">
          <Carousel
            ariaLabel="Apex results"
            autoplayMs={9500}
            arrowVariant="overlay"
            overlayArrowTopClassName="top-[7.5rem] sm:top-[8rem] lg:top-[9rem] -translate-y-1/2"
          >
            {apexResults.map((result) => {
              const before = result.beforeMediaId ? media[result.beforeMediaId as MediaId] : null;
              const after = result.afterMediaId ? media[result.afterMediaId as MediaId] : null;
              const sample = !before && !after && result.sampleMediaId ? media[result.sampleMediaId as MediaId] : null;
              return (
                <CarouselItem key={result.id} className="w-full basis-full sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]">
                  <div className="flex h-full flex-col overflow-hidden rounded-panel border border-steel bg-surface shadow-soft">
                    {before || after ? (
                      <div className={`grid grid-cols-2 ${MEDIA_HEIGHT}`}>
                        <ResultFrame label="Before" asset={before} />
                        <ResultFrame label="After" asset={after} />
                      </div>
                    ) : sample ? (
                      <div className={`relative ${MEDIA_HEIGHT}`}>
                        <Image src={sample.src} alt={sample.alt} fill sizes="(max-width: 1023px) 100vw, 33vw" className="object-cover" style={{ objectPosition: sample.focalPoint }} />
                        <span className="absolute left-3 top-3 rounded-control bg-surface/95 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-copper shadow-soft">Sample layout</span>
                        <span className="absolute bottom-3 left-3 right-3 rounded-control bg-ink/80 px-3 py-1.5 text-[0.65rem] font-semibold leading-snug text-white">Awaiting approved before/after photos</span>
                      </div>
                    ) : (
                      <div className={`relative grid grid-cols-2 gap-px bg-steel ${MEDIA_HEIGHT}`}>
                        <PlaceholderFrame label="Before" />
                        <PlaceholderFrame label="After" />
                        <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-control bg-surface px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-copper shadow-soft">Awaiting approval</span>
                      </div>
                    )}
                    <div className="flex flex-1 flex-col justify-center p-6">
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
    <div className="relative bg-surface-muted/25">
      {asset && <Image src={asset.src} alt={asset.alt} fill sizes="20rem" className="object-cover" style={{ objectPosition: asset.focalPoint }} />}
      <span className="absolute bottom-2 left-2 rounded-control bg-ink/80 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white">{label}</span>
    </div>
  );
}

function PlaceholderFrame({ label }: { label: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-2 bg-surface-soft">
      <ImageIcon className="size-7 text-surface-muted" />
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">{label}</span>
    </div>
  );
}
