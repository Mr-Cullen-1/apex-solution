import type { MediaId } from "./media";

// Only genuine, client-approved before/after photography is listed here. beforeMediaId/
// afterMediaId stay null (with a sampleMediaId fallback) for any job that doesn't yet have
// approved real photos, so the UI never presents a fabricated completed job.
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

// Four real, approved before/after pairs exist today. Do not pad this list with fake or
// generic sample jobs to hit a round number — the UI renders gracefully with any count.
export const apexResults: ApexResult[] = [
  { id: "outdoor-ac-cleaning", category: "Cooling", label: "Outdoor AC Unit Cleaning", caption: "A dirty outdoor condenser coil cleaned to restore proper airflow.", beforeMediaId: "realResultHvacBefore", afterMediaId: "realResultHvacAfter", sampleMediaId: null },
  { id: "dryer-vent-cleaning", category: "Appliance Repair", label: "Dryer Vent Cleaning", caption: "A dryer lint trap clogged with compacted lint, cleaned to help reduce fire risk and restore airflow.", beforeMediaId: "realResultDryerBefore", afterMediaId: "realResultDryerAfter", sampleMediaId: null },
  { id: "ice-maker-replacement", category: "Appliance Repair", label: "Ice Maker Replacement", caption: "A failed ice maker assembly replaced in a refrigerator freezer door.", beforeMediaId: "realResultIceMakerBefore", afterMediaId: "realResultIceMakerAfter", sampleMediaId: null },
  { id: "refrigerator-control-board-replacement", category: "Appliance Repair", label: "Refrigerator Control Board Replacement", caption: "A refrigerator control board replaced and reinstalled to restore proper operation.", beforeMediaId: "realResultControlBoardBefore", afterMediaId: "realResultControlBoardAfter", sampleMediaId: null },
];
