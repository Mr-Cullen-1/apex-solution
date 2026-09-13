export type AdminRole = "ADMIN" | "SUPER_ADMIN";

/** Safe identity returned by an authorized admin session check — never the
 * full Supabase Auth user object (no access/refresh tokens, no app_metadata
 * blob), just what the rest of Admin actually needs.
 *
 * `mustChangePassword` mirrors `admin_users.must_change_password` — true
 * immediately after SUPER_ADMIN provisioning or a password reset, until the
 * admin sets their own password via /admin/change-password. Whenever
 * `requireAdmin()` itself returns an identity, this is always `false` —
 * `requireAdmin()` redirects to /admin/change-password before returning
 * otherwise (see require-admin.ts). `getAdminSession()` (the non-redirecting
 * variant) can still return `true`, since /admin/change-password's own page
 * uses it directly to avoid a redirect loop. */
export type AdminIdentity = {
  userId: string;
  email: string;
  role: AdminRole;
  mustChangePassword: boolean;
};
