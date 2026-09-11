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
  // "We arrive ASAP" was replaced (client feedback): Apex connects homeowners with
  // independent local technicians rather than dispatching its own field staff, so the
  // headline should not imply Apex itself guarantees an arrival time.
  emergencyLabel: "Same-Day Service Available",
  emergencyDetail: "Fast local technician response.",
  heroExperience: technicianExperience,
  // Distinguishes online-form availability from live phone-line hours — do not
  // claim 24/7 phone support, only 24/7 Book Now form availability.
  bookOnlineLabel: "Book Online 24/7",
  phoneHoursLabel: "Phone Hours: 9 AM – Midnight",
} as const;

// Plumbing and Electrical are no longer marketed services — the old "Independently
// Licensed HVAC, Plumbing & Electrical Technicians" credential was replaced with a claim
// that matches the current four-service scope (Appliance Repair, Cooling, Heating,
// Water Heater Repair).
export const credentials = [
  "EPA 608 Certified Technicians",
  "Experienced on Major Appliance Brands",
  technicianExperience,
  "Same-Day Service Available",
] as const;

export const servicePricing = {
  headline: "Service calls starting at $89, based on your location",
  detail: "Diagnostic fee credited toward your repair if you move forward the same day.",
} as const;
