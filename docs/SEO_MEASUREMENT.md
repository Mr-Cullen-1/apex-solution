# SEO and conversion measurement

2026-11-17. Measurement specification; not an installed analytics service or a traffic report.

## Baseline availability

| Source | Available evidence | Limit |
|---|---|---|
| `apex-audit/` | 17 November saved crawl and Lighthouse evidence | Historical audit, not refreshed production data |
| Local checks | Build, HTTP, browser and synthetic performance evidence recorded in remediation progress | Does not establish Google indexing, live lead delivery or field Web Vitals |
| Search Console | Unavailable in this session | No organic impressions, clicks, CTR, query rankings or indexed-page count claimed |
| Analytics | Provider/account not configured by this change | No conversion rate baseline claimed |
| CRM/call attribution | Live data not queried in this task | Click-to-call is not a connected call, qualified lead or sale |

## Event contract for the next implementation

Use one selected analytics adapter. Until provider/account and consent behavior are known, do not inject third-party scripts or assume consent. Reuse the existing booking UI and server response contract; no CRM schema migration is required for the first analytics pass.

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
