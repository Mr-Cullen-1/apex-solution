# Reviews — Phase 1, 2, 2.5 & 3

Phase 1 built the database, domain model, and API contract for customer
reviews. Phase 2 (see "Phase 2 — customer submission page" below) adds the
real `/review` customer-facing submission form, a honeypot, and
database-backed rate limiting. Phase 2.5 (see "Phase 2.5 — split composer +
optional photo" below) redesigns the submission UI into a split
details/composer layout and adds an optional single-photo attachment,
uploaded to a private Supabase Storage bucket. Phase 3 (see "Phase 3 —
public review display" below) makes approved reviews actually visible to
the public, on the homepage and a real `/reviews` archive.

The full flow is now end to end: a customer submits at `/review` → the
review lands as `pending` → Apex approves it in the Supabase Dashboard →
it appears on the homepage and `/reviews` within a couple of minutes. The
placeholder `/reviews` page and its `ReviewList`/`Review` components
(described as "untouched" in earlier phases) have been **removed** — Phase
3 replaces them with real components reading real data; see "Phase 3" for
what took their place.

## Purpose

Let a customer eventually submit a review that Apex moderates before it can
ever be shown publicly. No review is public just because it exists in the
database.

## Request flow

```
(future) browser
  → POST /api/reviews            (submission)
  → GET  /api/reviews             (public read)
      ↓
src/app/api/reviews/route.ts
      ↓
src/features/reviews/repository.ts   (submitReview / getApprovedReviews)
      ↓ (normalize + validate happen here, in src/features/reviews/model.ts)
src/lib/supabase/server.ts           (privileged, server-only client)
      ↓
Postgres: public.reviews              (Supabase)
```

The browser never talks to Supabase directly, and never sees the secret
(service-role) key. Every read and write is mediated by the Next.js server.

## Schema

`supabase/migrations/20260911140000_create_reviews.sql` creates:

- Enum `public.review_status`: `pending | approved | rejected`.
- Table `public.reviews`:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid, PK | `gen_random_uuid()` |
| `full_name` | text, not null | **Private.** Never returned publicly. |
| `display_name` | text, not null | Public-safe derived name. |
| `rating` | smallint, not null | CHECK 1–5 |
| `review_text` | text, not null | CHECK 10–2000 chars |
| `service_slug` | text, nullable | Snapshot, not a foreign key |
| `service_label` | text, nullable | Snapshot, so a later rename doesn't retroactively relabel old reviews |
| `location_text` | text, nullable | CHECK ≤160 chars |
| `status` | review_status, not null | default `pending` |
| `is_verified_customer` | boolean, not null | default `false` |
| `is_featured` | boolean, not null | default `false` |
| `consent_to_publish` | boolean, not null | default `false`; the API additionally requires `true` to accept a submission at all |
| `source` | text, not null | default `'website'` |
| `created_at` / `updated_at` | timestamptz | `updated_at` auto-maintained by trigger |
| `approved_at` / `rejected_at` | timestamptz, nullable | auto-maintained by trigger, see below |

`full_name`, `display_name`, `service_slug`/`service_label`, and `source`
all have explicit `CHECK (char_length(...) <= N)` constraints — see the
migration for exact values.

## Moderation workflow (Phase 1 — via Supabase Dashboard)

1. Open the `reviews` table in the Supabase Dashboard.
2. Filter `status = pending`.
3. Read the submitted review (`full_name`, `review_text`, `rating`, etc.).
4. Optionally set `is_verified_customer = true`.
5. Optionally set `is_featured = true`.
6. Set `status` to `approved` or `rejected`.
7. A trigger (`reviews_set_moderation_timestamps`) sets `approved_at`/clears
   `rejected_at` on approval, sets `rejected_at`/clears `approved_at` on
   rejection, and clears both if moved back to `pending`. No manual
   timestamp maintenance is needed or possible.

There is no Apex-built admin UI in this phase — the Dashboard *is* the
moderation tool for now (Phase 4 may add one).

## Security model

- RLS is enabled on `public.reviews` with **zero policies** for `anon` or
  `authenticated` — PostgREST denies all direct access by default in that
  state. Table privileges for those roles are also explicitly revoked
  (defense in depth).
- The only way in or out is the Next.js server, using the Supabase
  **secret (service-role) key**, which bypasses RLS by design.
- A public submission payload can only ever set: `fullName`, `rating`,
  `reviewText`, `serviceSlug`, `locationText`, `consentToPublish`. The
  repository's insert call never forwards `status`, `is_verified_customer`,
  `is_featured`, or `source` from the request — those come from database
  defaults only.
- The public read query (`getApprovedReviews`) hardcodes
  `status = 'approved' AND consent_to_publish = true` in the query itself,
  not just in a UI filter, and selects explicit columns (never `select("*")`).

### RLS bypass vs. Postgres object grants — two separate mechanisms

These are easy to conflate, and conflating them caused a real production
issue, so it's documented explicitly:

1. `SUPABASE_SECRET_KEY` (or its `SUPABASE_SERVICE_ROLE_KEY` fallback) maps
   to the Postgres role **`service_role`**.
2. `service_role` **bypasses Row Level Security** — RLS policies (or the
   lack of them) never apply to it.
3. RLS bypass does **not** bypass ordinary Postgres **table-level
   privileges**. A role still needs an explicit `GRANT` to `SELECT`,
   `INSERT`, `UPDATE`, or `DELETE` on a table regardless of RLS. The
   original migration enabled RLS and revoked `anon`/`authenticated`
   privileges, but never explicitly granted `service_role` anything —
   which produced `42501 permission denied for table reviews` the moment a
   real Supabase project was connected, even though the key and RLS setup
   were both correct.
4. `supabase/migrations/20260911150000_grant_reviews_service_role.sql`
   fixes this without touching the original migration. Final grants on
   `public.reviews`:

   | Role | Privileges |
   | --- | --- |
   | `service_role` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
   | `anon` | none |
   | `authenticated` | none |

   RLS remains enabled with zero policies for `anon`/`authenticated`
   regardless of this migration — the two mechanisms are intentionally
   layered, so even a future accidental grant to those roles would still be
   blocked by RLS.

## Privacy

- `full_name` is private — collected for moderation/follow-up only.
- `display_name` is derived once at submission time by
  `deriveDisplayName()` (`src/features/reviews/model.ts`): first name + last
  initial (`"Mary-Jane O'Connor"` → `"Mary-Jane O."`), or the name unchanged
  if it's a single word (`"Madonna"` → `"Madonna"`). No fixed word-count
  assumption.
- The public DTO (`PublicReview`) is an explicit allow-list: `id`,
  `displayName`, `rating`, `reviewText`, `serviceLabel`, `locationText`,
  `isVerifiedCustomer`, `createdAt`, `approvedAt`. `full_name`, `status`,
  `is_featured`, `consent_to_publish`, `rejected_at`, `updated_at`, and
  `source` never leave `repository.ts`.
- No phone, email, or street address is collected for reviews.

## Verified Customer / Featured

Both `is_verified_customer` and `is_featured` default to `false` and are
**moderator-only** — a submission payload has no field for either, so there
is no code path by which a customer can set them. `is_featured` is an
eligibility narrowing for a future homepage query, never a bypass of
moderation: `getApprovedReviews({ featuredOnly: true })` still requires
`status = approved AND consent_to_publish = true` underneath.

## Service context

`service_slug` (if provided) is validated against the *current* active
category slugs in `src/content/services.ts` (`appliance-repair`, `cooling`,
`heating`, `water-heater-repair`) via `getServiceCategory()`. On acceptance,
both the slug and a human-readable `service_label` snapshot are stored, so a
later service rename doesn't retroactively make old reviews say something
that was never true. There is no database enum tying reviews permanently to
today's four services.

## Server repository (`src/features/reviews/repository.ts`)

- `submitReview(rawPayload)` — normalize → validate → (if configured)
  resolve service context, derive display name, insert. Returns
  `{ ok: true, status: "pending" }`, an `"invalid"` result with field
  errors, a `"not_configured"` result, or a generic `"error"` result.
- `getApprovedReviews({ limit?, featuredOnly? })` — clamps `limit` to
  1–20 (default 6), returns mapped `PublicReview[]`.

## API contract

### `POST /api/reviews`

- **As of Phase 2.5, requires `Content-Type: multipart/form-data`** (else
  `415`) — changed from plain JSON so an optional binary photo can travel
  alongside the text fields. Fields: `fullName`, `rating`, `reviewText`,
  `serviceSlug`, `locationText`, `consentToPublish` (all as strings — the
  server parses/normalizes them the same way regardless), `website`
  (honeypot), and an optional `media` file part.
- Request-level size guard: `content-length` over ~5.06 MB (`5 MB` media cap
  + a fixed multipart/field overhead allowance) is rejected `413` before the
  body is even parsed.
- `201` on success: `{ "ok": true, "status": "pending" }` — the response
  deliberately says *pending*, never "published."
- `400` on validation failure: `{ ok: false, status: "invalid", errors: {...} }`
  — `errors` may now also contain a `media` key.
- `413` if the request is too large, `415` if it isn't `multipart/form-data`.
- `503` if Supabase isn't configured: `{ ok: false, status: "not_configured", message }`.
- `500` on an unexpected error (including a photo upload failure — see
  "Media upload failure" below): `{ ok: false, status: "error", message }`.
- Never cached (`Cache-Control: no-store`).

### `GET /api/reviews`

- Optional `?limit=` (clamped 1–20 server-side). No other query parameter
  has any effect — in particular there is no way to pass `status=pending`
  or similar to widen results.
- `200`: `{ ok: true, reviews: PublicReview[] }`.
- `503`/`500` with the same shape as POST on failure.
- Success responses may be cached briefly (`public, max-age=60,
  stale-while-revalidate=300`) since they only ever contain already-public
  data; error responses are `no-store`.

## Missing configuration behavior

If `SUPABASE_URL` / `SUPABASE_SECRET_KEY` are absent:

- The app still lints, typechecks, and builds — nothing reads these env
  vars at module load time or build time, only lazily inside a request.
- `POST`/`GET /api/reviews` both return `503` with
  `status: "not_configured"` and an honest message. This mirrors the
  existing Book Now adapter's philosophy: never fake success.

## Environment variables

See `.env.example`.

```
SUPABASE_URL=
SUPABASE_SECRET_KEY=
REVIEW_RATE_LIMIT_SALT=
```

`SUPABASE_SECRET_KEY` is a privileged secret (current Supabase key naming)
— never prefix it with `NEXT_PUBLIC_`, never log it, never put a real value
in `.env.example`, README, or git history.

`SUPABASE_SERVICE_ROLE_KEY` (the older Supabase naming) is still read as a
**fallback** if `SUPABASE_SECRET_KEY` is unset — `src/lib/supabase/server.ts`
resolves `SUPABASE_SECRET_KEY ?? SUPABASE_SERVICE_ROLE_KEY`. Set only one;
`SUPABASE_SECRET_KEY` is preferred for new setups, and the fallback exists
purely for projects/environments not yet migrated to the new name.

`REVIEW_RATE_LIMIT_SALT` (Phase 2) is a server-only random secret used to
derive one-way review rate-limit keys — see "Rate limiting" above. Generate
a strong random value yourself (e.g. `openssl rand -hex 32`); never commit
a real value, and never fall back to a fixed/predictable value if it's
missing — the code deliberately doesn't either (see "Missing salt
behavior").

### Vercel

Add all three variables under **Project → Settings → Environment
Variables**, scoped to **Production** (and **Preview** too, if you want
review testing on preview deployments). Redeploy after adding them —
Next.js reads env vars at build/runtime, not retroactively.

## Migration instructions

1. Ensure a Supabase project exists and the Supabase CLI is linked to it
   (`supabase link`), or apply the SQL manually via the Dashboard's SQL
   editor.
2. Run all five migrations, **in order**: `supabase db push` (CLI), or
   paste each file into the SQL editor —
   1. `supabase/migrations/20260911140000_create_reviews.sql` (table + RLS)
   2. `supabase/migrations/20260911150000_grant_reviews_service_role.sql`
      (grants `service_role` the table privileges the Data API needs — RLS
      bypass alone is not sufficient; see "RLS bypass vs. Postgres object
      grants" above)
   3. `supabase/migrations/20260911160000_review_submission_rate_limit.sql`
      (rate-limit table + function)
   4. `supabase/migrations/20260911190000_review_media.sql` (Phase 2.5:
      media columns + the private `review-media` Storage bucket)
   5. `supabase/migrations/20260911200000_adjust_review_rate_limit.sql`
      (rate limit policy correction: adds
      `check_and_reserve_review_rate_limit`, a reservation-capable sibling
      of the original function — does not touch or drop it)
3. Confirm in the Dashboard: `public.reviews` and
   `public.review_submission_events` both exist, RLS is enabled on both, no
   policies exist for `anon`/`authenticated` on either, `service_role` has
   `SELECT`/`INSERT`/`UPDATE`/`DELETE` on `reviews` and
   `SELECT`/`INSERT`/`DELETE` on `review_submission_events`, and
   `service_role` has `EXECUTE` on both `check_and_record_review_rate_limit`
   (legacy, unused after this correction but still present) and
   `check_and_reserve_review_rate_limit` (current). Also confirm
   `public.reviews` has `media_path`/`media_mime_type`/`media_size_bytes`,
   and that Storage shows `review-media` as **Private** with no
   `anon`/`authenticated` policies against it.
4. Add the env vars locally (`.env.local`) and in Vercel, then redeploy. No
   new variable was added in Phase 2.5 or the rate limit correction.

All five migrations are idempotent (`create extension if not exists`, `if
not exists` on the enum/tables/columns, `drop trigger if exists`/`create or
replace function` before recreating, plain `grant`/bucket-upsert statements
that no-op if already applied) and each touches only its own new objects —
none modifies a previously-applied migration's objects.

## Manual moderation / test plan

1. `POST` a malformed payload (e.g. missing `reviewText`) → expect `400`.
2. `POST` a valid payload with `consentToPublish: false` → expect `400`
   (`consentToPublish` error).
3. `POST` a fully valid payload against a configured database → expect
   `201`, and the row inserted with `status = pending`,
   `is_verified_customer = false`, `is_featured = false`.
4. `GET /api/reviews` before moderation → the new review is absent.
5. In the Supabase Dashboard, set that row's `status = approved`.
6. `GET /api/reviews` again → the review is now present, and the JSON does
   **not** contain `full_name`, `status`, `is_featured`,
   `consent_to_publish`, `rejected_at`, `updated_at`, or `source`.
7. Reject a different test row → confirm it never appears in the `GET`
   response.
8. Clean up any test rows created against a real/shared database afterward.
   Never seed fake reviews into a database anyone might read from.

## Phase 2 — customer submission page

`/review` (`src/app/review/page.tsx`) is the real, live customer-facing form.
The page itself is a plain server component (static — no data fetching, no
`GET /api/reviews` call); all interactivity lives in the client component
`src/features/reviews/review-form.tsx`.

### Fields

Full Name (required, `autocomplete="name"`, one field — never split into
first/last), Rating (required, accessible 1–5 star `radiogroup`), Service
(optional `<select>` populated directly from `primaryServices` in
`src/content/services.ts` — never a duplicated hardcoded list, so a future
service catalog change is reflected automatically), Location (optional,
placeholder "City, county or state" — no address/ZIP/geolocation), Your
Review (required textarea with a live `n / 2000` counter), Consent
(required checkbox, unchecked by default).

### Shared validation, not duplicated validation

`review-form.tsx` imports `normalizeReviewSubmission` and
`validateReviewSubmission` directly from `src/features/reviews/model.ts` —
the exact same functions the server uses — for its client-side checks, and
the length/limit constants (`REVIEW_TEXT_MIN_LENGTH`,
`REVIEW_TEXT_MAX_LENGTH`, `REVIEW_LOCATION_MAX_LENGTH`,
`REVIEW_FULL_NAME_MAX_LENGTH`) live in `src/features/reviews/types.ts` as
plain exported constants. There are not two validation implementations that
could drift apart — there is one, imported from two places. (`model.ts` has
no `server-only` import and only reads plain content data, so it's safe to
bundle into the client.)

### Star rating accessibility

A real `role="radiogroup"`/`role="radio"` implementation (not five plain
clickable `<div>`s): roving `tabIndex` (only the selected — or first, before
any selection — star is in the tab order), `aria-checked`, `ArrowRight`/
`ArrowUp` and `ArrowLeft`/`ArrowDown` move the selection with wraparound,
and each star has a descriptive `aria-label` ("3 stars — Good"). Selecting a
rating shows a restrained text label (Poor/Fair/Good/Very good/Excellent)
next to the stars; the value actually submitted is always the plain integer
1–5.

### Submission contract

```
POST /api/reviews
{ fullName, rating, reviewText, serviceSlug?, locationText?, consentToPublish, website }
```

`website` is the honeypot (see below) — not part of `ReviewSubmissionPayload`
at all; it's read directly off the raw request body in `route.ts` before
anything touches validation or the database. The client never sends
`status`, `displayName`, `isVerifiedCustomer`, `isFeatured`, `source`, or
moderation timestamps — those fields don't exist anywhere in the client
form state.

### Error / success states

- Field-specific errors render next to each field, wired via
  `aria-describedby`/`aria-invalid` (see `Field`'s use of `cloneElement` in
  `review-form.tsx`).
- A `"not_configured"` / `"rate_limited"` / `"error"` server result renders
  a single form-level banner (`role="alert"`) — the customer's entered text
  is preserved, nothing is cleared on failure.
- On `201`, the form is replaced entirely by a success panel. Copy is
  deliberately non-committal about publication: "Your review has been
  submitted for approval. Once approved, it may appear on the Apex Home
  Services website." — never "published" or "live."
- The submit button is disabled and reads "Submitting…" during the
  in-flight request, preventing a double POST from a double click.

## Anti-spam

### Honeypot

A hidden `website` field (`src/features/reviews/review-form.tsx`) uses
Tailwind's `sr-only` (clip-based visually-hidden, not `display:none` — some
simple bots specifically check for and skip `display:none` fields to dodge
classic honeypots) plus `aria-hidden="true"` on the wrapper (so it's
invisible to assistive tech, not just visually clipped) and `tabIndex={-1}`
(out of the keyboard tab order) with `autoComplete="off"` (so a real user's
password manager doesn't autofill it and cause a false positive).

Server-side (`src/app/api/reviews/route.ts`), a non-empty `website` value
short-circuits **before** validation or any database access: the response
is `201 { ok: true, status: "pending" }` — identical to a real success — and
nothing is inserted, and no rate-limit quota is consumed. A bot that trips
the honeypot is never told it was caught. The only trace is a minimal
server log line (`[reviews_honeypot_triggered]`, no payload contents).

### Rate limiting — database-backed, not in-process

Serverless instances are ephemeral and horizontally distributed, so an
in-process `Map` would not enforce a consistent limit across requests. The
real check lives in Postgres.

**Policy correction (see "Rate limit policy correction" below for the full
story)**: the original policy (3 *attempts* per 60 minutes, quota consumed
the moment a request passed text validation) proved too aggressive for
ordinary QA and was replaced with **5 *successful* submissions per
60-minute window** — quota is now only ever spent by a review that actually
gets persisted.

- **Migrations**: `supabase/migrations/20260911160000_review_submission_rate_limit.sql`
  creates `public.review_submission_events` (`id`, `rate_key`,
  `created_at`); `supabase/migrations/20260911200000_adjust_review_rate_limit.sql`
  (forward-only, does not touch the original) adds
  `check_and_reserve_review_rate_limit(p_rate_key, p_limit,
  p_window_minutes) returns table(allowed boolean, event_id uuid)` — same
  atomic check as the original function, but it also returns the id of the
  event row it just inserted.
- **Policy values**: `MAX_SUCCESSFUL_SUBMISSIONS_PER_WINDOW = 5`,
  `WINDOW_MINUTES = 60` (`src/features/reviews/rate-limit.ts`) — plain
  parameters passed into the RPC, never hardcoded in SQL, so either number
  can change again without a migration.
- **Atomicity + reserve-then-release**: the function still takes a
  `pg_advisory_xact_lock` keyed on the rate key before counting, so two
  concurrent requests from the same key can't both read "under limit" and
  both get inserted. `reserveRateLimitSlot()` calls it *before* the
  (expensive, network) media upload and the review insert — reserving a
  slot optimistically, atomically. If the upload or the insert that follows
  then fails for any reason, `submitReview` calls
  `releaseRateLimitReservation(eventId)`, which deletes that specific row
  (service_role already holds `DELETE` on the table from the original
  migration — no new grant needed), restoring the customer's quota. Only a
  reservation that is *never released* — because the submission it was for
  actually succeeded — ends up counting toward the window. This
  reserve-then-release shape was chosen deliberately over a plain "check
  now, record later" two-step: splitting the check and the record into two
  separate, non-atomic calls would reopen the exact race the original
  atomic design existed to close.
- **What does NOT consume quota**: validation failures, honeypot hits,
  invalid/oversized/wrong-type images, a failed media upload, and a failed
  database insert — verified by code path (each of these returns before a
  reservation is ever made, or triggers a release if one already was) and,
  where it doesn't require the new migration to be live, by direct
  inspection of `review_submission_events` during QA.
- **Development bypass**: when `NODE_ENV !== "production"`,
  `reserveRateLimitSlot()` returns `{ allowed: true, eventId: null }`
  immediately, before touching the database at all. Local development never
  writes a rate-limit row and never needs manual cleanup between test
  submissions; validation, honeypot, and media checks all still run
  normally. Production enforcement is unaffected — this only ever short-circuits
  in a non-production `NODE_ENV`, which `next build`/`next start` never set.
- **Privacy — no raw IP or User-Agent is ever stored**: `rate_key` is
  `SHA-256(REVIEW_RATE_LIMIT_SALT + client IP + client User-Agent)`,
  computed in `hashRateKey()`. Neither raw value ever reaches the database,
  is logged, or is accepted from the request body (`ip`/`rateKey` fields in
  a POST body are never read anywhere in this codebase — only trusted
  server request headers are).
- **Why User-Agent was added**: a rate key derived from IP alone can
  collide two unrelated customers sharing one IP (office Wi-Fi, an
  apartment building, carrier-grade NAT, public Wi-Fi), and block the
  second one. Folding in User-Agent reduces — does not eliminate — that
  false-positive collision; it is not an identity or fingerprinting signal
  and is never used as one.
- **IP extraction**: the first address in `x-forwarded-for` (Vercel and
  most proxies put the real client IP there), falling back to `x-real-ip`,
  falling back to a constant placeholder if neither header is present
  (only realistic in local dev without a proxy in front).
- **Retention**: the rate-limit function opportunistically deletes its own
  rows older than 48 hours on every call — no separate cleanup job. Rows
  created during manual QA testing may be deleted once, by hand, from
  `public.review_submission_events` — this table is pure bookkeeping, never
  business data, and normal 48-hour/60-minute expiry would clear them
  anyway. No automatic cleanup beyond that expiry is triggered from
  application code.
- **Missing salt behavior**: if `REVIEW_RATE_LIMIT_SALT` is unset,
  `hashRateKey()` returns `null` (never a fixed/predictable fallback salt),
  submission proceeds **without** rate limiting, and a warning is logged on
  every affected submission — loud, not silent, in any environment.
- **Fails open on infra errors**: if the RPC call itself errors (e.g. the
  migration hasn't been applied to this project yet — see "Remote migration
  status" below, currently true for `check_and_reserve_review_rate_limit`),
  the submission is still allowed through — a rate-limiter hiccup shouldn't
  block a legitimate review that the insert step will independently succeed
  or fail on its own merits.
- **429 contract**: `{ ok: false, status: "rate_limited", message: "Too
  many review attempts. Please try again later." }`. No IP, User-Agent,
  hash, row count, or salt is ever exposed in the response. The numeric
  limit itself is also never surfaced to the customer.

### Turnstile — explicitly deferred

Not added in Phase 2. Server validation + moderation + honeypot + DB-backed
rate limiting is judged sufficient for an initial, controlled review-link
distribution (Apex sending the link directly to known customers). Add
Cloudflare Turnstile (or equivalent) later only if real spam volume
justifies the extra dependency and friction.

## Phase 2.5 — split composer + optional photo

`/review` was redesigned from a single stacked form into a split
details/composer layout, and gained one optional photo attachment. All
Phase 1/2 behavior (moderation, honeypot, rate limiting, consent, service
validation, no fake reviews) is unchanged — this phase only adds the media
path and rearranges the UI around it.

### Layout

The eyebrow/heading/intro copy that used to sit above the form now live
*inside* the white card itself, left-aligned — the review card is the whole
interface, not a form below a separate hero. At `md:` (768px) and up, the
card splits into two columns via `md:grid-cols-[38%_1fr]`: a narrower left
"Your details" column (Full Name, Rating, Service, Location — Service and
Location still share one row) and a wider right "Your review" column (the
textarea, emoji/character-count row, and the photo upload control). Below
`md:`, both columns stack into one, and the small uppercase group labels
("Your details"/"Your review") are hidden (`hidden md:block`) — they're a
desktop orientation aid, not load-bearing accessibility, and every field
still has its own real `<label>`. Consent and Submit run in one row at the
bottom of the card at `sm:` and up (`sm:flex-row sm:justify-between`),
stacked on mobile. The card's outer width still matches the navbar's outer
width via the same shared `Container`, unchanged from Phase 2.

### Review composer

`src/features/reviews/review-form.tsx`. Still a plain `<textarea>` — no
contenteditable, no HTML editor, no font toolbar. Height increased from
Phase 2's compact single-column sizing to use the room the split layout
frees up: `min-h-[6.5rem]` (104px) on mobile, `md:min-h-[10rem]` (160px) on
desktop. Placeholder: "Tell us what stood out about your experience…".
Character count (`n / 2000`) sits in the same row as a small emoji-picker
button, right-aligned.

**Emoji picker** — optional, no new dependency. A `😊` button toggles a small
`role="menu"` panel of eight common reaction emoji
(`REACTION_EMOJI` in `review-form.tsx`); selecting one inserts it at the
textarea's current cursor position via the standard
`selectionStart`/`selectionEnd`/`setSelectionRange` APIs, then returns focus
to the textarea with the cursor placed right after the inserted emoji.
Closes on Escape or an outside pointerdown, same pattern as `ServiceSelect`.
Native OS emoji input (Win+. / Cmd+Ctrl+Space) already works in the plain
textarea regardless — this button is a convenience, not the only way in.

**Emoji/Unicode correctness**: verified end-to-end (client fill → FormData
encoding → server `request.formData()` decoding) with a real
`😊👍🔥`-plus-accented-characters (`café, naïve, façade`) review text —
both survive intact through the multipart body. No normalization step
strips or mangles non-ASCII text; `normalizeReviewSubmission`'s
`collapseWhitespace`/`.slice()` only affects literal whitespace and a
length cap, neither of which touches emoji code points in ordinary review
lengths.

### Optional photo attachment

One photo, optional, JPEG/PNG/WEBP only, 5 MB max. Never a video, SVG, or
arbitrary file.

**Client UI** (`src/features/reviews/image-upload.tsx`): a styled
dropzone/button (click-to-pick or drag-and-drop on desktop; the native
mobile photo picker via a normal file input on mobile) — not a bare
`<input type="file">`. The real `<input>` stays keyboard-reachable
(`sr-only`, never `tabIndex={-1}`) inside a `<label>` that carries the
visible "Add a photo · Optional / JPG, PNG or WEBP · max 5 MB" copy as its
accessible name. After selection: a local `object:` URL preview (revoked on
replace/unmount, never read into React state as base64), filename, size,
and a labeled "Remove attached photo" button. Client-side validation
(`validateMediaFile` in `src/features/reviews/media.ts`) checks the
browser-declared `type`/`size` for instant feedback only — never the sole
gate.

**Server-side validation is authoritative and never trusts the client**:
`src/app/api/reviews/route.ts` reads the file's actual bytes and derives its
real type from **magic-byte signatures** (`sniffImageMimeType` in
`media.ts`) — JPEG (`FF D8 FF`), PNG (the 8-byte PNG signature), WEBP
(`RIFF….WEBP`) — completely ignoring the declared Content-Type and filename.
A PDF renamed to `photo.jpg` with a spoofed `image/jpeg` part header is
still rejected, because its bytes start with `%PDF`, not any of the three
allowed signatures. An SVG (XML text) fails the same way. This was verified
directly against the running server (bypassing all client JS) — see
"Media test matrix" below.

**Storage**: a new private Supabase Storage bucket, `review-media`
(`public = false`), provisioned by the Phase 2.5 migration (see below).
Object paths are server-generated: `reviews/<random-uuid>.<ext>` — never the
customer's filename, never derived from `full_name`. No client-side Supabase
upload exists or is permitted; the only path in is browser → Next.js server
→ Supabase Storage, using the same privileged service-role client as the
`reviews` table itself.

**Database**: `public.reviews` gained three nullable columns — `media_path`
(text), `media_mime_type` (text, constrained to the three allowed values),
`media_size_bytes` (integer, 1–5,242,880) — plus a CHECK constraint
requiring all three to be set together or not at all. See
`supabase/migrations/20260911190000_review_media.sql`.

**Submission flow** (`src/features/reviews/repository.ts`,
`submitReview`): normalize + validate text fields → (if invalid, return
immediately — no media is ever touched) → confirm Supabase is configured →
**rate limit** → *then* (only if a media file was attached and passed the
route-level magic-byte check) upload to Storage → insert the review row with
the resulting `media_path`/`media_mime_type`/`media_size_bytes`. Upload
happens strictly *before* insert, so a failed upload never creates a
medialess "orphan" review row and never silently drops the customer's photo
— the whole submission fails cleanly with a `"We couldn't upload your
photo. Please try again."` message, and the client preserves everything the
customer typed. If the upload succeeds but the subsequent insert fails for
an unrelated reason, the now-orphaned Storage object is deleted
best-effort (`deleteOrphanMedia`) and logged if that cleanup itself fails.

**Abuse ordering**: honeypot is checked first, before the media part is even
read (`route.ts`) — a honeypot hit returns the fake `201` without ever
sniffing bytes or touching Storage/DB. Rate limiting runs next, inside
`submitReview`, strictly *before* the (network) Storage upload — a
rate-limited request never uploads a byte. A request whose `content-length`
exceeds the 5 MB-plus-overhead cap is rejected before the multipart body is
even parsed. All of this was verified against the real running server (not
mocked) — see "Media test matrix".

**Public exposure**: unchanged from Phase 1/2 — `getApprovedReviews`
selects an explicit column list that still excludes all three media
columns, and `PublicReview` has no media field. No public URL is ever
generated for a `review-media` object in this phase; Phase 3 can add a
signed-URL layer for approved reviews only.

**Consent**: updated to also cover the attached photo — *"I agree that
Apex Home Services may publish this review and any attached photo on its
website after approval."* The supporting note (*"Your full name will not be
displayed publicly."*) is unchanged.

### Media test matrix (verified)

Run against the actual running dev server, deliberately without ever
letting a request reach a real database write or a real Storage upload
attempt against the live, real-credentialed Supabase project this
environment is connected to (see "Remote migration status" below for why
that matters) — each case pairs the media condition under test with an
unrelated, deliberately-invalid field (usually missing consent) so
`validateReviewSubmission` fails and `submitReview` returns *before* rate
limiting or any Supabase call, whatever the media check decides:

| Case | Result |
| --- | --- |
| No image | Submits normally (mocked network) |
| Real JPG | Accepted — no `errors.media` |
| Real PNG | Accepted — no `errors.media` |
| Real WEBP | Accepted — no `errors.media` |
| >5 MB file | `413`, rejected before the body is even parsed |
| SVG | `400 errors.media` — magic-byte sniff finds no match |
| PDF renamed `.jpg` (spoofed `image/jpeg`) | `400 errors.media` — same, content wins over filename/declared type |
| Remove selected image before submit | Submits without media (mocked network) |
| Honeypot + real image attached | Fake `201`, zero Storage/DB access (checked before media is read) |
| Plain JSON body (old contract) | `415` — this endpoint is multipart-only now |

"Upload fails → no false success" and "rate-limited request with file" were
verified by code inspection (upload strictly precedes insert; rate limiting
strictly precedes upload) rather than by live-triggering either against the
connected production Supabase project, to avoid writing a fabricated test
review into a real business's moderation queue or consuming real rate-limit
quota unnecessarily. See "Remote migration status".

### Remote migration status

**NOT APPLIED.** `supabase/migrations/20260911190000_review_media.sql` was
written but not run against any Supabase project from this session (no
`supabase db push`, no SQL editor paste). This dev environment's
`.env.local` does point at a real, live Supabase project, so until this
migration is applied there:

- The `media_path`/`media_mime_type`/`media_size_bytes` columns do not
  exist on the live `reviews` table.
- The `review-media` Storage bucket does not exist.
- A real submission that includes a photo would fail at the Storage upload
  step (bucket not found) and return a clean `"error"` result — no review
  row would be inserted, no orphan file would be created, and the customer
  would see the honest "We couldn't upload your photo" message rather than
  a false success. A submission with **no** photo is unaffected either way.

### External action required

Apply the new migration to the linked Supabase project — either
`supabase db push`, or paste
`supabase/migrations/20260911190000_review_media.sql` into the Supabase
Dashboard's SQL editor — then confirm in the Dashboard that:

1. `public.reviews` has the three new nullable columns with their CHECK
   constraints.
2. Storage → Buckets shows `review-media` as **Private**.
3. No Storage policy grants `anon`/`authenticated` any access to
   `review-media` objects (none should exist — RLS on `storage.objects` is
   enabled by default with zero policies, same deny-by-default posture as
   `public.reviews`).

No new environment variable is required — media upload uses the same
`SUPABASE_URL`/`SUPABASE_SECRET_KEY` server client as everything else.

### Storage cleanup limitation (documented, not automated)

Deleting a review row from `public.reviews` (e.g. a moderator manually
deleting a rejected/spam row from the Dashboard) does **not** delete its
associated Storage object — there is no DB trigger wired to Storage
deletion in this phase, deliberately, to avoid a cross-system trigger for a
rare manual action. The object becomes an orphan in `review-media` until
manually removed from the Storage browser. A future admin workflow (Phase
4) can automate this; for now it's a known, accepted limitation, not a
correctness or security issue (the object is still private and
unreachable).

### Vercel body-size caveat (documented, not solved)

Vercel's Node.js Serverless Functions runtime has a platform-level request
body size limit around 4.5 MB, independent of any limit this application
sets. This application's own cap is 5 MB (per the spec) plus a small
multipart overhead allowance — meaning a customer's photo close to the 5 MB
application limit could still be rejected by the platform itself before
this code ever runs, with a generic platform error rather than this app's
friendly "Image must be 5 MB or smaller" message. This is a known
constraint of the current architecture (server-mediated upload, no direct
client-to-Storage upload, per the "no client-side Supabase upload"
requirement) and is not solved in this phase. If it becomes a real problem,
the options are: lower the application-level cap to safely clear the
platform limit, move this route to a runtime/plan without that limit, or
revisit the "no direct client upload" constraint with a signed,
narrowly-scoped upload URL — out of scope here.

## Phase 3 — public review display

Approved reviews are now genuinely public: a homepage section and a real
`/reviews` archive, both server-rendered from Supabase, both still gated by
the same `status = approved AND consent_to_publish = true` condition that
has governed `getApprovedReviews` since Phase 1 — nothing new was loosened
to make this phase possible.

### Data flow

```
Supabase (public.reviews)
  → src/features/reviews/repository.ts   (getApprovedReviews / getHomepageReviews — server-only)
      ↓ (signed media URLs resolved here, per row, only for approved+consented rows)
  → PublicReview[] (safe DTO)
  → async Server Component (CustomerReviews on the homepage, ReviewsPage for /reviews)
  → ReviewCard (presentation-only)
```

No browser code ever queries Supabase directly, and no public Supabase
client was created — the browser only ever receives the fully-resolved
`PublicReview[]` HTML that a Server Component already rendered.

### Homepage placement and data strategy

`src/components/home/customer-reviews.tsx` (`CustomerReviews`), inserted in
`src/app/page.tsx` between `TrustStrip` and `ServicesGrid` — Pricing → Trust
Strip → Customer Reviews → Services, per the client's requested order.
`getHomepageReviews(6)` (`repository.ts`) implements the required
featured-first-with-fallback logic:

1. Query approved + consented + `is_featured = true`, up to 6.
2. If that returns one or more rows, use them — never topped up with
   non-featured rows.
3. Otherwise, fall back to the 6 most recent approved + consented reviews
   regardless of `is_featured`.

This means a real review with `is_featured = false` still appears on the
homepage today, because no review in the database is currently featured —
verified live against the actual database (see "Real data QA" below), not
assumed.

If the query fails, or there are zero approved+consented reviews at all,
`CustomerReviews` renders **nothing** (`return null`) — no "coming soon"
placeholder, no crash, and the rest of the homepage renders normally either
way, per the "never crash the homepage" requirement.

### Homepage layout: 1 / 2 / 3+ reviews

Reuses the exact pattern `ApexResults` already established for its own
before/after cards, rather than inventing a second one:

- **1 review**: a single `sm:grid-cols-2` grid with only one child, centered
  and capped at `max-w-xl` via `sm:[&:has(>:only-child)]:mx-auto
  sm:[&:has(>:only-child)]:max-w-xl` — the same CSS `:has()` trick
  `ApexResults` uses, not a separate conditional branch.
- **2 reviews**: the same grid, two balanced columns, no empty third slot.
- **3+ reviews**: the existing dependency-free `Carousel`/`CarouselItem`
  (`src/components/ui/carousel.tsx`, scroll-snap based) with the identical
  `basis-full sm:basis-[calc((100%-1.25rem)/2)]
  lg:basis-[calc((100%-2.5rem)/3)]` item classes `ApexResults` uses — 1
  visible on mobile, 2 on tablet, 3 on desktop. No new carousel dependency;
  no autoplay (kept off, as it is for `ApexResults`).

### Review card

`src/components/reviews/review-card.tsx` — one shared `ReviewCard`
component, no duplicate implementation, used by both the homepage and
`/reviews` via a `variant: "homepage" | "archive"` prop. Displays: star
rating, review text, an optional approved photo, `displayName` (never
`fullName`), a "Verified Customer" badge only when `isVerifiedCustomer` is
`true`, and service/location metadata. "homepage" clamps review text to 6
lines (`line-clamp-6`, a core Tailwind v4 utility, no plugin) and omits the
date; "archive" shows the complete, unclamped text (`whitespace-pre-line`
preserves the customer's own line breaks without any HTML/markdown parsing)
and a `month year` date derived from `approvedAt` (falling back to
`createdAt`).

Service/location follow the exact required format: `"Appliance Repair ·
New York"` when both exist, just the one present value when only one does,
and nothing at all (no dangling separator) when neither does — implemented
as `[serviceLabel, locationText].filter(Boolean).join(" · ")`.

No visible "Featured" badge exists anywhere — `is_featured` stays purely
editorial/internal, exactly as specified.

### Review media

`src/features/reviews/repository.ts` adds `createReviewMediaSignedUrl` — a
server-only helper that calls `supabase.storage.from("review-media")
.createSignedUrl(path, 600)` (10-minute expiry). It is only ever invoked
from inside `getApprovedReviews`, once per row that both (a) already passed
the `approved + consent_to_publish` filter and (b) actually has a
`media_path` — never for an arbitrary/unvalidated path, and never just
because a path happens to exist on some other row. Concurrency: all of a
query's signed-URL calls run via `Promise.all`, not sequentially — at most
6 (homepage) or 20 (`/reviews`) per request, and typically far fewer since
most reviews have no photo.

`PublicReview.mediaUrl` carries the resolved signed URL (or `null`) — the
raw `media_path` never leaves `repository.ts`. `next.config.ts` allowlists
only the Supabase Storage **sign** path
(`https://*.supabase.co/storage/v1/object/sign/**`) for `next/image`, so no
other remote host can be requested through it.

`src/components/reviews/review-media.tsx` (`ReviewMedia`) renders the
image — a small **client** component (the one legitimate need for
interactivity here) specifically so it can catch `onError` (a signed URL
can still 404 if the object was deleted after signing, or the URL expired
on a stale cached page) and hide itself entirely rather than showing a
broken-image icon. The rest of the card — text, rating, badge — is
unaffected either way.

### Media failure handling

- No `media_path` on the row → no `ReviewMedia` rendered at all, nothing to
  fail.
- `createSignedUrl` itself errors → logged server-side
  (`[reviews_media_signed_url_failed]`), `mediaUrl` resolves to `null`,
  `ReviewCard` renders the text review with no image. No raw Supabase/
  Storage error ever reaches the response.
- A signed URL that later 404s in the browser (deleted object, or an
  unusually late request against a near-expired URL) → `ReviewMedia`'s
  `onError` hides just the image; the surrounding review still renders.

### Cache / revalidation and the signed-URL/cache coordination

Both `src/app/page.tsx` and `src/app/reviews/page.tsx` set `export const
revalidate = 120` — Next.js re-renders (and re-queries Supabase) at most
once every 2 minutes, so a newly-approved review can take up to ~2 minutes
to appear. This is the documented, accepted trade-off (see spec) against
querying Supabase on every request.

The 120-second page cache is deliberately far shorter than the 600-second
signed-URL expiry: even a request served right at the edge of the cache
window embeds a URL that is, in the worst case, ~120 seconds old with
~480 seconds of validity left — comfortably never expired while the cached
page could still be served. The inverse (a short-lived signed URL baked
into a long-lived page cache) is exactly the misconfiguration the spec
warned against, and is not present here.

### `/reviews` — real archive

`src/app/reviews/page.tsx` now queries `getApprovedReviews({ limit: 20 })`
directly (no featured filter — `/reviews` shows everything approved,
matching the spec). Three states:

- **Reviews exist**: a `lg:grid-cols-2` grid of `ReviewCard variant="archive"`
  — 2 columns is prioritized for readable review text length even where a
  3-column grid might technically fit; 1 column below `lg:`. Card heights
  are not forced equal (no `items-stretch` grid coercion), so a short review
  next to a long one doesn't create an artificial blank gap.
- **Zero approved reviews** (query succeeded, empty result): *"No published
  reviews yet / Customer reviews will appear here after they are submitted
  and approved."* with a "Leave a review" CTA. No fake review data.
- **Fetch failure** (`not_configured` or `error`): a **different**, honest
  message — *"Reviews are temporarily unavailable / Please try again
  later."* — never confused with the empty state, and never leaking a raw
  Supabase/Postgres error.

Metadata: title "Customer Reviews", the spec's exact description, `noindex`
removed (now `index: true` — the old placeholder page stayed `noindex`
because it had nothing real to show; this one does). No `AggregateRating`
structured data, no review count, no star average anywhere — Phase 3
deliberately ships with **zero aggregate statistics**, matching the "no
`4.9/5`, no `500+ reviews`" requirement until a real, complete calculation
is ever justified.

### Retired: the old placeholder review system

`src/components/reviews/review-list.tsx` (the old `ReviewList`/`ReviewCard`
pair operating on a hardcoded `Review` type from `src/content/site.ts`) is
deleted, along with the now-unused `Review` type (`src/types/content.ts`)
and the always-empty `reviews` export (`content/site.ts`). Nothing else
referenced either — Phase 3 replaces this system rather than running two
review-card implementations side by side.

### Security recap (nothing new was loosened)

- `full_name` and `media_path` never leave `repository.ts` in any form.
- `SUPABASE_SECRET_KEY` never reaches the browser — verified live: the
  rendered `/reviews` HTML contains neither the raw storage path string nor
  any secret-key substring, only a fully-qualified, tokenized signed URL.
- A signed URL is minted **only** from a row that already satisfied
  `status = approved AND consent_to_publish = true` in the same query —
  there is no separate "get media URL for any path" endpoint or function.
- Review text renders as a plain JSX text child (`{review.reviewText}`),
  never `dangerouslySetInnerHTML`, never markdown-parsed — verified with a
  temporary (deleted, never committed) test route rendering a review
  containing `<script>alert(1)</script>` and an `onerror`-bearing `<img>`:
  no dialog fired, no tag executed, both rendered as inert visible text.
  Emoji (`😊🔥`) and a real line break survived the same render intact.

## Rate limit policy correction

Real (non-fabricated) QA against the shipped Phase 2/2.5/3 flow tripped the
original rate limit — 3 *attempts* per hour, consumed the moment a request
passed text validation — after only a handful of ordinary corrected
resubmissions. Root cause: quota was spent on validation success, not
submission success, so re-trying after a typo or an oversized photo cost
real quota even though nothing was ever persisted. See "Rate limiting —
database-backed, not in-process" above for the corrected design in full
(5 *successful* submissions/hour, reserve-then-release, IP+User-Agent
key, and a `NODE_ENV`-gated development bypass).

### Error UX — no more full-width top banner

Rate-limit/server/network errors (and, previously, media-upload failures)
rendered as a bordered, padded `role="alert"` banner directly under the
card heading, spanning the full card width. That pushed every field down
by the banner's own height, which could turn an otherwise one-screen form
into a scrolling one. Two changes:

- **`review_form.tsx`**: that error now renders as a single compact line
  next to the Submit button (`review-form-error`), reserving no space when
  absent. A `useEffect` on `formError` calls `scrollIntoView({ behavior:
  "smooth", block: "center" })` so it's still guaranteed visible even on a
  phone where the Submit button already sits near/below the fold — this
  only moves the *scroll position*, never the document's height.
- **A new, distinct `ReviewSubmissionResult` status,
  `"media_upload_failed"`**, separates "your photo failed to upload" from
  the generic `"error"` status, so the client can route it to the
  media-attachment's own local error slot (`review-media-error`, next to
  the photo control) instead of the form-level banner — an upload failure
  isn't a whole-form problem and never reads like one now. `errors.media`
  already existed as a slot; this only changes which server responses
  route into it.

In both cases the customer's entered text, rating, service, location,
consent, and (where safe) selected photo are left exactly as they were —
nothing is cleared on any of these error paths, so the customer can just
press submit again.

### A real bug found during this pass: the fixed mobile bar could cover Submit

While QA-ing the compact error placement at 390×844, scrolling the Submit
button into view landed it directly under the fixed mobile Call/Book Now
bar (`MobileActionBar`, `position: fixed`, ~81px + safe-area, pinned over
the bottom of the viewport regardless of scroll position) — `elementFromPoint`
at the button's own center resolved to the bar, not the button, meaning a
real tap there would have hit "Call" instead of submitting the review. This
was **not** introduced by this pass — it dates back to the footer's removal
from `/review` (`footer.tsx`'s own `pb-24 md:pb-10` had been the thing
reserving enough trailing space to let scrolled content clear the bar; a
footer-less page has nothing after the form to provide that same room) —
but it was only actually caught now. Fixed in `src/app/review/page.tsx`
with the identical convention `footer.tsx` already uses for this exact
problem (`pb-24` below `md:`, where the bar is `md:hidden`), plus
`scroll-mb-24 md:scroll-mb-0` on the Submit button itself (mirroring the
`scroll-mt-28` already used everywhere in this form for the *sticky
header*, but for the bottom edge) — native/keyboard-focus scroll-into-view
has no awareness of a `position: fixed` sibling covering part of the
viewport, so without an explicit `scroll-margin-bottom` it only scrolls the
minimum needed by the raw viewport bounds, which can still land a target
behind the bar. Verified live: a plain (non-forced) Playwright click on
Submit at 390×844 now genuinely reaches the network layer.

## Future phases (not built yet)

- **Phase 4 (optional)**: admin moderation UI, personalized review-request
  tokens for automatic verification, external review-source integrations
  (Google, Facebook, manual import — the `source` column already
  anticipates this without implementing it), pagination for `/reviews`
  beyond the current 20-review limit, and a genuine `AggregateRating` once
  there's enough real, complete review data to justify one.

Review-request tokens are explicitly deferred — no token table exists yet,
and `is_verified_customer` stays a manual moderation decision until then.
