/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the actual TypeScript lookup without an extra test dependency. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const data = require("../src/content/service-coverage-data.json");
const file = path.resolve(__dirname, "../src/content/service-coverage.ts");
const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", code)((name) => require(path.resolve(path.dirname(file), name)), loaded, loaded.exports);
const { checkZipCoverage, coverageZipCounts, coverageZipCount, coverageCountyCount, serviceAreas } = loaded.exports;

test("the approved workbook dataset has 721 unique five-digit ZIP strings and 18 counties in three states", () => {
  assert.deepEqual(coverageZipCounts, { NY: 363, NJ: 236, CT: 122 });
  assert.equal(coverageZipCount, 721);
  assert.equal(coverageCountyCount, 18);
  assert.deepEqual(serviceAreas.map((area) => area.code), ["NY", "NJ", "CT"]);
  assert.deepEqual(serviceAreas.map((area) => area.counties.length), [6, 9, 3]);
  assert.deepEqual(Object.keys(data.zipCodes), ["NY", "NJ", "CT"]);
  const zips = Object.values(data.zipCodes).flat();
  assert.equal(new Set(zips).size, 721);
  for (const zip of zips) {
    assert.equal(typeof zip, "string");
    assert.match(zip, /^[0-9]{5}$/);
  }
});

test("every source ZIP resolves to its source state without an inferred county", () => {
  for (const [state, zips] of Object.entries(data.zipCodes)) {
    for (const zip of zips) {
      const result = checkZipCoverage(zip);
      assert.equal(result.status, "supported", zip);
      assert.equal(result.zip, zip);
      assert.equal(result.state, state);
      assert.equal("county" in result, false);
    }
  }
});

test("leading zeros remain significant across all three states", () => {
  assert.equal(checkZipCoverage("00501").state, "NY");
  assert.equal(checkZipCoverage("07001").state, "NJ");
  assert.equal(checkZipCoverage("06401").state, "CT");
  assert.equal(checkZipCoverage("11201").state, "NY");
  for (const zip of ["501", "7001", "6401"]) assert.equal(checkZipCoverage(zip).status, "invalid");
});

test("invalid syntax is separate from valid but unsupported ZIPs, including MA and RI", () => {
  for (const zip of ["", "1120", "112011", "11201-1234", "abcde", " 07001", "07001 ", "07001\n", "１２３４５", "07 01"]) {
    assert.deepEqual(checkZipCoverage(zip), { status: "invalid" }, JSON.stringify(zip));
  }
  for (const zip of ["02108", "02903", "90210", "00000", "99999", "10001"]) {
    assert.deepEqual(checkZipCoverage(zip), { status: "unsupported", zip });
  }
});

test("workbook provenance is pinned and demand or ZIP-to-county claims are not imported", () => {
  assert.equal(data.sourceFile, "Apex_Home_Services_ZIP_Coverage_and_Search_Demand.xlsx");
  assert.equal(data.sourceSha256, "e914f2d04fb64d45685c6ebed09049f1caea4629a826e9e45e1361d749b33364");
  assert.deepEqual(Object.keys(data), ["sourceFile", "sourceSha256", "zipCodes", "counties"]);
});
