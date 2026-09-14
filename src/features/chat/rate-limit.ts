import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

// DB-backed rate limiting for POST /api/chat. Mirrors
// features/reviews/rate-limit.ts's architecture: not an in-process Map,
// since serverless instances are ephemeral and horizontally distributed,
// so process memory doesn't give a consistent limit across requests. The
// actual check-and-record happens atomically in Postgres (see
// supabase/migrations/20260917100000_create_chat_rate_limit.sql) via an
// advisory lock.
//
// Deliberately simpler than reviews' reserve/release variant: a chat
// request has no expensive follow-up step (upload, etc.) whose failure
// should refund the visitor's quota, so that extra complexity isn't
// warranted here — a plain check-and-record is enough.
//
// Policy: 20 requests per rate key per 10-minute window. Both numbers are
// plain parameters passed into the RPC, never hardcoded in SQL.
const MAX_REQUESTS_PER_WINDOW = 20;
const WINDOW_MINUTES = 10;

/** Same header-reading convention as features/reviews/rate-limit.ts
 * (duplicated rather than cross-imported — each feature under
 * src/features/** stays self-contained in this repo, e.g. booking/model.ts
 * doesn't import from reviews/model.ts either). */
function extractClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp?.trim()) return realIp.trim();
  return "unknown";
}

function extractUserAgent(request: Request): string {
  return request.headers.get("user-agent")?.trim() || "unknown";
}

function readSalt(): string | null {
  const salt = process.env.CHAT_RATE_LIMIT_SALT;
  return salt && salt.length > 0 ? salt : null;
}

/** One-way hash of (server-only salt + IP + User-Agent) — never any of the
 * three raw inputs — used only as the RPC's `rate_key` parameter, never
 * stored or logged raw. Returns null (never a fixed/predictable fallback
 * salt) when CHAT_RATE_LIMIT_SALT is unset; the caller treats null as
 * "rate limiting unavailable" and fails open. Uses its own dedicated salt
 * rather than reusing REVIEW_RATE_LIMIT_SALT — distinct secrets per
 * hashing purpose, not shared across unrelated features. */
function hashRateKey(ip: string, userAgent: string): string | null {
  const salt = readSalt();
  if (!salt) {
    console.error("[chat_rate_limit_unconfigured] CHAT_RATE_LIMIT_SALT is not set — this request is not being rate limited.");
    return null;
  }
  return createHash("sha256").update(`${salt}:${ip}:${userAgent}`).digest("hex");
}

/** Returns true only when a confirmed rate-limit hit should block the
 * request. Fails OPEN (returns false) in every other case: outside
 * production (same convention as reviews — local dev never needs manual
 * row cleanup between test messages), Supabase not configured, the salt
 * unset, or the RPC call itself erroring (e.g. the migration behind this
 * feature hasn't been applied to this environment yet). A rate-limiter
 * hiccup must never take the whole chatbot offline. */
export async function isChatRateLimited(request: Request): Promise<boolean> {
  if (process.env.NODE_ENV !== "production") return false;
  if (!isSupabaseConfigured()) return false;

  const rateKeyHash = hashRateKey(extractClientIp(request), extractUserAgent(request));
  if (!rateKeyHash) return false;

  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.rpc("check_and_record_chat_rate_limit", {
      p_rate_key: rateKeyHash,
      p_limit: MAX_REQUESTS_PER_WINDOW,
      p_window_minutes: WINDOW_MINUTES,
    });
    if (error) {
      console.error("[chat_rate_limit_failed]", error.code, error.message);
      return false;
    }
    return data !== true;
  } catch (err) {
    console.error("[chat_rate_limit_failed]", err instanceof Error ? err.message : "unknown_error");
    return false;
  }
}
