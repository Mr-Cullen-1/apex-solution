# Book Now architecture

## Phase 1 (Sep 2026) — Supabase lead storage + Telegram delivery
## Phase 2 (Sep 2026) — Resend confirmation email

Book Now went from a UI-only stub (`submission-adapter.ts` always returned
`not_configured`) to a real lead-delivery workflow with two independent,
best-effort operational delivery channels:

```
Browser (BookNowModal)
  -> POST /api/book-now
  -> normalize + validate (src/features/booking/model.ts — unchanged since
     before Phase 1, no second form model)
  -> insert into Supabase public.service_requests   <- source of truth
       |
       +--> best-effort Telegram sendMessage   (always attempted)
       |
       +--> best-effort Resend confirmation email
              (only when the customer supplied an email address)
  -> update telegram_status / email_status on the same row
  -> respond to the browser
```

**The database insert is the source of truth.** Telegram and email delivery
are each attempted only *after* the row is safely stored, run concurrently
(see "Execution strategy" below), and neither's outcome (success or failure)
changes the response already decided for the customer, nor gates the other
channel — see "Telegram failure behavior" and "Email failure behavior" below.

## Request flow

`src/app/api/book-now/route.ts` — unchanged responsibilities from before
Phase 1 (body-size guard, JSON parse, normalize, validate, 400 on invalid
input) — now calls `submitBookNowRequest` from
`src/features/booking/submission-adapter.ts`, which orchestrates:

1. `isSupabaseConfigured()` (`src/lib/supabase/server.ts`, shared with
   Reviews) — if false, returns `not_configured` (503) without attempting
   anything. Local/CI environments without Supabase credentials still lint,
   typecheck, and build normally; this path is not new to Phase 1.
2. `createServiceRequest` (`src/features/booking/repository.ts`) — calls the
   `book_now_create_request(...)` RPC (Admin Phase 2), which
   resolves/creates the customer, inserts the row, and records a
   `request_created` CRM activity event all in one transaction (never a
   plain insert since customer linkage was introduced — see
   docs/ADMIN_ARCHITECTURE.md §26). The RPC assigns `email_status` from a
   `case when p_email is not null then 'pending' else 'not_requested' end`
   expression, explicitly cast to `public.email_delivery_status` — Postgres
   infers an untyped `case` as `text`, which a strict enum column rejects
   (error `42804`); fixed by
   `supabase/migrations/20260916100000_fix_book_now_email_status_cast.sql`
   after real QA caught every Book Now submission failing against the
   original (uncast) version. Service/category **labels are never
   trusted from the browser**:
   only `categoryId`/`serviceId` travel over the wire, and
   `resolveServiceRequestContext` (`model.ts`) looks both up against the live
   catalog (`src/content/services.ts`) at insert time. An ID that doesn't
   resolve (stale/tampered) is silently dropped, not treated as a validation
   error — a bad ID never blocks an otherwise-valid lead.
   - If the insert fails, the customer gets a genuine error (500) — see
     "Database failure behavior" below.
3. Two independent delivery functions run concurrently via `Promise.all`
   (see "Execution strategy" below):
   - `deliverTelegram` — if `isTelegramConfigured()` is false, marks
     `telegram_status = 'failed'` with `telegram_last_error = "Telegram not
     configured"` and logs a warning. Otherwise `formatLeadMessage` +
     `sendTelegramMessage` (`src/features/booking/telegram.ts`) format and
     send a plain-text Telegram message, then `markTelegramSent` /
     `markTelegramFailed` records the outcome.
   - `deliverConfirmationEmail` — a no-op if the row has no email
     (`email_status` is already `'not_requested'` from the insert). If an
     email exists but `isResendConfigured()` is false, marks
     `email_status = 'failed'` with `email_last_error = "Resend not
     configured"` and logs a warning. Otherwise `buildConfirmationEmail` +
     `sendConfirmationEmail` (`src/features/booking/email.ts`) build and
     send via the official `resend` SDK, then `markEmailSent` /
     `markEmailFailed` records the outcome.
   - Build/lint/typecheck never depend on any of these env vars.
4. Response: `{ ok: true, status: "received", requestId }` (HTTP 201)
   regardless of whether Telegram or email delivery succeeded — see below.

## `service_requests` schema

Migrations:
`supabase/migrations/20260912100000_create_service_requests.sql` (Phase 1,
unedited) +
`supabase/migrations/20260913100000_add_service_request_email_delivery.sql`
(Phase 2, additive only).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `full_name` | `text not null` | 1–120 chars |
| `phone` | `text not null` | 1–40 chars, as entered |
| `email` | `text` | optional, ≤320 chars |
| `zip_code` | `text not null` | 1–20 chars |
| `service_id` / `service_label` | `text` | derived server-side, never trusted from the client |
| `category_id` / `category_label` | `text` | derived server-side, never trusted from the client |
| `issue` | `text` | short tag: `"Other"` or null. **Admin Phase 2**: no longer overloaded with `"First-Time Customer Offer"` — see `offer_code`/`offer_label`/`discount_percent` below and docs/ADMIN_ARCHITECTURE.md §25. |
| `message` | `text not null` | 1–1200 chars, matches the existing client cap |
| `customer_id` | `uuid not null references public.customers(id)` | **Admin Phase 2** — resolved/created by `resolve_or_create_customer(...)`; see docs/ADMIN_ARCHITECTURE.md §26 |
| `request_status` | `public.request_status not null default 'NEW'` | **Admin Phase 2** — operational CRM status (`NEW`/`CONTACTED`/`SCHEDULED`/`COMPLETED`/`CANCELLED`), independent of `telegram_status`/`email_status` |
| `offer_code` / `offer_label` / `discount_percent` | `text` / `text` / `smallint` | **Admin Phase 2** — `FIRST_TIME_10` / `"First-Time Customer Offer"` / `10` when the 10% first-time offer was claimed, all three `null` otherwise |
| `sms_consent` | `boolean not null default false` | |
| `source` | `text not null default 'website'` | not customer-editable |
| `source_path` | `text` | originating route, e.g. `/services/heating` |
| `telegram_status` | `public.telegram_delivery_status not null default 'pending'` | enum: `pending` \| `sent` \| `failed` |
| `telegram_message_id` | `bigint` | set only on `sent` |
| `telegram_sent_at` | `timestamptz` | set only on `sent` |
| `telegram_last_error` | `text` | sanitized summary only, ≤500 chars, never the bot token or a raw API response |
| `email_status` | `public.email_delivery_status not null default 'not_requested'` | enum: `not_requested` \| `pending` \| `sent` \| `failed` — see "Email delivery" below |
| `email_message_id` | `text` | Resend email id, set only on `sent` |
| `email_sent_at` | `timestamptz` | set only on `sent` |
| `email_last_error` | `text` | sanitized summary only, ≤500 chars, never the Resend API key or a raw API response |
| `created_at` / `updated_at` | `timestamptz not null default now()` | `updated_at` maintained by the existing shared `public.set_updated_at()` trigger function (defined in the Reviews migration, reused here rather than redefined) |

Indexes: `created_at desc`; `(telegram_status, created_at desc)`;
`(email_status, created_at desc)` (both support a future retry/operational
view, each channel independently).

## Security

- **RLS enabled, zero policies** for `anon`/`authenticated` — PostgREST
  denies all access by default. The browser never talks to Supabase for
  Book Now; there is no browser Supabase client for this feature.
- **`service_role` grants are explicit** (`select, insert, update` — no
  `delete`, nothing in the app deletes a lead): RLS bypass and Postgres
  object grants are two separate mechanisms, and both are required (see the
  comment in the migration referencing the Reviews grant-fix migration this
  pattern was learned from).
- The Supabase secret key (`SUPABASE_URL` / `SUPABASE_SECRET_KEY`) is the
  same server-only credential Reviews already uses — no new Supabase
  project or key was introduced.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are server-only env vars, read
  only in `src/features/booking/telegram.ts` (marked `import "server-only"`,
  same pattern as `src/lib/supabase/server.ts`). Never sent to the browser,
  never accepted from the POST body, never logged, never stored in the
  database. Errors are sanitized (`sanitizeTelegramError`) so even an
  unexpected Telegram error string can't leak the token.
- `telegramChatId` is **not** an accepted field on `/api/book-now` — the
  chat is entirely server-configured; the browser cannot choose it.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and the optional `RESEND_REPLY_TO`
  are server-only env vars, read only in `src/features/booking/email.ts`
  (`import "server-only"`). Never sent to the browser, never accepted from
  the POST body, never logged, never stored in the database. Errors are
  sanitized (`sanitizeResendError`) the same way Telegram's are.
- **The recipient is never client-controlled.** `/api/book-now` does not
  accept `emailTo`/`recipient`/`to` — the only recipient is the validated,
  normalized `email` already on the stored row. No CC/BCC to internal staff
  (Apex already gets Telegram for that).
- **No marketing subscription.** This send is purely transactional — no
  Resend Contact is created, no Audience membership, no Broadcast. A Book
  Now submission is not treated as marketing opt-in.

## Telegram message format

Plain text, no `parse_mode` — a customer-controlled field (name, message)
could contain characters that break Markdown/HTML parsing, and Telegram
would reject or mangle the whole message rather than just that field.

```
🔵 NEW SERVICE REQUEST

👤 Full Name:
John Smith

📞 Phone:
(516) 555-1234

📧 Email:
Not provided

📍 ZIP Code:
11550

🛠 Service:
Heating

🔎 Issue:
Other

📝 Customer Request:
The furnace stopped heating and makes a loud noise.

💬 SMS Consent:
Yes

🌐 Source:
Apex Home Services — Book Now

🆔 Request ID:
5f2c1a3e-...

🕒 Submitted:
Sep 12, 2026, 3:41 PM ET
```

- `🔎 Issue:` is omitted entirely (not rendered as "undefined") when there is
  no issue context.
- `🛠 Service:` shows `"{category} — {service}"` when a specific subservice
  is known, just the category name when only that's known (e.g. the
  Heating → Other path), or `"Not specified"` when Book Now was opened with
  no context at all (e.g. directly from the header).
- The message is built defensively against Telegram's 4096-character
  `sendMessage` limit: only the customer's free-text message is ever
  shortened to fit (name/phone/ZIP/etc. are never truncated), and the full,
  untouched message always remains in Supabase regardless.
- Timestamp uses `America/New_York` — the business's established service
  region (`src/content/company.ts` `serviceRegion`: NY/NJ/CT/MA/RI, all US
  Eastern) is a real, already-established fact, not an invented default.

## Telegram failure behavior

If `sendMessage` fails (bad token, network error, timeout, Telegram outage):

- The lead **is not deleted or modified** beyond its `telegram_status`.
- `telegram_status` is set to `failed` and `telegram_last_error` records a
  sanitized summary (never the bot token, never a raw response body).
- The customer still receives the same `{ ok: true, status: "received" }`
  response — **the request was received**, because the database insert
  already succeeded. Telegram is an operational notification, not the
  source of truth, and a temporary Telegram outage must never force a real
  customer to resubmit.
- A failed delivery stays visible and queryable
  (`telegram_status = 'failed'`) for a future Phase 2 retry job. No
  background worker or retry cron exists yet.

## Email delivery (Phase 2)

Sent only when the customer supplied and validated an email address —
`deliverConfirmationEmail` (`submission-adapter.ts`) is a no-op otherwise,
and `email_status` is already `'not_requested'` from the insert. No fake or
fallback recipient is ever invented.

**Sender**: read from `RESEND_FROM_EMAIL` (e.g. `"Apex Home Services
<no-reply@apexhomesupport.com>"`) — never hardcoded, never
`onboarding@resend.dev`. **Reply-To**: read from `RESEND_REPLY_TO` when set,
omitted entirely otherwise (never a fabricated support address).

**Subject**: fixed — `"We received your service request"` (no emoji, no
personalization, no marketing tone).

**Content** (`buildConfirmationEmail`, `src/features/booking/email.ts`):
a restrained HTML email (table-based layout for email-client compatibility,
no images, simple Apex-blue accent) plus a plain-text version — both always
sent together, never HTML-only. Greeting uses just the first
whitespace-separated token of the stored name ("Mary-Jane O'Connor" → "Hi
Mary-Jane,"), falling back to a plain "Hello," if nothing usable remains —
deliberately simple, no name-parsing library. The request-details block
shows Service (as `"{category} — {service}"`, just the category, or omitted
entirely — never "Service: Not specified" — when Book Now was opened with no
context), Issue (omitted when absent), ZIP Code, and the customer's message,
plus a small "Request reference: `<uuid>`" line. Copy is careful never to
imply Apex itself is dispatching a technician or performing the repair —
Apex is positioned as the coordinator who will "reach out shortly to confirm
the details and help coordinate your service request," with no promised
arrival time, no same-day guarantee, no guaranteed repair. Customer-controlled
text (name, message) is HTML-escaped before interpolation — never
`dangerouslySetInnerHTML` with raw values — so a message containing `<`,
`>`, `&`, or a stray `<script>`-looking string can never break the layout or
execute as markup.

**Idempotency**: `resend.emails.send(payload, { idempotencyKey:
"book-now-confirmation/<requestId>" })` — keyed on the service request UUID,
never the email address, phone, or a timestamp, so a retried request (e.g. a
transient network retry) can never produce two confirmation emails for the
same lead.

**Success**: `email_status = 'sent'`, `email_message_id` = the Resend
response `id`, `email_sent_at = now()`, `email_last_error = null`.

**Failure** (bad key, Resend outage, missing config): the lead **is not
deleted or modified** beyond `email_status`/`email_last_error`. Telegram's
outcome is completely unaffected — the two channels update disjoint columns
independently and neither ever gates the other. The customer still receives
`{ ok: true, status: "received" }`; email failure is never surfaced as a
customer-facing error.

## Execution strategy

`Promise.all([deliverTelegram(row), deliverConfirmationEmail(row)])` — run
concurrently, not sequentially, and both awaited before the response is
sent. Concurrency is safe here because the two functions touch disjoint
columns on the same row (no write conflict) and each already catches and
records its own failure internally (neither ever rejects, so `Promise.all`
cannot short-circuit on one channel's failure). Both are awaited — rather
than fired-and-left-running in the background — because this handler runs
on a serverless function that can freeze once its response is sent, so
anything not awaited first isn't guaranteed to finish.

## Database failure behavior

If the Supabase insert itself fails (the lead was **not** safely received),
the customer gets a genuine error: `{ ok: false, status: "error", message:
"We couldn't submit your request right now. Please try again or call us." }`
at HTTP 500. The existing Call-first UI (header, mobile action bar, modal's
own phone link) remains available as a fallback. No Supabase/Postgres/SQL
detail is ever exposed to the customer.

## "Other" and service/category context

`OtherProblemCard` (`src/components/services/other-problem-card.tsx`) calls
`open({ categoryId, issue: "Other" })` — no navigation, no second modal, the
existing shared `BookNowModal`. `issue` flows through
`BookNowContext` → `BookNowModal` → the submit payload → the stored row →
the Telegram message, so "Heating → Other" reaches Telegram as
`Service: Heating` / `Issue: Other` without asking the customer to re-select
anything the site already knows.

A "Claim this offer" CTA (`offer: true`) is translated by
`resolveOfferContext` (`src/features/booking/model.ts`) into its own
`offer_code`/`offer_label`/`discount_percent` columns — see
docs/ADMIN_ARCHITECTURE.md §25. (Prior to Admin Phase 2, this had no
dedicated column and was folded into `issue` as the literal string
`"First-Time Customer Offer"`; that overload was replaced, with a one-time
backfill splitting historical rows apart, once the CRM needed `issue` and
the offer to be independently queryable.)

`source_path` captures `window.location.pathname` at submit time (e.g.
`/services/heating/boiler-repair`) — never the full URL, query string, or
request headers.

## Environment variables

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
# TELEGRAM_THREAD_ID=

RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_REPLY_TO=
```

All server-only. Never `NEXT_PUBLIC_*`. See `.env.example` (always empty
placeholders — never a real value in the repository).

## Explicitly out of scope for Phase 2

- **Admin panel** — leads are inspected directly in Supabase for now.
- **A separate Telegram bot server** — no webhook receiver, no long-polling
  worker. The bot is only a sending identity; the Next.js server calls
  `sendMessage` directly. No bot commands or Telegram buttons were added.
- **Automated retry** — a `failed` Telegram or email delivery is visible and
  queryable but nothing currently retries it automatically.
- **Resend delivery/bounce/complaint webhooks** — not implemented. "Resend
  API accepted the send" is treated as `email_status = 'sent'`; there is no
  visibility yet into actual inbox delivery, bounces, complaints, opens, or
  clicks. See "Future phase" below.
- **Resend Contacts/Audience/Broadcasts** — a Book Now submission is never
  treated as marketing consent.

## Future phase TODO (not built yet)

- Background/cron retry for rows where `telegram_status = 'failed'` or
  `email_status = 'failed'`.
- Lightweight operational view/alerting for stuck `pending`/`failed` rows
  (either channel).
- Resend webhooks (`email.delivered`, `email.bounced`, `email.complained`)
  to move `email_status` beyond "Resend accepted the send" into actual
  inbox-delivery confirmation.
