import type { ContactDetails } from "@/types/content";

export const contact: ContactDetails = {
  phone: "(516) 586-0826",
  phoneHref: "tel:+15165860826",
  smsHref: "sms:+15165860826",
  email: null,
  address: null,
  hours: "Monday-Friday, 9 AM-6 PM",
};

export const company = {
  name: "Apex Home Services",
  tagline: "Reliable Home Services. Local Professionals.",
  description: "Apex connects homeowners with independent appliance, heating, cooling and water-heater professionals in select counties across NY, NJ and CT. Check your ZIP for listed coverage; service and appointment availability are confirmed separately.",
  locale: "en_US",
  serviceRegion: "New York, New Jersey, and Connecticut",
  contact,
  socialLinks: [],
} as const;

// Single source for the homepage's browser title/description so the root
// layout and the homepage route can't drift apart (a page-level `metadata`
// export replaces the parent's, it does not merge with it).
export const homeMeta = {
  title: `Appliance Repair & HVAC Services | ${company.name}`,
  description: "Request appliance repair, heating, cooling or water-heater service in approved NY, NJ and CT ZIP codes. Check your location and request service through Apex.",
} as const;

/** Client-approved article terms supplied November 27, 2026. */
export const serviceCallTerms = { startingPrice: "$89", locationNote: "depending on location", credit: "Diagnostic fee credited toward repair when you proceed with the repair the same day." } as const;
