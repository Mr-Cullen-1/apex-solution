import type { NavigationItem } from "@/types/content";
import { contactEntry } from "./cta";

export const primaryNavigation: NavigationItem[] = [
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "Cooling", href: "/services/cooling", description: "Repair, installation, maintenance, and replacement." },
      { label: "Heating", href: "/services/heating", description: "Furnaces, heat pumps, and seasonal care." },
      { label: "Plumbing", href: "/services/plumbing", description: "Water heaters, drains, and leak detection." },
      { label: "Air Quality", href: "/services/air-quality", description: "Healthier, more balanced indoor air." },
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
