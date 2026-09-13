import { getServiceById, getServiceCategory } from "./services";

// Eligibility is expressed against real catalog entries from services.ts —
// three items map to a real service/category page; the appliance items map to
// the existing Appliance Repair category plus the applianceType values already
// used in the booking flow, since no distinct per-appliance maintenance routes exist.
const acMaintenance = getServiceById("ac-maintenance")!;
const heatingMaintenance = getServiceById("heating-maintenance")!;
const applianceRepair = getServiceCategory("appliance-repair")!;

export type OfferEligibility = { label: string; href: string };

const eligibility: OfferEligibility[] = [
  { label: "Outdoor AC unit cleaning", href: acMaintenance.href },
  { label: "Furnace maintenance", href: heatingMaintenance.href },
  { label: "Refrigerator maintenance", href: applianceRepair.href },
  { label: "Dryer maintenance", href: applianceRepair.href },
  { label: "Washer maintenance", href: applianceRepair.href },
];

export const firstTimeOffer = {
  title: "First-Time Customer Offer",
  headline: "Save 10% on your first maintenance service.",
  disclaimer: "Applies to first-time Apex customers on the maintenance services listed below. Confirmed when you book.",
  eligibility,
  // Admin/CRM-facing offer identity (service_requests.offer_code/offer_label/
  // discount_percent — see supabase/migrations/20260914130000_service_requests_crm_fields.sql).
  // Distinct from the old (pre-Admin-Phase-2) approach of overloading the
  // `issue` column with this same title string — that was a Book Now
  // Phase 1 shortcut, replaced now that offer and issue are tracked as
  // independent columns.
  code: "FIRST_TIME_10",
  discountPercent: 10,
} as const;

const offerServiceIds = new Set(["ac-maintenance", "heating-maintenance"]);
const offerCategoryIds = new Set(["appliance-repair"]);

export function isOfferEligible({ categoryId, serviceId }: { categoryId?: string; serviceId?: string }) {
  return Boolean((serviceId && offerServiceIds.has(serviceId)) || (categoryId && offerCategoryIds.has(categoryId)));
}
