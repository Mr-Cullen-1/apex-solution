"use client";

import Image from "next/image";
import { useState } from "react";

/** Renders an approved review's photo from an already-resolved, short-lived
 * signed URL — never a private `media_path`. Client component only because
 * it needs `onError` to gracefully drop the image (a signed URL can still
 * 404 if the underlying object was deleted after the URL was minted, or
 * once the URL itself expires past a stale cached page) without ever
 * showing a broken-image icon or crashing the review card around it. */
export function ReviewMedia({ src, variant }: { src: string; variant: "homepage" | "archive" }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;

  return (
    <div className={`relative w-full shrink-0 overflow-hidden bg-surface-muted/25 ${variant === "homepage" ? "aspect-[16/10]" : "aspect-[16/9] sm:aspect-[2/1]"}`}>
      <Image
        src={src}
        alt="Customer review photo"
        fill
        sizes={variant === "homepage" ? "(max-width: 1023px) 100vw, 33vw" : "(max-width: 767px) 100vw, 50vw"}
        className="object-cover"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
