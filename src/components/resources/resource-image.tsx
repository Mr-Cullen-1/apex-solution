import Image from "next/image";
import type { ResourceImage as ImageData } from "@/types/resource";

export function ResourceImage({ image, alt, priority = false, sizes = "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw" }: { image: ImageData | null; alt: string; priority?: boolean; sizes?: string }) {
  return (
    <div className="resource-image relative aspect-[16/9] overflow-hidden rounded-card bg-surface-soft">
      {image ? <Image src={image.src} alt={alt} fill sizes={sizes} preload={priority} className="object-cover" /> : (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-brand-primary">
          <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-16" aria-hidden="true"><path d="M10 36 40 12l30 24M18 30v38h44V30M31 68V46h18v22M34 32h12" /><path d="M5 74h70" /></svg>
          <span className="text-xs font-semibold tracking-widest uppercase">Homeowner resources</span>
        </div>
      )}
    </div>
  );
}
