# Responsive service workspace audit and implementation

## Intent and design
Make the existing multi-page Apex site feel like a clear service application: identify the service, understand the next step, and request a visit or call. Retain brand tokens, real photography, public routes and existing submission integrations. Conversion is a design objective, not a guaranteed visitor outcome.

Source audit found: the mobile hero puts a long introduction and decorative scene before service selection; the explorer only links to another page instead of carrying selection into booking; the bottom bar duplicates two header actions without navigation; tablet has no bottom navigation; active page state is absent; service heroes are oversized on small screens; booking's action can be far below the keyboard; scene rotation has no 2D alternative.

Approaches considered: cosmetic cleanup leaves task discovery unresolved; a WebGL tour adds weight and hides information behind exploration; an application-style workspace with optional CSS 3D preserves immediate task access. The last approach is the implementation decision under the user's request to complete the redesign.

## Implementation plan
- [x] Recompose the homepage around four explicit service choices, contextual booking and a short explanation of follow-up.
- [x] Improve the CSS home illustration with distinct equipment, a 2D plan, view controls and a compact mobile opt-in.
- [x] Add Home / Services / Help / Call / Book navigation below desktop, active route states and safe-area spacing.
- [x] Tighten shared service heroes and preserve service context. Reduce mobile service-card height.
- [x] Improve booking sheet spacing and sticky submit action without changing payload, consent or backend semantics.
- [x] Run lint, typecheck, build and existing booking model tests. Record browser QA limits.

## Review focus
320px widths, short landscape screens and 200% text enlargement must retain natural scrolling rather than clipping content. Dialogs must fit dynamic viewport height. Active navigation must match nested service routes. No new availability, prices, reviews or guarantees. Reduced motion stops transitions. Admin surfaces stay separate.

## Verification
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed; all 33 generated pages completed. The sandbox initially blocked the TypeScript worker (`spawn EPERM`); the authorized build outside the sandbox completed.
- `node tests/booking-model.test.cjs`: 4 passed. The direct invocation avoids the sandbox child-process restriction of `node --test` while running the same Node tests.
- `node tests/service-search.test.cjs`: 3 passed. Regression coverage rejects substring false positives and retains prefix, hyphenated and empty-query behavior. The substring regression failed before the fix and passed afterward.
- Existing local HTTP suite: 19 public pages, 12 supporting route checks, sitemap and two invalid booking bodies passed. No valid request or notification submitted. Evidence: `audits/service-workspace-2026-11-16/http-validation.json`.
- Additional read-only HTTP check: all 19 public pages have unique element IDs and valid same-page anchor targets.
- React/source review: narrow client state boundaries, primitive props to the service directory, no added runtime dependency, existing adapters preserved, route-based booking context, 44px view controls and small-screen rotation checked in source.

The initial browser connection failure was resolved in the follow-up session using a separate native Chrome window. Actual screenshots and interactions were reviewed in Chrome DevTools responsive emulation at 320x568, 390x844, 568x320, 768x1024, 1024x768 and 1440x900, plus a maximized desktop at 200% browser zoom. These are emulated viewports, not physical-device results. Detailed findings and rechecks are recorded in `audits/service-workspace-2026-11-16/browser-qa.md`.

Browser-discovered fixes: compact phone hero spacing and single-line dock labels; shared homepage selection for dock booking; word-prefix service search; desktop help moved out of the content action area; short-height booking layout; independently scrollable chat content and larger quick-action/close targets. Each was visually rechecked after its change.

## Remaining release checks

Physical iOS/Android devices and virtual keyboards, Safari/Firefox, screen-reader announcements, Web Vitals and live end-to-end booking/notification/AI delivery remain unverified. No real lead, AI message or phone call was sent during this audit. Final production conversion performance requires measurement; no booking/call outcome is guaranteed by these changes.
