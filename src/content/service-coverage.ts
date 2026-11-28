import coverage from "./service-coverage-data.json";
import type { ServiceArea } from "@/types/content";

export const serviceAreas = [
  { state: "New York", code: "NY", slug: "new-york", counties: coverage.counties.NY },
  { state: "New Jersey", code: "NJ", slug: "new-jersey", counties: coverage.counties.NJ },
  { state: "Connecticut", code: "CT", slug: "connecticut", counties: coverage.counties.CT },
] as const satisfies readonly ServiceArea[];

export type CoverageState = (typeof serviceAreas)[number]["code"];
export type ZipCoverageResult =
  | { status: "invalid" }
  | { status: "unsupported"; zip: string }
  | { status: "supported"; zip: string; state: CoverageState; stateName: string };

export const coverageZipCounts = {
  NY: coverage.zipCodes.NY.length,
  NJ: coverage.zipCodes.NJ.length,
  CT: coverage.zipCodes.CT.length,
} as const;
export const coverageZipCount = Object.values(coverageZipCounts).reduce((sum, count) => sum + count, 0);
export const coverageCountyCount = serviceAreas.reduce((sum, area) => sum + area.counties.length, 0);

const zipStates = new Map<string, CoverageState>(
  serviceAreas.flatMap((area) => coverage.zipCodes[area.code].map((zip): [string, CoverageState] => [zip, area.code])),
);

/** Exact allowlist lookup. ZIP syntax, geographic coverage and appointment availability are separate. */
export function checkZipCoverage(zip: string): ZipCoverageResult {
  if (zip.length !== 5 || !/^[0-9]{5}$/.test(zip)) return { status: "invalid" };
  const state = zipStates.get(zip);
  if (!state) return { status: "unsupported", zip };
  return { status: "supported", zip, state, stateName: serviceAreas.find((area) => area.code === state)!.state };
}
