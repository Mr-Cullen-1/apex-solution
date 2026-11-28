# Service coverage

## Source and approved scope

The source is the user-supplied `Apex_Home_Services_ZIP_Coverage_and_Search_Demand.xlsx`, reviewed on 2026-11-28. Its SHA-256 is `e914f2d04fb64d45685c6ebed09049f1caea4629a826e9e45e1361d749b33364`. The original file is read-only input and is not committed to the site.

`ZIP Codes!A2:B722` supplies exactly 721 distinct ZIP strings: New York 363, New Jersey 236, Connecticut 122. The committed JSON preserves every five-character ZIP verbatim, including leading zeros. Coverage uses exact membership, never numeric ranges, prefixes or statewide assumptions.

`County Coverage!A2:B19` supplies the 18 county names for these three approved states:

- NY: Kings, Bronx, Nassau, Suffolk, Westchester, Rockland (6).
- NJ: Middlesex, Monmouth, Ocean, Union, Essex, Morris, Passaic, Bergen, Somerset (9).
- CT: Fairfield, New Haven, Litchfield (3).

The source workbook still contains a legacy total of **29 counties across five states** in `Summary!C9`, with MA and RI county rows in `County Coverage!A20:B30`. `Summary!A7:D8` records their ZIP lists as missing. The user's approved public scope explicitly excludes MA and RI, so only NY/NJ/CT ZIPs and the 18 corresponding county entries are imported. The site's 18-county total is this approved subset, not the workbook's legacy aggregate.

## What the data does not establish

`ZIP Codes!C2:C722` is blank and labeled `County (crosswalk required)`. No ZIP-to-county relationship is inferred, and lookup results identify only the state provided in the workbook. County names and the ZIP allowlist are separate source lists; county display does not imply that every ZIP in a county is served or that the ZIP list has been reconciled to county boundaries. A verified crosswalk would be required for county-level matching.

Demand and lead columns in the ZIP sheet are blank; demand status says **NOT MEASURED — import Keyword Planner data**. No search demand, modeled leads, actual leads, ranking or performance claim is displayed or imported. Workbook methodology describes an optional estimate scenario; that is not an observed result.

Geographic inclusion does not promise a specific service, technician, arrival time or appointment. The team confirms service details and scheduling. Out-of-list ZIPs receive contact options with no availability promise; they do not receive a positive coverage result.

## Implementation

- `src/content/service-coverage-data.json`: extracted ZIP strings and separate county lists, plus source filename/hash.
- `src/content/service-coverage.ts`: shared state directory, derived counts and exact `checkZipCoverage` lookup.
- `src/content/site.ts`: re-exports the shared directory for existing consumers.
- `src/components/service-areas/zip-coverage-checker.tsx`: small client boundary used on the homepage and `/service-areas`.

The input is text with a numeric keyboard hint to retain leading zeros. Exactly five ASCII digits are accepted; letters, spaces, ZIP+4, short/long strings and trailing newlines are invalid. Invalid entries retain focus with a linked error; changes clear stale results; submitted coverage results are announced in a live region. Supported results use the existing `BookingLink` and shared modal flow. Unsupported results use centralized contact details and the contact page. No backend, database or booking validation behavior changes are required for this advisory checker.

## Re-extraction and verification

Run from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/extract-zip-coverage.ps1 -WorkbookPath 'C:\Users\User\Downloads\Apex_Home_Services_ZIP_Coverage_and_Search_Demand.xlsx'
node --test tests/service-coverage.test.cjs
```

The extractor reads the Open XML ZIP with native .NET; it does not open Excel, write the source workbook or query external data. It rejects duplicate ZIPs, malformed ZIP strings, unexpected states, changed expected totals and newly populated county mappings that need review. Source hash and the documented ranges must be reviewed when replacing the source file. Unit tests exercise every imported ZIP, leading-zero behavior, invalid inputs, valid out-of-list ZIPs and MA/RI examples.
