"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { setReviewFeatured, setReviewStatus, setReviewVerified } from "./repository";
import type { AdminReviewMutationResult, ReviewStatus } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidReviewId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** A moderation change can flip what's publicly visible on `/` and
 * `/reviews` (approve/reject/verify/feature all can). Both public routes
 * use plain time-based ISR (`export const revalidate = ...`), not fetch
 * tags, so `revalidatePath` — not `revalidateTag` — is the correct
 * invalidation call here (see docs/ADMIN_ARCHITECTURE.md). The admin list
 * itself is already `no-store` (never cached), but its path is revalidated
 * too in case a future change adds caching there. */
function revalidatePublicReviewSurfaces() {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin");
  revalidatePath("/admin/reviews");
}

async function moderate(reviewId: string, run: (adminUserId: string) => Promise<AdminReviewMutationResult>): Promise<AdminReviewMutationResult> {
  if (!isValidReviewId(reviewId)) return { ok: false, status: "not_found" };
  // Every mutation independently re-verifies authorization — never assumes
  // the button only exists inside an already-protected /admin page.
  const admin = await requireAdmin();
  const result = await run(admin.userId);
  if (result.ok) revalidatePublicReviewSurfaces();
  return result;
}

export async function setReviewStatusAction(reviewId: string, newStatus: ReviewStatus): Promise<AdminReviewMutationResult> {
  return moderate(reviewId, (adminUserId) => setReviewStatus(reviewId, adminUserId, newStatus));
}

export async function setReviewVerifiedAction(reviewId: string, isVerified: boolean): Promise<AdminReviewMutationResult> {
  return moderate(reviewId, (adminUserId) => setReviewVerified(reviewId, adminUserId, isVerified));
}

export async function setReviewFeaturedAction(reviewId: string, isFeatured: boolean): Promise<AdminReviewMutationResult> {
  return moderate(reviewId, (adminUserId) => setReviewFeatured(reviewId, adminUserId, isFeatured));
}
