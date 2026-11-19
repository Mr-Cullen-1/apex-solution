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

The application does not load `gtag.js`, initialize GA4, push `page_view`, wrap browser history, or create a second page-view mechanism. Sprint 1 now emits the allowlisted frontend events documented below. Configure the single Google tag for `G-50J6LW5JET` inside GTM. The container persists across Next.js Link/back/forward navigation. Use exactly one page-view mechanism: if using GTM History Change triggers for virtual page views, disable GA4 automatic history-based page views and avoid overlapping page-view triggers. Filter same-page query cleanup (including `BookNowUrlSync`'s `replaceState`) so it does not count a second visit. Confirm one initial view and one view per actual route change in Tag Assistant/GA4 DebugView before treating reporting as validated.

The 19 November Sprint 1 read-only check found HTTP 200 for the public container and the supplied GA4 ID in its script. The public GA4 tag has automatic forms enabled and user-provided data collection flags enabled. This is configuration evidence, not proof of event receipt or of actual PII transmission. See the release gates in ANALYTICS_SPRINT_1.md; authenticated workspace settings were not available. Nothing was published in GTM. Consent configuration, private-route exclusions, URL/referrer redaction and existing container tags remain owner-controlled and must follow the data boundaries below. Loading the container does not establish consent or prove GA4 event delivery.

References: [Google container installation](https://support.google.com/tagmanager/answer/14847097), [Next.js Script](https://nextjs.org/docs/app/api-reference/components/script), [Google SPA measurement with GTM](https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm).

## Local installation validation (2026-11-19)

- `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run build`: passed; 33 static pages generated.
- `node --test tests/booking-model.test.cjs tests/service-search.test.cjs tests/audit-seo.test.cjs`: 12 passed against the local production server (`QA_BASE_URL=http://127.0.0.1:3128`). Metadata, structured data, sitemap and protection-header checks passed.
- `node tests/browser-gtm.cjs`: passed with an isolated container fixture. It failed before installation because no GTM initialization existed, then passed after installation. No app-owned GA4 initialization or manual page-view pushes were observed.
- `QA_GTM_LIVE=1 node tests/browser-gtm.cjs`: passed with the real public container; all other external requests intercepted. Chromium 153.0.8010.12 confirmed `window.google_tag_manager['GTM-5JLZPN4Q']` initialized, bootstrap and container script were in head, and container requests returned HTTP 200. Service directory/category/detail Link navigation plus back/forward retained the same document and made no additional container request. Reload and a direct admin-login visit each initialized exactly once in their new document: 3 requests for 3 documents. Console errors and uncaught page errors: 0 on these tested routes.
- JavaScript-disabled browser: exactly one iframe fallback request for the expected container; the response was isolated. It precedes the skip link and all authored page content, after Next.js's internal hidden boundary.

Evidence: ignored `docs/qa/current/gtm/fixture.json` and `live.json`. These tests validate the local installation, not production deployment, GA4 receipt, or GA4-side page-view deduplication. No site deployment, container publishing, real form submission or account configuration was performed. Existing review-image network limitations from the previous audit are outside these service/admin checks.

## Sprint 1 frontend event contract

Implemented locally; not committed, published or deployed. Full behavior, configuration gates, file inventory and test commands: [ANALYTICS_SPRINT_1.md](ANALYTICS_SPRINT_1.md).

| Event | Trigger | Deduplication |
|---|---|---|
| `booking_click` | Explicit booking CTA, including direct provider calls | Provider owns emission; query-driven opening excluded |
| `form_start` | First trusted field change, including select/checkbox | Once per modal instance; no mount or focus event |
| `form_submit` | HTTP **201** AND `ok === true` AND `status === "received"` | Once per modal instance; no click/render/validation-error conversion |
| `phone_click` | Public tel link activation | One delegated listener; never also contact_click |
| `contact_click` | Contact-page, email or SMS link activation | Same listener; no raw address or link text |
| `service_select` | Changed service picker or navigation to a different catalog service/category | No default/preselection, repeated current value or query opening |

The typed adapter independently allowlists event names, placements, initiators, public paths and catalog IDs at runtime. Every payload is constructed field by field. No customer fields, request IDs, raw query/referrer, tokens, URLs or free text are copied. Unused fields are null to clear GTM's persistent event context. Unknown and private paths (including review invitations), plus the admin hostname, emit no new public events. The existing root container still loads globally: GTM-side exclusions remain a required release gate.

No attribution capture or campaign parsing was added. Existing query cleanup and submission behavior remain unchanged. A request persisted with a lost response is not a browser-confirmed success. Phone clicks are not calls or leads; QUO and phone_lead are outside this sprint.

Configure only `form_submit` as the booking key event after validation; do not add generate_lead for the same request. Disable automatic form collection and overlapping GTM form/click triggers before activating these custom events. Consent remains controlled by the existing Google tag configuration; the adapter does not grant consent or reinterpret the service-text checkbox.

## Reporting after setup

- GSC: canonical/indexing/sitemap status and query×page impressions/clicks/CTR, with actual source dates.
- Funnel: landing > booking_click > form_start > form_submit, segmented by allowlisted service and placement.
- CRM: qualified lead → appointment → sale, with definitions approved by the operator. Reconcile against stored requests; notifications are separate statuses.
- Performance: report lab median and range separately from field p75 LCP/INP/CLS. Missing observer data is `unavailable`, never zero.
- Start a 2–4 week baseline after events are validated. If earlier data is unavailable, do not invent a before/after percentage.

Required acceptance fixtures: 201 received emits once; 200/400/500/503/network failures emit no success; repeated edits and rerenders do not duplicate; automatic opening emits no booking click; private routes emit no public events; payloads contain no personal data. Use isolated collectors and synthetic submissions. Production acceptance additionally requires GTM Preview/GA4 DebugView, consent checks, URL/referrer redaction and private-route tag exclusions.
