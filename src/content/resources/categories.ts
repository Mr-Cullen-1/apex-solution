import type { ResourceCategoryId } from "@/types/resource";

export const resourceCategories = [
  {
    "id": "heating",
    "name": "Heating",
    "group": "Home Services & Appliances",
    "description": "Practical heating guides, troubleshooting checks, and advice on when to request professional service."
  },
  {
    "id": "refrigerators",
    "name": "Refrigerators",
    "group": "Home Services & Appliances",
    "description": "Refrigerator troubleshooting, cooling problems, and practical advice on when to request professional service."
  },
  {
    "id": "washers-dryers",
    "name": "Washers & Dryers",
    "group": "Home Services & Appliances",
    "description": "Washer and dryer troubleshooting, safe homeowner checks, and advice on professional repair."
  },
  {
    "id": "dishwashers",
    "name": "Dishwashers",
    "group": "Home Services & Appliances",
    "description": "Dishwasher drainage problems, safe troubleshooting checks, and advice on when to request professional service."
  },
  {
    "id": "ovens",
    "name": "Ovens",
    "group": "Home Services & Appliances",
    "description": "Oven heating problems, safety precautions, and practical advice on professional repair."
  },
  {
    "id": "ice-makers",
    "name": "Ice Makers",
    "group": "Home Services & Appliances",
    "description": "Refrigerator ice maker troubleshooting and advice on water supply, cooling, and professional repair."
  },
  {
    "id": "commercial-refrigeration",
    "name": "Commercial Refrigeration",
    "group": "Commercial Equipment",
    "description": "Practical commercial refrigeration guides, troubleshooting checks, and advice on when to request professional service."
  },
  {
    "id": "walk-in-coolers-freezers",
    "name": "Walk-In Coolers & Freezers",
    "group": "Commercial Equipment",
    "description": "Walk-in cooler and freezer troubleshooting, temperature problems, and advice on professional service."
  },
  {
    "id": "commercial-ice-machines",
    "name": "Commercial Ice Machines",
    "group": "Commercial Equipment",
    "description": "Commercial ice machine troubleshooting, production problems, and advice on professional service."
  },
  {
    "id": "commercial-ovens",
    "name": "Commercial Ovens",
    "group": "Commercial Equipment",
    "description": "Commercial oven heating problems, safety precautions, and advice on professional repair."
  },
  {
    "id": "commercial-freezers",
    "name": "Commercial Freezers",
    "group": "Commercial Equipment",
    "description": "Commercial freezer temperature problems, safe checks, and advice on professional repair."
  },
  {
    "id": "preventive-maintenance",
    "name": "Preventive Maintenance",
    "group": "Commercial Equipment",
    "description": "Practical preventive maintenance guides, troubleshooting checks, and advice on when to request professional service."
  },
  {
    "id": "hvac-heating",
    "name": "HVAC & Heating",
    "group": "Planned guides",
    "description": "Guides about hvac & heating."
  },
  {
    "id": "water-heaters",
    "name": "Water Heaters",
    "group": "Planned guides",
    "description": "Guides about water heaters."
  },
  {
    "id": "appliance-repair",
    "name": "Appliance Repair",
    "group": "Planned guides",
    "description": "Guides about appliance repair."
  },
  {
    "id": "home-maintenance",
    "name": "Home Maintenance",
    "group": "Planned guides",
    "description": "Guides about home maintenance."
  },
  {
    "id": "energy-efficiency",
    "name": "Energy Efficiency",
    "group": "Planned guides",
    "description": "Guides about energy efficiency."
  }
] as const satisfies readonly { id: ResourceCategoryId; name: string; group: string; description: string }[];

export function getResourceCategory(id: string) { return resourceCategories.find(category => category.id === id); }
export function resourceCategoryPath(id: ResourceCategoryId) { return `/blog/category/${id}`; }
