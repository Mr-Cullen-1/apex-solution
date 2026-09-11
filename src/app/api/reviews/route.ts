import { getApprovedReviews, submitReview } from "@/features/reviews/repository";
import { extractClientIp, extractUserAgent } from "@/features/reviews/rate-limit";
import { REVIEW_MEDIA_MAX_SIZE_BYTES, REVIEW_MEDIA_TOO_LARGE_MESSAGE, REVIEW_MEDIA_UNSUPPORTED_MESSAGE, sniffImageMimeType } from "@/features/reviews/media";

// The `/review` page (src/app/review/page.tsx) POSTs here; a future
// homepage/`/reviews` section GETs here.
//
// POST is multipart/form-data, not JSON, since Phase 2.5 added an optional
// single-photo attachment — FormData is the only body type that can carry
// both text fields and a binary file part without hand-rolling multipart
// parsing or a hand-set Content-Type boundary (the browser sets that; see
// review-form.tsx's plain `fetch(..., { body: formData })`, no headers).

// Generous allowance for multipart boundaries + text field overhead on top
// of the hard 5 MB media cap — real overhead here is at most a few KB, never
// megabytes, so this still meaningfully bounds the request body Vercel
// buffers before this handler ever runs.
const MAX_REQUEST_BYTES = REVIEW_MEDIA_MAX_SIZE_BYTES + 64_000;

function textField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** `website` is a honeypot: invisible to real visitors, irresistible to
 * simple bots that fill every field. Checked before anything else — before
 * the other text fields are even read, and before the optional media part
 * is ever inspected, so a honeypot hit never triggers a magic-byte sniff or
 * touches Supabase in any way. */
function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get("website");
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return Response.json({ ok: false, status: "invalid", errors: { form: "Expected a multipart form submission." } }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return Response.json({ ok: false, status: "invalid", errors: { form: "The request is too large." } }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ ok: false, status: "invalid", errors: { form: "The request body must be a valid form submission." } }, { status: 400 });
  }

  if (isHoneypotFilled(formData)) {
    // Deliberately indistinguishable from a real success response, and no
    // database or Storage access at all — a bot that got flagged should
    // never learn that it was flagged, and it shouldn't consume rate-limit
    // quota or have its "attachment" uploaded anywhere either.
    console.warn("[reviews_honeypot_triggered]");
    return Response.json({ ok: true, status: "pending" }, { status: 201, headers: { "Cache-Control": "no-store" } });
  }

  const body = {
    fullName: textField(formData, "fullName"),
    rating: textField(formData, "rating"),
    reviewText: textField(formData, "reviewText"),
    serviceSlug: textField(formData, "serviceSlug"),
    locationText: textField(formData, "locationText"),
    consentToPublish: textField(formData, "consentToPublish") === "true",
  };

  // Media validation happens here, before submitReview is even called, so a
  // bad attachment is rejected without ever running rate limiting or text
  // validation. This is still not the "expensive" step Storage abuse
  // protection cares about — the request body has already been fully
  // received by the time formData() resolves; the actual network upload to
  // Storage (inside submitReview) is what waits until after rate limiting.
  const mediaEntry = formData.get("media");
  let media: { data: Uint8Array; mimeType: "image/jpeg" | "image/png" | "image/webp"; sizeBytes: number } | null = null;
  if (mediaEntry instanceof File && mediaEntry.size > 0) {
    if (mediaEntry.size > REVIEW_MEDIA_MAX_SIZE_BYTES) {
      return Response.json({ ok: false, status: "invalid", errors: { media: REVIEW_MEDIA_TOO_LARGE_MESSAGE } }, { status: 400 });
    }
    const bytes = new Uint8Array(await mediaEntry.arrayBuffer());
    // Authoritative type comes from the file's own magic bytes, never from
    // the part's declared Content-Type or the filename — see media.ts.
    const sniffed = sniffImageMimeType(bytes);
    if (!sniffed) {
      return Response.json({ ok: false, status: "invalid", errors: { media: REVIEW_MEDIA_UNSUPPORTED_MESSAGE } }, { status: 400 });
    }
    media = { data: bytes, mimeType: sniffed, sizeBytes: bytes.byteLength };
  }

  const result = await submitReview(body, { clientIp: extractClientIp(request), userAgent: extractUserAgent(request), media });
  const statusCode = result.ok
    ? 201
    : result.status === "invalid"
      ? 400
      : result.status === "not_configured"
        ? 503
        : result.status === "rate_limited"
          ? 429
          : 500;
  return Response.json(result, { status: statusCode, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  // Only `limit` is accepted — no `status`, `featured`, or other filter is
  // read from the query string, so a caller can never widen the result
  // beyond approved + consented reviews via the URL.
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  const result = await getApprovedReviews({ limit });
  if (!result.ok) {
    const statusCode = result.status === "not_configured" ? 503 : 500;
    return Response.json(result, { status: statusCode, headers: { "Cache-Control": "no-store" } });
  }

  // Approved reviews can tolerate a short shared cache — this is public,
  // already-moderated data. Pending/rejected reviews are never reachable
  // through this endpoint at all, so there's nothing sensitive to protect
  // here with a stricter policy.
  return Response.json(result, { status: 200, headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
