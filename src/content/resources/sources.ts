/** Exact editorial source URLs reviewed for use in resource articles. */
export const resourceSources = {
  foodSafety: { title: "FDA: Power outages, key tips for consumers about food safety", href: "https://www.fda.gov/food/emergencies/power-outages-key-tips-consumers-about-food-safety" },
  nycFoodSafety: { title: "NYC Health Department: Food protection guidelines", href: "https://www.nyc.gov/site/doh/business/food-operators/food-safety-guidelines.page" },
  iceMaintenance: { title: "KaTom: Commercial ice machine cleaning and maintenance", href: "https://www.katom.com/learning-center/commercial-ice-machine-cleaning-maintenance.html" },
  carbonMonoxide: {
    title: "CPSC: Carbon Monoxide Fact Sheet",
    href: "https://www.cpsc.gov/safety-education/safety-guides/carbon-monoxide/carbon-monoxide-fact-sheet",
  },
  winterVents: {
    title: "CPSC: Winter Weather Safety Tips",
    href: "https://www.cpsc.gov/Newsroom/News-Releases/2025/As-Winter-Weather-Impacts-Millions-CPSC-Issues-Safety-Tips-to-Help-Families-Prevent-Carbon-Monoxide-Poisoning-and-Fires",
  },
  winterHeating: {
    title: "CPSC: Keep Warm and Safe This Winter",
    href: "https://www.cpsc.gov/Newsroom/News-Releases/2026/Keep-Warm-and-Safe-This-Winter-Tips-for-Using-Generators-Furnaces-and-Space-Heaters",
  },
  filters: {
    title: "U.S. Department of Energy: HVAC Proper Installation of Filters",
    href: "https://bsesc.energy.gov/energy-basics/hvac-proper-installation-filters",
  },
} as const;

export function isApprovedResourceSource(href: string) {
  return Object.values(resourceSources).some((source) => source.href === href);
}
