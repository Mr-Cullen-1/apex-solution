# Media strategy

Phase 1 uses four original, temporary images generated with the built-in OpenAI image generation tool on September 5, 2026. They are stored locally in `public/images`, referenced only through `src/content/media.ts`, and marked `temporary: true` so approved production photography can replace them without changing section components.

The client has since confirmed a Northeast service footprint across New York, New Jersey, Connecticut, Massachusetts, and Rhode Island. The current generated images include Southwest architecture, arid terrain, and desert landscaping. They are geographically inaccurate for the final brand and must be replaced with Northeast-appropriate production photography. Their public alt text does not claim a Phoenix or Arizona service location.

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

## Client logo status

The client describes a supplied Apex Home Services raster logo whose artwork contains the older line “Comfort Today. A Brighter Tomorrow.” No logo image file was present in the Phase 1.1 attachment, so it could not be safely added or inspected. The site continues to use the refined text mark. When the file is supplied, preserve the artwork without destructive edits and update or replace the asset through the approved brand-source workflow. Separately rendered copy must continue to use **Reliable Home Services. Local Professionals.**

## Production replacement rules

- Replace assets in `src/content/media.ts`, retaining accurate width, height, focal point, and alt text.
- Obtain usage rights and record photographer/source information before launch.
- Do not label concept imagery as completed Apex work.
- Prefer modern homes, real craftsmanship, natural light, and credible work practices over staged contractor imagery.
