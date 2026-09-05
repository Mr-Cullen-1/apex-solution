export type PlannedRoute = {
  path: `/${string}`;
  title: string;
  group: "Service" | "Conversion" | "Company" | "Location" | "Resource" | "Legal";
};

export const plannedRoutes: PlannedRoute[] = [
  { path: "/emergency", title: "Emergency Service", group: "Conversion" },
  { path: "/membership", title: "Apex Care", group: "Conversion" },
  { path: "/financing", title: "Financing", group: "Conversion" },
  { path: "/offers", title: "Offers", group: "Conversion" },
  { path: "/team", title: "Our Team", group: "Company" },
  { path: "/reviews", title: "Customer Reviews", group: "Company" },
  { path: "/projects", title: "Selected Projects", group: "Company" },
  { path: "/careers", title: "Careers", group: "Company" },
  { path: "/resources", title: "Apex Journal", group: "Resource" },
  { path: "/faq", title: "Frequently Asked Questions", group: "Resource" },
  { path: "/privacy", title: "Privacy Policy", group: "Legal" },
  { path: "/terms", title: "Terms of Use", group: "Legal" },
];

export const completedPublicPaths = ["/about", "/brands", "/contact", "/service-areas"] as const;

export function getPlannedRoute(slug: string[]) {
  const path = `/${slug.join("/")}`;
  return plannedRoutes.find((route) => route.path === path);
}
