export type PlannedRoute = {
  path: `/${string}`;
  title: string;
  group: "Service" | "Conversion" | "Company" | "Location" | "Resource" | "Legal";
};

export const plannedRoutes: PlannedRoute[] = [
  { path: "/services", title: "Home Services", group: "Service" },
  { path: "/services/cooling", title: "Cooling Services", group: "Service" },
  { path: "/services/cooling/ac-repair", title: "AC Repair", group: "Service" },
  { path: "/services/cooling/ac-installation", title: "AC Installation", group: "Service" },
  { path: "/services/cooling/ac-maintenance", title: "AC Maintenance", group: "Service" },
  { path: "/services/cooling/ac-replacement", title: "AC Replacement", group: "Service" },
  { path: "/services/heating", title: "Heating Services", group: "Service" },
  { path: "/services/heating/furnace-repair", title: "Furnace Repair", group: "Service" },
  { path: "/services/heating/heat-pumps", title: "Heat Pumps", group: "Service" },
  { path: "/services/heating/heating-maintenance", title: "Heating Maintenance", group: "Service" },
  { path: "/services/plumbing", title: "Plumbing Services", group: "Service" },
  { path: "/services/plumbing/water-heaters", title: "Water Heaters", group: "Service" },
  { path: "/services/plumbing/drain-cleaning", title: "Drain Cleaning", group: "Service" },
  { path: "/services/plumbing/leak-detection", title: "Leak Detection", group: "Service" },
  { path: "/services/air-quality", title: "Indoor Air Quality", group: "Service" },
  { path: "/emergency", title: "Emergency Service", group: "Conversion" },
  { path: "/membership", title: "Apex Care", group: "Conversion" },
  { path: "/financing", title: "Financing", group: "Conversion" },
  { path: "/offers", title: "Offers", group: "Conversion" },
  { path: "/about", title: "About Apex Solution", group: "Company" },
  { path: "/team", title: "Our Team", group: "Company" },
  { path: "/reviews", title: "Customer Reviews", group: "Company" },
  { path: "/projects", title: "Selected Projects", group: "Company" },
  { path: "/careers", title: "Careers", group: "Company" },
  { path: "/service-areas", title: "Service Areas", group: "Location" },
  { path: "/service-areas/phoenix", title: "Phoenix", group: "Location" },
  { path: "/service-areas/scottsdale", title: "Scottsdale", group: "Location" },
  { path: "/service-areas/mesa", title: "Mesa", group: "Location" },
  { path: "/service-areas/chandler", title: "Chandler", group: "Location" },
  { path: "/service-areas/gilbert", title: "Gilbert", group: "Location" },
  { path: "/service-areas/tempe", title: "Tempe", group: "Location" },
  { path: "/resources", title: "Apex Journal", group: "Resource" },
  { path: "/faq", title: "Frequently Asked Questions", group: "Resource" },
  { path: "/book", title: "Book a Service", group: "Conversion" },
  { path: "/contact", title: "Contact", group: "Conversion" },
  { path: "/privacy", title: "Privacy Policy", group: "Legal" },
  { path: "/terms", title: "Terms of Use", group: "Legal" },
];

export function getPlannedRoute(slug: string[]) {
  const path = `/${slug.join("/")}`;
  return plannedRoutes.find((route) => route.path === path);
}
