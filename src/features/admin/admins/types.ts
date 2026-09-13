import type { AdminRole } from "@/features/admin/auth/types";

export type { AdminRole };

/** Admin account row for the /admin/admins list — deliberately never
 * includes a password, access token, or refresh token. Email and
 * lastSignInAt come from Supabase Auth (the source of truth for identity),
 * not from public.admin_users, which only ever stores
 * user_id/role/is_active/must_change_password. */
export type AdminAccount = {
  userId: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

export type ListAdminsResult = { ok: true; admins: AdminAccount[] } | { ok: false; message: string };

/** `temporaryPassword` is `null` when Create Admin linked an existing,
 * previously-non-admin Supabase Auth identity rather than issuing a new
 * credential (instruction: never reset an existing identity's password
 * without an explicit separate action) — the UI must render that case
 * without a password reveal. When non-null, it exists ONLY in this
 * response value; nothing in this codebase persists it anywhere. */
export type CreateAdminResult =
  | { ok: true; admin: AdminAccount; temporaryPassword: string | null }
  | { ok: false; status: "invalid"; message: string }
  | { ok: false; status: "error"; message: string };

export type ResetAdminPasswordResult =
  | { ok: true; admin: AdminAccount; temporaryPassword: string }
  | { ok: false; status: "not_found" }
  | { ok: false; status: "error"; message: string };

export type AdminAccountMutationResult =
  | { ok: true; admin: AdminAccount }
  | { ok: false; status: "not_found" }
  | { ok: false; status: "invalid"; message: string }
  | { ok: false; status: "error"; message: string };
