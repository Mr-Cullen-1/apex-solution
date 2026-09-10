export type BookNowDraft = {
  fullName: string;
  phone: string;
  email: string;
  zipCode: string;
  message: string;
  serviceTextConsent: boolean;
};

export type BookNowPayload = BookNowDraft & {
  categoryId: string;
  serviceId: string;
  offer: boolean;
};

export type BookNowErrors = Partial<Record<keyof BookNowDraft | "form", string>>;

export type SubmissionResult =
  | { ok: false; status: "invalid"; errors: BookNowErrors }
  | { ok: false; status: "not_configured"; message: string };
