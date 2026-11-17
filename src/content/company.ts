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
  description: "Apex connects homeowners with independent appliance, heating, cooling and water-heater professionals in select counties across NY, NJ, CT, MA and RI. Service and ZIP availability are confirmed separately.",
  locale: "en_US",
  serviceRegion: "New York, New Jersey, Connecticut, Massachusetts, and Rhode Island",
  contact,
  socialLinks: [],
} as const;

// Single source for the homepage's browser title/description so the root
// layout and the homepage route can't drift apart (a page-level `metadata`
// export replaces the parent's, it does not merge with it).
export const homeMeta = {
  title: `Appliance Repair & HVAC Services | ${company.name}`,
  description: "Request appliance repair, heating, cooling or water-heater service in select NY, NJ, CT, MA and RI counties. Service and ZIP coverage are confirmed separately.",
} as const;
