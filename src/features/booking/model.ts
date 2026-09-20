import { firstTimeOffer } from "@/content/offers";
import { getServiceById, primaryServices } from "@/content/services";
import type { BookNowDraft, BookNowErrors, BookNowPayload } from "./types";

/** Server-authoritative offer context — the only place a claimed 10%
 * first-time offer is translated from the customer's boolean flag into the
 * columns actually stored (offer_code/offer_label/discount_percent).
 * Independent of `issue`: a customer can claim the offer AND separately
 * describe their problem (see resolveServiceRequestContext) — the two are
 * no longer conflated the way the pre-Admin-Phase-2 `issue` overload did. */
export function resolveOfferContext(offer: boolean): { offerCode: string | null; offerLabel: string | null; discountPercent: number | null } {
  if (!offer) return { offerCode: null, offerLabel: null, discountPercent: null };
  return { offerCode: firstTimeOffer.code, offerLabel: firstTimeOffer.title, discountPercent: firstTimeOffer.discountPercent };
}

export function findServiceContext(serviceId: string) {
  for (const category of primaryServices) {
    const service = category.children.find((item) => item.id === serviceId);
    if (service) return { category, service };
  }
  return undefined;
}

export function getCategoryById(categoryId: string) {
  return primaryServices.find((category) => category.id === categoryId);
}

/** Reads ?service=/?category= (and the redirected-through-/book equivalents)
 * into a { categoryId, serviceId } pair, ignoring anything that doesn't match
 * a real catalog entry. */
export function parseBookingPreselection(query: { service?: string | string[]; category?: string | string[] }) {
  const serviceValue = typeof query.service === "string" ? query.service : "";
  const serviceContext = findServiceContext(serviceValue);
  if (serviceContext) return { categoryId: serviceContext.category.id, serviceId: serviceContext.service.id };
  const categoryValue = typeof query.category === "string" ? query.category : "";
  const category = getCategoryById(categoryValue);
  return category ? { categoryId: category.id, serviceId: "" } : { categoryId: "", serviceId: "" };
}

/** Resolves a "Regarding: X" label for the modal from a categoryId/serviceId/offer
 * selection. Returns null when there is nothing specific to show (general homepage
 * entry point). */
export function resolveBookingContext({ categoryId, serviceId, offer }: { categoryId?: string; serviceId?: string; offer?: boolean }) {
  if (offer) return `${firstTimeOffer.title} — 10%`;
  if (serviceId) return getServiceById(serviceId)?.name ?? null;
  if (categoryId) return getCategoryById(categoryId)?.name ?? null;
  return null;
}

/** Server-authoritative service/category context for a stored lead. Never
 * trusts a client-supplied label — only IDs are accepted, and both labels are
 * derived here from the live catalog (src/content/services.ts) via a single
 * lookup, so a request that only supplied `serviceId` still gets a correct
 * `categoryLabel` too. An ID that doesn't resolve to a real, current catalog
 * entry (stale/tampered) is silently dropped rather than rejecting the whole
 * submission — the customer still gets to leave a valid lead either way. */
export function resolveServiceRequestContext({ categoryId, serviceId }: { categoryId?: string; serviceId?: string }): {
  serviceId: string | null;
  serviceLabel: string | null;
  categoryId: string | null;
  categoryLabel: string | null;
} {
  if (serviceId) {
    const found = findServiceContext(serviceId);
    if (found) return { serviceId: found.service.id, serviceLabel: found.service.name, categoryId: found.category.id, categoryLabel: found.category.name };
  }
  if (categoryId) {
    const category = getCategoryById(categoryId);
    if (category) return { serviceId: null, serviceLabel: null, categoryId: category.id, categoryLabel: category.name };
  }
  return { serviceId: null, serviceLabel: null, categoryId: null, categoryLabel: null };
}

export function createBookNowDraft(): BookNowDraft {
  return { fullName: "", phone: "", email: "", zipCode: "", message: "", serviceTextConsent: false };
}

/** Human-readable label for `service_requests.source` — shared by the
 * Telegram message and the admin Requests UI so the two never drift apart.
 * `source` itself stays free text (no enum) per the Unified Request System
 * design; this is presentation only. Unknown/legacy values (e.g. the
 * original Phase 1 default "website") fall back to a title-cased render of
 * the raw value rather than "Unknown". */
export function resolveSourceLabel(source: string): string {
  switch (source) {
    case "book_now":
      return "Book Now";
    case "admin_phone":
      return "Admin / Phone";
    case "instagram":
      return "Instagram";
    case "facebook":
      return "Facebook";
    case "website":
      return "Website";
    default:
      return source ? source.charAt(0).toUpperCase() + source.slice(1) : "Unknown";
  }
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeBookNowPayload(value: unknown): BookNowPayload {
  const input = value && typeof value === "object" ? value as Partial<Record<keyof BookNowPayload, unknown>> : {};
  const sourcePath = text(input.sourcePath).slice(0, 200);
  return {
    fullName: text(input.fullName).slice(0, 120),
    phone: text(input.phone).slice(0, 40),
    email: text(input.email).slice(0, 160).toLowerCase(),
    zipCode: text(input.zipCode).slice(0, 10),
    message: text(input.message).slice(0, 1200),
    serviceTextConsent: input.serviceTextConsent === true,
    categoryId: text(input.categoryId).slice(0, 60),
    serviceId: text(input.serviceId).slice(0, 60),
    offer: input.offer === true,
    issue: text(input.issue).slice(0, 60),
    // Defensive shape check only (must look like an internal route), never
    // trusted as anything more than display context — this never drives a
    // redirect or lookup, only a stored/notified string.
    sourcePath: sourcePath.startsWith("/") ? sourcePath : "",
    campaignToken: text(input.campaignToken).slice(0, 64),
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s.-]{7,20}$/;
const zipPattern = /^\d{5}$/;

export function validateBookNowPayload(payload: BookNowPayload): BookNowErrors {
  const errors: BookNowErrors = {};
  if (!payload.fullName) errors.fullName = "Enter your full name.";
  if (!payload.phone) errors.phone = "Enter a phone number so we can reach you.";
  else if (!phonePattern.test(payload.phone)) errors.phone = "Enter a valid phone number.";
  if (!payload.zipCode) errors.zipCode = "Enter your ZIP code.";
  else if (!zipPattern.test(payload.zipCode)) errors.zipCode = "Enter a five-digit ZIP code.";
  if (!payload.message) errors.message = "Tell us what's going on.";
  if (payload.email && !emailPattern.test(payload.email)) errors.email = "Enter a valid email address.";
  return errors;
}
