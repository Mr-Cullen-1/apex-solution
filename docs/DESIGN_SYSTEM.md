# Design system

## Service workspace update (2026-11-16)

The current public UI uses an application-style service workspace. This section supersedes the older header, mobile action bar and booking wizard descriptions below.

- Homepage: compact editorial introduction, four labeled service choices, immediate contextual booking, service-detail links and a separate optional home illustration. Service choice always works without the illustration.
- Mobile and tablet: Home / Services / Help / Call / Book dock below 1280px, with current-page state and safe-area padding owned by the marketing shell. Dock booking preserves the homepage selection or current service route. Header call/booking remain visible. The full wordmark starts at 1024px to prevent intermediate-width crowding. Desktop help uses a 44px icon button in the right gutter, with an accessible name and tooltip, to avoid covering content actions; smaller screens use Help in the dock.
- CSS illustration: token-based navy technical canvas, differentiated equipment, 2D/3D switches, manual rotation, selected equipment highlight. Below 900px it opens only on request. No WebGL dependency, autoplay or scroll interception.
- Services: searchable directory and direct subservice links; compact photo-led category/detail heroes with section shortcuts. Five process cards become two columns on tablets, five only on large desktops.
- Booking: the existing single-form bottom sheet/modal uses a dynamic-viewport bound, compact phone/ZIP row and sticky submit section. At viewport heights of 480px or less, the header compacts and submit returns to normal flow to preserve room for form fields. Request/appointment semantics, consent and adapters are unchanged.
- Chat: the empty-state content scrolls independently of the composer, starts at the top on short screens, and uses 44px quick-action/close targets. Decorative content yields space to actionable controls.
- Motion: short hover and state transitions; all respect reduced motion. Content is available immediately. At short phone heights the service tiles simplify; content remains naturally scrollable, never forced into a clipped fixed-height page.

New scene and dock tokens live in `globals.css`; existing brand colors are retained. The component review and code checks do not substitute for visual QA. See `UX_UI_AUDIT_2026-11-16.md` for verification evidence and remaining device checks.

## Direction

Premium, restrained home-services brand built on a Dribbble reference's layout language (large rounded canvases, asymmetric split composition, soft floating elements, generous whitespace) and the official Apex logo's own color identity (navy/blue). Superseded Sep 2026: the original editorial/square-edged/navy-copper direction (see git history for the prior version of this file) and a brief green-dominant iteration that used the reference's own palette instead of the client's real brand color — corrected once the official logo files were supplied.

## Footer redesign (2026-11-13)

The supplied footer concept explicitly adds a scoped palette in `globals.css`:
`--footer-start` (#062B4E), `--footer-end` (#031C34), and `--footer-accent`
(#38BDF8), with light text, muted text, border, and panel tokens. This is an
approved exception to the logo-sampling rule below; other surfaces keep their
existing brand colors.

The footer uses one column on phones, two at `md`, and a 12-track grid at `lg`
with spans 4/3/2/3 for brand, residential, commercial, and HVAC respectively.
Category headings are uppercase sky blue with thin dividers. The brand column
contains the official white mark, centralized description, linked state badge,
phone action, and solid blue Book Now trigger. The `footer-primary` button
variant owns both its default and hover color pairs.

Links change color on hover, links and buttons move 3px when motion is allowed,
and focus outlines use the footer accent. Reduced motion disables translations,
including the booking arrow. Mobile bottom padding reserves room for the sticky
action bar. The bottom bar contains copyright; legal links were explicitly
excluded by the user. No policy pages or legal promises are introduced.

## Foundation tokens

All colors live in `src/app/globals.css`. The brand triad is sampled directly from `public/brand/apex-mark-colored.png` (see `src/content/brand.ts`) — do not hand-pick new hex values without re-sampling the source file.

| Token | Value | Source | Primary use |
| --- | --- | --- | --- |
| `--ink` | `#01213A` | logo window detail | Body text, headings, default dark surface |
| `--brand-dark` | `#003973` | logo "A" leg gradient | Large dark section surfaces, footer |
| `--brand-primary` | `#005098` | logo dominant blue | Primary CTA fill, accent text, focus ring |
| `--brand-accent` | `#0376E7` | logo swoosh highlight | Decorative accents only (not text/button fills — too light for AA text contrast on its own) |
| `--status-live` | `#16A34A` | semantic, not brand | Positive/live state — the public site's "Live Now" dot, and (Admin) approved reviews, sent deliveries, active admins |
| `--status-critical` | `#C0362C` | semantic, not brand | Admin-only — genuine operational failures (Telegram/Email delivery failed, cancelled requests). Never a brand accent. |
| `--status-pipeline-1..4` | `color-mix` steps of `--brand-primary` | derived | Admin-only — chart **mark** fills for the request-pipeline donut (ordinal ramp, NEW→COMPLETED). Not used for text/badges — see `docs/ADMIN_ARCHITECTURE.md` §40. |
| `--page-bg` | tinted `#F2F4F7` | reference atmosphere | Page canvas |
| `--surface` / `--surface-soft` | white / brand-tinted white | — | Cards, panels |
| `--ink-muted` | `#4B5768` | — | Secondary text |

Legacy Tailwind utility names (`bg-navy`, `bg-warm-white`, `bg-soft-white`, `text-slate`, `border-steel`, `bg-copper`/`text-copper`) are kept as aliases onto the tokens above, so most components never reference hex values directly. `bg-copper` reads as `--brand-primary` (a real, mid-dark blue) — pair it with white text, never `text-navy`, or contrast fails.

## Typography

The Resources section uses the same tokens, Geist and section spacing. Its editorial hero, topic navigation and honest empty state introduce no new colors. Article/card images reserve a 16:9 region; `.resource-prose` scopes readable H2/H3, list and callout styles to article bodies. Native FAQ disclosures require no added client JavaScript. Article 1 AI illustrations carry visible provenance captions (including an optional featured-image caption); source links remain underlined and announce new-tab behavior accessibly. Missing editorial photography stays null; the empty-state house drawing is a decorative placeholder, not a claimed asset.

Geist, self-hosted via `next/font`. Headline scale is heavy but not maximal — `tracking-[-0.03em]`, `leading-[1.02–1.08]` — closer to the reference's confident-but-calm hierarchy than the earlier ultra-condensed editorial treatment.

## Layout and interaction

- Radius system: `--radius-control` (999px, pills), `--radius-card` (20px), `--radius-panel` (28px), `--radius-hero` (32px) — generated as real Tailwind utilities (`rounded-control`, etc.) via `@theme`.
- Shadows: `--shadow-soft/card/hero`, low-opacity ink-tinted, no hard borders as the primary hierarchy device.
- One vertical rhythm: `.section-y` / `.section-y-bottom` / `.section-y-tight` (clamp-based, scales continuously rather than jumping at breakpoints) — apply to every major section instead of ad hoc `py-*` values.
- `[id] { scroll-margin-top: 6.5rem }` is set globally so the sticky header never covers an anchor target.
- Not every section needs its own giant rounded shell — vary between a bordered hero/panel treatment and cards sitting directly on the page canvas (see Brands, Why Apex).

## Carousels

The active carousel primitive is `src/components/ui/carousel.tsx` (multi-item, scroll-snap based — services, Apex Results). It respects reduced motion and requires no additional dependency. The unreferenced hero-image carousel was removed during the 17 November cleanup; the current home illustration and service hero are unchanged.

## Header

Sticky; transparent at the top of the page, transitioning to a bordered/blurred/shadowed floating pill once scrolled (`scrolled` state in `SiteHeader`). No separate utility bar above it. The header uses the neutral Contact Apex label, phone and Book Now actions. A live-presence indicator requires a real availability signal.

## Brand assets

The approved client-supplied logos are `public/brand/apex-mark-{colored,white,black}.png` (1254×1254). The duplicate `apex logo/` copies were removed after SHA-256 equality checks. `src/app/icon.png` (64×64) and `apple-icon.png` (180×180) are resized derivatives for Next's file-based icon metadata. Never redesign or recolor the mark; use colored on light surfaces and white on dark ones.

## Booking-flow patterns

- Same wizard architecture as before (progress line, stage headings, sticky mobile Back/Continue, optional desktop summary rail) — restyled to rounded controls/cards, unchanged validation/history/focus logic.
- The global mobile action bar is suppressed on `/book`.
- Confirmation styling never implies a transmitted or confirmed appointment while the submission adapter is unconfigured.

## Content integrity carried into visuals

- Blog layouts share the existing shell, brand tokens and article typography. The responsive listing uses one featured card, a 1/2/3-column guide grid, labeled title/keyword search and grouped category filtering. Article pages preserve original Word formatting, a sticky desktop table of contents, readable body width and focusable horizontal table scroll regions. A one-article category shows its featured article without a contradictory empty-result message.
- Blog imagery uses fixed 16:9 dimensions with `next/image`, descriptive alt text and visible disclosure for AI editorial illustrations. Generated illustrations are never presented as photographs of Apex service visits. Article CTAs reuse the existing booking modal and approved phone/hours/pricing terms. The shared ZIP checker uses text input with a numeric keyboard hint, a linked invalid-input error and live coverage results.

- The homepage uses screen-only `content-visibility: auto` below the hero and on its footer, with `contain-intrinsic-size: auto 700px`. Keep content server-rendered and retain normal print rendering. Recheck scrolling, focus and viewport layout when changing section sizes; see the [19 November performance evidence](audits/reviews-performance-2026-11-19.md).
- Review dates use the full `text-slate` token. Do not reintroduce the opacity modifier: it failed normal-text contrast on the review-card background.

- Apex Results and Reviews render an honest, designed empty state (not fabricated content) until real photography/testimonials are supplied.
- No guarantee/warranty claims appear anywhere in the UI.
- "Live Now" and similar status cues are never conveyed by color alone.

## Admin dashboard (internal, `/admin`)

A separate operational surface — never the public shell above (see
`src/app/admin/(dashboard)/layout.tsx`), built on the same foundation
tokens plus the two admin-only semantic additions in the table above
(`--status-critical`, `--status-pipeline-1..4`). Its own reusable
primitives (`src/components/admin/ui/`, `src/components/admin/charts/`),
badge/status system, and zero-dependency chart components are documented in
full in `docs/ADMIN_ARCHITECTURE.md` §40 — that's the source of truth for
anything admin-specific; this file stays scoped to the public site.
