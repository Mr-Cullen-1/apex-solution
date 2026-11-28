import type { FAQ, SupportedBrandGroup } from "@/types/content";

import { serviceAreas } from "./service-coverage";
export { serviceAreas } from "./service-coverage";

export const serviceCoverageDescription = `Service requests are coordinated in select counties in ${serviceAreas.map((area) => area.state).join(", ")}. Check your ZIP against our current coverage list. Service details and appointment availability are confirmed separately.`;

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
  { id: "service-area", question: "Does Apex Home Services serve my area?", answer: "Apex Home Services serves listed ZIP codes in New York, New Jersey, and Connecticut. Use our ZIP checker to confirm geographic coverage; service details and scheduling are confirmed when you book." },
  { id: "request-details", question: "What should I include when I book?", answer: "Share the main symptom, when it started, the type of system if known, and your ZIP code. Exact scheduling will be confirmed separately." },
];
