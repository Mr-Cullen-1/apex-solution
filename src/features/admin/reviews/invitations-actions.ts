"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { createReviewInvitation } from "./invitations-repository";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type GenerateReviewInvitationResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

/** ADMIN or SUPER_ADMIN -- generating a review link is an ordinary CRM
 * action, not account management. The raw token is returned exactly once,
 * in this Server Action's return value, the same "shown once" pattern as
 * Create Admin/Reset Password's temporary-password reveal -- nothing
 * server-side persists it beyond this call (only its hash does, inside
 * createReviewInvitation). */
export async function generateReviewInvitationAction(requestId: string): Promise<GenerateReviewInvitationResult> {
  if (!UUID_PATTERN.test(requestId)) return { ok: false, message: "Invalid request." };

  const admin = await requireAdmin();
  const result = await createReviewInvitation(requestId, admin.userId);
  if (!result.ok) return result;

  revalidatePath(`/admin/requests/${requestId}`);
  return { ok: true, token: result.token };
}
