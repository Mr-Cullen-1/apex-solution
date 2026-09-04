import type { FAQ, Project, ResourceArticle, Review, ServiceArea } from "@/types/content";

export const serviceAreas: ServiceArea[] = ["Phoenix", "Scottsdale", "Mesa", "Chandler", "Gilbert", "Tempe"].map(
  (name) => ({ name, slug: name.toLowerCase(), region: "Arizona" }),
);

// Reviews remain empty until approved customer content is supplied.
export const reviews: Review[] = [];
export const faqs: FAQ[] = [
  { id: "choose-service", question: "How do I know which service to request?", answer: "Choose the category closest to what you are experiencing. If you are unsure, start a service request and describe the symptoms so the request can be directed appropriately." },
  { id: "service-area", question: "Does Apex Solution serve my area?", answer: "The initial website service area includes Phoenix, Scottsdale, Mesa, Chandler, Gilbert, and Tempe. Final availability should be confirmed when you request service." },
  { id: "request-details", question: "What should I include in a service request?", answer: "Share the main symptom, when it started, the type of system if known, and your preferred timing. Exact scheduling will be confirmed separately." },
  { id: "apex-care", question: "What is Apex Care?", answer: "Apex Care is the planned preventive-maintenance membership concept. Final benefits, eligibility, and commercial terms are still subject to business confirmation." },
  { id: "financing", question: "Will financing be available?", answer: "A financing experience is planned, but providers, eligibility, rates, and terms have not yet been confirmed." },
];
export const projects: Project[] = [
  { id: "whole-home-comfort", title: "Whole-home comfort", service: "Cooling", location: null, summary: "Concept imagery demonstrating the intended case-study presentation.", mediaId: "homeExterior", status: "concept" },
  { id: "precision-diagnostics", title: "Precision diagnostics", service: "System care", location: null, summary: "Project facts and location will be added after verification.", mediaId: "serviceDetail", status: "concept" },
  { id: "balanced-interior", title: "Balanced interiors", service: "Air quality", location: null, summary: "A visual placeholder for future verified residential work.", mediaId: "homeInterior", status: "concept" },
];
export const resources: ResourceArticle[] = [
  { slug: "ac-repair-or-replace", title: "Repair or replace? Start with the right questions.", excerpt: "A practical framework for making a clearer cooling-system decision.", category: "Cooling", publishedAt: null, status: "planned", mediaId: "serviceDetail" },
  { slug: "uneven-home-temperatures", title: "Why one room never feels quite right.", excerpt: "How airflow, insulation, and equipment can shape uneven comfort.", category: "Home comfort", publishedAt: null, status: "planned", mediaId: "homeInterior" },
  { slug: "seasonal-comfort-checklist", title: "A smarter seasonal comfort checklist.", excerpt: "Simple observations that help you prepare before temperatures shift.", category: "Maintenance", publishedAt: null, status: "planned", mediaId: "homeExterior" },
];

export const membership = {
  name: "Apex Care",
  description: "A planned preventive-maintenance membership for year-round home comfort.",
  benefits: [] as string[],
  pricing: null,
} as const;
