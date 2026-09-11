import type { FAQ, ServiceArea, SupportedBrandGroup } from "@/types/content";

export const serviceAreas = [
  {
    state: "New York",
    code: "NY",
    slug: "new-york",
    counties: ["Kings County", "Bronx County", "Nassau County", "Suffolk County", "Westchester County", "Rockland County"],
  },
  {
    state: "New Jersey",
    code: "NJ",
    slug: "new-jersey",
    counties: ["Middlesex County", "Monmouth County", "Ocean County", "Union County", "Essex County", "Morris County", "Passaic County", "Bergen County", "Somerset County"],
  },
  {
    state: "Connecticut",
    code: "CT",
    slug: "connecticut",
    counties: ["Fairfield County", "New Haven County", "Litchfield County"],
  },
  {
    state: "Massachusetts",
    code: "MA",
    slug: "massachusetts",
    counties: ["Suffolk County", "Middlesex County", "Worcester County", "Norfolk County", "Plymouth County", "Bristol County"],
  },
  {
    state: "Rhode Island",
    code: "RI",
    slug: "rhode-island",
    counties: ["Providence County", "Kent County", "Bristol County", "Newport County", "Washington County"],
  },
] as const satisfies readonly ServiceArea[];

export const supportedBrands = [
  {
    id: "appliances",
    label: "Appliances",
    brands: ["Samsung", "LG", "Whirlpool", "GE", "Maytag", "Frigidaire", "KitchenAid", "Bosch", "Kenmore", "Electrolux", "Amana"],
  },
  {
    id: "premium-appliances",
    label: "Premium Appliances",
    brands: ["Sub-Zero", "Wolf", "Viking", "Thermador", "Miele", "Monogram"],
  },
  {
    id: "hvac",
    label: "HVAC",
    brands: ["Carrier", "Trane", "Lennox", "Rheem", "Goodman", "American Standard", "Bryant", "York", "Mitsubishi", "Friedrich"],
  },
] as const satisfies readonly SupportedBrandGroup[];

export const faqs: FAQ[] = [
  { id: "choose-service", question: "How do I know which service to book?", answer: "Choose the category closest to what you are experiencing. If you are unsure, book now and describe the symptoms so the request can be directed appropriately." },
  { id: "service-area", question: "Does Apex Home Services serve my area?", answer: "Apex Home Services covers confirmed counties across New York, New Jersey, Connecticut, Massachusetts, and Rhode Island. Exact ZIP-level availability should be confirmed when you book." },
  { id: "request-details", question: "What should I include when I book?", answer: "Share the main symptom, when it started, the type of system if known, and your ZIP code. Exact scheduling will be confirmed separately." },
];
