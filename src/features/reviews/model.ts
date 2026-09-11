import { getServiceCategory } from "@/content/services";
import { REVIEW_FULL_NAME_MAX_LENGTH, REVIEW_LOCATION_MAX_LENGTH, REVIEW_TEXT_MAX_LENGTH, REVIEW_TEXT_MIN_LENGTH } from "./types";
import type { ReviewSubmissionPayload, ReviewValidationErrors } from "./types";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/** Collapses accidental repeated whitespace (e.g. pasted from a form with
 * extra spaces/newlines) without touching the customer's actual wording —
 * no grammar correction, no rewriting. */
function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeRating(value: unknown): number {
  const rating = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(rating)) return 0;
  return Math.round(rating);
}

export function normalizeReviewSubmission(value: unknown): ReviewSubmissionPayload {
  const input = value && typeof value === "object" ? (value as Partial<Record<keyof ReviewSubmissionPayload, unknown>>) : {};
  return {
    fullName: collapseWhitespace(text(input.fullName)).slice(0, REVIEW_FULL_NAME_MAX_LENGTH),
    rating: normalizeRating(input.rating),
    reviewText: text(input.reviewText).slice(0, REVIEW_TEXT_MAX_LENGTH),
    serviceSlug: text(input.serviceSlug).slice(0, 60),
    locationText: collapseWhitespace(text(input.locationText)).slice(0, REVIEW_LOCATION_MAX_LENGTH),
    consentToPublish: input.consentToPublish === true,
  };
}

export function validateReviewSubmission(payload: ReviewSubmissionPayload): ReviewValidationErrors {
  const errors: ReviewValidationErrors = {};

  if (!payload.fullName) errors.fullName = "Enter your name.";

  if (!payload.rating) errors.rating = "Choose a rating.";
  else if (!Number.isInteger(payload.rating) || payload.rating < 1 || payload.rating > 5) errors.rating = "Choose a rating from 1 to 5.";

  if (!payload.reviewText) errors.reviewText = "Enter your review.";
  else if (payload.reviewText.length < REVIEW_TEXT_MIN_LENGTH) errors.reviewText = `Your review must be at least ${REVIEW_TEXT_MIN_LENGTH} characters.`;

  if (payload.serviceSlug && !getServiceCategory(payload.serviceSlug)) errors.serviceSlug = "Select a valid service.";

  if (!payload.consentToPublish) errors.consentToPublish = "Consent to publish is required to submit a review.";

  return errors;
}

/** Resolves an already-validated serviceSlug into the {slug, label} pair
 * stored on the row. Call only after validateReviewSubmission has confirmed
 * the slug (if any) is real — this does not re-validate. */
export function resolveServiceContext(serviceSlug: string): { slug: string | null; label: string | null } {
  if (!serviceSlug) return { slug: null, label: null };
  const category = getServiceCategory(serviceSlug);
  return category ? { slug: category.slug, label: category.name } : { slug: null, label: null };
}

/** Deterministically derives a public-safe display name from a full name —
 * first name plus the initial of the last word, e.g. "John Smith" -> "John
 * S.", "Mary-Jane O'Connor" -> "Mary-Jane O.". A single-word name (e.g.
 * "Madonna") is returned unchanged. Does not assume any fixed word count. */
export function deriveDisplayName(fullName: string): string {
  const words = collapseWhitespace(fullName).split(" ").filter(Boolean);
  if (words.length === 0) return "Customer";
  if (words.length === 1) return words[0];
  const firstName = words[0];
  const lastInitial = words[words.length - 1].charAt(0);
  return `${firstName} ${lastInitial}.`;
}
