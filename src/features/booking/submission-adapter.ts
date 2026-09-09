import type { BookNowPayload, SubmissionResult } from "./types";

export async function submitBookNowRequest(payload: BookNowPayload): Promise<SubmissionResult> {
  void payload;
  return {
    ok: false,
    status: "not_configured",
    message: "Thanks — we received your request details, but online submission is not connected yet. Apex has not received this request. Please call us directly to reach the team right away.",
  };
}
