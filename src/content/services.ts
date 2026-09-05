import { bookingEntry } from "@/content/cta";
import type { Service, ServiceCategory, ServiceProblem } from "@/types/content";

const visitFaq = {
  question: "What happens after I request service?",
  answer: "The team can review the information you provide, confirm whether the request is within the service area, and discuss an appropriate next step. Scheduling is confirmed separately.",
} as const;

const service = (value: Service) => value;

const acRepair = service({
  id: "ac-repair", name: "AC Repair", slug: "ac-repair", href: "/services/cooling/ac-repair", shortDescription: "Cooling-system inspection and repair options.",
  summary: "When your home is not cooling as expected, a professional inspection can help clarify what the system needs.",
  description: "AC repair service focuses on understanding performance concerns, inspecting relevant components, and discussing appropriate options before approved work begins.",
  signs: ["The system runs but the home stays warm", "Airflow feels weaker or less consistent", "The system makes a new or unusual sound"],
  overview: ["Cooling concerns can have more than one cause, so symptoms alone are not a complete diagnosis.", "A service visit can help identify the relevant system condition and clarify practical repair or replacement options."],
  relatedServiceIds: ["ac-maintenance", "ac-replacement", "air-quality"], problems: [], faqs: [visitFaq, { question: "Does unusual noise always mean a major repair?", answer: "Not necessarily. Different conditions can create similar sounds, so an inspection may be appropriate before drawing a conclusion." }],
  brandGroupIds: ["hvac"], mediaId: "northeastHvac", seo: { title: "AC Repair Services", description: "Explore AC repair service from Apex Home Services, including common cooling concerns, what to expect, related services, and how to request an inspection." }, status: "published",
});

const acInstallation = service({
  id: "ac-installation", name: "AC Installation", slug: "ac-installation", href: "/services/cooling/ac-installation", shortDescription: "Thoughtful planning for new cooling equipment.",
  summary: "A new cooling system should be considered in the context of the home, comfort goals, and existing equipment.",
  description: "Installation planning may include reviewing the current system, discussing household priorities, and considering equipment options appropriate to the property.",
  signs: ["You are planning a new or renovated space", "The existing system no longer meets household needs", "You want to compare current equipment options"],
  overview: ["Equipment selection is only one part of a cooling installation decision.", "Professional review can help connect system options with the home and the way it is used."],
  relatedServiceIds: ["ac-replacement", "heat-pumps", "air-quality"], problems: [], faqs: [visitFaq, { question: "Can installation options be compared before work begins?", answer: "Yes. The purpose of the initial discussion is to understand the home and review available options before any work is approved." }],
  brandGroupIds: ["hvac"], mediaId: "northeastHvac", seo: { title: "AC Installation Services", description: "Learn how Apex Home Services approaches residential AC installation planning, equipment discussions, and next-step service requests." }, status: "published",
});

const acMaintenance = service({
  id: "ac-maintenance", name: "AC Maintenance", slug: "ac-maintenance", href: "/services/cooling/ac-maintenance", shortDescription: "Seasonal attention for residential cooling systems.",
  summary: "Preventive cooling service provides an opportunity to review system condition before or during periods of regular use.",
  description: "A maintenance visit can focus on observable system condition and performance while creating space to discuss findings and possible next steps.",
  signs: ["A seasonal review is due", "Cooling performance has changed since last season", "You want the system inspected before regular use"],
  overview: ["Maintenance is preventive attention rather than a promise that future problems cannot occur.", "The visit can help surface observable concerns and support more informed home-comfort decisions."],
  relatedServiceIds: ["ac-repair", "heating-maintenance", "ac-replacement"], problems: [], faqs: [visitFaq, { question: "Does maintenance guarantee the system will not need repair?", answer: "No. Maintenance can support system awareness and care, but it cannot guarantee future operation or eliminate every possible issue." }],
  brandGroupIds: ["hvac"], mediaId: "serviceDetail", seo: { title: "AC Maintenance Services", description: "Review residential AC maintenance from Apex Home Services, including common reasons to schedule seasonal system attention." }, status: "published",
});

const acReplacement = service({
  id: "ac-replacement", name: "AC Replacement", slug: "ac-replacement", href: "/services/cooling/ac-replacement", shortDescription: "Clear guidance when replacement is being considered.",
  summary: "When repair and replacement both deserve consideration, a system review can help organize the decision.",
  description: "Replacement discussions can consider current performance, the home, and available equipment options without assuming that replacement is always the answer.",
  signs: ["The system needs increasingly frequent attention", "Comfort needs have changed", "You want to compare repair and replacement paths"],
  overview: ["A replacement decision should be based on the specific system and household priorities.", "The service conversation can clarify options and the information needed for a responsible choice."],
  relatedServiceIds: ["ac-repair", "ac-installation", "heat-pumps"], problems: [], faqs: [visitFaq, { question: "Does an older system automatically need replacement?", answer: "No. Age can be one consideration, but an inspection and a discussion of the system's condition are more useful than age alone." }],
  brandGroupIds: ["hvac"], mediaId: "northeastHvac", seo: { title: "AC Replacement Services", description: "Consider residential AC replacement with a clear review of system concerns, household goals, and available next steps." }, status: "published",
});

const furnaceRepair = service({
  id: "furnace-repair", name: "Furnace Repair", slug: "furnace-repair", href: "/services/heating/furnace-repair", shortDescription: "Professional review of residential heating concerns.",
  summary: "If a furnace is not heating as expected, an inspection can help identify the relevant condition and available options.",
  description: "Furnace repair service begins with the symptoms you have noticed and a review of the relevant heating system components.",
  signs: ["The home does not warm as expected", "Heating cycles feel inconsistent", "The system has developed an unusual sound or smell"],
  overview: ["Similar heating symptoms can stem from different system conditions.", "A professional inspection can help replace guesswork with a clearer discussion of findings."],
  relatedServiceIds: ["heating-maintenance", "heat-pumps", "air-quality"], problems: [], faqs: [visitFaq, { question: "Should I keep running a system with a new smell?", answer: "If you are concerned about safety, stop using the equipment and follow appropriate emergency guidance. A remote description cannot establish the cause." }],
  brandGroupIds: ["hvac"], mediaId: "serviceDetail", seo: { title: "Furnace Repair Services", description: "Explore furnace repair service from Apex Home Services, including common heating concerns and what a service visit may involve." }, status: "published",
});

const heatPumps = service({
  id: "heat-pumps", name: "Heat Pumps", slug: "heat-pumps", href: "/services/heating/heat-pumps", shortDescription: "Service considerations for year-round heat-pump systems.",
  summary: "Heat pumps support both heating and cooling, making whole-system context especially useful when performance changes.",
  description: "Heat-pump service can address performance concerns or help homeowners explore equipment options for year-round comfort.",
  signs: ["Heating or cooling performance has changed", "The system switches modes unexpectedly", "You are considering a heat-pump option for the home"],
  overview: ["Heat-pump needs vary between existing-system service and new-equipment planning.", "A review can help distinguish the request and organize the appropriate next conversation."],
  relatedServiceIds: ["furnace-repair", "ac-installation", "heating-maintenance"], problems: [], faqs: [visitFaq, { question: "Are heat pumps only used for heating?", answer: "Many heat-pump systems can support both heating and cooling. The right application depends on the home and equipment configuration." }],
  brandGroupIds: ["hvac"], mediaId: "northeastHvac", seo: { title: "Heat Pump Services", description: "Explore residential heat-pump service and equipment considerations with Apex Home Services." }, status: "published",
});

const heatingMaintenance = service({
  id: "heating-maintenance", name: "Heating Maintenance", slug: "heating-maintenance", href: "/services/heating/heating-maintenance", shortDescription: "Preventive seasonal heating-system attention.",
  summary: "A seasonal heating review can help homeowners understand observable system condition before regular cold-weather use.",
  description: "Heating maintenance provides a structured opportunity to review the system, discuss observations, and identify concerns that may deserve further service.",
  signs: ["A seasonal heating review is due", "System behavior has changed since last winter", "You want the equipment reviewed before regular use"],
  overview: ["Preventive service supports awareness but is not a guarantee against future repairs.", "Clear findings help homeowners decide whether additional attention is appropriate."],
  relatedServiceIds: ["furnace-repair", "ac-maintenance", "heat-pumps"], problems: [], faqs: [visitFaq, { question: "Is maintenance the same as repair?", answer: "No. Maintenance is preventive attention. If a specific fault is found, repair options can be discussed separately." }],
  brandGroupIds: ["hvac"], mediaId: "serviceDetail", seo: { title: "Heating Maintenance Services", description: "Learn about seasonal residential heating maintenance and how to request a system review from Apex Home Services." }, status: "published",
});

const waterHeaters = service({
  id: "water-heaters", name: "Water Heaters", slug: "water-heaters", href: "/services/plumbing/water-heaters", shortDescription: "Inspection and service options for residential water heaters.",
  summary: "Changes in hot-water performance can justify a professional review of the water-heating system.",
  description: "Water-heater service can focus on understanding the concern, reviewing accessible equipment conditions, and explaining available next steps.",
  signs: ["Hot water is inconsistent or unavailable", "Water temperature has changed unexpectedly", "Moisture appears near the equipment"],
  overview: ["Water-heating concerns can involve different equipment and conditions.", "An inspection can help determine whether service or a broader equipment discussion is appropriate."],
  relatedServiceIds: ["leak-detection", "drain-cleaning"], problems: [], faqs: [visitFaq, { question: "Does moisture always mean the tank is leaking?", answer: "Not always. Moisture can have different sources, and the equipment area should be inspected before drawing a conclusion." }],
  brandGroupIds: [], mediaId: "serviceDetail", seo: { title: "Water Heater Services", description: "Explore residential water-heater service for inconsistent hot water, equipment concerns, and informed next-step planning." }, status: "published",
});

const drainCleaning = service({
  id: "drain-cleaning", name: "Drain Cleaning", slug: "drain-cleaning", href: "/services/plumbing/drain-cleaning", shortDescription: "Professional attention for slow or recurring drain concerns.",
  summary: "Slow or recurring drainage concerns may benefit from professional inspection rather than repeated guesswork.",
  description: "Drain service starts with where and how the issue appears, followed by an appropriate review and discussion of service options.",
  signs: ["A drain is moving more slowly than usual", "The same drainage concern keeps returning", "Multiple fixtures appear to be affected"],
  overview: ["The visible symptom does not always reveal the location or nature of a drainage issue.", "A professional review can help identify a more appropriate service path."],
  relatedServiceIds: ["leak-detection", "water-heaters"], problems: [], faqs: [visitFaq, { question: "Can a recurring slow drain have more than one cause?", answer: "Yes. Similar symptoms can occur for different reasons, so an inspection may be appropriate when a concern persists." }],
  brandGroupIds: [], mediaId: "serviceDetail", seo: { title: "Drain Cleaning Services", description: "Learn about drain cleaning service for slow, recurring, or multi-fixture drainage concerns." }, status: "published",
});

const leakDetection = service({
  id: "leak-detection", name: "Leak Detection", slug: "leak-detection", href: "/services/plumbing/leak-detection", shortDescription: "Focused investigation of suspected residential leaks.",
  summary: "Unexplained moisture or water-use changes can be a reason to request professional leak investigation.",
  description: "Leak-detection service focuses on the reported symptoms and accessible system conditions without assuming the source in advance.",
  signs: ["Unexplained moisture appears in the home", "A water-use pattern changes unexpectedly", "You hear water where no fixture is in use"],
  overview: ["Water can travel beyond its source, making visual symptoms incomplete evidence.", "A focused inspection can help narrow the concern and support a clearer service decision."],
  relatedServiceIds: ["water-heaters", "drain-cleaning"], problems: [], faqs: [visitFaq, { question: "Can leak location be confirmed remotely?", answer: "No. A description can help prepare for a visit, but confirming a source generally requires inspection." }],
  brandGroupIds: [], mediaId: "serviceDetail", seo: { title: "Leak Detection Services", description: "Explore professional leak-detection service for unexplained moisture and residential water-system concerns." }, status: "published",
});

const coolingProblems: readonly ServiceProblem[] = [
  { id: "weak-cooling", label: "The home is not cooling well", description: "Weak or uneven cooling can have multiple possible service areas.", href: acRepair.href },
  { id: "cooling-noise", label: "The system sounds different", description: "New noise is useful context for a professional inspection, not a remote diagnosis.", href: acRepair.href },
  { id: "seasonal-cooling", label: "I want a seasonal system review", description: "Preventive attention can help you understand observable system condition.", href: acMaintenance.href },
  { id: "new-cooling", label: "I am considering new equipment", description: "Start with a discussion of the home, current system, and comfort priorities.", href: acInstallation.href },
];

export const primaryServices: readonly ServiceCategory[] = [
  {
    id: "appliance-repair", name: "Appliance Repair", slug: "appliance-repair", href: "/services/appliance-repair", shortDescription: "Professional diagnostic service for household appliances.",
    description: "Apex Home Services works on a confirmed range of standard and premium appliance brands. Service begins with the appliance, symptoms, and a careful review of possible next steps.", mediaId: "applianceService", brandGroupIds: ["appliances", "premium-appliances"], children: [], layout: "image-led", status: "published",
    problems: [
      { id: "appliance-not-cooling", label: "An appliance is not cooling", description: "Cooling changes can justify a professional appliance inspection.", href: "/services/appliance-repair" },
      { id: "appliance-not-starting", label: "An appliance is not starting", description: "Power and operating symptoms can have several possible service areas.", href: "/services/appliance-repair" },
      { id: "appliance-noise", label: "An appliance is making unusual noise", description: "The sound and when it occurs are useful details for a service request.", href: "/services/appliance-repair" },
      { id: "appliance-leak", label: "An appliance appears to be leaking", description: "Moisture location and timing can help prepare for an inspection.", href: "/services/appliance-repair" },
    ],
    faqs: [visitFaq, { question: "Does the brand list mean factory-authorized service?", answer: "No. Brands We Service means Apex works on the listed brands; it does not claim manufacturer authorization, certification, dealership, partnership, or warranty authorization." }],
    seo: { title: "Appliance Repair Services", description: "Explore appliance repair service from Apex Home Services, supported brand categories, common service situations, and how to request an inspection." },
  },
  {
    id: "cooling", name: "Cooling", slug: "cooling", href: "/services/cooling", shortDescription: "Cooling diagnostics, repair, installation, maintenance, and replacement.",
    description: "Residential cooling service built around clear symptoms, careful inspection, and practical discussions about repair, care, or equipment options.", mediaId: "northeastHvac", brandGroupIds: ["hvac"], children: [acRepair, acInstallation, acMaintenance, acReplacement], problems: coolingProblems, layout: "image-led", status: "published",
    faqs: [visitFaq, { question: "Do cooling symptoms identify the exact problem?", answer: "No. Similar symptoms can have different causes, so an inspection may be appropriate before choosing a service path." }],
    seo: { title: "Residential Cooling Services", description: "Browse AC repair, installation, maintenance, and replacement services from Apex Home Services." },
  },
  {
    id: "heating", name: "Heating", slug: "heating", href: "/services/heating", shortDescription: "Furnace, heat-pump, and seasonal heating service.",
    description: "Heating service for changing performance, preventive seasonal attention, and thoughtful equipment discussions.", mediaId: "serviceDetail", brandGroupIds: ["hvac"], children: [furnaceRepair, heatPumps, heatingMaintenance], layout: "technical", status: "published",
    problems: [
      { id: "no-heat", label: "The home is not heating", description: "A heating inspection can help clarify the relevant system condition.", href: furnaceRepair.href },
      { id: "heating-noise", label: "The heating system sounds different", description: "New sounds are useful service context but not a remote diagnosis.", href: furnaceRepair.href },
      { id: "seasonal-heating", label: "I want a seasonal heating review", description: "Preventive attention can support a clearer understanding of the system.", href: heatingMaintenance.href },
    ],
    faqs: [visitFaq, { question: "Can heating concerns be diagnosed from a description alone?", answer: "No. The description helps prepare for service, but confirming a condition generally requires inspection." }],
    seo: { title: "Residential Heating Services", description: "Browse furnace repair, heat-pump, and heating-maintenance services from Apex Home Services." },
  },
  {
    id: "plumbing", name: "Plumbing", slug: "plumbing", href: "/services/plumbing", shortDescription: "Water-heater, drain, and leak-detection service.",
    description: "Focused residential plumbing service for hot-water, drainage, and suspected leak concerns already established in the Apex service catalog.", mediaId: "serviceDetail", brandGroupIds: [], children: [waterHeaters, drainCleaning, leakDetection], layout: "directory", status: "published",
    problems: [
      { id: "no-hot-water", label: "Hot water is inconsistent", description: "Water-heater service may be a useful place to begin.", href: waterHeaters.href },
      { id: "slow-drain", label: "A drain is slow or recurring", description: "Drain service can help review the specific pattern and affected fixtures.", href: drainCleaning.href },
      { id: "unexplained-moisture", label: "There is unexplained moisture", description: "Possible leak concerns generally require inspection to locate the source.", href: leakDetection.href },
    ],
    faqs: [visitFaq, { question: "Can plumbing symptoms have more than one cause?", answer: "Yes. Similar symptoms can come from different conditions, so service content should not be treated as a diagnosis." }],
    seo: { title: "Residential Plumbing Services", description: "Browse water-heater, drain-cleaning, and leak-detection services from Apex Home Services." },
  },
  {
    id: "air-quality", name: "Indoor Air Quality", slug: "air-quality", href: "/services/air-quality", shortDescription: "Thoughtful service for cleaner, more balanced indoor air.",
    description: "Indoor air quality and airflow concerns can involve the home, comfort system, and the way spaces are used. A professional conversation can help organize the next step.", mediaId: "serviceDetail", brandGroupIds: ["hvac"], children: [], layout: "directory", status: "published",
    problems: [
      { id: "uneven-comfort", label: "Rooms feel uneven or uncomfortable", description: "Airflow and indoor comfort concerns can have several possible service areas.", href: "/services/air-quality" },
      { id: "air-concerns", label: "The air feels stale or difficult to balance", description: "Share what you notice and where it occurs to begin a service conversation.", href: "/services/air-quality" },
    ],
    faqs: [visitFaq, { question: "Can indoor air quality be assessed from symptoms alone?", answer: "No. Household observations are useful context, but they do not establish a specific condition without appropriate review." }],
    seo: { title: "Indoor Air Quality Services", description: "Explore indoor air quality and airflow service from Apex Home Services, including common comfort concerns and next steps." },
  },
];

export const allServices = primaryServices.flatMap((category) => category.children);
export const customerProblems = [
  ...primaryServices.flatMap((category) => category.problems),
  { id: "other", label: "Something else", description: "Start a request and describe what you are noticing.", href: bookingEntry.href },
] as const;

const homepageProblemIds = new Set(["appliance-not-cooling", "weak-cooling", "no-heat", "unexplained-moisture", "uneven-comfort", "other"]);
export const homepageProblems = customerProblems.filter((problem) => homepageProblemIds.has(problem.id));

export const serviceVisitSteps = [
  { number: "01", title: "Understand the issue", description: "Start with what you have noticed and the context around it." },
  { number: "02", title: "Inspect the relevant system", description: "Review the accessible equipment or appliance related to the request." },
  { number: "03", title: "Explain the findings", description: "Discuss observations in clear homeowner language." },
  { number: "04", title: "Review service options", description: "Consider available next steps before work is approved." },
  { number: "05", title: "Perform approved work", description: "Proceed with the agreed scope where applicable." },
] as const;

export function getServiceCategory(slug: string) {
  return primaryServices.find((category) => category.slug === slug);
}

export function getService(categorySlug: string, serviceSlug: string) {
  return getServiceCategory(categorySlug)?.children.find((item) => item.slug === serviceSlug);
}

export function getServiceById(id: string) {
  return allServices.find((item) => item.id === id) ?? primaryServices.find((item) => item.id === id);
}

export const completedServicePaths = [
  "/services",
  ...primaryServices.map((category) => category.href),
  ...allServices.map((item) => item.href),
] as const;
