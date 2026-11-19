# Sprint 1: frontend analytics

Implemented locally on 2026-11-19. No commit, push, GTM publish or deployment. No QUO code, webhook, server analytics, direct GA4 initialization or new page-view mechanism. Existing booking payload, validation, fetch, persistence, notification and result UI behavior are unchanged.

## Configuration inspected before implementation

- `src/app/layout.tsx` reads and validates `NEXT_PUBLIC_GTM_ID`, installs one `next/script` bootstrap and one noscript fallback. It was not changed.
- Public GET of `gtm.js?id=GTM-5JLZPN4Q`: HTTP 200; script includes `G-50J6LW5JET`.
- Public GET of `gtag/js?id=G-50J6LW5JET`: HTTP 200; `__ogt_auto_events.vtp_enableForm` is **true**. Automatic form events can count submission attempts, including failed bookings.
- The same public configuration includes `__ogt_1p_data_v2` with `vtp_isEnabled`, `vtp_isAutoEnabled`, `vtp_autoPhoneEnabled`, `vtp_autoAddressEnabled`, `vtp_autoEmailEnabled` and `vtp_isAutoCollectPiiEnabledFlag` set to true. These are configuration flags, not evidence that any particular customer's data was transmitted.
- Authenticated GA4/GTM workspace settings and DebugView were not available. External settings were not changed. Public script configuration is a point-in-time observation.

## Event contract

| Event | Owner and condition | Cardinality |
|---|---|---|
| `booking_click` | `BookNowProvider.open`, explicit CTA/chat action | One per activation; query initiator blocked both here and in adapter |
| `form_start` | Booking form, first trusted field change (input, select, checkbox) | Once per modal instance; focus/mount/programmatic changes do not count |
| `form_submit` | Booking fetch response, exactly HTTP 201, `ok === true`, `status === "received"` | Once per modal instance; no conversion on invalid data, unsuccessful status, network failure or rerender |
| `phone_click` | One public delegated listener, `tel:` link | One per activation; no `contact_click` for the same action |
| `contact_click` | Same listener, same-origin `/contact`, `mailto:` or `sms:` | One per activation; assistant prompts and booking CTA are not contact events |
| `service_select` | Changed homepage/form picker or link to a different catalog service/category | No initial defaults, automatic preselection, current-value reselection or search text |

The adapter accepts only six event names. It constructs payloads explicitly and validates placements, initiators, catalog IDs and public routes at runtime. Arbitrary extra keys are discarded; unknown catalog values become null. Query strings, hashes, raw referrers, link text, addresses, phone numbers, ZIPs, messages, customer names, request IDs and tokens are never copied. Nullable fields are reset on every event to avoid inheriting a previous event's service or form context in GTM.

`placement` identifies the authored entry point; `initiator` is `booking_cta`, `chat_action`, `query`, `link` or `picker`. Booking forms retain their opening origin. `form_id` is the fixed `book_now` constant, not a customer/request identifier. Service context uses only catalog IDs.

Events are limited to the explicit public route allowlist. `/admin/**`, the `admin.` hostname, `/review`, review-token URLs, campaign redirect URLs and unknown paths are excluded. The listener mounts only in the marketing layout and cleans itself up. Root GTM still loads globally, as before; this code's exclusions do not disable existing third-party tags.

Phone and other links retain their original href/default behavior. No tracking timers, `preventDefault`, redirect wrappers, additional network requests or dependency were introduced. Adapter exceptions cannot escape into the booking flow. Deduplication uses modal-local refs and one event owner, not request IDs or browser storage. Two genuine bookings in separate modal instances remain two events.

## Required account configuration before production activation

1. GA4 Admin → Data streams → the web stream for `G-50J6LW5JET` → Enhanced measurement settings: turn **Form interactions OFF**. Review Google tag → Manage automatic event detection for form collection as well. Native form submissions must not produce another `form_start`/`form_submit`.
2. Google tag → Configure tag settings → Show all → **Allow user-provided data capabilities**: disable collection for this no-PII implementation. Review property-level user-provided data settings, auto-detection, manual selectors and any enhanced-conversion/user-data tags. Do not interpret the service-text checkbox as analytics consent.
3. In GTM, configure a Custom Event trigger with the exact allowlist `^(booking_click|form_start|form_submit|phone_click|contact_click|service_select)$`. Route these through the existing Google tag to the supplied GA4 ID. Do not add another Google tag. Do not simultaneously send these names through All Clicks, Just Links, native Form Submission or automatic GA4 form triggers.
4. Map only `placement`, `initiator`, `page_path`, `form_id`, `category_id`, `service_id`, `contact_method`. Omit null parameters from outgoing GA4 requests. Do not forward the whole dataLayer, DOM values or API payload. Review inherited tag/event settings too.
5. Apply public-route/hostname exclusions to **all existing Google tags**, including automatic events on admin and private/token routes. Prevent raw query/hash/token URLs in `page_location`, `page_referrer`, automatic outbound `link_url` or user-data settings. The safe `page_path` custom parameter alone does not sanitize GA4's automatically attached URL/referrer.
6. Preserve one page-view owner. Existing history measurement is enabled in the public Google tag; inspect actual GTM rules before changing it. Query-only cleanup must not be counted as another view. This sprint adds no history listener or `page_view` push.
7. Confirm consent behavior, then use GTM Preview and GA4 DebugView to verify one event per action, zero failed-booking conversions, no private-route traffic or PII, and correct page-view counts. Only `form_submit` is the booking key event; `phone_click` is not a call or lead. `phone_lead`/QUO are deferred.

These are reviewable follow-up steps, not executed changes. No claim of end-to-end GA4 delivery or production deduplication is made until account configuration is corrected and verified.

References: [Enhanced measurement](https://support.google.com/analytics/answer/9216061?hl=en), [Google tag settings](https://support.google.com/analytics/answer/12131703?hl=en), [User-provided data collection](https://support.google.com/analytics/answer/14077171?hl=en).

## Example dataLayer payloads

```json
[
  {"event":"booking_click","placement":"service_hero","initiator":"booking_cta","page_path":"/services/cooling/ac-repair","form_id":"book_now","category_id":"cooling","service_id":"ac-repair","contact_method":null},
  {"event":"form_start","placement":"service_hero","initiator":"booking_cta","page_path":"/services/cooling/ac-repair","form_id":"book_now","category_id":"cooling","service_id":"ac-repair","contact_method":null},
  {"event":"form_submit","placement":"service_hero","initiator":"booking_cta","page_path":"/services/cooling/ac-repair","form_id":"book_now","category_id":"cooling","service_id":"ac-repair","contact_method":null},
  {"event":"phone_click","placement":"header","initiator":"link","page_path":"/contact","form_id":null,"category_id":null,"service_id":null,"contact_method":"phone"},
  {"event":"contact_click","placement":"footer","initiator":"link","page_path":"/","form_id":null,"category_id":null,"service_id":null,"contact_method":"contact_page"},
  {"event":"service_select","placement":"home_explorer","initiator":"picker","page_path":"/","form_id":null,"category_id":"cooling","service_id":null,"contact_method":null}
]
```

## Verification

All browser booking/chat responses are fixtures; no real leads or messages were sent. External analytics requests are intercepted. Browser version: Chromium 153.0.8010.12. Production build served locally at port 3128.

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed; 33 static pages. The sandboxed build logged the existing `reviews_fetch_failed` network fallback; it did not fail the build. Live review delivery is outside this change.
- `QA_BASE_URL=http://127.0.0.1:3128 node --test tests/*.test.cjs`: 13/13 passed (existing 12 plus adapter privacy/schema regression).
- `node tests/browser-analytics.cjs`: 9/9 scenario groups passed, including all shared/direct booking entry points and all 15 authored phone placements. Failed submissions emit zero form_submit, exact successful responses emit one, query openings emit zero booking_click, and no PII appears in custom payloads.
- `node tests/browser-gtm.cjs`: passed; one bootstrap/container per document, no direct GA4 or manual page-view events, client navigation/back/forward/reload and noscript preserved; zero console or runtime errors.
- Existing `tests/browser-interactions.cjs`: 45/45 passed across desktop/tablet/mobile, including accessibility, focus trap, phone layout, service preselection, validation and booking success/error/unavailable/network/invalid outcomes. External request interception was added to prevent synthetic tests reaching live analytics.

The adapter test failed before implementation (missing adapter), and the browser CTA assertion failed before implementation (zero booking events). Production browser testing identified that Playwright `selectOption` emits untrusted events: the test now verifies those are ignored and uses actual keyboard input for a genuine selection. No application workaround was added for synthetic input. A separate regression reproduced programmatic homepage clicks incorrectly counting as selections; the homepage picker now checks the native trusted-event flag too.

To reproduce on Windows, start `npm.cmd run start -- --port 3128`, set `QA_BASE_URL=http://127.0.0.1:3128`, and set `QA_BROWSER` to your installed Chromium executable for the legacy interaction script. Existing ignored artifacts are under `docs/qa/current/analytics-existing/` and `docs/qa/current/gtm/`.

## Changed files

### Analytics and booking

- `src/features/analytics/events.ts` — new typed, runtime-allowlisted adapter and route/catalog guards.
- `src/features/analytics/public-interactions.tsx` — new public delegated link listener.
- `src/features/booking/book-now-context.tsx` — mandatory origin metadata and one booking-click emission point.
- `src/features/booking/book-now-modal.tsx` — first-edit/success events and genuine service selection; submission behavior unchanged.
- `src/components/ui/booking-link.tsx` — required stable placement forwarded to provider.
- `src/app/(marketing)/layout.tsx` — mount public listener.

### CTA metadata and selection hooks

- `src/app/(marketing)/about/page.tsx`
- `src/app/(marketing)/brands/page.tsx`
- `src/app/(marketing)/contact/page.tsx`
- `src/app/(marketing)/service-areas/page.tsx`
- `src/components/chat/chat-action-row.tsx`
- `src/components/chat/quick-actions.tsx`
- `src/components/home/expertise-and-standard.tsx`
- `src/components/home/first-time-offer.tsx`
- `src/components/home/home-explorer.tsx`
- `src/components/home/pricing-strip.tsx`
- `src/components/home/service-area-explorer.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/mobile-action-bar.tsx`
- `src/components/navigation/site-header.tsx`
- `src/components/services/other-problem-card.tsx`
- `src/components/services/service-finder.tsx`
- `src/components/services/service-sections.tsx`

### Tests and documentation

- `tests/analytics.test.cjs` — new adapter security/schema regression.
- `tests/browser-analytics.cjs` — new isolated frontend event regression suite.
- `tests/browser-interactions.cjs` — isolate external traffic in existing UI regression checks.
- `docs/ANALYTICS_SPRINT_1.md` — this implementation and activation handoff.
- `docs/SEO_MEASUREMENT.md` — current event names, ownership and limits.
- `docs/BUSINESS_FACTS.md` — replace stale analytics status.

29 files total. `.env.local`, environment examples, package dependencies, backend/API files and root GTM initialization are untouched.
