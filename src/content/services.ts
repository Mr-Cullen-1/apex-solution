import type { Service } from "@/types/content";

export const primaryServices: Service[] = [
  {
    id: "cooling", name: "Cooling", slug: "cooling", href: "/services/cooling", shortDescription: "Precise cooling diagnostics, repair, installation, and care.",
    children: [
      { id: "ac-repair", name: "AC Repair", slug: "ac-repair", href: "/services/cooling/ac-repair", shortDescription: "Cooling diagnostics and repair." },
      { id: "ac-installation", name: "AC Installation", slug: "ac-installation", href: "/services/cooling/ac-installation", shortDescription: "Thoughtful system installation." },
      { id: "ac-maintenance", name: "AC Maintenance", slug: "ac-maintenance", href: "/services/cooling/ac-maintenance", shortDescription: "Seasonal cooling care." },
      { id: "ac-replacement", name: "AC Replacement", slug: "ac-replacement", href: "/services/cooling/ac-replacement", shortDescription: "Clear replacement guidance." },
    ],
  },
  {
    id: "heating", name: "Heating", slug: "heating", href: "/services/heating", shortDescription: "Dependable furnace and heat-pump expertise for cooler nights.",
    children: [
      { id: "furnace-repair", name: "Furnace Repair", slug: "furnace-repair", href: "/services/heating/furnace-repair", shortDescription: "Focused furnace diagnostics." },
      { id: "heat-pumps", name: "Heat Pumps", slug: "heat-pumps", href: "/services/heating/heat-pumps", shortDescription: "Year-round heat-pump service." },
      { id: "heating-maintenance", name: "Heating Maintenance", slug: "heating-maintenance", href: "/services/heating/heating-maintenance", shortDescription: "Preventive seasonal attention." },
    ],
  },
  {
    id: "plumbing", name: "Plumbing", slug: "plumbing", href: "/services/plumbing", shortDescription: "Clear answers for water heaters, drains, leaks, and more.",
    children: [
      { id: "water-heaters", name: "Water Heaters", slug: "water-heaters", href: "/services/plumbing/water-heaters", shortDescription: "Water-heating support." },
      { id: "drain-cleaning", name: "Drain Cleaning", slug: "drain-cleaning", href: "/services/plumbing/drain-cleaning", shortDescription: "Careful drain service." },
      { id: "leak-detection", name: "Leak Detection", slug: "leak-detection", href: "/services/plumbing/leak-detection", shortDescription: "Precise leak investigation." },
    ],
  },
  { id: "air-quality", name: "Air Quality", slug: "air-quality", href: "/services/air-quality", shortDescription: "Thoughtful solutions for cleaner, more balanced indoor air." },
];

export const customerProblems = [
  { id: "not-cooling", label: "My AC isn't cooling", href: "/services/cooling/ac-repair" },
  { id: "system-noise", label: "My system is making noise", href: "/services/cooling/ac-repair" },
  { id: "high-energy-bill", label: "My energy bill is too high", href: "/book" },
  { id: "uneven-temperatures", label: "My home has uneven temperatures", href: "/services/air-quality" },
  { id: "new-system", label: "I need a new system", href: "/services/cooling/ac-installation" },
  { id: "other", label: "Something else", href: "/book" },
] as const;
