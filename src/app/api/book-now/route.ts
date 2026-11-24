import { normalizeBookNowPayload, validateBookNowPayload } from "@/features/booking/model";
import { submitBookNowRequest } from "@/features/booking/submission-adapter";
import { readBookingBody } from "@/features/booking/request-body";
import { checkBookingRateLimit } from "@/features/booking/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;
const headers = { "Cache-Control": "no-store" };
const invalid = (status: number, form: string) => Response.json({ ok: false, status: "invalid", errors: { form } }, { status, headers });

export async function POST(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") return invalid(415, "Please submit the form as JSON.");
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") return invalid(403, "Please submit from this website.");
  const parsed = await readBookingBody(request);
  if (!parsed.ok) return invalid(parsed.status, parsed.status === 413 ? "The request is too large." : parsed.status === 408 ? "The request timed out. Please try again." : "The request body must be valid JSON.");
  const payload = normalizeBookNowPayload(parsed.body);
  const errors = validateBookNowPayload(payload);
  if (Object.keys(errors).length) return Response.json({ ok: false, status: "invalid", errors }, { status: 400, headers });

  const protection = await checkBookingRateLimit(request, payload.phone);
  if (protection.status === "limited") return Response.json({ ok: false, status: "error", message: "Too many requests. Please wait 15 minutes or call us directly." }, { status: 429, headers: { ...headers, "Retry-After": String(protection.retryAfter) } });
  if (protection.status === "unavailable") return Response.json({ ok: false, status: "not_configured", message: "Online submission is temporarily unavailable. Your request has not been submitted. Please call us directly." }, { status: 503, headers });

  const result = await submitBookNowRequest(payload);
  const statusCode = result.ok ? 201 : result.status === "not_configured" ? 503 : 500;
  return Response.json(result, { status: statusCode, headers });
}
