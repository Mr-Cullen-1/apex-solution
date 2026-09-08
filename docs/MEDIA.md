# Media strategy

Phase 1 and Phase 2A use six original, temporary images generated with the built-in OpenAI image generation tool on September 5, 2026. They are stored locally in `public/images`, referenced only through `src/content/media.ts`, and marked `temporary: true` so approved production photography can replace them without changing section components.

The client has since confirmed a Northeast service footprint across New York, New Jersey, Connecticut, Massachusetts, and Rhode Island. Three legacy Phase 1 images include Southwest architecture, arid terrain, and desert landscaping. They are geographically inaccurate for the final brand and must be replaced with Northeast-appropriate production photography. Their public alt text does not claim a Phoenix or Arizona service location.

## Asset inventory and prompts

### `apex-hero-technician.png`

Premium home-services hero photograph of a navy-uniformed HVAC technician diagnosing residential comfort equipment in a modern Southwest home. Portrait editorial composition, warm desert daylight, architectural negative space, no text, logos, direct eye contact, or staged gestures.

**Replacement status:** required; visible arid landscape and Southwest architecture are not representative of the confirmed service region.

### `apex-service-detail.png`

Close editorial photograph of gloved hands using a diagnostic tool on clean residential HVAC equipment. Landscape crop, realistic trade detail, natural side light, navy and steel palette, no text, logos, unsafe work, or dramatic effects.

**Replacement status:** optional; the close equipment crop is geographically neutral.

### `apex-home-interior.png`

Architectural photograph of a calm modern Southwest living room with soft airflow, warm natural materials, desert landscape, and subtle comfort-system details. Portrait composition, no people, text, logos, or resort styling.

**Replacement status:** required; the landscape and architectural cues are not representative of the confirmed service region.

### `apex-home-exterior.png`

Blue-hour architectural photograph of a contemporary Phoenix Valley home with desert landscaping and discreet residential comfort equipment. Wide composition, deep navy sky, warm interior light, no people, vehicles, logos, or oversaturated HDR treatment.

**Replacement status:** required; the desert landscaping is geographically inaccurate for final use.

### `apex-appliance-service.png`

Premium editorial residential service photograph of a professional technician in a clean navy work uniform diagnosing a built-in refrigerator in an upscale Northeast US kitchen. Natural window light, warm white cabinetry, subtle autumn greenery outside, candid working posture, realistic tools, no text, logo, badge, direct eye contact, exaggerated expression, or visible brand marks. Wide landscape composition with useful negative space and a calm navy, warm-white, steel, and natural-wood palette.

**Replacement status:** temporary but regionally appropriate; replace with rights-cleared Apex photography when available.

### `apex-northeast-hvac.png`

Premium editorial residential HVAC service photograph of a professional technician in a clean navy work uniform inspecting an outdoor heat-pump or AC condenser beside a well-kept Northeast US clapboard home. Early autumn deciduous trees, cool natural daylight, realistic tools, safe working posture, no text, logo, badge, direct eye contact, dramatic effects, desert plants, or visible manufacturer marks. Wide landscape composition with architectural negative space and restrained navy, warm-white, slate, and copper-adjacent tones.

**Replacement status:** temporary but regionally appropriate; replace with rights-cleared Apex photography when available.

## Phase 3 usage (reference-driven redesign, Sep 2026)

The redesign stopped placing `apex-hero-technician.png`, `apex-home-interior.png`, and `apex-home-exterior.png` (the three geographically inaccurate Southwest/desert concepts) in any new component. The new homepage hero, "What can we help with?" grid, and final CTA banner now reuse only `apex-northeast-hvac.png`, `apex-appliance-service.png`, and `apex-service-detail.png` — the three assets already flagged as regionally appropriate or geographically neutral. The three Southwest assets remain in `src/content/media.ts` (still `temporary: true`) but are no longer referenced by any component; they can be removed once confirmed unnecessary, or replaced if a future page needs a fourth distinct image.

No new photography was generated or sourced in Phase 3. The "Apex Results" before/after section ships with all `beforeMediaId`/`afterMediaId` values `null` in `src/content/results.ts` — see the no-fabrication note there — pending real, customer-approved job photography.

## Client logo status

The client describes a supplied Apex Home Services raster logo whose artwork contains the older line “Comfort Today. A Brighter Tomorrow.” No logo image file was present in the Phase 1.1 attachment, so it could not be safely added or inspected. The site continues to use the refined text mark. When the file is supplied, preserve the artwork without destructive edits and update or replace the asset through the approved brand-source workflow. Separately rendered copy must continue to use **Reliable Home Services. Local Professionals.**

## Phase 2C usage

Phase 2C generated no new media. The About page reuses `apex-northeast-hvac.png` with an explicit public caption identifying it as temporary conceptual service imagery—not an actual Apex employee or completed project. Service Areas, Brands, and Contact remain typography-led. No legacy Southwest asset is used as a prominent identity element on these pages.

## Production replacement rules

- Replace assets in `src/content/media.ts`, retaining accurate width, height, focal point, and alt text.
- Obtain usage rights and record photographer/source information before launch.
- Do not label concept imagery as completed Apex work.
- Prefer modern homes, real craftsmanship, natural light, and credible work practices over staged contractor imagery.
