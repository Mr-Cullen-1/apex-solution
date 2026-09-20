import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { generateInvitationToken, hashInvitationToken } from "@/features/reviews/invitation-token";

const FAILED_MESSAGE = "Couldn't generate a review link right now. Please try again.";
const LIST_FAILED_MESSAGE = "Couldn't load review invitations for this request.";

export type ReviewInvitationStatus = "active" | "used" | "revoked";

export type AdminReviewInvitation = {
  id: string;
  status: ReviewInvitationStatus;
  createdAt: string;
  usedAt: string | null;
};

type ReviewInvitationRow = {
  id: string;
  status: ReviewInvitationStatus;
  created_at: string;
  used_at: string | null;
};

/** Creates a new invitation and returns the raw token exactly once -- it is
 * never persisted or logged anywhere; only its hash reaches the database
 * (see admin_create_review_invitation, which receives the hash, never the
 * raw token). The caller (a Server Action) must hand this token straight to
 * the admin's own response and never store it server-side beyond this call. */
export async function createReviewInvitation(
  serviceRequestId: string,
  adminUserId: string,
): Promise<{ ok: true; token: string; invitation: AdminReviewInvitation } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const token = generateInvitationToken();
    const tokenHash = hashInvitationToken(token);

    const { data, error } = await supabase.rpc("admin_create_review_invitation", {
      p_service_request_id: serviceRequestId,
      p_admin_user_id: adminUserId,
      p_token_hash: tokenHash,
    });

    if (error || !data) {
      console.error("[admin_review_invitation_create_failed]", error?.code, error?.message);
      return { ok: false, message: FAILED_MESSAGE };
    }

    const row = data as ReviewInvitationRow;
    return { ok: true, token, invitation: { id: row.id, status: row.status, createdAt: row.created_at, usedAt: row.used_at } };
  } catch (err) {
    console.error("[admin_review_invitation_create_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: FAILED_MESSAGE };
  }
}

/** Newest-first list for the request detail page's "Review invitation"
 * card -- never returns token_hash to the caller (selected columns exclude
 * it), since it's meaningless without the raw token anyway and there's no
 * reason to expose even the hash to the browser. */
export async function listReviewInvitationsForRequest(
  serviceRequestId: string,
): Promise<{ ok: true; invitations: AdminReviewInvitation[] } | { ok: false; message: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("review_invitations")
      .select("id, status, created_at, used_at")
      .eq("service_request_id", serviceRequestId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin_review_invitations_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }

    const invitations = ((data ?? []) as ReviewInvitationRow[]).map((row) => ({
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      usedAt: row.used_at,
    }));
    return { ok: true, invitations };
  } catch (err) {
    console.error("[admin_review_invitations_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}
