# Apex Home Services — Interaction Test Report

16 November 2026. Actual Chromium 149.0.7827.55 against the final local production build. Desktop 1440 × 900; tablet 768 × 1024; mobile 390 × 844.

**45/45 main scenarios passed, plus 57/57 phone/footer cases.** No real form request, call, booking, email or SMS was sent. Quo was not changed.

## Scenario matrix

| Scenario | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| navigation and overview links | Pass | Pass | Pass |
| 3D service selection, camera and reduced motion | Pass | Pass | Pass |
| pricing phone stays on one line | Pass | Pass | Pass |
| service call text stays clear of chat launcher | Pass | Pass | Pass |
| service category CTA labels stay on one line | Pass | Pass | Pass |
| contact CTA and mobile sticky booking entry | Pass | Pass | Pass |
| booking focus trap, validation and comfortable controls | Pass | Pass | Pass |
| booking success response | Pass | Pass | Pass |
| booking error response | Pass | Pass | Pass |
| booking unavailable response | Pass | Pass | Pass |
| booking network response | Pass | Pass | Pass |
| booking invalid response | Pass | Pass | Pass |
| keyboard skip link and visible focus | Pass | Pass | Pass |
| service preselection and modal accessibility | Pass | Pass | Pass |
| faq expansion and results carousel | Pass | Pass | Pass |

The CTA-label scenario checks five previously affected routes per size. The booking scenario matrix includes both valid service selection and malformed phone/ZIP input. Detailed measurements, assertions and synthetic payloads are retained in the raw evidence.

## Form and contact behavior

Contact uses the shared booking dialog; there is no separate contact-form implementation to test. Its own main-content Book Now control was clicked, and on mobile the sticky booking action was also clicked. The same form was then exercised from `/contact` across every response mode.

- Opening focuses Close. Shift+Tab wraps to Send Request, Tab wraps back, Escape closes and restores the trigger. Navigation dialogs also dismiss and restore focus correctly.
- Empty submission produces linked validation and focuses the name field without a network request. Punctuation-only phone and a three-digit ZIP are rejected without sending. Leading-zero ZIP `06810` survives the synthetic success payload.
- AC Repair selection produces the expected category/detail values. `/?book=1&service=furnace-repair` preselects Furnace Repair. Optional email and SMS consent were left unselected.
- Success: a delayed intercepted 201 shows a disabled Sending state, then Request received with result-heading focus.
- Server error 503, unavailable 503, aborted network request and field-validation 400 display their appropriate feedback. None is represented as a confirmed booking.
- Booking fields measured at least 48 px high and 16 px text. The modal scrolls within the viewport, and its open state had zero detected axe violations in all three sizes.

## Navigation, phone and keyboard

Desktop Services dropdown and mobile category overview links actually navigated to Cooling. Mobile navigation closed after selection and released body scrolling. The first Tab reaches the skip link; its outline is visible, Enter targets `#main-content`. FAQ disclosure and the results carousel were exercised. The 3D selection/camera/reduced-motion checks are recorded in the main matrix.

All 88 phone anchor instances per viewport (264 DOM instances including hidden controls) had a nonempty accessible name and `tel:+15165860826`. All 226 visible instances were clicked. A capture-phase handler prevented dialing and recorded the target. The 20 unique discovered internal destinations returned 200. Footer links matched the homepage footer on every route.

## Network and console accounting

Exactly five synthetic booking POSTs per viewport were intercepted: 15 total, zero delivered to the backend. Invalid client input generated no POST. All other mutation requests were also blocked by the harness.

The page sweep recorded zero console errors and zero uncaught page exceptions. Each interaction run recorded four expected resource errors caused by deliberate fault injection: two 503 responses, one 400 response and one `ERR_FAILED` network abort. Twelve expected messages total; zero uncaught application exceptions. These fault-injection messages are not ordinary-page failures.

## Evidence and repeatability

- [Desktop interaction results](docs/qa/2026-11-16/final/interaction-desktop.json)
- [Tablet interaction results](docs/qa/2026-11-16/final/interaction-tablet.json)
- [Mobile interaction results](docs/qa/2026-11-16/final/interaction-mobile.json)
- [Phone, footer and destination results](docs/qa/2026-11-16/final/links.json)
- [Screenshot index](SCREENSHOT_INDEX.md)
- [Issue ledger and reproduction steps](VISUAL_QA_ISSUES.csv)

Run `node tests/browser-interactions.cjs` with `QA_PHASE=final`, followed by `node tests/browser-links.cjs` after the full page sweep. `QA_CHECK` can filter the main suite to a scenario substring. The tests use synthetic local fixtures, not customer data.

Four visual defects are fixed and their relevant checks were repeated. Live delivery, CRM/Quo behavior, call connectivity, live review submission and success data, screen-reader speech, non-Chromium engines and physical-device behavior remain outside this UI validation. No production-release or end-to-end integration pass is claimed.
