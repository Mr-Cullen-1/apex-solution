# Apex Home Services — Visual QA Report

Date: 16 November 2026. Target: `http://127.0.0.1:3123`. Actual headless Chromium 149.0.7827.55 execution on Windows, using Playwright Core 1.65.1 and axe-core 4.13.0.

**Ready for staging UI validation, with the integration and browser limits below.** All four confirmed UI defects were fixed and retested. Nothing was deployed; Quo configuration was not changed. This is not a production-release or live-booking integration sign-off.

## Coverage and results

| Check | Final result |
| --- | --- |
| Public marketing inventory | 19 routes, listed individually in [SCREENSHOT_INDEX.md](SCREENSHOT_INDEX.md) |
| Viewports | Desktop 1440 × 900; tablet 768 × 1024; mobile 390 × 844 |
| Full-page screenshots | 57, one per route and viewport |
| HTTP responses | 57/57 returned 200 |
| Page-wide horizontal overflow / protruding text or controls | 0 / 0 detected |
| Missing images / failed asset responses | 0 / 0 |
| Unexpected page-console errors / uncaught page exceptions | 0 / 0 |
| Automated accessibility violations | 0 detected across 57 page scans and three open-booking-dialog scans |
| Main interaction scenarios | 45/45 passed |
| Phone/footer cases | 57/57 passed; 226 visible phone links clicked with dialing prevented |
| Internal link destinations | 20/20 returned 200, including the booking-query entry and `/review` utility page |
| Footer | Exactly one per page; identical link text/targets across all 19 routes at each size |
| Confirmed visual/interaction defects | Four discovered; four fixed; zero confirmed UI defects left open in this scope |

Raw final evidence: [desktop](docs/qa/2026-11-16/final/desktop.json), [tablet](docs/qa/2026-11-16/final/tablet.json), [mobile](docs/qa/2026-11-16/final/mobile.json), [links](docs/qa/2026-11-16/final/links.json). The 19-page inventory comprises seven top-level marketing pages, four service categories and eight service details. Administrative, campaign-token and review-token flows are outside that inventory.

## Visual review

The browser scrolled every page and the horizontal results carousel to load lazy images, awaited fonts/images, and returned to the top before taking full-page screenshots. Desktop, tablet and mobile screenshot contact sheets were visually reviewed at the top, middle and footer of every route, with direct full-page and viewport inspection for representative pages and each defect. The final affected CTA screenshots were inspected again after fixes.

Heading hierarchy, typography, spacing, service imagery, page sections and footer placement were coherent in the reviewed views. Desktop splits become stacked hero layouts on tablet/mobile. Phone and booking controls remain available in the header; mobile also retains its fixed action bar. Full-page screenshots place fixed bars at the original viewport position; that is a browser-capture characteristic, not duplicate page content. Narrow screens make the site long, but it remains vertically scrollable without page-wide sideways scrolling. Service-area chips and the results carousel intentionally scroll inside their own containers.

### Interactive CSS 3D home

- The cutaway stays within its hero panel. Its text and four service buttons remain readable and clickable; no observed interception of the hero CTAs.
- All four selections update the active equipment and pressed state. The related service link updates correctly.
- The desktop/tablet camera button changes the computed transform. Mobile intentionally hides that camera control and keeps a static view with working service selection.
- Reduced-motion emulation reduces the house transition to `0.00001s`; selection and links continue to work.
- Scrolling does not trap the page. Header, chat, booking overlay and mobile actions retain their expected layering in tested flows.
- Across three desktop camera samples, measured requestAnimationFrame interval p95 was **18.2 ms** (maximum 35.1 ms). This is a local headless scheduling diagnostic, not proof of physical-device GPU smoothness. The component has no continuous animation loop.

## Confirmed issues and fixes

| ID | Severity | Finding | Status |
| --- | --- | --- | --- |
| VQA-001 | Medium | Problem-discovery card descriptions used white at 55% opacity. | Fixed; regression passed |
| VQA-002 | Low | The pricing strip squeezed the phone CTA into multiple text lines when copy and actions shared a tablet row.. | Fixed; regression passed |
| VQA-003 | Medium | At a particular scroll position the floating chat launcher covered the end of the service-grid phone text. | Fixed; regression passed |
| VQA-004 | Low | Long final-CTA headings shrank the action group, wrapping both the phone number and Book Now. | Fixed; regression passed |

[VISUAL_QA_ISSUES.csv](VISUAL_QA_ISSUES.csv) includes each URL, affected sizes, before/after evidence, reproduction steps and implemented fix. Fixes are limited to four existing TSX files and use the existing design tokens/utilities. No route or runtime dependency was added.

## Performance

Three fresh browser contexts per page/profile; final local production build, server/image caches may be warm. Mobile profile: 4× CPU slowdown, 1.6 Mbps download, 0.75 Mbps upload and 150 ms latency. Navigation, booking open, input, selection and Escape were exercised without submission. CLS uses the maximum session window, excluding shifts immediately following input.

| Profile | Route | Median LCP | LCP range | Maximum CLS | Observed interaction maximum: median / worst sample |
| --- | --- | --- | --- | --- | --- |
| desktop | `/` | 208 ms | 196–1360 ms | 0.0000 | 48 / 240 ms |
| desktop | `/services/cooling/ac-repair` | 156 ms | 156–188 ms | 0.0000 | 48 / 48 ms |
| mobile-throttled | `/` | 1516 ms | 1444–1528 ms | 0.0000 | 88 / 104 ms |
| mobile-throttled | `/services/cooling/ac-repair` | 1532 ms | 1512–1556 ms | 0.0000 | 88 / 104 ms |

[Raw performance samples](docs/qa/2026-11-16/final/performance.json). **Field INP is not available.** The Event Timing values above describe the longest observed interaction in each short lab session; they are not a representative production INP percentile. The slowest first desktop interaction is reported, not discarded. No Lighthouse score or production Core Web Vitals pass is claimed.

All 63 image elements encountered per viewport used the Next image endpoint; 31 carried lazy loading. This includes repeated site logos and is not a count of unique source assets. Lazy carousel images loaded after horizontal scrolling; none remained broken. Representative optimized images and reserved image areas were visually checked. Local timing and emulation do not establish real-network or real-device performance.

## Accessibility and limitations

Semantic headings, image names, control labels and contrast were checked with axe WCAG 2 A/AA and 2.1 AA tags. Keyboard checks exercised the first skip link, visible outline, navigation dismissal, dialog focus boundaries, error focus, success focus and focus restoration. The booking controls measured at least 48 px high with 16 px text.

Axe also returned **647 color-contrast nodes requiring manual review per viewport**, largely in repeated styled content. These are incomplete checks, not passes or confirmed failures. Visual readability was reviewed and the confirmed 4.23:1 description defect was corrected, but this report does not certify every gradient/alpha combination or WCAG conformance. Screen-reader output was not tested.

The local reviews page displays its designed “Reviews are temporarily unavailable” fallback. Populated review content and live booking delivery were not verified. Booking success, server validation, unavailable service, server failure and network failure were simulated in the browser; all POSTs were intercepted before reaching the application. No customer data, real booking, call, email or SMS was sent. Phone testing confirms link format and clickability, not call routing. Quo configuration was untouched.

Only Chromium was executed. Safari/WebKit, Firefox, physical touch devices, browser zoom, production hosting behavior and field Web Vitals remain unverified. Staging should exercise these and a non-customer integration fixture before any production release decision.

## Setup and verification

The browser-host integration was unavailable, so local Playwright was used successfully. Cached Chromium and existing axe/sharp packages were reused. Playwright Core was installed in the ignored `node_modules/.qa-tools` prefix because no usable project Playwright library was present. Root package manifests and architecture were unchanged.

The development server loaded and was tested first. One initial cold parallel development request returned a transient 500; it did not reproduce in the warm/final production sweep. A separate diagnostic run briefly used stale server assets during a rebuild and was discarded after restarting the server. Only the clean final production runs support the results above. Early smooth-scroll, horizontal lazy-image and mid-transition capture artifacts were corrected in the harness; they were not counted as application defects.

| Required check | Result |
| --- | --- |
| `npm.cmd run lint` | Passed, exit 0, including QA scripts |
| `npm.cmd run typecheck` | Passed, exit 0 |
| `npm.cmd run build` | Passed, exit 0; 33 generated static pages |
| `node tests/booking-model.test.cjs` | Four tests passed during this QA session |
| `git diff --check` | Passed |

To reproduce locally (PowerShell), install the isolated tool if absent, build, start a dedicated local server, then run the suites. Do not rebuild while that production server is serving an older build; stop and restart it between builds.

```powershell
npm.cmd install --prefix node_modules/.qa-tools --no-package-lock --ignore-scripts playwright-core@1.65.1
npm.cmd run build
npm.cmd run start -- --hostname 127.0.0.1 --port 3123
# In another terminal after the server is ready:
$env:QA_PHASE = 'final'
node tests/browser-qa.cjs
node tests/browser-interactions.cjs
node tests/browser-links.cjs
# Run performance separately from other CPU-heavy checks:
node tests/browser-performance.cjs
```

The scripts reuse cached Chromium by default. `QA_BROWSER`, `QA_BASE_URL` and `QA_PLAYWRIGHT` allow local overrides. All test suites block non-read browser requests; the interaction suite fulfills booking requests with synthetic fixtures.
