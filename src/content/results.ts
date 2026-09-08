import type { MediaId } from "./media";

// No customer-approved before/after photography exists yet. beforeMediaId/afterMediaId
// stay null so the UI never presents a fabricated completed job — populate them only
// with real, customer-consented photography.
//
// sampleMediaId is a SEPARATE, clearly-labeled field: an existing repo stock photo shown
// only so the card isn't visually blank while real photos are pending. The UI must always
// render it with a "sample layout" disclosure, never as if it were a real result.
export type ApexResult = {
  id: string;
  category: string;
  label: string;
  caption: string;
  beforeMediaId: MediaId | null;
  afterMediaId: MediaId | null;
  sampleMediaId: MediaId | null;
};

export const apexResults: ApexResult[] = [
  { id: "outdoor-ac-cleaning", category: "Cooling", label: "Outdoor AC unit cleaning", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null, sampleMediaId: "northeastHvac" },
  { id: "refrigerator", category: "Appliance Repair", label: "Refrigerator", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null, sampleMediaId: "applianceService" },
  { id: "dryer", category: "Appliance Repair", label: "Dryer", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null, sampleMediaId: "heroTechnician" },
  { id: "washer", category: "Appliance Repair", label: "Washer", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null, sampleMediaId: "homeInterior" },
  { id: "furnace", category: "Heating", label: "Furnace", caption: "Verified before-and-after photos will appear here once approved.", beforeMediaId: null, afterMediaId: null, sampleMediaId: "serviceDetail" },
];
