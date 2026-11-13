import { getServiceCategory } from "@/content/services";

// Compact directory labels from the supplied footer concept. Equipment types
// share the existing appliance route; they are not new service landing pages.
export const footerEquipmentGroups = [
  {
    id: "residential",
    label: "Residential Appliances",
    links: [
      "Refrigerators, Freezers & Ice Makers",
      "Washers & Dryers (Gas & Electric)",
      "Ovens, Ranges & Cooktops",
      "Microwaves (Built-in & Over-the-Range)",
      "Dishwashers",
      "Wine & Beverage Coolers",
      "Range Hoods & Warming Drawers",
    ].map((label) => ({ label, href: "/services/appliance-repair" })),
  },
  {
    id: "commercial",
    label: "Commercial Equipment",
    links: [
      "Commercial Refrigerators",
      "Commercial Freezers",
      "Commercial Ice Machines",
      "Pizza Ovens & Griddles",
      "Frozen Beverage Dispensers",
      "Food Truck Refrigeration",
    ].map((label) => ({ label, href: "/services/appliance-repair" })),
  },
];

export const footerSystemGroups = [
  { id: "cooling", label: "Cooling Services" },
  { id: "heating", label: "Heating Services" },
  { id: "water-heater-repair", label: "Water Heater Repair" },
].flatMap(({ id, label }) => {
  const category = getServiceCategory(id);
  if (!category) return [];
  return [{
    id,
    label,
    links: category.children.length
      ? category.children.map((service) => ({ label: service.name, href: service.href }))
      : [{ label: category.name, href: category.href }],
  }];
});
