"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/features/admin/auth/require-admin";
import { normalizeBookNowPayload, validateBookNowPayload } from "@/features/booking/model";
import { submitAdminServiceRequest } from "@/features/booking/submission-adapter";
import { addNote } from "@/features/admin/activity/repository";
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

export type CreateAdminRequestInput = {
  fullName: string;
  phone: string;
  email: string;
  zipCode: string;
  message: string;
  categoryId: string;
  serviceId: string;
  internalNotes: string;
};

export type CreateAdminRequestResult =
  | { ok: true; requestId: string; requestCode: string }
  | { ok: false; status: "invalid"; errors: Partial<Record<keyof CreateAdminRequestInput, string>> }
  | { ok: false; status: "error"; message: string };

/** Admin -> canonical request creation service: reuses the exact same
 * normalize/validate (src/features/booking/model.ts) and create-and-deliver
 * pipeline (submitAdminServiceRequest, src/features/booking/submission-adapter.ts)
 * as the public Book Now flow -- source is set to "admin_phone" instead of
 * the default "book_now", but the RPC, the Supabase insert, and the
 * Telegram/email delivery are all the exact same code path. Never a second,
 * parallel request-creation system. */
export async function createAdminRequestAction(input: CreateAdminRequestInput): Promise<CreateAdminRequestResult> {
  const admin = await requireAdmin();

  const payload = normalizeBookNowPayload({
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    zipCode: input.zipCode,
    message: input.message,
    serviceTextConsent: false,
    categoryId: input.categoryId,
    serviceId: input.serviceId,
    offer: false,
    issue: "",
    sourcePath: "/admin/create-request",
  });
  const errors = validateBookNowPayload(payload);
  if (Object.keys(errors).length) return { ok: false, status: "invalid", errors };

  const result = await submitAdminServiceRequest(payload, { source: "admin_phone" });
  if (!result.ok) return { ok: false, status: "error", message: result.message };

  const notes = input.internalNotes.trim();
  if (notes) await addNote(result.row.customer_id, result.row.id, admin.userId, notes);

  revalidatePath("/admin/requests");
  revalidatePath("/admin");
  return { ok: true, requestId: result.row.id, requestCode: result.row.request_code };
}
