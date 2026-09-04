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
