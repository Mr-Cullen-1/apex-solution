# Phase 1.1 — Business data alignment

## Confirmed brand identity

- Public name: **Apex Home Services**
- Confirmed tagline: **Reliable Home Services. Local Professionals.**
- Internal repository name: `apex-solution` (unchanged)

The referenced raster logo contains the older tagline “Comfort Today. A Brighter Tomorrow.” The actual logo file was not included in the available attachment. No artwork was recreated or modified. Separately rendered brand copy uses the confirmed tagline.

## Confirmed geographic coverage

The shared `serviceAreas` dataset contains 29 confirmed counties grouped under New York, New Jersey, Connecticut, Massachusetts, and Rhode Island. The homepage provides keyboard-accessible state tabs on desktop and complete stacked state groups on mobile. No county landing pages were generated.

## Supported brands

The shared `supportedBrands` dataset contains:

- 11 appliance brands
- 6 premium-appliance brands
- 10 HVAC brands

“Brands We Service” states only that Apex works on the listed brands. It does not represent factory authorization, manufacturer certification, dealership, partnership, or warranty authorization. Brand names are displayed as text; no trademark logos are used.

## ZIP availability limitation

The homepage accepts a required five-digit ZIP code using native browser validation and forwards it to the existing contact route with `intent=zip-coverage`. There is no ZIP coverage database or API, so the interface does not generate an availability result or claim that a ZIP is serviced. Phase 2A can connect this form to a verified coverage service or booking adapter.

## Media requiring replacement

The generated hero, interior, and exterior images contain Southwest or desert cues and remain temporary, geographically inaccurate concept assets. The diagnostic equipment detail is comparatively neutral. See `docs/MEDIA.md` for asset-level replacement notes.

## Missing business information

Phone, email, street address, hours, licenses, credentials, reviews, project facts and statistics, guarantees, response times, emergency or 24/7 availability, pricing, financing provider and rates, warranties, manufacturer authorizations, and exact ZIP-level coverage remain unresolved.

## Phase 2A implications

Service templates should consume the confirmed company, service-area, and supported-brand datasets. Booking should accept the ZIP intent without assuming availability, isolate future coverage logic behind an integration adapter, and preserve the current no-fabrication rule.
