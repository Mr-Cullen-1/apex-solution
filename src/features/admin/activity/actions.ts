"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { addNote } from "./repository";
import type { AddNoteResult } from "./types";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Shared by the Request detail and Customer profile screens — ADMIN or
 * SUPER_ADMIN may add a note (requireAdmin(), not requireSuperAdmin(): note-
 * taking is ordinary CRM work, not account management). */
export async function addNoteAction(customerId: string, serviceRequestId: string | null, text: string): Promise<AddNoteResult> {
  if (!UUID_PATTERN.test(customerId)) return { ok: false, status: "invalid", message: "Customer not found." };
  if (serviceRequestId !== null && !UUID_PATTERN.test(serviceRequestId)) return { ok: false, status: "invalid", message: "Request not found." };

  const admin = await requireAdmin();
  const result = await addNote(customerId, serviceRequestId, admin.userId, text);
  if (result.ok) {
    revalidatePath(`/admin/customers/${customerId}`);
    if (serviceRequestId) revalidatePath(`/admin/requests/${serviceRequestId}`);
  }
  return result;
}
