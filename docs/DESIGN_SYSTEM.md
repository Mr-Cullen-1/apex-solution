# Design system

## Direction

Premium, restrained home-services brand built on a Dribbble reference's layout language (large rounded canvases, asymmetric split composition, soft floating elements, generous whitespace) and the official Apex logo's own color identity (navy/blue). Superseded Sep 2026: the original editorial/square-edged/navy-copper direction (see git history for the prior version of this file) and a brief green-dominant iteration that used the reference's own palette instead of the client's real brand color — corrected once the official logo files were supplied.

## Foundation tokens

All colors live in `src/app/globals.css`. The brand triad is sampled directly from `apex logo/colored.png` (see `src/content/brand.ts`) — do not hand-pick new hex values without re-sampling the source file.

| Token | Value | Source | Primary use |
| --- | --- | --- | --- |
| `--ink` | `#01213A` | logo window detail | Body text, headings, default dark surface |
| `--brand-dark` | `#003973` | logo "A" leg gradient | Large dark section surfaces, footer |
| `--brand-primary` | `#005098` | logo dominant blue | Primary CTA fill, accent text, focus ring |
| `--brand-accent` | `#0376E7` | logo swoosh highlight | Decorative accents only (not text/button fills — too light for AA text contrast on its own) |
| `--status-live` | `#16A34A` | semantic, not brand | "Live Now" status dot only — green is reserved for this one semantic meaning |
| `--page-bg` | tinted `#F2F4F7` | reference atmosphere | Page canvas |
| `--surface` / `--surface-soft` | white / brand-tinted white | — | Cards, panels |
| `--ink-muted` | `#4B5768` | — | Secondary text |

Legacy Tailwind utility names (`bg-navy`, `bg-warm-white`, `bg-soft-white`, `text-slate`, `border-steel`, `bg-copper`/`text-copper`) are kept as aliases onto the tokens above, so most components never reference hex values directly. `bg-copper` reads as `--brand-primary` (a real, mid-dark blue) — pair it with white text, never `text-navy`, or contrast fails.

## Typography

Geist, self-hosted via `next/font`. Headline scale is heavy but not maximal — `tracking-[-0.03em]`, `leading-[1.02–1.08]` — closer to the reference's confident-but-calm hierarchy than the earlier ultra-condensed editorial treatment.

## Layout and interaction

- Radius system: `--radius-control` (999px, pills), `--radius-card` (20px), `--radius-panel` (28px), `--radius-hero` (32px) — generated as real Tailwind utilities (`rounded-control`, etc.) via `@theme`.
- Shadows: `--shadow-soft/card/hero`, low-opacity ink-tinted, no hard borders as the primary hierarchy device.
- One vertical rhythm: `.section-y` / `.section-y-bottom` / `.section-y-tight` (clamp-based, scales continuously rather than jumping at breakpoints) — apply to every major section instead of ad hoc `py-*` values.
- `[id] { scroll-margin-top: 6.5rem }` is set globally so the sticky header never covers an anchor target.
- Not every section needs its own giant rounded shell — vary between a bordered hero/panel treatment and cards sitting directly on the page canvas (see Brands, Why Apex).

## Carousels

A single primitive family in `src/components/ui/carousel.tsx` (multi-item, scroll-snap based — services, Apex Results) and `hero-image-carousel.tsx` (single dominant image, opacity crossfade — hero only). Both: autoplay pauses on hover/focus, skip autoplay entirely under `prefers-reduced-motion`, no dependency installed.

## Header

Sticky; transparent at the top of the page, transitioning to a bordered/blurred/shadowed floating pill once scrolled (`scrolled` state in `SiteHeader`). No separate utility bar above it. CTA hierarchy left→right: Live Now (small, calm, dot + text) → phone (`brand-primary` pill) → Request service (`ink` pill, secondary weight).

## Brand assets

The only approved logo files are `apex logo/{colored,white,black}.png` (client-supplied, 1254×1254). Copies live in `public/brand/` for in-page use and `src/app/icon.png` / `apple-icon.png` for the browser favicon (Next's file-convention auto-generates the `<link rel="icon">` tags — no manual `metadata.icons` needed). Never redesign or recolor this mark; use `colored` on light surfaces, `white` on dark ones.

## Booking-flow patterns

- Same wizard architecture as before (progress line, stage headings, sticky mobile Back/Continue, optional desktop summary rail) — restyled to rounded controls/cards, unchanged validation/history/focus logic.
- The global mobile action bar is suppressed on `/book`.
- Confirmation styling never implies a transmitted or confirmed appointment while the submission adapter is unconfigured.

## Content integrity carried into visuals

- Apex Results and Reviews render an honest, designed empty state (not fabricated content) until real photography/testimonials are supplied.
- No guarantee/warranty claims appear anywhere in the UI.
- "Live Now" and similar status cues are never conveyed by color alone.
