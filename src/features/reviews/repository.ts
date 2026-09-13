import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { deriveDisplayName, normalizeReviewSubmission, resolveServiceContext, validateReviewSubmission } from "./model";
import { extensionForMimeType, REVIEW_MEDIA_BUCKET, REVIEW_MEDIA_UPLOAD_FAILED_MESSAGE } from "./media";
import type { ReviewMediaMimeType } from "./media";
import { hashRateKey, releaseRateLimitReservation, reserveRateLimitSlot } from "./rate-limit";
import { createReviewMediaSignedUrl } from "./signed-media";
import type { GetApprovedReviewsOptions, GetApprovedReviewsResult, PublicReview, ReviewRow, ReviewSubmissionResult } from "./types";

const SUBMIT_NOT_CONFIGURED_MESSAGE =
  "Thanks — we received your review details, but the review database is not connected yet. It has not been submitted.";
const FETCH_NOT_CONFIGURED_MESSAGE = "Reviews are not available right now.";
const SUBMISSION_FAILED_MESSAGE = "The review could not be submitted right now. Please try again shortly.";
const FETCH_FAILED_MESSAGE = "Reviews could not be loaded right now.";
const RATE_LIMITED_MESSAGE = "Too many review attempts. Please try again later.";

/** Already validated by the caller (route.ts sniffs the real bytes via
 * `sniffImageMimeType` and enforces the size cap before this is ever built)
 * — this is the one HTTP boundary a media upload can come through, so the
 * validation lives there rather than being duplicated here. */
export type ReviewMediaInput = { data: Uint8Array; mimeType: ReviewMediaMimeType; sizeBytes: number };

/** Best-effort cleanup of a Storage object that was uploaded but whose
 * matching review row never made it into the database — logged, not thrown,
 * since the submission has already failed for its own reason and a cleanup
 * hiccup shouldn't produce a second, different error for the customer. */
async function deleteOrphanMedia(supabase: SupabaseClient, path: string) {
  const { error } = await supabase.storage.from(REVIEW_MEDIA_BUCKET).remove([path]);
  if (error) console.error("[reviews_media_orphan_cleanup_failed]", path, error.message);
}

const DEFAULT_LIMIT = 6;
const MIN_LIMIT = 1;
const MAX_LIMIT = 20;

function clampLimit(limit: number | undefined): number {
  if (!Number.isFinite(limit ?? NaN)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, Math.round(limit as number)));
}

/** The only place a database row is mapped to what a client is allowed to
 * see. full_name, status, is_featured, consent_to_publish, rejected_at,
 * updated_at, source, and the raw `media_path` never leave this function —
 * `mediaUrl` is passed in separately, already resolved (or null) by the
 * caller, never derived from the row inside here. */
function toPublicReview(
  row: Pick<ReviewRow, "id" | "display_name" | "rating" | "review_text" | "service_label" | "location_text" | "is_verified_customer" | "created_at" | "approved_at">,
  mediaUrl: string | null,
): PublicReview {
  return {
    id: row.id,
    displayName: row.display_name,
    rating: row.rating,
    reviewText: row.review_text,
    serviceLabel: row.service_label,
    locationText: row.location_text,
    isVerifiedCustomer: row.is_verified_customer,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    mediaUrl,
  };
}

/** Validates, normalizes, and inserts a customer review as `pending`.
 * Moderation fields (status, is_verified_customer, is_featured, source) are
 * never accepted from the caller — the database defaults them, and this
 * function does not pass them at all.
 *
 * Rate limiting only ever consumes quota for a submission that actually
 * gets persisted: `reserveRateLimitSlot` runs before the (expensive,
 * network) media upload below — a malformed or rate-limited request never
 * reaches Supabase Storage — but the reservation it makes is released again
 * (see the `releaseRateLimitReservation` calls below) if the upload or the
 * insert that follows it fails for any reason. Omit `clientIp` to skip
 * rate limiting entirely (the caller is responsible for deciding that's
 * acceptable). */
export async function submitReview(
  rawPayload: unknown,
  options: { clientIp?: string; userAgent?: string; media?: ReviewMediaInput | null } = {},
): Promise<ReviewSubmissionResult> {
  const payload = normalizeReviewSubmission(rawPayload);
  const errors = validateReviewSubmission(payload);
  if (Object.keys(errors).length) return { ok: false, status: "invalid", errors };

  if (!isSupabaseConfigured()) return { ok: false, status: "not_configured", message: SUBMIT_NOT_CONFIGURED_MESSAGE };

  let rateLimitEventId: string | null = null;
  if (options.clientIp) {
    const rateKeyHash = hashRateKey(options.clientIp, options.userAgent ?? "unknown");
    if (rateKeyHash) {
      const reservation = await reserveRateLimitSlot(rateKeyHash);
      if (!reservation.allowed) return { ok: false, status: "rate_limited", message: RATE_LIMITED_MESSAGE };
      rateLimitEventId = reservation.eventId;
    }
  }

  const { slug, label } = resolveServiceContext(payload.serviceSlug);
  const displayName = deriveDisplayName(payload.fullName);
  const supabase = getSupabaseServerClient();
  const media = options.media ?? null;

  // Upload-then-insert (not insert-then-upload): a review row is never
  // created for a photo that failed to upload, so there is nothing to roll
  // back on that path. If the upload succeeds but the insert that follows
  // fails for some other reason, the now-orphaned object is deleted below —
  // the customer never silently loses submitted text while their photo
  // reference dangles in Storage with no matching review.
  let mediaPath: string | null = null;
  if (media) {
    mediaPath = `reviews/${randomUUID()}.${extensionForMimeType(media.mimeType)}`;
    try {
      const { error: uploadError } = await supabase.storage.from(REVIEW_MEDIA_BUCKET).upload(mediaPath, media.data, {
        contentType: media.mimeType,
        upsert: false,
      });
      if (uploadError) {
        console.error("[reviews_media_upload_failed]", uploadError.message);
        if (rateLimitEventId) await releaseRateLimitReservation(rateLimitEventId);
        return { ok: false, status: "media_upload_failed", message: REVIEW_MEDIA_UPLOAD_FAILED_MESSAGE };
      }
    } catch (err) {
      console.error("[reviews_media_upload_failed]", err instanceof Error ? err.message : err);
      if (rateLimitEventId) await releaseRateLimitReservation(rateLimitEventId);
      return { ok: false, status: "media_upload_failed", message: REVIEW_MEDIA_UPLOAD_FAILED_MESSAGE };
    }
  }

  try {
    const { error } = await supabase.from("reviews").insert({
      full_name: payload.fullName,
      display_name: displayName,
      rating: payload.rating,
      review_text: payload.reviewText,
      service_slug: slug,
      service_label: label,
      location_text: payload.locationText || null,
      consent_to_publish: payload.consentToPublish,
      media_path: mediaPath,
      media_mime_type: media ? media.mimeType : null,
      media_size_bytes: media ? media.sizeBytes : null,
    });
    if (error) {
      console.error("[reviews_submission_failed]", error.code, error.message);
      if (mediaPath) await deleteOrphanMedia(supabase, mediaPath);
      if (rateLimitEventId) await releaseRateLimitReservation(rateLimitEventId);
      return { ok: false, status: "error", message: SUBMISSION_FAILED_MESSAGE };
    }
    return { ok: true, status: "pending" };
  } catch (err) {
    console.error("[reviews_submission_failed]", err instanceof Error ? err.message : err);
    if (mediaPath) await deleteOrphanMedia(supabase, mediaPath);
    if (rateLimitEventId) await releaseRateLimitReservation(rateLimitEventId);
    return { ok: false, status: "error", message: SUBMISSION_FAILED_MESSAGE };
  }
}

/** Returns only reviews that are safe to show publicly: status = approved
 * AND consent_to_publish = true. This condition lives in the query itself
 * (not just in a future UI), and columns are selected explicitly — never
 * `select("*")` — so a new private column added later isn't accidentally
 * exposed here. */
export async function getApprovedReviews(options: GetApprovedReviewsOptions = {}): Promise<GetApprovedReviewsResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "not_configured", message: FETCH_NOT_CONFIGURED_MESSAGE };

  const limit = clampLimit(options.limit);

  try {
    const supabase = getSupabaseServerClient();
    let query = supabase
      .from("reviews")
      .select("id, display_name, rating, review_text, service_label, location_text, is_verified_customer, media_path, created_at, approved_at")
      .eq("status", "approved")
      .eq("consent_to_publish", true)
      .order("approved_at", { ascending: false })
      .limit(limit);

    // Featured is an eligibility narrowing on top of the moderation
    // condition above, never a substitute for it.
    if (options.featuredOnly) query = query.eq("is_featured", true);

    const { data, error } = await query;
    if (error) {
      console.error("[reviews_fetch_failed]", error.code, error.message);
      return { ok: false, status: "error", message: FETCH_FAILED_MESSAGE };
    }

    // Signed URLs are only ever minted for rows that already passed the
    // approved + consented filter above — never from an arbitrary path —
    // and only for the handful of rows actually returned (capped at 20),
    // resolved concurrently rather than one request at a time.
    const rows = data ?? [];
    const reviews = await Promise.all(
      rows.map(async (row) => toPublicReview(row, row.media_path ? await createReviewMediaSignedUrl(row.media_path) : null)),
    );
    return { ok: true, reviews };
  } catch (err) {
    console.error("[reviews_fetch_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: FETCH_FAILED_MESSAGE };
  }
}

/** Homepage selection logic: Apex-curated (`is_featured`) reviews take
 * priority whenever at least one exists; the section otherwise falls back
 * to the most recent approved + consented reviews so it never goes empty
 * just because a moderator hasn't flagged anything as featured yet. Never
 * mixes the two — either all-featured or all-recent, matching the product
 * spec exactly. */
export async function getHomepageReviews(limit?: number): Promise<GetApprovedReviewsResult> {
  const featured = await getApprovedReviews({ limit, featuredOnly: true });
  if (!featured.ok) return featured;
  if (featured.reviews.length > 0) return featured;
  return getApprovedReviews({ limit });
}
