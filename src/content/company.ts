import type { ContactDetails } from "@/types/content";

export const contact: ContactDetails = {
  phone: "(516) 586-0826",
  phoneHref: "tel:+15165860826",
  smsHref: "sms:+15165860826",
  email: null,
  address: null,
  hours: null,
};

export const company = {
  name: "Apex Home Services",
  tagline: "Reliable Home Services. Local Professionals.",
  description: "Reliable heating, cooling, water-heater, and appliance service from local professionals across New York, New Jersey, Connecticut, Massachusetts, and Rhode Island.",
  locale: "en_US",
  serviceRegion: "New York, New Jersey, Connecticut, Massachusetts, and Rhode Island",
  contact,
  socialLinks: [],
} as const;

// Single source for the homepage's browser title/description so the root
// layout and the homepage route can't drift apart (a page-level `metadata`
// export replaces the parent's, it does not merge with it).
export const homeMeta = {
  title: `${company.name} | Premium Home Services`,
  description: "Reliable heating, cooling, appliance, and water-heater service from local Northeast professionals.",
} as const;
