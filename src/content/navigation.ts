import type { NavigationItem } from "@/types/content";
import { contactEntry } from "./cta";

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Appliance Repair", href: "/services/appliance-repair", description: "Diagnostic and repair service for household appliances." },
      { label: "Cooling", href: "/services/cooling", description: "Repair, installation, maintenance, and replacement." },
      { label: "Heating", href: "/services/heating", description: "Furnaces, heat pumps, and seasonal care." },
      { label: "Water Heater Repair", href: "/services/water-heater-repair", description: "Diagnostics and repair for residential water heaters." },
    ],
  },
  { label: "Service Areas", href: "/service-areas" },
  { label: "About", href: "/about" },
  { label: contactEntry.label, href: contactEntry.href },
];

export const footerGroups = [
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Brands We Service", href: "/brands" },
    ],
  },
  {
    label: "Support",
    links: [
      { label: "Service Areas", href: "/service-areas" },
      { label: contactEntry.label, href: contactEntry.href },
    ],
  },
] satisfies { label: string; links: NavigationItem[] }[];
