import type { BookingPayload, SubmissionResult } from "./types";

export async function submitServiceRequest(payload: BookingPayload): Promise<SubmissionResult> {
  void payload;
  return {
    ok: false,
    status: "not_configured",
    message: "Your request details are ready, but online submission is not connected yet. Apex has not received this request.",
  };
}
