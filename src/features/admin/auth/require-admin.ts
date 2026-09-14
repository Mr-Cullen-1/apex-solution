import "server-only";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAuthServerClient, isAuthConfigured } from "@/lib/supabase/auth-server";
import { isAdminHost } from "@/lib/admin-host";
import type { AdminIdentity, AdminRole } from "./types";

/** Every redirect() below targets a hardcoded "/admin"-prefixed path so the
 * old apexhomesupport.com/admin route keeps working unchanged — except on
 * the admin subdomain, where that would visibly bounce the browser to
 * "admin.apexhomesupport.com/admin" instead of staying on the clean
 * unprefixed path proxy.ts rewrote FROM. Mirrors the same host-aware
 * pattern in proxy.ts and auth/actions.ts. */
async function onAdminSubdomain(): Promise<boolean> {
  return isAdminHost((await headers()).get("host"));
}

type ActiveAdminRow = { role: AdminRole; mustChangePassword: boolean };

/** The single place that turns "a Supabase Auth user_id" into "an active
 * Apex admin" (or `null`). Always goes through the privileged server
 * client — public.admin_users has no anon/authenticated RLS policies, so
 * this table is only ever readable this way. */
async function lookupActiveAdmin(userId: string): Promise<ActiveAdminRow | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("admin_users").select("role, is_active, must_change_password").eq("user_id", userId).maybeSingle();
  if (error) {
    console.error("[admin_users_lookup_failed]", error.code, error.message);
    return null;
  }
  if (!data || !data.is_active) return null;
  return { role: data.role as AdminRole, mustChangePassword: data.must_change_password };
}

/** Non-throwing session check: authenticated Supabase user AND an active
 * public.admin_users row, or `null` for anything short of that (no session,
 * expired session, valid Supabase account with no/inactive admin row). Use
 * this where "not authorized" is a normal, expected outcome to branch on —
 * e.g. /admin/login deciding whether to bounce an already-authorized admin
 * to /admin, or /admin/change-password's own page (which must remain
 * reachable even when `mustChangePassword` is true, so it cannot use the
 * redirecting `requireAdmin()` below without looping). Use `requireAdmin()`
 * everywhere access must be enforced. */
export async function getAdminSession(): Promise<AdminIdentity | null> {
  if (!isAuthConfigured()) return null;
  const authClient = await createAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return null;

  const admin = await lookupActiveAdmin(user.id);
  if (!admin) return null;

  return { userId: user.id, email: user.email ?? "", role: admin.role, mustChangePassword: admin.mustChangePassword };
}

/** The mandatory authorization gate for every protected Admin page and
 * every moderation Server Action — proxy.ts only ever performs an
 * optimistic "is there a session at all" redirect; this function is the
 * real security boundary and must be called independently by each one.
 *
 * - No session -> redirect to /admin/login.
 * - Valid Supabase session but not an active admin -> the session is
 *   torn down (signed out) and the caller is sent back to /admin/login,
 *   the same as instruction #14/#56: an authenticated-but-unauthorized (or
 *   since-deactivated) user is never left in a lingering, half-authorized
 *   state.
 * - Active admin who still has `must_change_password = true` (freshly
 *   provisioned, or reset by a SUPER_ADMIN) -> redirected to
 *   /admin/change-password before reaching anything else. That page uses
 *   `getAdminSession()` instead of this function, so it never loops. */
export async function requireAdmin(): Promise<AdminIdentity> {
  const onAdminHost = await onAdminSubdomain();
  const loginPath = onAdminHost ? "/login" : "/admin/login";
  const changePasswordPath = onAdminHost ? "/change-password" : "/admin/change-password";

  if (!isAuthConfigured()) redirect(loginPath);

  const authClient = await createAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) redirect(loginPath);

  const admin = await lookupActiveAdmin(user.id);
  if (!admin) {
    await authClient.auth.signOut();
    redirect(loginPath);
  }

  if (admin.mustChangePassword) redirect(changePasswordPath);

  return { userId: user.id, email: user.email ?? "", role: admin.role, mustChangePassword: false };
}

/** Admin account management (/admin/admins and every create/reset/
 * activate/deactivate/role-change Server Action) is SUPER_ADMIN only. This
 * builds on `requireAdmin()` — first proving a valid, active, password-set
 * admin session, then narrowing to the SUPER_ADMIN role — rather than
 * duplicating the session/authorization lookup. An ADMIN calling this is
 * redirected to `/admin` (the safe "forbidden" behavior for a page; every
 * Server Action that calls this instead surfaces the redirect the same
 * way, since `redirect()` unwinds the action the same as a page render). */
export async function requireSuperAdmin(): Promise<AdminIdentity> {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") redirect((await onAdminSubdomain()) ? "/" : "/admin");
  return admin;
}
