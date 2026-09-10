import { firstTimeOffer } from "@/content/offers";
import { getServiceById, primaryServices } from "@/content/services";
import type { BookNowDraft, BookNowErrors, BookNowPayload } from "./types";

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

export function createBookNowDraft(): BookNowDraft {
  return { fullName: "", phone: "", email: "", zipCode: "", message: "", serviceTextConsent: false };
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeBookNowPayload(value: unknown): BookNowPayload {
  const input = value && typeof value === "object" ? value as Partial<Record<keyof BookNowPayload, unknown>> : {};
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
