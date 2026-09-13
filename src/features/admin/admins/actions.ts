"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/features/admin/auth/require-admin";
import { createAdmin, resetAdminPassword, setAdminActive, setAdminRole } from "./repository";
import type { AdminAccountMutationResult, AdminRole, CreateAdminResult, ResetAdminPasswordResult } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidRole(value: string): value is AdminRole {
  return value === "ADMIN" || value === "SUPER_ADMIN";
}

export async function createAdminAction(email: string, role: string): Promise<CreateAdminResult> {
  // Every admin-management mutation independently re-verifies SUPER_ADMIN —
  // never assumes the button only exists on an already-protected page.
  const actor = await requireSuperAdmin();

  const trimmedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(trimmedEmail)) return { ok: false, status: "invalid", message: "Enter a valid email address." };
  if (!isValidRole(role)) return { ok: false, status: "invalid", message: "Choose a valid role." };

  const result = await createAdmin(trimmedEmail, role, actor.userId);
  if (result.ok) revalidatePath("/admin/admins");
  return result;
}

export async function resetAdminPasswordAction(targetUserId: string): Promise<ResetAdminPasswordResult> {
  if (!UUID_PATTERN.test(targetUserId)) return { ok: false, status: "not_found" };
  const actor = await requireSuperAdmin();
  const result = await resetAdminPassword(targetUserId, actor.userId);
  if (result.ok) revalidatePath("/admin/admins");
  return result;
}

export async function setAdminActiveAction(targetUserId: string, isActive: boolean): Promise<AdminAccountMutationResult> {
  if (!UUID_PATTERN.test(targetUserId)) return { ok: false, status: "not_found" };
  const actor = await requireSuperAdmin();
  const result = await setAdminActive(targetUserId, actor.userId, isActive);
  if (result.ok) revalidatePath("/admin/admins");
  return result;
}

export async function setAdminRoleAction(targetUserId: string, newRole: string): Promise<AdminAccountMutationResult> {
  if (!UUID_PATTERN.test(targetUserId)) return { ok: false, status: "not_found" };
  if (!isValidRole(newRole)) return { ok: false, status: "invalid", message: "Choose a valid role." };
  const actor = await requireSuperAdmin();
  const result = await setAdminRole(targetUserId, actor.userId, newRole);
  if (result.ok) revalidatePath("/admin/admins");
  return result;
}
