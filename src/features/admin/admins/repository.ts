import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { generateTemporaryPassword } from "./password";
import type { AdminAccount, AdminAccountMutationResult, AdminRole, CreateAdminResult, ListAdminsResult, ResetAdminPasswordResult } from "./types";

const LIST_FAILED_MESSAGE = "Couldn't load admin accounts. Try again.";
const MUTATION_FAILED_MESSAGE = "That couldn't be saved right now. Please try again.";
const CREATE_FAILED_MESSAGE = "Couldn't create that admin right now. Please try again.";
const RESET_FAILED_MESSAGE = "Couldn't reset that password right now. Please try again.";
const ALREADY_ADMIN_MESSAGE = "This email is already an Admin.";
const LAST_SUPER_ADMIN_MESSAGE = "This is the last active Super Admin — it can't be deactivated or demoted.";

type AdminUsersRow = { user_id: string; role: AdminRole; is_active: boolean; must_change_password: boolean; created_at: string };

async function toAdminAccount(row: AdminUsersRow): Promise<AdminAccount> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.admin.getUserById(row.user_id);
  if (error || !data.user) {
    console.error("[admin_account_auth_lookup_failed]", row.user_id, error?.message);
    return { userId: row.user_id, email: "(unknown)", role: row.role, isActive: row.is_active, mustChangePassword: row.must_change_password, createdAt: row.created_at, lastSignInAt: null };
  }
  return {
    userId: row.user_id,
    email: data.user.email ?? "(unknown)",
    role: row.role,
    isActive: row.is_active,
    mustChangePassword: row.must_change_password,
    createdAt: row.created_at,
    lastSignInAt: data.user.last_sign_in_at ?? null,
  };
}

/** Admin roster — email and last sign-in come from Supabase Auth (fetched
 * per row via the Admin API), never duplicated into public.admin_users. The
 * admin table itself is small (no bulk-admin scenario in this project), so
 * an N-lookup fan-out here is a deliberate, acceptable simplicity trade-off. */
export async function listAdmins(): Promise<ListAdminsResult> {
  if (!isSupabaseConfigured()) return { ok: false, message: LIST_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.from("admin_users").select("user_id, role, is_active, must_change_password, created_at").order("created_at", { ascending: true });
    if (error) {
      console.error("[admin_accounts_list_failed]", error.code, error.message);
      return { ok: false, message: LIST_FAILED_MESSAGE };
    }
    const rows = (data ?? []) as AdminUsersRow[];
    const admins = await Promise.all(rows.map(toAdminAccount));
    return { ok: true, admins };
  } catch (err) {
    console.error("[admin_accounts_list_failed]", err instanceof Error ? err.message : err);
    return { ok: false, message: LIST_FAILED_MESSAGE };
  }
}

/** Bounded lookup for "does a Supabase Auth identity already exist for this
 * email" — used by Create Admin to detect an existing account instead of
 * failing opaquely or creating a duplicate. Bounded to a few hundred users
 * — this project's Auth pool is admin-only and small; a miss here is
 * treated as "no existing identity", which is the safe default (createUser
 * will itself error if that's wrong). */
async function findExistingAuthUserByEmail(email: string): Promise<{ id: string } | null> {
  const supabase = getSupabaseServerClient();
  const target = email.toLowerCase();
  for (let page = 1; page <= 3; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data) return null;
    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return { id: match.id };
    if (data.users.length < 200) return null;
  }
  return null;
}

/** Creates a new admin with a SUPER_ADMIN-issued temporary password —
 * replaces the previous email-invitation flow entirely. No email is sent by
 * Apex or Supabase; the temporary password is returned once in this
 * function's return value and is never written to any table, log, or
 * analytics event.
 *
 * Three outcomes:
 * 1. No existing Auth identity for this email → `auth.admin.createUser`
 *    with the generated password and `email_confirm: true` (SUPER_ADMIN is
 *    explicitly vouching for a trusted internal administrator — there is no
 *    email-confirmation step to wait on), then `admin_provision_user` with
 *    `must_change_password = true`. If the RPC fails after the Auth user
 *    was already created, the just-created Auth user is deleted again
 *    (best-effort) so a retry never leaves an orphaned identity or reports
 *    false success.
 * 2. An existing Auth identity that is already an Admin → a clear
 *    "already an Admin" result, no password touched, no duplicate created.
 * 3. An existing Auth identity that is NOT yet an Admin → provisioned via
 *    the same RPC, but with `must_change_password = false` and no password
 *    touched at all (their existing credential is left exactly as it was —
 *    "do not reset its password without an explicit action"). The UI must
 *    render this case without a password reveal (`temporaryPassword: null`). */
export async function createAdmin(email: string, role: AdminRole, actorUserId: string): Promise<CreateAdminResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: CREATE_FAILED_MESSAGE };
  const supabase = getSupabaseServerClient();

  const existing = await findExistingAuthUserByEmail(email);

  if (existing) {
    const { data: existingAdminRow, error: lookupError } = await supabase.from("admin_users").select("user_id").eq("user_id", existing.id).maybeSingle();
    if (lookupError) console.error("[admin_create_existing_lookup_failed]", lookupError.code, lookupError.message);
    if (existingAdminRow) return { ok: false, status: "invalid", message: ALREADY_ADMIN_MESSAGE };

    const { data, error } = await supabase.rpc("admin_provision_user", {
      p_target_user_id: existing.id,
      p_actor_user_id: actorUserId,
      p_role: role,
      p_must_change_password: false,
    });
    if (error || !data) {
      console.error("[admin_provision_existing_failed]", error?.code, error?.message);
      return { ok: false, status: "error", message: CREATE_FAILED_MESSAGE };
    }
    return { ok: true, admin: await toAdminAccount(data as AdminUsersRow), temporaryPassword: null };
  }

  const temporaryPassword = generateTemporaryPassword();
  const { data: created, error: createError } = await supabase.auth.admin.createUser({ email, password: temporaryPassword, email_confirm: true });
  if (createError || !created.user) {
    console.error("[admin_create_auth_user_failed]", createError?.status, createError?.message);
    return { ok: false, status: "error", message: CREATE_FAILED_MESSAGE };
  }

  const { data: provisioned, error: provisionError } = await supabase.rpc("admin_provision_user", {
    p_target_user_id: created.user.id,
    p_actor_user_id: actorUserId,
    p_role: role,
    p_must_change_password: true,
  });
  if (provisionError || !provisioned) {
    console.error("[admin_provision_new_failed]", provisionError?.code, provisionError?.message);
    // Reconciliation: never leave an orphaned Auth user with no
    // admin_users row, and never silently report success.
    const { error: cleanupError } = await supabase.auth.admin.deleteUser(created.user.id);
    if (cleanupError) console.error("[admin_create_cleanup_failed]", created.user.id, cleanupError.message);
    return { ok: false, status: "error", message: CREATE_FAILED_MESSAGE };
  }

  return { ok: true, admin: await toAdminAccount(provisioned as AdminUsersRow), temporaryPassword };
}

/** Issues a fresh temporary password for an existing admin via the Admin
 * API's own updateUserById (server-side, service-role only — never a
 * browser-visible call), then flags must_change_password + records the
 * audit event through admin_mark_password_reset. If the Auth password
 * update itself fails, nothing else happens. If it succeeds but the
 * flag/audit RPC fails, the password has already changed in Supabase Auth
 * — this is surfaced as a failure so the SUPER_ADMIN retries (a second
 * Reset Password click is safe/idempotent: it just issues another new
 * password). */
export async function resetAdminPassword(targetUserId: string, actorUserId: string): Promise<ResetAdminPasswordResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: RESET_FAILED_MESSAGE };
  const supabase = getSupabaseServerClient();

  const temporaryPassword = generateTemporaryPassword();
  const { error: updateError } = await supabase.auth.admin.updateUserById(targetUserId, { password: temporaryPassword });
  if (updateError) {
    console.error("[admin_reset_password_auth_failed]", updateError.status, updateError.message);
    return { ok: false, status: "error", message: RESET_FAILED_MESSAGE };
  }

  try {
    const { data, error } = await supabase.rpc("admin_mark_password_reset", { p_target_user_id: targetUserId, p_actor_user_id: actorUserId });
    if (error) {
      if (error.code === "P0002" || error.message.includes("not found")) return { ok: false, status: "not_found" };
      console.error("[admin_mark_password_reset_failed]", error.code, error.message);
      return { ok: false, status: "error", message: RESET_FAILED_MESSAGE };
    }
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, admin: await toAdminAccount(data as AdminUsersRow), temporaryPassword };
  } catch (err) {
    console.error("[admin_mark_password_reset_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: RESET_FAILED_MESSAGE };
  }
}

function mapAdminManagementRpcError(error: { code?: string; message: string }): AdminAccountMutationResult {
  if (error.code === "P0002" || error.message.includes("not found")) return { ok: false, status: "not_found" };
  if (error.message.includes("last active super admin")) return { ok: false, status: "invalid", message: LAST_SUPER_ADMIN_MESSAGE };
  console.error("[admin_account_mutation_failed]", error.code, error.message);
  return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
}

export async function setAdminActive(targetUserId: string, actorUserId: string, isActive: boolean): Promise<AdminAccountMutationResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_set_admin_active", { p_target_user_id: targetUserId, p_actor_user_id: actorUserId, p_is_active: isActive });
    if (error) return mapAdminManagementRpcError(error);
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, admin: await toAdminAccount(data as AdminUsersRow) };
  } catch (err) {
    console.error("[admin_account_mutation_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  }
}

export async function setAdminRole(targetUserId: string, actorUserId: string, newRole: AdminRole): Promise<AdminAccountMutationResult> {
  if (!isSupabaseConfigured()) return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("admin_set_admin_role", { p_target_user_id: targetUserId, p_actor_user_id: actorUserId, p_new_role: newRole });
    if (error) return mapAdminManagementRpcError(error);
    if (!data) return { ok: false, status: "not_found" };
    return { ok: true, admin: await toAdminAccount(data as AdminUsersRow) };
  } catch (err) {
    console.error("[admin_account_mutation_failed]", err instanceof Error ? err.message : err);
    return { ok: false, status: "error", message: MUTATION_FAILED_MESSAGE };
  }
}
