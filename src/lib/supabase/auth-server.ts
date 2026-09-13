import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase Auth session client — deliberately separate from
// src/lib/supabase/server.ts (the privileged service-role repository
// client). This one speaks for "who is this admin?" using the Supabase
// *publishable* key and the caller's own cookies; it never bypasses RLS and
// must never be used to read/write application tables directly. Admin
// authorization (public.admin_users) is checked with the privileged client
// instead — see src/features/admin/auth/require-admin.ts.
//
// Uses the official @supabase/ssr cookie-adapter pattern so the session is
// stored in real HttpOnly/Secure cookies, never localStorage or a hand-
// rolled JWT scheme.

export class AdminAuthNotConfiguredError extends Error {
  constructor() {
    super("Admin authentication is not configured.");
    this.name = "AdminAuthNotConfiguredError";
  }
}

type AuthConfig = { url: string; publishableKey: string };

function readAuthConfig(): AuthConfig | null {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function isAuthConfigured(): boolean {
  return readAuthConfig() !== null;
}

/** Creates a request-scoped Supabase Auth client bound to the current
 * request's cookies via next/headers. Setting cookies only succeeds when
 * called from a Server Action or Route Handler; calls from a Server
 * Component are caught and ignored (Next.js forbids mutating cookies there)
 * — session refresh in that context is proxy.ts's job. */
export async function createAuthServerClient(): Promise<SupabaseClient> {
  const config = readAuthConfig();
  if (!config) throw new AdminAuthNotConfiguredError();

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — expected, ignored.
        }
      },
    },
  });
}
