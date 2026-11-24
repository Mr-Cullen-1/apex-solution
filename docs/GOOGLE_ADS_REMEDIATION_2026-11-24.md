# Apex Home Services — Google Ads remediation

Date: November 24, 2026. Baseline: `3849927`. Branch: `fix/google-ads-readiness-2026-11-24`.

**Recommendation: NO-GO for advertising.** Repository fixes are prepared and locally verified; they have not changed production. GTM/GA4 setup, approved legal text, isolated staging delivery tests and Quo activation prerequisites remain outstanding. Stop here for a new independent audit; do not merge/release or activate advertising on the strength of this report alone.

No Google Ads activation, production deployment, hosted migration, production data write, webhook registration, real test call, email or Telegram send was performed. `.env.local` was not edited. Local synthetic tests use intercepted HTTP, isolated module dependencies, disposable PGlite or localhost-only PostgreSQL databases.

## Status definitions

- **FIXED:** repository defect repaired with the stated local test evidence. This does not mean deployed.
- **PARTIALLY FIXED:** useful code/configuration work completed, but the full finding remains open.
- **BLOCKED:** needs owner/account/staging inputs before the requested action can safely proceed.
- **NOT VERIFIED:** no current end-to-end proof; no successful outcome is inferred from source or fixtures.

## Phase 1 — analytics and privacy

| Finding | Status / priority | Change and evidence | Remaining action / business impact |
|---|---|---|---|
| A02: six events not forwarded to GA4 | PARTIALLY FIXED / Critical | Prepared a GTM workspace import candidate with init, six-event and manual-page-view tags; existing six-event browser suite passes 9/9. | Actual import validation, workspace setup and GA4 receipt require account access. No usable paid-lead measurement is claimed. |
| A05: conversion setup | BLOCKED / Critical | Defined booking primary, phone/contact intent secondary and diagnostic events in the release checklist. | Configure/verify actual key events and Ads imports in the authorized accounts. Phone click is not an answered or qualified call; avoid importing raw and derived booking events as two primary actions. |
| A04: automatic/custom forms and automatic user data | PARTIALLY FIXED / High | Removed unconditional root GTM bootstrap and noscript pixel. Tracking defaults off unless explicit readiness flag plus valid GTM/GA4 IDs are configured. | Disable enhanced measurement and automatic user-provided data collection in the reviewed stream/tag, then prove no duplicates. The old published container was not modified. |
| A03: admin/query leakage | PARTIALLY FIXED / High | Application boundary repaired: public path allowlist; sanitized origin+pathname, blank referrer, fixed non-personal title; private-route GA disable flag. Enabled fixture proves no private bootstrap, no query-only view, one view per public navigation and safe return from private route. Default-off fixture also passes. | Actual Google tags can create their own automatic events: account checklist and network/DebugView evidence remain required before activation. |
| Consent/privacy policy | BLOCKED / High | No consent acceptance or legal basis is invented. External tracking remains off by default. | Owner must approve actual consent/retention/vendor practices and the chosen implementation before readiness is enabled. |
| A06: paid-click/campaign attribution | NOT VERIFIED / High | Existing booking-query behavior is retained; the new analytics data deliberately excludes all queries/referrers. | GCLID/GBRAID/WBRAID/UTM storage and attributable offline conversions are not implemented. Do not assume source attribution or bidding readiness. Privacy-approved attribution design is a separate gate. |

Deliverables: [analytics checklist](ANALYTICS_RELEASE_CHECKLIST.md), [GTM draft](analytics/gtm-workspace-draft.json). **The JSON is not an account-validated export or a published container.** Google documents that `send_page_view=false` does not by itself stop enhanced-measurement history views: [manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views), [enhanced measurement](https://support.google.com/analytics/answer/9216061).

## Phase 2 — legal pages

| Finding | Status / priority | Change and evidence | Remaining action / business impact |
|---|---|---|---|
| L01: missing Privacy Policy route | PARTIALLY FIXED / Critical | Added `/privacy-policy`, explicit owner-approval warning and draft section structure; server-render and browser tests confirm 200 and noindex. | It is not an operative policy. Owner/legal reviewer must supply and approve actual text before launch. |
| L02: missing Terms and business identity | PARTIALLY FIXED / High | Added `/terms` with same controls; footer links are visibly marked awaiting approval. No invented address, operator, promises, effective date or jurisdiction. | Legal operator/DBA, privacy/support contact, responsibility, payment, cancellation and warranty details remain missing. `/privacy` and `/terms-of-service` aliases are not added or used. |
| L03: public business/credential/price claims | BLOCKED / High | Existing claims preserved; no new certifications, reviews, offers or guarantees invented. | Owner must substantiate EPA 608, experience, availability and advertised pricing/offer conditions. Prior content approval is not independent verification. |

Draft pages are excluded from the sitemap and analytics allowlist. Removing their warnings alone would not resolve legal readiness. See [owner approval register](LEGAL_APPROVAL_REQUIRED.md).

## Phase 3 — security

| Finding | Status / priority | Change and evidence | Remaining action / business impact |
|---|---|---|---|
| SEC01: Critical/High dependencies | FIXED locally / Critical | Next and eslint-config-next 16.4.6; sharp 0.35.5; source-map-js 1.2.4; compatible brace-expansion/zod/TypeScript-ESLint updates. Final full npm audit reports 0 vulnerabilities, including development dependencies. Build/lint/typecheck pass. | Production still has its old release until a separately approved deployment. Re-audit dependencies at release time. |
| B05: body-size bypass | FIXED locally / Medium | Read actual bytes with 8,000-byte/five-second bounds. Tests reject absent/false Content-Length, multibyte overflow and stalled streams before persistence. | Verify hosting connection/body limits and actual HTTP behavior in staging. |
| B04: booking abuse admission | PARTIALLY FIXED / High | Atomic PostgreSQL quota: 5/IP and 3/normalized phone per fixed 15-minute bucket; salted HMAC only, service-role RPC, RLS and public grant denial. PGlite and 12-connection native PostgreSQL tests pass. 429/Retry-After and fail-closed 503 tested. | New migration and >=32-character server-only salt must be installed in isolated staging before deploying this code. Missing either disables online booking with a call fallback. Verify proxy trust, hosted grants, shared-NAT tolerance and WAF. Distributed attackers/boundary bursts are not eliminated. |
| API validation/origin handling | FIXED locally / High | JSON-only, same-origin browser checks, existing field validation and no-store responses; failed admission does not persist. | Origin is defense in depth, not bot authentication; non-browser requests can omit it. |
| SEC04: exposed secrets/configuration | NOT VERIFIED as a comprehensive production audit / High | Server-only credential boundaries retained; no new public secrets, only public analytics IDs and readiness switch. New limiter salt remains an empty example. | Current hosted environment inventory, rotation history and all deployed artifacts require hosting access. See final local exact-value scan evidence. |
| SEC05/SEC06: database/API authorization | PARTIALLY FIXED / High | New limiter table has RLS, no public policies; security-invoker function and restricted ACLs tested against anon/authenticated/service_role. Existing active-admin/role checks retained. | Current hosted pg_policies, function ACLs, storage and authenticated-user access remain NOT VERIFIED; do not infer hosted RLS from migration files. |
| SEC02: image attack surface | PARTIALLY FIXED / High | Vulnerable Next/sharp versions updated. No attacker-controlled input was identified in the static OG image source. | Existing `*.supabase.co` signed-path image allowlist is still broad; narrow to approved storage host/bucket in a separate verified media change. Deployed runtime remains unverified. |
| SEC07: CSP/Permissions-Policy | NOT VERIFIED / Medium | Existing nosniff/referrer/frame protections preserved. | No CSP was imposed without a resource inventory; test policy in staging before enforcement. |

See [advisory review](DEPENDENCY_REMEDIATION.md), [booking rollout](BOOKING_PROTECTION.md) and the additive `20261124064321_booking_rate_limit.sql` migration. No hosted SQL was executed.

## Phase 4 — booking reliability

| Finding | Status / priority | Change and evidence | Remaining action / business impact |
|---|---|---|---|
| B03: fresh persistence proof | BLOCKED / High | Existing transactional booking RPC path retained. Route/orchestrator tests isolate the DB boundary; Quo/limiter SQL use disposable databases. | Supply isolated staging and approved test identity. These tests do not prove a real new booking row/customer/activity record. |
| N02: Resend delivery | BLOCKED / High | Real adapter against isolated fetch verifies error redaction, abort signal and stable request-ID idempotency header. | Confirm sender-domain status, provider acceptance and actual inbox receipt with approved staging email. No email sent. |
| N02: Telegram delivery | BLOCKED / High | Adapter fixture verifies bounded send and non-personal error categories; existing plain-text formatting retained. | Confirm destination/topic permissions and actual message receipt in an approved test destination. No message sent. |
| N03: notification failure handling | PARTIALLY FIXED / Medium | `Promise.allSettled` preserves received response after storage even if delivery/status writing throws. Logs use stable category + internal request ID. Added transport/RPC deadlines and a 45s route budget for the worst 31s bounded path plus overhead. | Process termination can still leave pending/unknown notifications; no new durable outbox or automatic retry/alert worker is claimed. Reconcile provider evidence before retries. |
| B06: duplicate booking after ambiguous response | PARTIALLY FIXED / High | Ambiguous persistence failures now advise calling before retry. Notification failures no longer falsely turn a stored lead into an apparent failed submission. Existing double-click suppression passes browser tests. | Stable server-side booking idempotency across repeated HTTP requests is not implemented. Resend idempotency protects an email for one request ID only. |

See [staging acceptance protocol](BOOKING_STAGING_ACCEPTANCE.md). Historical statuses from the audit are historical evidence, not fresh delivery verification.

## Phase 5 — Quo

| Finding | Status / priority | Evidence | Remaining action / business impact |
|---|---|---|---|
| Q02: webhook security/idempotency/recovery | FIXED/retained verified local behavior / High | Existing 21 Quo tests pass: raw-body HMAC, replay tolerance, allowlists, duplicates/order, transaction/RLS, interrupted durable cursor/run recovery. Three native PostgreSQL concurrency tests pass with 12 sessions and actual lock waiting. | No new implementation defect found by this review; hosted gateway behavior still requires staging. |
| Q03: staging subscription/schema/config | BLOCKED / High | Runbook reviewed and updated. No verified Apex project in current Supabase/Vercel connector context. | Supply isolated projects, staging number/scope and secure signing/reconcile credentials. Then apply/test both existing migrations and register staging-only webhook. Production remains untouched. |
| Q04: answered/missed calls and operational handling | NOT VERIFIED / High | Synthetic answered/missed/out-of-order behavior covered locally; no real calls made. | Test actual ringing, forwarding, missed/answered events, voicemail/after-hours and staff response. No qualified-call conversion or campaign attribution is claimed. |

## Test evidence and limitations

- Regression fixes were reproduced before implementation: body bypass returned 201; notification exceptions rejected stored requests; provider/DB error text leaked synthetic markers; route execution budget lacked headroom. Corresponding tests now pass.
- Unit/SQL suite and final build results are recorded in `remediation/2026-11-24/test-evidence.json` after the final run.
- Browser analytics: **9/9 groups passed** with booking writes and all external traffic intercepted; confirms six events, successful-submit-only counting, no PII in custom events and private-route exclusion.
- Responsive interactions: **45/45 passed** at desktop 1440x900, tablet 768x1024 and mobile 390x844. Includes keyboard/focus, validation, success, error, unavailable/network states, navigation, CTAs and preselection.
- Analytics/privacy: both default-disabled local production build and enabled local development fixture pass. The fixture supplies no real Google script; this is **not** GTM Preview, DebugView or production collection verification.
- Native PostgreSQL 18.7: **3/3 booking concurrency** and **3/3 Quo concurrency** checks passed; test databases dropped and project-owned cluster stopped afterward.
- Independent read-only reviewer ran 13 focused tests and found two Medium issues (timeout budget and raw DB logging). Both were reproduced by additional tests and fixed. No additional Critical/High finding was identified in that review; it is not the requested future independent release audit.
- Build passed with existing `reviews_fetch_failed` fallback warnings in this restricted environment. Live review retrieval was not certified by this build. Package install-script policy was preserved.
- Initial verification retries were harness issues: legal text assertion missed CSS uppercase; one browser harness referenced an older absent Chromium binary; first dev navigation exceeded compilation timeout. Corrected case-insensitive assertion, explicit installed Chromium path and navigation allowance; final results above supersede those failures.

## Audit findings outside this implementation scope

The original 45 findings are preserved in [audit-baseline.json](remediation/2026-11-24/audit-baseline.json). All original non-PASS findings have current status in [finding-status.json](remediation/2026-11-24/finding-status.json). Prior PASS checks remain historical unless explicitly rerun above.

W03 review-selector contrast, W04 intermittent image observation, W05 private/admin/review/chat end-to-end workflows, S02 legacy redirect behavior, S03 search indexing/Search Console, S04 local-business inputs, P02/P03 performance work, P04 field Core Web Vitals, ADS02 advertiser/account setup and ADS03 campaign/service capacity remain **NOT VERIFIED or BLOCKED** as detailed in the finding register. No performance, indexing, legal, account or policy approval is inferred from this code remediation.

## Client inputs and access still required

1. Exact isolated Vercel deployment/branch and separate Supabase project, with confirmation that previews do not use production write credentials; authorized reviewers/access through secure account sharing.
2. GTM workspace edit access, GA4 property/stream access and intended Ads account identifiers; owner decisions on primary/secondary conversions, attribution and consent. No secret keys in chat.
3. Legal operator/DBA, monitored privacy/support contacts, address where applicable, service-provider relationship, retention/sharing/recording/SMS facts and approved Privacy Policy/Terms.
4. Evidence for public certification, experience, same-day availability, $89 starting price and offer terms; actual service ZIPs, schedules, capacity and qualified-lead definition.
5. Approved staging booking identity, test inbox and Telegram destination; Resend verified sender/domain status and provider-log access.
6. Staging Quo number/scope, webhook signing secret and reconciliation secret provisioned securely; approved real-call test window and retention/access policy.
7. Hosted RLS/storage/WAF/environment access, and Search Console/Business Profile/Ads verification information for the next audit.

## Prioritized release gates

1. **Critical:** independent review of this branch and dependency upgrades; establish isolated staging. Do not deploy the booking route without the limiter migration/salt.
2. **Critical:** validate GTM import in a staging workspace, disable conflicting automatic measurement/user-data collection, approve privacy/consent implementation and capture Preview/DebugView/network proof. Keep readiness false until then.
3. **Critical:** replace legal draft structures with owner-approved operative text; verify public identity and claims.
4. **High:** execute hosted booking persistence, email/inbox, Telegram, failure and duplicate-response acceptance; verify RLS/ACLs and proxy/WAF behavior.
5. **High:** configure/test staging Quo subscription and answered/missed calls; verify interrupted recovery and operational handling.
6. **High:** resolve campaign attribution and booking idempotency strategy, then audit conversion imports/counting, advertiser verification, service capacity and campaign claims.
7. Run a new independent audit on the approved staging candidate. Any later production release/Ads activation requires a separate authorized action. **Current decision remains NO-GO.**

## Git delivery

| Commit | Purpose |
|---|---|
| `88412af` | Analytics boundary, readiness gate, GTM draft and checklist |
| `e6fee51` | Pending noindex legal routes and owner-input register |
| `3318f92` | Framework/transitive advisory upgrades |
| `c515c04` | Bounded booking request and durable quota migration |
| `30db8d5` | Booking notification reliability, deadlines and log redaction |
| `fa3c298` | Browser/concurrency verification, evidence and remediation report |

Draft PR: [#1 — remediation for independent review](https://github.com/Mr-Cullen-1/apex-solution/pull/1). The GitHub connector could not create it (integration permission 403); the existing repository Git authentication successfully created the draft. No credential was printed or stored. No merge is part of this task.
