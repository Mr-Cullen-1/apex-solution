import { normalizeBookingPayload, validateBookingPayload } from "@/features/booking/model";
import { submitServiceRequest } from "@/features/booking/submission-adapter";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 32_000) return Response.json({ ok: false, status: "invalid", errors: { form: "The request is too large." } }, { status: 413 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, status: "invalid", errors: { form: "The request body must be valid JSON." } }, { status: 400 });
  }

  const payload = normalizeBookingPayload(body);
  const errors = validateBookingPayload(payload);
  if (Object.keys(errors).length) return Response.json({ ok: false, status: "invalid", errors }, { status: 400 });

  const result = await submitServiceRequest(payload);
  return Response.json(result, { status: 503, headers: { "Cache-Control": "no-store" } });
}
