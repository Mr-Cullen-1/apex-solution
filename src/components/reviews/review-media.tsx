"use client";

import Image from "next/image";

/** Renders an approved review's photo from an already-resolved, short-lived
 * signed URL — never a private `media_path`. Client component only because
 * it needs `onError` to gracefully report a failed load (a signed URL can
 * still 404 if the underlying object was deleted after the URL was minted,
 * or once the URL itself expires past a stale cached page) — the parent
 * <ReviewCard> owns what happens next: it falls back to the text-only
 * testimonial layout entirely (instruction: never a broken-image shell)
 * rather than this component quietly rendering nothing inside an otherwise
 * photo-shaped card. */
export function ReviewMedia({ src, variant, onError }: { src: string; variant: "homepage" | "archive"; onError: () => void }) {
  return (
    <div className={`relative w-full shrink-0 overflow-hidden bg-surface-muted/25 ${variant === "homepage" ? "aspect-[16/10]" : "aspect-[16/9] sm:aspect-[2/1]"}`}>
      <Image
        src={src}
        alt="Customer review photo"
        fill
        sizes={variant === "homepage" ? "(max-width: 1023px) 100vw, 33vw" : "(max-width: 767px) 100vw, 50vw"}
        className="object-cover"
        onError={onError}
      />
    </div>
  );
}
