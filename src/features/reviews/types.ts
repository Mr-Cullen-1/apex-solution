export type ReviewStatus = "pending" | "approved" | "rejected";

// Shared client+server constraints — the single source both the `/review`
// form's live validation and `validateReviewSubmission` (server-authoritative)
// read from, so the two can never quietly drift apart. Plain constants, safe
// to import from a client component.
export const REVIEW_FULL_NAME_MAX_LENGTH = 120;
export const REVIEW_TEXT_MIN_LENGTH = 10;
export const REVIEW_TEXT_MAX_LENGTH = 2000;
export const REVIEW_LOCATION_MAX_LENGTH = 160;

/** Raw, editable form state a future `/review` page would hold — rating
 * starts unset (`null`) before the customer picks a star value. */
export type ReviewSubmissionDraft = {
  fullName: string;
  rating: number | null;
  reviewText: string;
  serviceSlug: string;
  locationText: string;
  consentToPublish: boolean;
};

/** Normalized payload after trimming/clamping, before validation. Fields a
 * customer can never set — status, displayName, isVerifiedCustomer,
 * isFeatured, approvedAt, rejectedAt, source — are deliberately absent from
 * this type; they're applied server-side in the repository. */
export type ReviewSubmissionPayload = {
  fullName: string;
  rating: number;
  reviewText: string;
  serviceSlug: string;
  locationText: string;
  consentToPublish: boolean;
};

// "media" is not a key of ReviewSubmissionPayload — the optional photo
// attachment travels as a separate multipart file part, not a JSON field
// (see src/features/reviews/media.ts) — but it needs the same error-slot
// shape as every text field.
export type ReviewValidationErrors = Partial<Record<keyof ReviewSubmissionPayload | "form" | "media", string>>;

export type ReviewSubmissionResult =
  | { ok: true; status: "pending" }
  | { ok: false; status: "invalid"; errors: ReviewValidationErrors }
  | { ok: false; status: "not_configured"; message: string }
  | { ok: false; status: "rate_limited"; message: string }
  // Distinct from "error" specifically so the client can route this one
  // message to the local media-attachment error slot instead of the
  // compact form-level banner — a photo upload failure isn't a form-wide
  // problem, and shouldn't read like one.
  | { ok: false; status: "media_upload_failed"; message: string }
  | { ok: false; status: "error"; message: string };

/** Shape of a row in `public.reviews`. Includes private/moderation fields —
 * never return this directly from an API response; map through
 * `toPublicReview` first. */
export type ReviewRow = {
  id: string;
  full_name: string;
  display_name: string;
  rating: number;
  review_text: string;
  service_slug: string | null;
  service_label: string | null;
  location_text: string | null;
  status: ReviewStatus;
  is_verified_customer: boolean;
  is_featured: boolean;
  consent_to_publish: boolean;
  source: string;
  // Optional review photo (Phase 2.5). All three are set together or not at
  // all (enforced by a DB CHECK constraint) — never publicly exposed; see
  // PublicReview below, which omits them entirely.
  media_path: string | null;
  media_mime_type: string | null;
  media_size_bytes: number | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
};

/** Safe public DTO. Deliberately excludes full_name, status, is_featured,
 * consent_to_publish, rejected_at, updated_at, source, and the raw
 * `media_path` — `mediaUrl` (Phase 3) is a short-lived signed Storage URL
 * generated server-side per request, never the private object path itself. */
export type PublicReview = {
  id: string;
  displayName: string;
  rating: number;
  reviewText: string;
  serviceLabel: string | null;
  locationText: string | null;
  isVerifiedCustomer: boolean;
  createdAt: string;
  approvedAt: string | null;
  mediaUrl: string | null;
};

export type GetApprovedReviewsOptions = {
  limit?: number;
  featuredOnly?: boolean;
};

export type GetApprovedReviewsResult =
  | { ok: true; reviews: PublicReview[] }
  | { ok: false; status: "not_configured"; message: string }
  | { ok: false; status: "error"; message: string };
