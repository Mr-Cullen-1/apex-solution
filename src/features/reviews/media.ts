// Optional review photo attachment — shared client+server constants and pure
// validation helpers. No `server-only` import: the client form calls
// `validateMediaFile` for instant feedback the same way it already calls
// `normalizeReviewSubmission`/`validateReviewSubmission` from ./model.

export const REVIEW_MEDIA_BUCKET = "review-media";
export const REVIEW_MEDIA_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const REVIEW_MEDIA_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ReviewMediaMimeType = (typeof REVIEW_MEDIA_ALLOWED_MIME_TYPES)[number];

export const REVIEW_MEDIA_UNSUPPORTED_MESSAGE = "Upload a JPG, PNG or WEBP image.";
export const REVIEW_MEDIA_TOO_LARGE_MESSAGE = "Image must be 5 MB or smaller.";
export const REVIEW_MEDIA_UPLOAD_FAILED_MESSAGE = "We couldn't upload your photo. Please try again.";

function isAllowedMimeType(mimeType: string): mimeType is ReviewMediaMimeType {
  return (REVIEW_MEDIA_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

/** Client-side pre-check only — instant feedback before a file is even sent.
 * Trusts the browser-declared `type`/`size`, which a real browser sets from
 * its own file-type sniffing, not from the filename. Never the sole gate:
 * the server re-checks size and independently re-derives the type from the
 * file's actual bytes via `sniffImageMimeType`, never trusting either the
 * declared MIME type or the filename extension. */
export function validateMediaFile(file: { type: string; size: number }): string | null {
  if (!isAllowedMimeType(file.type)) return REVIEW_MEDIA_UNSUPPORTED_MESSAGE;
  if (file.size > REVIEW_MEDIA_MAX_SIZE_BYTES) return REVIEW_MEDIA_TOO_LARGE_MESSAGE;
  return null;
}

/** Authoritative server-side type detection from magic bytes — deliberately
 * ignores the client-declared Content-Type/filename entirely, so a PDF (or
 * anything else) renamed to `photo.jpg` with a spoofed `image/jpeg` part
 * header is still rejected: its bytes start with `%PDF`, not a JPEG/PNG/WEBP
 * signature, so this returns null regardless of what the request claimed. */
export function sniffImageMimeType(bytes: Uint8Array): ReviewMediaMimeType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function extensionForMimeType(mimeType: ReviewMediaMimeType): string {
  return mimeType === "image/jpeg" ? "jpg" : mimeType === "image/png" ? "png" : "webp";
}
