# Design system

## Direction

Premium Technical Home Services: warm, architectural, precise, and approachable. The system avoids generic red/blue contractor styling, SaaS patterns, glass effects, and ornamental luxury cues.

## Foundation tokens

| Token | Value | Primary use |
| --- | --- | --- |
| Apex Navy | `#101D2C` | Type, dark surfaces, primary actions |
| Warm White | `#F7F6F2` | Primary page surfaces |
| Soft White | `#FAF9F6` | Alternate light surfaces |
| Slate | `#66717D` | Secondary text |
| Steel | `#D9DEE2` | Borders and quiet dividers |
| Copper | `#B9784B` | Small accents and focus indicators |

Copper should occupy roughly five percent of a composition. Use borders, spacing, hierarchy, and imagery before adding shadows or color effects.

## Typography

Geist is self-hosted through the official `geist` package and `next/font/local` as the primary contemporary sans-serif. Headings use tight tracking and deliberate line lengths; body copy prioritizes readability. A secondary typeface should only be introduced if Phase 1 compositions demonstrate a clear need.

## Layout and interaction

- Maximum content width: 90rem with fluid page gutters.
- Tap targets: at least 48px for primary mobile actions.
- Corners: square by default; subtle rounding only when it communicates containment.
- Motion: short, quiet, and optional. Honor reduced-motion preferences.
- Focus: visible copper outline with adequate offset.
- Imagery: professional homes, systems, and craftsmanship; never imply a real employee or project without approval.

## Phase 1 visual language

- Display typography uses fluid `clamp()` sizing, tight tracking, and intentionally short line lengths.
- Section rhythm alternates expansive editorial layouts, compact trust bands, dark signature moments, image-led work, and focused conversion areas.
- Components remain mostly square-edged. Borders and contrast establish hierarchy before shadows.
- Hover motion is limited to short arrow shifts, one-pixel elevation, and subtle image scaling.
- Homepage entrance motion uses CSS only and is disabled through the global reduced-motion rule.
- Temporary imagery and its replacement contract are documented in `docs/MEDIA.md`.

## Service-page patterns

- Service discovery uses numbered editorial directories, divided lists, and asymmetric text/image compositions rather than repeated rounded cards.
- Category pages share a section system but vary their light surface treatment and available content according to taxonomy data.
- Individual services use restrained symptom callouts, a five-step visit framework, contextual relationships, relevant brand groups, and a compact five-state coverage band.
- Native disclosure elements provide service FAQs without adding client JavaScript. Primary booking actions use the shared `BookingLink` boundary.

## Booking-flow patterns

- Booking uses an editorial progress line, large stage headings, square bordered choices, and an optional sticky desktop summary rail.
- Mobile receives a dedicated sticky Back/Continue action area; the global mobile action bar is suppressed on `/book` to avoid competing controls.
- Input errors appear beside their fields and in a focus-managed step summary. Choice tiles expose visible keyboard focus through their containing labels.
- Confirmation styling distinguishes a locally prepared request from a transmitted or confirmed appointment. No success language may imply delivery while the adapter is unconfigured.
