// Client-approved availability, credentials, and pricing copy (confirmed Sep 2026).
// The technician-experience claim was previously two different client-supplied
// numbers for two contexts ("8+" in the hero, "7 to 10+" in the trust strip).
// The client has since confirmed one unified figure — `technicianExperience`
// below is the single source both contexts read from, so this can never
// drift apart again.
export const technicianExperience = "10+ Years Technician Experience";

export const availability = {
  liveNowLabel: "Live Now",
  liveNowDetail: "Instant response. Call or text and we reply right away.",
  emergencyLabel: "Emergency Same-Day Service",
  emergencyDetail: "We arrive ASAP.",
  heroExperience: technicianExperience,
  // Distinguishes online-form availability from live phone-line hours — do not
  // claim 24/7 phone support, only 24/7 Book Now form availability.
  bookOnlineLabel: "Book Online 24/7",
  phoneHoursLabel: "Phone Hours: 9 AM – Midnight",
} as const;

export const credentials = [
  "EPA 608 Certified Technicians",
  "Experienced and Trained on All Major Appliance Brands",
  "Independently Licensed HVAC, Plumbing & Electrical Technicians",
  technicianExperience,
] as const;

export const servicePricing = {
  headline: "Service calls starting at $89, based on your location",
  detail: "Diagnostic fee credited toward your repair if you move forward the same day.",
} as const;
