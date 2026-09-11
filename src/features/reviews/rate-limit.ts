import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

// DB-backed rate limiting for POST /api/reviews. Deliberately not an
// in-process Map: serverless instances are ephemeral and horizontally
// distributed, so process memory does not provide a consistent limit
// across requests. The actual check-and-reserve happens atomically in
// Postgres (see supabase/migrations/..._adjust_review_rate_limit.sql) via
// an advisory lock, so two concurrent requests from the same key can't
// both read "under limit" and both get inserted.
//
// Policy: 5 *successful* submissions per rate key per 60-minute window —
// not attempts. Both numbers are plain parameters passed into the RPC
// below, never hardcoded in SQL, so changing either needs no migration.
const MAX_SUCCESSFUL_SUBMISSIONS_PER_WINDOW = 5;
const WINDOW_MINUTES = 60;

/** Reads the first address from `x-forwarded-for` (Vercel/most proxies put
 * the real client IP first), falling back to `x-real-ip`, then a constant
 * placeholder if neither is present (e.g. local dev without a proxy) — a
 * shared placeholder bucket is an acceptable degradation there, never used
 * in production where these headers are always set. Always read from
 * trusted server request headers — an `ip` field in the POST body is never
 * read or trusted anywhere in this codebase. */
export function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "unknown";
}

/** Folded into the rate key alongside IP purely to reduce — never to
 * eliminate — false-positive collisions between unrelated customers behind
 * one shared IP (office Wi-Fi, an apartment building, carrier-grade NAT,
 * public Wi-Fi). This is not an identity/fingerprinting signal: it is never
 * stored raw, never logged, and only ever folded into the one-way hash
 * below. Also a trusted server header, never a client-supplied field. */
export function extractUserAgent(request: Request): string {
  return request.headers.get("user-agent")?.trim() || "unknown";
}

function readSalt(): string | null {
  const salt = process.env.REVIEW_RATE_LIMIT_SALT;
  return salt && salt.length > 0 ? salt : null;
}

/** One-way hash of (server-only salt + IP + User-Agent) — never any of the
 * three raw inputs — stored as `rate_key`. Returns `null` (never a
 * fixed/predictable fallback salt) when `REVIEW_RATE_LIMIT_SALT` is unset;
 * callers must treat `null` as "rate limiting unavailable for this
 * request" and fail open rather than substitute an insecure default. This
 * is intentionally loud, not silent: every call without a configured salt
 * logs a warning. */
export function hashRateKey(ip: string, userAgent: string): string | null {
  const salt = readSalt();
  if (!salt) {
    console.error(
      "[reviews_rate_limit_unconfigured] REVIEW_RATE_LIMIT_SALT is not set — this submission is not being rate limited.",
    );
    return null;
  }
  return createHash("sha256").update(`${salt}:${ip}:${userAgent}`).digest("hex");
}

export type RateLimitReservation = { allowed: boolean; eventId: string | null };

/** Atomically checks the rolling window and, if under the limit, reserves
 * one slot — a real event row is inserted immediately (closing the same
 * race a plain "check now, record later" two-step would reopen) and its id
 * is returned. The caller MUST call `releaseRateLimitReservation` with that
 * id if the submission this reservation was made for ultimately fails for
 * any reason (media upload failure, insert failure) — that deletes the
 * just-inserted row, so a failed submission never permanently costs the
 * customer part of their quota. Only a reservation that is never released
 * (because the submission actually succeeded) counts toward the window.
 *
 * Skipped entirely outside production: when `NODE_ENV !== "production"`,
 * always returns `{ allowed: true, eventId: null }` without touching the
 * database at all — local development never needs manual row cleanup
 * between test submissions, and production enforcement is unaffected.
 *
 * Fails OPEN (`allowed: true`) on any infra error, same as before — a
 * rate-limiter hiccup should not block a legitimate submission that the
 * actual insert step will independently succeed or fail on its own
 * merits. */
export async function reserveRateLimitSlot(rateKeyHash: string): Promise<RateLimitReservation> {
  if (process.env.NODE_ENV !== "production") return { allowed: true, eventId: null };
  if (!isSupabaseConfigured()) return { allowed: true, eventId: null };
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .rpc("check_and_reserve_review_rate_limit", {
        p_rate_key: rateKeyHash,
        p_limit: MAX_SUCCESSFUL_SUBMISSIONS_PER_WINDOW,
        p_window_minutes: WINDOW_MINUTES,
      })
      .single();
    if (error) {
      console.error("[reviews_rate_limit_check_failed]", error.code, error.message);
      return { allowed: true, eventId: null };
    }
    const row = data as { allowed: boolean; event_id: string | null } | null;
    return { allowed: row?.allowed === true, eventId: row?.event_id ?? null };
  } catch (err) {
    console.error("[reviews_rate_limit_check_failed]", err instanceof Error ? err.message : err);
    return { allowed: true, eventId: null };
  }
}

/** Releases (deletes) a reservation whose submission ultimately failed.
 * Best-effort: logged, never thrown — a cleanup hiccup here must not turn
 * into a second, different error surfaced to the customer. A reservation
 * that fails to release simply expires on its own at the end of the
 * 60-minute window (or the function's own 48-hour opportunistic prune),
 * so this is a UX nicety, not a safety requirement. */
export async function releaseRateLimitReservation(eventId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("review_submission_events").delete().eq("id", eventId);
    if (error) console.error("[reviews_rate_limit_release_failed]", eventId, error.message);
  } catch (err) {
    console.error("[reviews_rate_limit_release_failed]", eventId, err instanceof Error ? err.message : err);
  }
}
