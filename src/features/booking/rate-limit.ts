import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeUsPhone } from "@/features/customers/phone";

type LimitResult = { status: "allowed" } | { status: "limited"; retryAfter: number } | { status: "unavailable" };

/** Vercel overwrites x-forwarded-for. Else use a shared bucket, never trust
 * arbitrary forwarded headers on an unverified hosting topology. No UA key:
 * changing a User-Agent must not reset the quota. Only HMACs reach storage.
 */
export function bookingRateKeys(request: Request, phone: string, salt: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ip = process.env.VERCEL === "1" && isIP(forwarded) ? forwarded : "shared-untrusted-proxy";
  const hash = (value: string) => createHmac("sha256", salt).update(value).digest("hex");
  return { p_ip_key: hash(`ip:${ip}`), p_phone_key: hash(`phone:${normalizeUsPhone(phone)}`) };
}

export async function checkBookingRateLimit(request: Request, phone: string): Promise<LimitResult> {
  const salt = process.env.BOOKING_RATE_LIMIT_SALT;
  if (!salt || salt.length < 32) {
    console.error("[book_now_protection_unconfigured]");
    return { status: "unavailable" };
  }
  try {
    const { data, error } = await getSupabaseServerClient().rpc("reserve_booking_attempt", bookingRateKeys(request, phone, salt)).abortSignal(AbortSignal.timeout(5_000));
    if (error || !data || typeof data.allowed !== "boolean") throw new Error("limiter_unavailable");
    return data.allowed ? { status: "allowed" } : { status: "limited", retryAfter: 900 };
  } catch {
    console.error("[book_now_protection_unavailable]");
    return { status: "unavailable" };
  }
}
