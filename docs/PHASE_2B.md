# Phase 2B — Premium booking request experience

## Booking-flow architecture

`/book` is a server-rendered route shell containing a focused client-side request flow. The user moves through Service, What's happening, Location, Preferred timing, Contact details, Review, and a final request-prepared state. The flow is a service request, not a live scheduling engine.

## Steps and form-state strategy

All active-request values live in React component memory. Back and edit actions preserve previous answers. Browser history stores only a step hash; personal information is never written to the URL or local storage. Refresh safely restarts the active request while retaining only service or category preselection from the query string.

The desktop layout pairs the active step with a sticky contextual summary rail. Mobile uses a compact progress line and dedicated sticky Back/Continue controls; the global mobile action bar is hidden on `/book`.

## Validation

Shared typed functions normalize and validate category and service IDs, contextual problem IDs, text limits, five-digit ZIP format, state, non-past date preferences, time window, names, contact channels, contact preference, and text consent. The client uses the same rules for immediate feedback, while the API route repeats them as the authority. Request bodies over 32KB are rejected.

No additional form or schema dependency was introduced because the project had no validation library and the rules are contained and explicit.

## Service preselection

`BookingLink` accepts either `serviceId` or `categoryId` and is solely responsible for producing `/book?service=...` or `/book?category=...`. The server page parses those values against the Phase 2A taxonomy. Known values preselect the correct category or individual service; malformed, duplicated, or unknown values fall back to an unselected request without crashing. Users can always change the selection.

## Problem mapping and brands

Problem choices come from the selected category's centralized Phase 2A problem list and are presented as observations rather than diagnoses. Every category also supports Something else and an optional 1,200-character description.

Brand suggestions are built from the selected category's `supportedBrands` group IDs. The input also accepts any other text or Not sure and never rejects a request because a brand is absent. Appliance Repair includes optional appliance-type classification without creating new marketed services or routes. Indoor Air Quality remains free of speculative sub-offerings.

## Location handling

The form captures ZIP, street, optional unit, city, and state with standard autocomplete attributes. Verified states are listed directly, plus Another state with a text field. An out-of-region choice shows calm coverage that Apex currently lists the five confirmed states and that availability must be reviewed. ZIP validation checks format only and never claims eligibility.

## Timing semantics

The request captures a first preferred date, optional second date, and Morning, Afternoon, or Flexible preference. Past dates are rejected. The UI repeatedly states that preferences do not reserve an appointment or technician time.

## Contact and consent

First and last name are required. At least one of phone or email is required; requiring both was not justified by confirmed business requirements. Contact preference may be Phone, Text, Email, or No preference. Text preference requires narrow service-request communication consent and does not claim SMS delivery. Final wording requires legal review; promotional marketing consent is not included.

## Review experience

The review step summarizes service, issue, optional details, location, timing, and contact information. Each section has an Edit action that returns to the relevant step without erasing other answers.

## Submission adapter and current limitation

The UI posts normalized JSON to `/api/service-requests`. The route enforces server validation and calls `submitServiceRequest`. The current adapter returns `not_configured`; it sends, stores, emails, and logs nothing. The final state explicitly says the details are ready but Apex has not received the request. No reference number is generated.

## Privacy and security

Only service or category IDs may appear in booking query parameters. Address, contact, timing, and issue values remain in memory and the request body. No personal values are logged. The route limits body size, normalizes bounded strings, validates every identifier and field, and is not an email relay or arbitrary webhook proxy.

Before production submission, add server-side rate limiting, bot protection, provider authentication, monitoring, retention/deletion rules, privacy and legal review, and CSRF/origin controls appropriate to the chosen deployment and provider.

## Accessibility

The flow uses semantic fieldsets, legends, labels, native inputs and selects, a labelled progress region, visible focus treatment, 48px actions, step-level alert summaries, field-level error associations, and focus movement to new stage headings and confirmation. Selection never depends on color alone. Global reduced-motion behavior remains active.

## Responsive design

The flow uses a single-column mobile sequence with compact progress and safe sticky controls, expands form choices at tablet widths, and introduces the sticky summary rail at desktop widths. Long service names wrap naturally and no fixed-width form shell is used.

## Testing and QA status

The repository has no configured unit-test runner, so Phase 2B does not add a framework solely for this feature. Validation is covered by strict TypeScript, production build execution, direct query and HTTP response checks, API validation cases, and route/link audits.

The in-app browser was unavailable during final QA. Rendered inspection and interactive keyboard testing at 375px, 768px, 1024px, and 1440px could not be performed. Direct, service-preselected, category-preselected, malformed-query, metadata, and server-validation behavior were verified over the production HTTP server, but that does not substitute for a manual responsive and assistive-technology pass.

## Phase 2C / integration handoff

Replace only `submission-adapter.ts` with a server-only CRM, field-service, scheduling, or notification implementation. Configuration and secrets must come from server environment variables. On real acceptance, return an actual provider result and optional real reference ID; only then may the final UI state say Apex received the request.

Phase 2C must also define failure retries, idempotency, spam controls, delivery monitoring, service-area eligibility rules, exact consent language, data retention, and operational ownership.
