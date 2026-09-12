# Book Now architecture

## Phase 1 (Sep 2026) — Supabase lead storage + Telegram delivery

Book Now went from a UI-only stub (`submission-adapter.ts` always returned
`not_configured`) to a real lead-delivery workflow:

```
Browser (BookNowModal)
  -> POST /api/book-now
  -> normalize + validate (src/features/booking/model.ts — unchanged from
     the pre-Phase-1 UI, no second form model)
  -> insert into Supabase public.service_requests   <- source of truth
  -> best-effort Telegram sendMessage
  -> update telegram_status on the same row
  -> respond to the browser
```

**The database insert is the source of truth.** Telegram delivery is
attempted only *after* the row is safely stored, and its outcome (success or
failure) never changes the response already decided for the customer — see
"Telegram failure behavior" below.

## Request flow

`src/app/api/book-now/route.ts` — unchanged responsibilities from before
Phase 1 (body-size guard, JSON parse, normalize, validate, 400 on invalid
input) — now calls `submitBookNowRequest` from
`src/features/booking/submission-adapter.ts`, which orchestrates:

1. `isSupabaseConfigured()` (`src/lib/supabase/server.ts`, shared with
   Reviews) — if false, returns `not_configured` (503) without attempting
   anything. Local/CI environments without Supabase credentials still lint,
   typecheck, and build normally; this path is not new to Phase 1.
2. `createServiceRequest` (`src/features/booking/repository.ts`) — inserts
   the row. Service/category **labels are never trusted from the browser**:
   only `categoryId`/`serviceId` travel over the wire, and
   `resolveServiceRequestContext` (`model.ts`) looks both up against the live
   catalog (`src/content/services.ts`) at insert time. An ID that doesn't
   resolve (stale/tampered) is silently dropped, not treated as a validation
   error — a bad ID never blocks an otherwise-valid lead.
   - If the insert fails, the customer gets a genuine error (500) — see
     "Database failure behavior" below.
3. `isTelegramConfigured()` — if false, the request is still `received`
   (the lead is safely stored); the row is marked `telegram_status = failed`
   with `telegram_last_error = "Telegram not configured"` and a warning is
   logged. Build/lint/typecheck never depend on these env vars.
4. `formatLeadMessage` + `sendTelegramMessage`
   (`src/features/booking/telegram.ts`) — formats and sends a plain-text
   message via Telegram Bot API `sendMessage`, then `markTelegramSent` /
   `markTelegramFailed` records the outcome on the same row.
5. Response: `{ ok: true, status: "received", requestId }` (HTTP 201)
   regardless of whether step 4 succeeded — see below.

## `service_requests` schema

Migration: `supabase/migrations/20260912100000_create_service_requests.sql`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `full_name` | `text not null` | 1–120 chars |
| `phone` | `text not null` | 1–40 chars, as entered |
| `email` | `text` | optional, ≤320 chars |
| `zip_code` | `text not null` | 1–20 chars |
| `service_id` / `service_label` | `text` | derived server-side, never trusted from the client |
| `category_id` / `category_label` | `text` | derived server-side, never trusted from the client |
| `issue` | `text` | short tag: `"Other"`, `"First-Time Customer Offer"`, or null |
| `message` | `text not null` | 1–1200 chars, matches the existing client cap |
| `sms_consent` | `boolean not null default false` | |
| `source` | `text not null default 'website'` | not customer-editable |
| `source_path` | `text` | originating route, e.g. `/services/heating` |
| `telegram_status` | `public.telegram_delivery_status not null default 'pending'` | enum: `pending` \| `sent` \| `failed` |
| `telegram_message_id` | `bigint` | set only on `sent` |
| `telegram_sent_at` | `timestamptz` | set only on `sent` |
| `telegram_last_error` | `text` | sanitized summary only, ≤500 chars, never the bot token or a raw API response |
| `created_at` / `updated_at` | `timestamptz not null default now()` | `updated_at` maintained by the existing shared `public.set_updated_at()` trigger function (defined in the Reviews migration, reused here rather than redefined) |

Indexes: `created_at desc`; `(telegram_status, created_at desc)` (for a
future Phase 2 "list failed deliveries to retry" view).

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

A "Claim this offer" CTA (`offer: true`) has no dedicated database column —
it's folded into the same `issue` column as `"First-Time Customer Offer"`
(`repository.ts`) so that context isn't silently dropped, rather than adding
a column the rest of this phase's schema doesn't call for.

`source_path` captures `window.location.pathname` at submit time (e.g.
`/services/heating/boiler-repair`) — never the full URL, query string, or
request headers.

## Environment variables

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
# TELEGRAM_THREAD_ID=
```

All server-only. Never `NEXT_PUBLIC_*`. See `.env.example` (always empty
placeholders — never a real value in the repository).

## Explicitly out of scope for Phase 1

- **Resend / email** — not installed, not called, no `RESEND_API_KEY`. Email
  is stored (optional, validated when provided) but no email is sent to the
  customer or to Apex. Planned for Phase 3, after Telegram delivery is
  verified end-to-end.
- **Admin panel** — leads are inspected directly in Supabase for now.
- **A separate Telegram bot server** — no webhook receiver, no long-polling
  worker. The bot is only a sending identity; the Next.js server calls
  `sendMessage` directly.
- **Automated retry** — a `failed` Telegram delivery is visible and
  queryable but nothing currently retries it automatically. Phase 2 TODO.

## Phase 2 TODO (not built yet)

- Background/cron retry for rows where `telegram_status = 'failed'`.
- Lightweight operational view/alerting for stuck `pending`/`failed` rows.

## Phase 3 TODO (not built yet)

- Resend-based customer confirmation email (only once Telegram is verified
  in production).
