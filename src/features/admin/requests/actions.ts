"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { setRequestStatus } from "./repository";
import type { AdminRequestMutationResult, RequestStatus } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES: readonly RequestStatus[] = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CANCELLED"];

export async function setRequestStatusAction(requestId: string, newStatus: string): Promise<AdminRequestMutationResult> {
  if (!UUID_PATTERN.test(requestId)) return { ok: false, status: "not_found" };
  if (!VALID_STATUSES.includes(newStatus as RequestStatus)) return { ok: false, status: "not_found" };

  // ADMIN or SUPER_ADMIN — Requests is not account management.
  const admin = await requireAdmin();
  const result = await setRequestStatus(requestId, admin.userId, newStatus as RequestStatus);
  if (result.ok) {
    revalidatePath("/admin/requests");
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath("/admin");
  }
  return result;
}
