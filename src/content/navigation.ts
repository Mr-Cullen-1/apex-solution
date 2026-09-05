import type { NavigationItem } from "@/types/content";
import { bookingEntry, contactEntry } from "./cta";

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
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Apex Care", href: "/membership" },
  { label: "Service Areas", href: "/service-areas" },
  { label: "Resources", href: "/resources" },
];

export const utilityNavigation: NavigationItem[] = [
  { label: "Emergency", href: "/emergency" },
  { label: "Financing", href: "/financing" },
  { label: "Offers", href: "/offers" },
  { label: contactEntry.label, href: contactEntry.href },
];

export const footerNavigation: NavigationItem[] = [
  { label: "Team", href: "/team" },
  { label: "Reviews", href: "/reviews" },
  { label: "Projects", href: "/projects" },
  { label: "Careers", href: "/careers" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export const footerGroups = [
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Brands We Service", href: "/brands" },
      { label: "Team", href: "/team" },
      { label: "Projects", href: "/projects" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    label: "Support",
    links: [
      { label: bookingEntry.label, href: bookingEntry.href },
      { label: "Service Areas", href: "/service-areas" },
      { label: "Emergency", href: "/emergency" },
      { label: "Financing", href: "/financing" },
      { label: contactEntry.label, href: contactEntry.href },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Apex Journal", href: "/resources" },
      { label: "FAQ", href: "/faq" },
      { label: "Reviews", href: "/reviews" },
      { label: "Apex Care", href: "/membership" },
    ],
  },
] satisfies { label: string; links: NavigationItem[] }[];
