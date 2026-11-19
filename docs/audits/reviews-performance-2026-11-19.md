# Reviews and homepage performance — 19 November 2026

Scope: investigate the outstanding review-fetch error and mobile home LCP from the 17 November audit. Local changes only; no deployment, database mutation, or real customer submission.

## Review-fetch investigation

- Reproduced `reviews_fetch_failed` in a restricted local build. The underlying Supabase client error was `AggregateError [EACCES]`, before an HTTP response (`status: 0`). Environment variables were present; their values were never printed.
- The same approved-and-consented review query with network permission returned HTTP 200: 3 eligible reviews, including 2 with media.
- Both media objects returned HTTP 200 using short-lived signed read URLs. The final diagnostic also downloaded both complete image bodies (778,597 bytes each). No review text, customer identity, storage path, credentials, or signed URL is included in its output.
- A fresh network-enabled production build completed all 33 static outputs with no `reviews_fetch_failed` warning. The reproduced failure was an execution-environment network restriction, not evidence of a broken query or a reason to loosen database permissions.
- Added `node tests/reviews-health.cjs` as an explicit read-only diagnostic. Run it separately from unit tests in an environment with network access. It exits nonzero for missing configuration, database failures, or inaccessible media. An empty approved feed is a valid result, not fabricated content.
- Initial HEAD checks succeeded, but full GETs exceeded 15 seconds. A separate curl download completed in 26.36 seconds (about 29.5 KB/s); the final diagnostic uses a 45-second media timeout and confirmed both complete downloads. This does not establish ongoing availability or the production hosting environment.

### Remaining local image-optimizer limitation

Browser scans recorded HTTP 500/504 from `/_next/image` for review photos. The installed Next.js `fetchExternalImage` uses a 7-second abort signal, shorter than the observed upstream transfers on this connection. The review cards correctly fell back to text, so a zero-broken-images DOM count alone would have missed the failures. No arbitrary optimizer bypass, timeout patch, or weaker storage permissions was introduced. Verify cold-cache optimized photo delivery on the actual staging/production host; it is not certified by this local run.

The populated `/reviews` page also exposed insufficient date-label contrast (3.18:1). Removed the opacity modifier from the existing `text-slate` token so the date has normal text contrast; no palette or content change.

## Homepage rendering change

The baseline mobile LCP element was the H1, not an image. A browser trace recorded an initial document layout of 1,877 ms across 814 layout objects under 4x CPU throttling. Removing scripts or balanced wrapping in isolated experiments did not remove the bottleneck. Deferring offscreen layout reduced the experimental LCP from 3,204 to 2,296 ms.

The homepage now opts its sections below the hero and its footer into `content-visibility: auto`, with a remembered intrinsic size and a 700px initial estimate. The browser renders sections as they approach the viewport. The hero is excluded, all content remains server-rendered, and print uses normal rendering. No new dependency, dynamic loading component, or change to business content was introduced.

This uses the browser's [content-visibility behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content-visibility). Browsers without support retain ordinary rendering. Scroll, focus, print, and visual checks are required because estimated offscreen heights can affect scroll behavior.

## Measurement and validation

Initial matching fallback-build measurements used three fresh contexts per route/profile, Chromium 153.0.8010.12, 4x CPU, 1.6 Mbps down, 0.75 Mbps up, and 150ms latency:

- Mobile home LCP: before 3,088 / 3,256 / 3,392 ms; after 1,764 / 3,048 / 2,460 ms. Median 3,256 → 2,460 ms (24.4% lower).
- The range is wide, and unchanged service-page timings also varied. This initial result is not a field Core Web Vitals result or a production guarantee.
- A separate interleaved comparison on the live-review build is recorded under ignored `docs/qa/current/2026-11-19/interleaved-performance.json`. Both modes use identical HTML interception; the baseline disables only the new containment rules. Sample order alternates to reduce ordering bias.

Interleaved live-review results (five contexts per mode):

| Mode | LCP samples (ms) | Median | Range | Initial CLS |
| --- | --- | --- | --- | --- |
| Containment disabled | 4036, 2288, 3368, 3880, 3548 | 3548 | 2288–4036 | 0 |
| Final containment | 2268, 2228, 2264, 2184, 2280 | 2264 | 2184–2280 | 0 |

Median improvement: 36.2%. All ten samples contained the real reviews section and used the H1 as LCP. These are local controlled measurements, not production or field results.

Completed checks: lint, typecheck, production build, and 12 domain/rendered-SEO tests. Typecheck was rerun after build: an earlier concurrent run encountered the temporarily absent generated `.next/types/routes.js`; the sequential run passed without changing application types.

Browser checks:

- The full interaction run covered 45 scenarios across desktop, tablet, and mobile. It passed 44 initially; the tablet home-explorer test still assumed the older visibility breakpoint. After aligning that test with the existing disclosure behavior, the focused explorer/reduced-motion rerun passed on all three profiles. Other updated stale selectors covered the current booking dialog title, quick-navigation dock, and service picker. These were harness changes, not product behavior changes.
- Homepage and `/reviews` were scanned at 390, 768, and 1440px: HTTP 200, no horizontal overflow, no remaining broken-image elements. Image optimizer errors and the initial review contrast finding are described above rather than counted as successful image delivery.
- Scroll through every homepage section, focus a footer link, normal print rendering, and horizontal overflow checks passed at 320, 390, 768, and 1440px. Mobile and desktop home screenshots were visually inspected.
- Booking responses in browser tests were intercepted; no real lead, chat message, email, or Telegram notification was sent.

After the contrast fix, `/reviews` passed the axe WCAG A/AA scan at all three viewports with zero violations and no horizontal overflow. The two image-optimizer console errors per viewport remained, consistent with the upstream transfer limitation above. Final lint, sequential typecheck, network-enabled build, 12 domain/rendered-SEO tests, and `git diff --check` passed. No blanket claim of clean image delivery or a production release is made.

## Remaining work

- Staging/production verification and field performance remain separate from local measurements.
- Cold-cache review photo optimization remains unverified on staging/production; the local slow-transfer limitation is documented above.
- Real booking persistence and notification delivery are not established by intercepted browser tests.
- Owner inputs for privacy/terms, analytics, warranties, service scope, and location content are still outstanding in `docs/BUSINESS_FACTS.md`.
- No merge, push, or deployment is included in this checkpoint.

Raw screenshots, traces, diagnostic experiments, and timing samples live in ignored `docs/qa/current/2026-11-19/`; this report retains the durable summary.
