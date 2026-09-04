import type { ContactDetails } from "@/types/content";

export const contact: ContactDetails = {
  phone: null,
  email: null,
  address: null,
  hours: null,
};

export const company = {
  name: "Apex Solution",
  tagline: "Service at a higher standard.",
  description: "Expert heating, cooling, plumbing, and indoor air solutions designed to keep your home performing at its best.",
  locale: "en_US",
  market: "Phoenix metropolitan area",
  contact,
  socialLinks: [],
} as const;
