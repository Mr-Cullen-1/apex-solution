export type ContactPreference = "phone" | "text" | "email" | "none";
export type TimeWindow = "morning" | "afternoon" | "flexible";

export type BookingDraft = {
  categoryId: string;
  serviceId: string;
  problemId: string;
  issueDescription: string;
  brand: string;
  applianceType: string;
  zipCode: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  otherState: string;
  preferredDate: string;
  alternateDate: string;
  timeWindow: TimeWindow | "";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactPreference: ContactPreference;
  serviceTextConsent: boolean;
};

export type BookingPayload = BookingDraft;
export type BookingErrors = Partial<Record<keyof BookingDraft | "form", string>>;

export type SubmissionResult =
  | { ok: false; status: "invalid"; errors: BookingErrors }
  | { ok: false; status: "not_configured"; message: string };
