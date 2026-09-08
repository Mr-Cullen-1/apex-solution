// Client-approved availability, credentials, and pricing copy (confirmed Sep 2026).
// Two distinct experience claims were supplied for two distinct contexts. They are
// intentionally NOT normalized to one number — see docs/PROJECT.md decision log.
export const availability = {
  liveNowLabel: "Live Now",
  liveNowDetail: "Instant response. Call or text and we reply right away.",
  emergencyLabel: "Emergency Same-Day Service",
  emergencyDetail: "We arrive ASAP.",
  heroExperience: "8+ Years Technician Experience",
} as const;

export const credentials = [
  "EPA 608 Certified Technicians",
  "Experienced and Trained on All Major Appliance Brands",
  "Independently Licensed HVAC, Plumbing & Electrical Technicians",
  "7 to 10+ Years Technician Experience",
] as const;

export const servicePricing = {
  headline: "Service calls starting at $89, based on your location",
  detail: "Diagnostic fee credited toward your repair if you move forward the same day.",
} as const;
