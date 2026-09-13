// Deterministic US-phone normalization for customer identity matching ONLY
// (instruction: "This normalization is NOT call tracking"). Deliberately
// pragmatic — no libphonenumber/telephony dependency: strips everything but
// digits, and drops a leading US country-code "1" when the result is 11
// digits, so "(516) 555-1234", "5165551234", and "+1 516 555 1234" all
// normalize to the same 10-digit key. Anything that isn't a recognizable
// 10/11-digit US number still normalizes consistently (digits-only) rather
// than being rejected — matching is best-effort, not validation (the actual
// phone format validation already happens in features/booking/model.ts).
export function normalizeUsPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits;
}

/** `null` for an absent/blank email — customers.normalized_email is
 * nullable, and "no email on this submission" must never normalize to a
 * matchable empty string. */
export function normalizeEmail(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}
