import type { ReviewStatus } from "@/features/reviews/types";

export type { ReviewStatus };

/** Admin-only DTO — a deliberately separate shape from PublicReview
 * (features/reviews/types.ts), which strips full_name, status,
 * is_featured, consent_to_publish, source, and timestamps a moderator
 * needs to see. Nothing here is safe to return from a public API route. */
export type AdminReview = {
  id: string;
  fullName: string;
  displayName: string;
  rating: number;
  reviewText: string;
  serviceSlug: string | null;
  serviceLabel: string | null;
  locationText: string | null;
  status: ReviewStatus;
  isVerifiedCustomer: boolean;
  isFeatured: boolean;
  consentToPublish: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  hasMedia: boolean;
  /** Short-lived signed URL, resolved per request — never the raw storage
   * path. `null` when there's no media, or signing failed (fails safe:
   * the review still renders, just without its photo). */
  mediaUrl: string | null;
};

export type AdminReviewStatusFilter = ReviewStatus | "all";

export type AdminReviewCounts = {
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
};

export const ADMIN_REVIEWS_PAGE_SIZE = 25;

export type ListAdminReviewsParams = {
  status: AdminReviewStatusFilter;
  page: number;
  search?: string;
};

export type ListAdminReviewsResult =
  | { ok: true; reviews: AdminReview[]; total: number; page: number; pageSize: number }
  | { ok: false; message: string };

export type GetAdminReviewResult =
  | { ok: true; review: AdminReview }
  | { ok: false; status: "not_found" }
  | { ok: false; status: "error"; message: string };

export type AdminReviewMutationResult =
  | { ok: true; review: AdminReview }
  | { ok: false; status: "not_found" }
  | { ok: false; status: "invalid"; message: string }
  | { ok: false; status: "error"; message: string };
