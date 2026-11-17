# Audit remediation progress — 2026-11-17

Plan: `docs/superpowers/plans/2026-11-17-audit-remediation.md`.

Later handoff: the user subsequently authorized cleanup, commit and push. See [workspace cleanup](workspace-cleanup-2026-11-17.md) for that validation and delivery. The local-only statements below describe the earlier remediation checkpoint.

Implementation authorized by the user's “boshla unda”. Local branch: `fix/audit-remediation-2026-11-17`; base: `3bb9ed1`. No commit, push, deployment, live database change or external message is included.

## Execution decisions

- Ruling: Work in the shared IDE checkout on a dedicated local branch rather than copy the untracked audit/plan and environment into another checkout. This preserves the user's active workspace; edits are visible in their IDE. Branch creation required sandbox escalation and succeeded. No changes were committed.
- Ruling: Keep the ledger here with the deliverable instead of disposable commit-based skill scratch files, because this task does not commit changes.
- Ruling: Small text/metadata fixes use rendered HTTP/accessibility checks rather than implementation-mirroring unit tests. New data/behavior contracts receive focused regression tests.
- Pre-flight: T01 facts feed T03/T04/T05/T09/T10. Missing operational facts must remain explicit; existing source-confirmed content can be reconciled without inventing new scope. T06 depends on provider/consent configuration. T02 is independent.

## Baseline

- Prior planning turn: lint/typecheck/build passed; build used reviews fallback after fetch failure.
- Implementation baseline: booking model 4/4, service search 3/3 passed.
- `.env.local` was not changed or printed. No analytics-related key names were found in the scoped key-name check.

## Tasks

| Task | Status | Evidence / next step |
|---|---|---|
| T01 | Partial; input needed | Source-backed role/contact copy reconciled; `docs/BUSINESS_FACTS.md` lists missing operational inputs |
| T02 | Complete locally | Review title, footer accessible name and sitemap lastmod validated in rendered HTML/browser |
| T03 | Needs business input | Operator, privacy contact, actual sharing and retention/deletion policy |
| T04 | Partial; input needed | Existing appliance catalog, eight service overviews, boiler links, FAQ headings, offer/pricing context improved; detailed scope and warranties need facts |
| T05 | Complete locally | Shared visible/JSON-LD breadcrumbs on all 12 service routes; stable Organization identity; county/state hierarchy; Service broker follows existing About model |
| T06 | Needs business input | Analytics provider/account and consent behavior |
| T07 | Partial; evidence needed | Review moderation/consent explanation, discovery links and general-HVAC captions added; photo associations and exact dryer work need evidence |
| T08 | Partial | Responsive hero sizes, smaller icons and basic headers validated; field LCP, hosting redirect and staged CSP remain open |
| T09 | Needs business input | Original appliance scope/content and demand priority |
| T10 | Needs business input | County-specific service capacity and genuine local content |
| T11 | Partial; access needed | Status registry and measurement specification delivered; no GSC/analytics/CRM baseline invented |
| T12 | Local batch passed; release checks pending | Lint/typecheck/build, HTTP, rendered SEO, browser regression and independent review completed; live integration/release verification remains separate |

## Implemented batch

- Removed the static Live Now claim; aligned home, booking and service schema with the existing independent-provider coordination model. No new business claim or legal policy was fabricated.
- Corrected the review utility title, removed generated sitemap modification dates and fixed the footer accessible name.
- Added shared breadcrumbs, root Organization identity and state-qualified counties, including the two distinct Suffolk counties. Service coverage now matches the visible selected-county wording.
- Exposed the existing client-supplied appliance catalog, expanded service-specific request guidance and boiler discovery, clarified diagnostic/maintenance offer wording and review moderation. Furnace/boiler imagery is labelled as general outdoor HVAC equipment.
- Resized approved icons from 285,831 bytes each to 3,942 bytes (64px) and 17,263 bytes (180px); adjusted service hero responsive sizes. Added nosniff, strict-origin-when-cross-origin and SAMEORIGIN response headers.
- Added business-input and measurement documents. No runtime dependency was added; isolated browser tools live under ignored `node_modules/.qa-tools`.

## Validation evidence

All browser evidence uses the local production build at `http://127.0.0.1:3127`, Chromium 153.0.8010.12. It does not establish the state of the deployed website.

| Check | Result | Evidence |
|---|---|---|
| `npm.cmd run lint` | Passed | Final run includes the QA harness changes |
| `npm.cmd run typecheck` | Passed | Production type generation and TypeScript check |
| `npm.cmd run build` | Passed; 33/33 static outputs | Review fetch fallback occurred; see limitation below |
| `node --test tests/audit-seo.test.cjs` | 5/5 passed | Title/noindex, headers, sitemap, Organization/county hierarchy, 12 service breadcrumbs/broker/coverage |
| Booking model and service search tests | 4/4 and 3/3 passed | Existing regression suites |
| `tests/check-public-responses.py` | Passed | `docs/qa/2026-11-17/http-validation.json`: 19 public pages, 12 supporting checks, sitemap and two invalid API requests; no valid lead submitted |
| `tests/browser-qa.cjs` | 57 page/viewport combinations checked | `docs/qa/2026-11-17/pages/`: 19 routes at desktop/tablet/mobile; all HTTP 200, no horizontal overflow, axe violations, console/page errors or failed asset responses |
| Homepage image recheck | Passed in all 3 viewports | `docs/qa/2026-11-17/pages-home-recheck/`: no unloaded/broken images after individually scrolling them into view |
| `tests/audit-browser.cjs` | 5/5 viewport profiles passed | `docs/qa/2026-11-17/regression/results.json`: 320px, mobile, short landscape, tablet and desktop; service preselection, consent, validation, mock receipt, 503/network failure, Escape/focus restoration, breadcrumbs and footer naming |
| Visual inspection | Selected views inspected | Desktop home, mobile appliance/boiler and short-landscape booking screenshots; submit and disclaimer remain reachable |
| Independent source review | No critical, important or minor findings | Read-only review of source changes against `3bb9ed1`; runtime claims validated separately above |
| `git diff --check` | Passed | No whitespace errors |

The first page scan reported one unloaded desktop home logo and two unloaded mobile carousel images, with no failed image responses. Investigation loaded every rendered image successfully. The width-based carousel scroll had skipped lazy images under scroll snapping; the harness now visits each image and waits for load/error. The initial evidence is preserved and the focused homepage rerun supersedes its image findings. No product image was replaced to hide a test failure.

An initial typecheck/build attempt hit a malformed generated `.next/dev/types/validator.ts`. Its exact contents were preserved in ignored `node_modules/.qa-tools/invalid-dev-validator.txt`; only that generated file was removed, then typecheck and build passed. Application types were not weakened. The Python HTTP suite used the existing Codex runtime because `python` was not on PATH.

## Local performance measurements

Three fresh browser contexts per route/profile, local production build. Mobile profile: 4x CPU slowdown, 1.6 Mbps download, 0.75 Mbps upload, 150 ms latency. Values below are LCP median (range), in milliseconds.

| Profile / route | Before | After |
|---|---|---|
| Desktop home | 468 (468-468), 2 valid samples | 464 (372-2224), 3 valid samples |
| Desktop AC repair | 308 (284-472) | 324 (260-344) |
| Mobile home | 3148 (3140-3764) | 3308 (2988-3336) |
| Mobile AC repair | 2744 (2700-2768) | 2688 (2652-2740) |

All observed CLS values were 0. Before desktop home had one unavailable LCP observation, excluded rather than reported as zero. The mobile home median did not improve; the AC difference is small and does not establish a durable gain. LCP optimization remains open. Small samples and variable machine load limit the comparison. Observed interaction maxima are lab diagnostics, not field INP. Raw observations and aggregation: `docs/qa/2026-11-17/before/performance.json`, `after/performance.json`, and `performance-summary.json`.

## Remaining boundaries

- Build logged two `reviews_fetch_failed` fetch errors and successfully used the existing fallback; the local server also logged this during browser checks. A populated review feed and live review backend were not validated.
- Seven browser submissions were intercepted with synthetic responses. Live persistence, Telegram/email delivery, chat provider responses, real phone calls and production admin flows were not tested.
- Privacy/terms require the legal operator, contact, sharing/retention/deletion rules and approved service terms. Analytics requires the selected account/provider and consent decision. New appliance/county pages require original scope and local evidence. These are recorded in `docs/BUSINESS_FACTS.md`.
- Production redirect ownership, CSP rollout, Search Console/indexing, field Core Web Vitals, actual-device testing and 200% browser zoom remain separate checks. Automated axe results are not a complete accessibility audit.
- No commit, push, deployment, production content edit or database migration was performed. The user's `.env.local` remains untouched.
