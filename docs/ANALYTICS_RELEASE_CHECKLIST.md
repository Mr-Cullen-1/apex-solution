# Analytics staging release checklist

Status: **BLOCKED on GTM/GA4 account access and owner privacy decisions. Do not publish this container or enable Ads during remediation.**

The application no longer loads GTM by default. Set `NEXT_PUBLIC_ANALYTICS_READY=true`, `NEXT_PUBLIC_GTM_ID`, and `NEXT_PUBLIC_GA4_ID` only in isolated staging after the following configuration is prepared. These are build-time variables. Keep production unchanged.

## Workspace configuration

`analytics/gtm-workspace-draft.json` is a review/import candidate, not a verified GTM export. Import into a new staging workspace/container and resolve import validation there. Replace the draft measurement ID with an isolated test stream. Do not merge alongside the old initialization tag: replace/disable that tag and any duplicate GA4 event, history, form-submit, or click tags in the workspace.

The draft has one Google tag on `apex_analytics_init`, one GA4 event tag forwarding the six existing custom events, and one manual `page_view` tag on `apex_page_view`. All triggers require `analytics_allowed=true`. All tags explicitly set sanitized `page_location`, blank `page_referrer`, allowlisted `page_path`, and fixed non-personal page title. No URL, referrer, DOM text, form field, user ID or customer-data variables may be added.

In GA4 stream settings disable **all enhanced measurement** for this implementation, especially automatic history page views, form interactions and site search. Disable automatic user-provided data collection in the Google tag. `send_page_view=false` alone does not disable enhanced history events. The old published container is unsafe to re-enable without these steps.

## Conversion definitions

| Frontend event | GA4 event | Intended use |
|---|---|---|
| booking_click | booking_click | Funnel diagnostic, not a conversion |
| form_start | form_start | Funnel diagnostic; custom owner only |
| form_submit | form_submit | Primary booking key event, only `form_id=book_now`, after HTTP 201 + received. Use a filtered GA4 derived `booking_request_received` key event if other forms share the property; import only one booking action into Ads. |
| phone_click | phone_click | Secondary call-intent action; never represent it as an answered/qualified call |
| contact_click | contact_click | Secondary contact intent; segment email/SMS/contact-page, do not count contact-page navigation as a lead |
| service_select | service_select | Funnel diagnostic, not a conversion |

Actual answered/missed calls belong to Quo operational tracking. A primary qualified-call conversion requires an approved qualification rule, deduplication and attributable click/call IDs; that is not established by a telephone-link click. Do not import both a raw event and its derived booking key event as primary conversions. Owner must decide consent, retention and advertising-data use before activation. No assumed consent policy is embedded here.

## Required evidence before activation

- GTM Preview: exactly one tag per intended event; zero automatic `form_start`/`form_submit`; exactly one `page_view` per public pathname, none for query-only changes.
- GA4 DebugView: all six names/allowlisted parameters; booking success once; invalid/network-error responses zero submission events. Enable debug only in the isolated workspace, not in production code.
- Network inspection with synthetic query/hash/referrer/customer markers: none in any collection request, including automatic session/engagement events.
- Direct and client navigation to `/admin/login`, `/review`, `/l/<test-token>`, unknown URLs and the admin hostname: no collection. Test navigation back to public pages too. Private routes set the GA disable flag; the stream's enhanced measurement must remain disabled.
- Consent behavior approved by owner and tested with the chosen consent implementation before setting the readiness flag.
- Compare event counts to approved staging records, then retain screenshots/export version and tester/date. Account configuration and DebugView remain NOT VERIFIED until this evidence exists.

Removing query/referrer values intentionally sacrifices automatic campaign/referrer attribution. No GCLID/UTM persistence or offline-conversion attribution is claimed; design that separately with owner privacy approval before paid bidding relies on it.

References: [Google manual pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views), [enhanced measurement](https://support.google.com/analytics/answer/9216061), [configuration fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).
