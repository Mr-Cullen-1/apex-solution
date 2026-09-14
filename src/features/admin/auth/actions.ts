"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAuthServerClient, isAuthConfigured } from "@/lib/supabase/auth-server";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isAdminHost } from "@/lib/admin-host";
import { getAdminSession } from "./require-admin";

/** Same host-aware redirect-target reasoning as require-admin.ts and
 * proxy.ts — on the admin subdomain these must land on the unprefixed
 * path, not visibly bounce the browser to ".../admin". */
async function onAdminSubdomain(): Promise<boolean> {
  return isAdminHost((await headers()).get("host"));
}

// One deliberately generic message for every failure mode — wrong
// password, an email with no Supabase account, and a real Supabase account
// with no (or an inactive) public.admin_users row all return the exact same
// string. This is what prevents account enumeration (instruction #53/#76):
// nothing about the response lets a caller distinguish "wrong password"
// from "that's not an admin account".
const GENERIC_LOGIN_ERROR = "Unable to sign in with those credentials.";
const NOT_CONFIGURED_ERROR = "Admin sign-in is not configured yet.";

export type LoginActionState = { error: string } | undefined;

/** Server Action backing /admin/login's form. Never returns which specific
 * check failed. On success, redirects to /admin — if the account still has
 * `must_change_password = true` (a fresh SUPER_ADMIN-issued temporary
 * password), requireAdmin() in the /admin/(dashboard) layout bounces that
 * one hop further to /admin/change-password; this action does not need to
 * know that itself. */
export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: GENERIC_LOGIN_ERROR };
  if (!isAuthConfigured() || !isSupabaseConfigured()) return { error: NOT_CONFIGURED_ERROR };

  const authClient = await createAuthServerClient();
  const { data, error } = await authClient.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    console.warn("[admin_login_failed]", error?.status ?? "no_user");
    return { error: GENERIC_LOGIN_ERROR };
  }

  // Authenticated with Supabase, but that alone is never sufficient — see
  // requireAdmin() / docs/ADMIN_ARCHITECTURE.md. A valid Supabase user with
  // no active public.admin_users row is signed straight back out rather
  // than left holding a session the app will just reject on every page.
  const privileged = getSupabaseServerClient();
  const { data: adminRow, error: adminError } = await privileged
    .from("admin_users")
    .select("is_active")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError) console.error("[admin_users_lookup_failed]", adminError.code, adminError.message);

  if (!adminRow || !adminRow.is_active) {
    await authClient.auth.signOut();
    console.warn("[admin_login_denied]", data.user.id);
    return { error: GENERIC_LOGIN_ERROR };
  }

  redirect((await onAdminSubdomain()) ? "/" : "/admin");
}

/** Terminates the Supabase Auth session (clearing its cookies) and sends
 * the admin back to the login screen — never just a client-side navigation
 * that would leave the session cookie intact. */
export async function logoutAction(): Promise<void> {
  if (isAuthConfigured()) {
    const authClient = await createAuthServerClient();
    await authClient.auth.signOut();
  }
  redirect((await onAdminSubdomain()) ? "/login" : "/admin/login");
}

const MIN_PASSWORD_LENGTH = 8;
const GENERIC_PASSWORD_ERROR = "Couldn't set your password. Please try again.";
const PASSWORD_MISMATCH_ERROR = "Passwords do not match.";
const PASSWORD_TOO_SHORT_ERROR = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;

export type ChangePasswordActionState = { error: string } | undefined;

/** Backs /admin/change-password — used both for the mandatory first
 * change (a fresh SUPER_ADMIN-issued temporary password) and for a
 * voluntary change later. Deliberately uses `getAdminSession()` (the
 * non-redirecting check) rather than `requireAdmin()`: `requireAdmin()`
 * would itself redirect back to /admin/change-password whenever
 * `mustChangePassword` is true, looping forever instead of ever reaching
 * this action. An unauthenticated caller is redirected to /admin/login
 * here instead. Uses the signed-in admin's OWN session
 * (`auth.updateUser`) — never the service-role `admin.updateUserById` —
 * so a SUPER_ADMIN never sees or sets another admin's password. */
export async function changePasswordAction(_prevState: ChangePasswordActionState, formData: FormData): Promise<ChangePasswordActionState> {
  const session = await getAdminSession();
  const onAdminHost = await onAdminSubdomain();
  if (!session) redirect(onAdminHost ? "/login" : "/admin/login");

  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < MIN_PASSWORD_LENGTH) return { error: PASSWORD_TOO_SHORT_ERROR };
  if (password !== confirmPassword) return { error: PASSWORD_MISMATCH_ERROR };
  if (!isAuthConfigured()) return { error: GENERIC_PASSWORD_ERROR };

  const authClient = await createAuthServerClient();
  // The session's own update-user call — this changes the currently
  // signed-in user's password without invalidating their session (Supabase
  // Auth does not sign the user out on a password change), so continuing
  // straight to /admin below is reliable rather than a guess.
  const { error } = await authClient.auth.updateUser({ password });
  if (error) {
    console.error("[admin_change_password_failed]", error.status, error.message);
    return { error: GENERIC_PASSWORD_ERROR };
  }

  // Only after the password itself was actually changed — never before.
  if (session.mustChangePassword) {
    const privileged = getSupabaseServerClient();
    const { error: clearError } = await privileged.from("admin_users").update({ must_change_password: false }).eq("user_id", session.userId);
    if (clearError) console.error("[admin_must_change_password_clear_failed]", clearError.code, clearError.message);
  }

  redirect(onAdminHost ? "/" : "/admin");
}
