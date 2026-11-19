# SEO and conversion measurement

Updated 2026-11-19. GTM is installed in the local application; container-managed tags and measurement acceptance remain separate from this code change. No deployment or traffic report is claimed.

## Baseline availability

| Source | Available evidence | Limit |
|---|---|---|
| `apex-audit/` | 17 November saved crawl and Lighthouse evidence | Historical audit, not refreshed production data |
| Local checks | Build, HTTP, browser and synthetic performance evidence recorded in remediation progress | Does not establish Google indexing, live lead delivery or field Web Vitals |
| Search Console | Unavailable in this session | No organic impressions, clicks, CTR, query rankings or indexed-page count claimed |
| Analytics | GTM `GTM-5JLZPN4Q` installed; intended GA4 destination `G-50J6LW5JET` supplied by the owner | GA4 tag configuration, consent behavior and reporting not verified; no conversion rate baseline claimed |
| CRM/call attribution | Live data not queried in this task | Click-to-call is not a connected call, qualified lead or sale |

## Container installation

`src/app/layout.tsx` reads `NEXT_PUBLIC_GTM_ID`. The local value and `.env.example` are `GTM-5JLZPN4Q`. An absent or malformed ID omits both snippets. Set the public variable in the target build environment before a future deployment; changing it requires rebuilding. No private key is involved.

The root uses Google's supported two-part installation: an asynchronous container bootstrap in `<head>` via `next/script`, and a hidden noscript iframe as the first authored body child. Next.js can prepend its internal hidden streaming boundary to the rendered body. The shared root covers marketing, admin and other document routes. `beforeInteractive` is used specifically for the required head placement and once-per-document initialization. The usual `afterInteractive`/`@next/third-parties` approach loads after hydration and does not provide this exact head-plus-noscript placement. No new dependency was needed. Existing fonts, metadata and page layouts are preserved.

The application does not load `gtag.js`, initialize GA4, push `page_view`, wrap browser history, or send booking events. Configure the single Google tag for `G-50J6LW5JET` inside GTM. The container persists across Next.js Link/back/forward navigation. Use exactly one page-view mechanism: if using GTM History Change triggers for virtual page views, disable GA4 automatic history-based page views and avoid overlapping page-view triggers. Filter same-page query cleanup (including `BookNowUrlSync`'s `replaceState`) so it does not count a second visit. Confirm one initial view and one view per actual route change in Tag Assistant/GA4 DebugView before treating reporting as validated.

The public container script returned HTTP 200 during setup, but did not contain the supplied GA4 measurement ID as literal text. That is not proof of GA4 configuration; container workspace/settings access was not available. Nothing was published in GTM. Consent configuration, private-route exclusions, URL/referrer redaction and existing container tags remain owner-controlled and must follow the data boundaries below. Loading the container does not establish consent or prove GA4 event delivery.

References: [Google container installation](https://support.google.com/tagmanager/answer/14847097), [Next.js Script](https://nextjs.org/docs/app/api-reference/components/script), [Google SPA measurement with GTM](https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm).

## Local installation validation (2026-11-19)

- `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`: passed; 33 static pages generated.
- `node --test tests/booking-model.test.cjs tests/service-search.test.cjs tests/audit-seo.test.cjs`: 12 passed against the local production server (`QA_BASE_URL=http://127.0.0.1:3128`). Metadata, structured data, sitemap and protection-header checks passed.
- `node tests/browser-gtm.cjs`: passed with an isolated container fixture. It failed before installation because no GTM initialization existed, then passed after installation. No app-owned GA4 initialization or manual page-view pushes were observed.
- `QA_GTM_LIVE=1 node tests/browser-gtm.cjs`: passed with the real public container; all other external requests intercepted. Chromium 153.0.8010.12 confirmed `window.google_tag_manager['GTM-5JLZPN4Q']` initialized, bootstrap and container script were in head, and container requests returned HTTP 200. Service directory/category/detail Link navigation plus back/forward retained the same document and made no additional container request. Reload and a direct admin-login visit each initialized exactly once in their new document: 3 requests for 3 documents. Console errors and uncaught page errors: 0 on these tested routes.
- JavaScript-disabled browser: exactly one iframe fallback request for the expected container; the response was isolated. It precedes the skip link and all authored page content, after Next.js's internal hidden boundary.

Evidence: ignored `docs/qa/current/gtm/fixture.json` and `live.json`. These tests validate the local installation, not production deployment, GA4 receipt, or GA4-side page-view deduplication. No site deployment, container publishing, real form submission or account configuration was performed. Existing review-image network limitations from the previous audit are outside these service/admin checks.

## Event contract for the next implementation

Use GTM as the single analytics adapter. Custom conversion events are not part of this installation. Confirm consent and tag behavior before adding them. Reuse the existing booking UI and server response contract; no CRM schema migration is required for the first analytics pass.

| Event | Trigger | Deduplication |
|---|---|---|
| `click_to_call` | User activates a phone link | One shared click listener, not overlapping listeners |
| `booking_open` | Modal becomes open | Once per actual open |
| `booking_start` | First user edit in that modal | Once per open, not each keystroke |
| `booking_submit_success` | Successful HTTP response with `ok: true`, `status: received` | Once per received request; not on click, render or validation error |
| `booking_error` | Validation, service unavailable, server or network error | Only error category; never raw response or user text |

Capture source/medium/approved campaign codes before `BookNowUrlSync` removes query parameters. Keep only bounded approved values; unknown/untrusted codes become `unknown`. Referrer is origin-only. Strip query/hash and mask private token routes. Never send names, email, phone, ZIP, issue/message text, request IDs, invitation tokens or campaign tokens to external analytics. If the server persisted a request but the response is lost, a browser cannot truthfully claim a confirmed success; any server-side reconciliation is a separate project.

If GA4 is selected, use `booking_submit_success` as the single lead key event; do not count a second `generate_lead` event for the same request.

## Reporting after setup

- GSC: canonical/indexing/sitemap status and query×page impressions/clicks/CTR, with actual source dates.
- Funnel: landing → booking_open → booking_start → confirmed receipt, segmented by allowed service and source.
- CRM: qualified lead → appointment → sale, with definitions approved by the operator. Reconcile against stored requests; notifications are separate statuses.
- Performance: report lab median and range separately from field p75 LCP/INP/CLS. Missing observer data is `unavailable`, never zero.
- Start a 2–4 week baseline after events are validated. If earlier data is unavailable, do not invent a before/after percentage.

Required acceptance fixtures: URL cleanup retains safe attribution; 201 received emits once; 400/500/503/network failures emit no success; rerenders emit no duplicate; disabled adapter/consent sends nothing; payload contains no personal data. Use an isolated collector and synthetic test recipients before any production activation.
