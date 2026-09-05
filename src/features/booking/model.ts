import { allServices, primaryServices } from "@/content/services";
import { serviceAreas } from "@/content/site";
import type { BookingDraft, BookingErrors, BookingPayload, ContactPreference, TimeWindow } from "./types";

export const bookingSteps = ["Service", "What's happening?", "Location", "Preferred timing", "Contact details", "Review"] as const;
export const timeWindows: readonly { value: TimeWindow; label: string }[] = [
  { value: "morning", label: "Morning preference" },
  { value: "afternoon", label: "Afternoon preference" },
  { value: "flexible", label: "Flexible" },
];
export const contactPreferences: readonly { value: ContactPreference; label: string }[] = [
  { value: "none", label: "No preference" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
];
export const applianceTypes = ["Refrigerator", "Freezer", "Washer", "Dryer", "Dishwasher", "Oven / Range", "Cooktop", "Other appliance"] as const;

export const stateOptions = [...serviceAreas.map((area) => [area.code, area.state] as const), ["OTHER", "Another state"] as const];

export const coveredStateCodes = new Set(serviceAreas.map((area) => area.code));

export function findServiceContext(serviceId: string) {
  for (const category of primaryServices) {
    const service = category.children.find((item) => item.id === serviceId);
    if (service) return { category, service };
  }
  return undefined;
}

export function parseBookingPreselection(query: { service?: string | string[]; category?: string | string[] }) {
  const serviceValue = typeof query.service === "string" ? query.service : "";
  const serviceContext = findServiceContext(serviceValue);
  if (serviceContext) return { categoryId: serviceContext.category.id, serviceId: serviceContext.service.id };
  const categoryValue = typeof query.category === "string" ? query.category : "";
  const category = primaryServices.find((item) => item.id === categoryValue);
  return category ? { categoryId: category.id, serviceId: "" } : { categoryId: "", serviceId: "" };
}

export function createBookingDraft(selection: { categoryId: string; serviceId: string }): BookingDraft {
  return { ...selection, problemId: "", issueDescription: "", brand: "", applianceType: "", zipCode: "", street: "", unit: "", city: "", state: "", otherState: "", preferredDate: "", alternateDate: "", timeWindow: "", firstName: "", lastName: "", phone: "", email: "", contactPreference: "none", serviceTextConsent: false };
}

export function getSelectedCategory(draft: Pick<BookingDraft, "categoryId">) {
  return primaryServices.find((category) => category.id === draft.categoryId);
}

export function getSelectedService(draft: Pick<BookingDraft, "serviceId">) {
  return allServices.find((service) => service.id === draft.serviceId);
}

export function getProblems(categoryId: string) {
  return primaryServices.find((category) => category.id === categoryId)?.problems ?? [];
}

function text(value: unknown, _max: number) {
  void _max;
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeBookingPayload(value: unknown): BookingPayload {
  const input = value && typeof value === "object" ? value as Partial<Record<keyof BookingDraft, unknown>> : {};
  const contactPreference = contactPreferences.some((option) => option.value === input.contactPreference) ? input.contactPreference as ContactPreference : "none";
  const timeWindow = timeWindows.some((option) => option.value === input.timeWindow) ? input.timeWindow as TimeWindow : "";
  return {
    categoryId: text(input.categoryId, 60), serviceId: text(input.serviceId, 60), problemId: text(input.problemId, 80), issueDescription: text(input.issueDescription, 1200), brand: text(input.brand, 100), applianceType: text(input.applianceType, 80), zipCode: text(input.zipCode, 10), street: text(input.street, 150), unit: text(input.unit, 60), city: text(input.city, 100), state: text(input.state, 5).toUpperCase(), otherState: text(input.otherState, 80), preferredDate: text(input.preferredDate, 10), alternateDate: text(input.alternateDate, 10), timeWindow, firstName: text(input.firstName, 80), lastName: text(input.lastName, 80), phone: text(input.phone, 40), email: text(input.email, 160).toLowerCase(), contactPreference, serviceTextConsent: input.serviceTextConsent === true,
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+()\d\s.-]{7,40}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function validateBookingStep(draft: BookingDraft, step: number, today = new Date().toISOString().slice(0, 10)): BookingErrors {
  const errors: BookingErrors = {};
  if (step === 0) {
    const category = getSelectedCategory(draft);
    if (!category) errors.categoryId = "Choose the service category you need.";
    if (draft.serviceId && !category?.children.some((service) => service.id === draft.serviceId)) errors.serviceId = "Choose a service from the selected category.";
  }
  if (step === 1) {
    const problems = getProblems(draft.categoryId);
    if (!draft.problemId || (draft.problemId !== "other" && !problems.some((problem) => problem.id === draft.problemId))) errors.problemId = "Choose what you are noticing, or select Something else.";
    if (draft.issueDescription.length > 1200) errors.issueDescription = "Keep additional details to 1,200 characters or fewer.";
    if (draft.brand.length > 100) errors.brand = "Keep the brand name to 100 characters or fewer.";
    if (draft.applianceType.length > 80) errors.applianceType = "Choose a valid appliance type.";
  }
  if (step === 2) {
    if (!/^\d{5}$/.test(draft.zipCode)) errors.zipCode = "Enter a five-digit ZIP code.";
    if (!draft.street) errors.street = "Enter the service street address.";
    if (draft.street.length > 150) errors.street = "Keep the street address to 150 characters or fewer.";
    if (draft.unit.length > 60) errors.unit = "Keep the apartment or unit to 60 characters or fewer.";
    if (!draft.city) errors.city = "Enter the service city.";
    if (draft.city.length > 100) errors.city = "Keep the city to 100 characters or fewer.";
    if (!stateOptions.some(([code]) => code === draft.state)) errors.state = "Choose a state.";
    if (draft.state === "OTHER" && !draft.otherState) errors.otherState = "Enter the state for the service address.";
    if (draft.otherState.length > 80) errors.otherState = "Keep the state name to 80 characters or fewer.";
  }
  if (step === 3) {
    if (!datePattern.test(draft.preferredDate) || draft.preferredDate < today) errors.preferredDate = "Choose today or a future preferred date.";
    if (draft.alternateDate && (!datePattern.test(draft.alternateDate) || draft.alternateDate < today)) errors.alternateDate = "Choose today or a future alternate date.";
    if (!timeWindows.some((option) => option.value === draft.timeWindow)) errors.timeWindow = "Choose a preferred time window.";
  }
  if (step === 4) {
    if (!draft.firstName) errors.firstName = "Enter your first name.";
    if (!draft.lastName) errors.lastName = "Enter your last name.";
    if (draft.firstName.length > 80) errors.firstName = "Keep the first name to 80 characters or fewer.";
    if (draft.lastName.length > 80) errors.lastName = "Keep the last name to 80 characters or fewer.";
    if (!draft.phone && !draft.email) errors.form = "Enter a phone number or email address we can use to reach you.";
    if (draft.phone && !phonePattern.test(draft.phone)) errors.phone = "Enter a valid phone number.";
    if (draft.email && (!emailPattern.test(draft.email) || draft.email.length > 160)) errors.email = "Enter a valid email address.";
    if ((draft.contactPreference === "phone" || draft.contactPreference === "text") && !draft.phone) errors.phone = "Enter a phone number for this contact preference.";
    if (draft.contactPreference === "email" && !draft.email) errors.email = "Enter an email address for this contact preference.";
    if (draft.contactPreference === "text" && !draft.serviceTextConsent) errors.serviceTextConsent = "Consent is required only if you prefer service-request text messages.";
  }
  return errors;
}

export function validateBookingPayload(payload: BookingPayload, today?: string): BookingErrors {
  return [0, 1, 2, 3, 4].reduce((errors, step) => ({ ...errors, ...validateBookingStep(payload, step, today) }), {} as BookingErrors);
}
