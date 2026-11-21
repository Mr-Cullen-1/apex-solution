# Quo integration preparation

**20 November 2026 — Sprint 2.1 implementation:** isolated server-side inbound call ingestion, signed webhooks, order-independent call facts, atomic call/event storage and durable leased reconciliation are implemented locally. Sprint 2.1 fixes late-event enrichment, caller ambiguity, per-item resume, persistent cursor loops, body transport retry and signing-key configuration validation. See [the current call tracking architecture and activation runbook](docs/QUO_CALL_TRACKING.md). No production migration, webhook registration, deployment, contact sync or GA4 call conversion has been performed. The historical proposal below remains future planning for contacts and lead matching; its queue/contact-link suggestions are not the Sprint 2 implementation.

Researched 16 November 2026 against official documentation. **Plan only:** no API key was requested, no customer data was exported, no Quo account settings or production webhooks were changed. Client has confirmed Admin access. Actual account entitlements, organization ID and number ID remain unverified.

## API contract

For a new integration, target the date-versioned API at `https://api.quo.com`, with `Quo-Api-Version: 2026-03-30`, an `Authorization` header containing the API key, and JSON Content-Type for bodies. Successful responses use a `data` envelope; lists use cursor pagination. Do not mix this contract with the legacy v1/OpenPhone examples. [Request conventions](https://www.quo.com/docs/2026-03-30/requests), [documentation index](https://www.quo.com/docs/llms.txt).

API keys belong on the server, never in `NEXT_PUBLIC_*`, client bundles, logs or repository files. Quo documents raw-key authentication rather than Bearer for API keys and requires owner/admin access to generate them. Use an integration-specific key supplied through the deployment secret manager only after implementation is authorized. Record key ownership and rotation procedure without recording its value. [Authentication](https://www.quo.com/docs/mdx/api-reference/authentication).

## Contacts and booking synchronization

`POST /contacts` creates a contact using `firstName`, optional `lastName`, `externalId`, `source`, `sourceUrl` and actor attribution. Proposed mapping: `externalId = Apex customer UUID`; `source = apex-website`; `sourceUrl = authenticated Apex customer URL`. Preserve the customer's original full name locally; do not assume a reliable first/last split. The versioned contact creation schema does not embed the old v1 `defaultFields.phoneNumbers` shape. [Create contact](https://www.quo.com/docs/2026-03-30/contacts/create-a-contact).

Use `POST /contacts/{contactId}/properties` for phone/email, with `type` (`phone-number` or `email`), `value` and optional `name`. Save each returned property ID for subsequent updates. Do not blindly paste v1 contact updates into this API. Confirm read/merge semantics, visibility/sharing and preservation of staff-owned fields with a disposable contact before production sync. [Contact properties](https://www.quo.com/docs/2026-03-30/contact-properties/create-a-contact-property), [list contacts](https://www.quo.com/docs/2026-03-30/contacts/list-contacts).

Proposed application flow (not implemented):

1. Accept booking through the existing server validation and persist it through the current request repository.
2. Persist a sync-outbox job alongside the saved request. A Quo outage must never turn a saved Apex request into a failed booking.
3. Worker resolves an existing Apex-to-Quo contact mapping. If absent, use verified external-ID lookup and local phone matching; ambiguous matches go to staff review.
4. Create or update only integration-owned fields. Persist returned Quo contact ID before proceeding to properties. Retry partial property writes without creating another contact.
5. Mark sync success or a sanitized actionable failure separately from customer-facing booking status. Keep Telegram/email behavior unchanged.

Proposed tables: `quo_contact_links` (unique customer UUID, organization ID, Quo contact ID, sync state); `integration_outbox` (unique action/request key, attempt count, next retry, sanitized last error); `quo_events` (unique organization/event ID, call ID, event time, processing state); `quo_calls` (organization/call ID, phoneNumberId, direction, status, duration, matched customer/request references). Any migration and row-level access design is future work, not part of this UI change.

## Calls and lead matching

The versioned API exposes `GET /calls` and call lookup by ID. List filters include `phoneNumberId`, E.164 `participant`, direction, status and creation-time bounds. Use cursor pagination for backfills; the participant filter covers the originating/receiving number, not every member of a group call. [List calls](https://www.quo.com/docs/2026-03-30/calls/list-calls).

Reuse Apex's existing US-phone identity normalization, then convert recognized ten-digit numbers to E.164 for Quo. A shared household phone is evidence of a possible match, not proof of identity. Prefer persisted Quo contact links, then one unambiguous normalized-phone match. Unknown/private callers and multiple matches remain unmatched. Link a call to an existing open request only when the association is unambiguous; otherwise show candidates to staff. Never infer a confirmed appointment or completed job from a completed call. A click on a `tel:` link is not evidence that a call occurred. Preserve existing campaign attribution; this integration does not introduce dynamic number insertion.

## Events and verification

Useful versioned events include `call.ringing`, `call.answered`, `call.completed` and `call.missed`. Recording, summary, transcript and voicemail completion are separate events and may arrive later. Start with operational call metadata; recordings/transcripts are unnecessary for basic lead matching. Unknown participant/contact resolution must remain unknown rather than being interpreted as no customer. [Event payloads](https://www.quo.com/docs/2026-03-30/webhooks-event-payloads.md).

For the versioned receiver, validate `webhook-id`, `webhook-timestamp` and `webhook-signature` against the exact raw body. Signatures use HMAC-SHA256 over the ID, timestamp and body separated by periods; the `whsec_` key contains base64 key material. Prefer the documented verifier or tested Node crypto implementation, including timestamp tolerance and constant-time comparison. Legacy `OpenPhone-Signature` webhooks require a different verifier. Do not silently accept both formats at an undifferentiated endpoint. [Signature validation](https://www.quo.com/docs/2026-03-30/webhooks-signature-validation), [legacy signatures](https://www.quo.com/docs/webhooks/legacy-signature-validation).

Proposed receiver: verify signature and expected organization/version; validate schema and size; durably deduplicate deliveries by `webhook-id` (stable across retries); enqueue work; then acknowledge. Store envelope event ID separately for cross-subscription correlation and business-operation idempotency. Process asynchronously with bounded retries. Protect terminal call state from late ringing events. Reconcile gaps through the calls API and cursor checkpoints. Do not log payloads containing personal details. Alert staff on a sustained queue failure without sending messages to customers. Subscriptions pin their payload version; restrict call events to the confirmed Apex phoneNumberId. [Webhook overview](https://www.quo.com/docs/2026-03-30/webhooks-overview).

## Phases and acceptance

1. **Read-only discovery after authorization:** verify organization/phoneNumberId for (516) 586-0826, current plan, existing integrations and webhook versions. No routing, caller-ID or number changes.
2. **Local fixtures:** test signed/unsigned/tampered/stale events, duplicate delivery, reversed order, missing participants, shared numbers, 429/5xx, expired key, partial contact creation and worker retries.
3. **Isolated staging:** synthetic customer only; verify contact/property mapping, sharing, synchronization and failure recovery. Use official test-event tooling only against the approved test receiver.
4. **Reviewable production proposal:** exact endpoint, event subscriptions, intended number/organization, field map, retention, monitoring and rollback. Obtain approval before provisioning production webhooks or changing Quo configuration, as required by the user's brief.
5. **Controlled activation:** begin with metadata-only events and a small sync cohort. Reconcile persisted requests against synced contacts. Roll back by disabling the integration worker/approved webhook; booking stays available. Do not delete customer contacts as rollback.

Open decisions: field ownership, contact sharing, retention period, which staff review ambiguous matches, API entitlement and rate budget, and whether optional future SMS is wanted. Existing service-text consent is not marketing consent. No messaging automation is proposed in this phase.
