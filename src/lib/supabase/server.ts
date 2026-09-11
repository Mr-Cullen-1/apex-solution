import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase access. Never import this from a client component or
// from any module a client component could pull in — the `server-only`
// import above makes that a build error rather than a silent leak.
//
// Uses a privileged secret key deliberately: reviews is a private table with
// no anon/authenticated RLS policies (see supabase/migrations), so every
// read and write is mediated by this privileged server client. The key is
// read from a plain (non NEXT_PUBLIC_) env var and never returned, logged,
// or forwarded in any response.
//
// SUPABASE_SECRET_KEY is the current Supabase naming for this key.
// SUPABASE_SERVICE_ROLE_KEY (the older name) is still read as a fallback for
// projects/environments not yet migrated to the new name — never the other
// way around.

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase server credentials are not configured.");
    this.name = "SupabaseNotConfiguredError";
  }
}

type SupabaseConfig = { url: string; secretKey: string };

function readConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  return { url, secretKey };
}

export function isSupabaseConfigured(): boolean {
  return readConfig() !== null;
}

let cachedClient: SupabaseClient | null = null;

/** Lazily creates (and caches) the privileged server client. Throws
 * `SupabaseNotConfiguredError` — never a raw connection/env error — when
 * the required env vars are absent, so callers can map it to an honest
 * `not_configured` result instead of a generic 500. */
export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const config = readConfig();
  if (!config) throw new SupabaseNotConfiguredError();
  cachedClient = createClient(config.url, config.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
