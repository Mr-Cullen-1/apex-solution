import type { MediaId } from "./media";

// No customer-approved before/after photography exists yet. Media stays null so the
// UI renders an honest "coming soon" state rather than fabricated completed jobs.
// Populate beforeMediaId/afterMediaId only with real, customer-consented photography.
export type ApexResult = {
  id: string;
  category: string;
  label: string;
  caption: string;
  beforeMediaId: MediaId | null;
  afterMediaId: MediaId | null;
};

export const apexResults: ApexResult[] = [
  { id: "outdoor-ac-cleaning", category: "Cooling", label: "Outdoor AC unit cleaning", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null },
  { id: "refrigerator", category: "Appliance Repair", label: "Refrigerator", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null },
  { id: "dryer", category: "Appliance Repair", label: "Dryer", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null },
  { id: "washer", category: "Appliance Repair", label: "Washer", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null },
  { id: "furnace", category: "Heating", label: "Furnace", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null },
];
