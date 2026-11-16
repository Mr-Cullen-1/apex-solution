# Design improvement plan

## Decision

Evolve the blue/navy identity with clearer typography, whitespace and restrained depth. Three approaches were considered: photography-only refinement (fast but less distinctive), full WebGL environment (excessive payload and complexity), and a small CSS 3D cutaway with real service photos elsewhere. Use the third: immediate content, no renderer dependency, manual service selection and accessible links. User's brief authorizes implementation after discovery.

## Implementation sequence

1. Record baseline and source issues; preserve the existing SEO reports.
2. Refine global spacing, shadows, focus indicators and control sizes without changing brand colors.
3. Recompose homepage around NY-first service copy, call/booking actions, a dimensional home explorer and visible category cards.
4. Improve shared service templates, overview links, preparation content and contact messaging.
5. Add meaningful booking validation regression tests; fix phone validation, service selection, accessible errors and scrollable short-screen layout. Keep persistence and notification adapters.
6. Correct title inheritance/social metadata and reviews sitemap discovery without route changes.
7. Run lint, typecheck, production build, domain tests and local rendered-response checks. Record unavailable visual/interaction testing accurately.
8. Deliver Quo plan only, with version-specific API details and explicit approval gate for account mutations.

## Acceptance

All four services directly discoverable; phone (516) 586-0826 centralized; county coverage unchanged; booking context retained; no fake successful request; no added runtime dependency; no autoplay in new scene; reduced-motion fallback; existing routes build; meaningful validation tests pass. Browser and performance measurements are release checks, not implied by a successful build.
