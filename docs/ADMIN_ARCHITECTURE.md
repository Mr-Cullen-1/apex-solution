# Admin Architecture

This document covers the internal `/admin` area: authentication, authorization,
the moderation flow, the audit log, the Requests/Customers CRM, admin account
management, and the environment/bootstrap steps required before it can be
used. It does not cover the public website, which is unchanged by these
phases (aside from the review-card no-image polish noted in §25).

**Phase 1** (Auth + Dashboard + Review Moderation) is covered by §1–§18.
**Phase 2** (SUPER_ADMIN account management + Requests/Customers CRM +
review-card polish) is covered by §19 onward.
**Phase 3** (visual redesign + dashboard analytics — no auth/authorization/
data-model change) is covered by §40. It supersedes the sidebar/dashboard
*descriptions* in §6/§7 below (the security model those sections describe is
unchanged) — read §40 for the current shell and dashboard content.

## 1. Two Supabase clients, two responsibilities

This project already had one privileged Supabase client
(`src/lib/supabase/server.ts`) used by every repository (reviews,
service_requests) via the `SUPABASE_SECRET_KEY` (service-role) key. Phase 1
adds a second, distinct client:

| Client | File | Key | Responsibility |
| --- | --- | --- | --- |
| Auth session client | `src/lib/supabase/auth-server.ts` | `SUPABASE_PUBLISHABLE_KEY` | Sign in, sign out, read the current Supabase Auth session. Respects RLS. Never reads/writes application tables. |
| Privileged repository client | `src/lib/supabase/server.ts` | `SUPABASE_SECRET_KEY` | All reads/writes to `reviews`, `service_requests`, `admin_users`, `review_moderation_events`. Bypasses RLS. Never handles a login session. |

The service-role key never reaches the browser, and it is never used to
fabricate an admin session. The auth client is built with `@supabase/ssr`'s
cookie adapter, backed by `next/headers` `cookies()`, so the session lives in
real `HttpOnly`/`Secure` cookies managed by Supabase's own SSR library — never
`localStorage`, never a hand-rolled token.

The whole admin sign-in flow is server-action/cookie based (see
`src/features/admin/auth/actions.ts`); there is no browser-side Supabase Auth
client and no `NEXT_PUBLIC_*` variable was introduced.

## 2. Authentication vs. authorization

- **Authentication** ("who are you?") is Supabase Auth — an email/password
  account managed entirely from the Supabase Dashboard. There is no
  `/admin/signup` route and no public admin registration anywhere in this
  app.
- **Authorization** ("are you allowed to administer Apex?") is
  `public.admin_users`. A valid Supabase Auth session is never, by itself,
  sufficient — the user must additionally have an `is_active = true` row in
  `admin_users`.

Both checks happen together in `requireAdmin()`
(`src/features/admin/auth/require-admin.ts`), the single reusable
authorization function used by every protected page and every moderation
Server Action. There is also `getAdminSession()`, a non-throwing variant used
only by `/admin/login` to decide whether an already-authorized admin should
be redirected straight to `/admin`.

### `admin_users` schema

```
public.admin_users
  user_id     uuid primary key references auth.users(id) on delete cascade
  role        admin_role ('ADMIN' | 'SUPER_ADMIN') not null
  is_active   boolean not null default true
  created_at  timestamptz not null default now()
  updated_at  timestamptz not null default now()
```

RLS is enabled with **zero** policies for `anon`/`authenticated` — the table
is only ever readable via the privileged service-role client, after the
caller's Supabase Auth session has already been independently verified.
Phase 1 treats `ADMIN` and `SUPER_ADMIN` identically for review moderation;
the role column exists for future permission differentiation. No admin
account-management UI is built in this phase.

## 3. Admin roles

Both `ADMIN` and `SUPER_ADMIN` are fully authorized for every Phase 1
capability (review moderation, dashboard). The distinction is reserved for a
future phase (e.g. account management, permissions).

## 4. Login (`/admin/login`)

- Email + password only. No signup CTA, no social login, no public
  password-reset flow.
- On submit (`loginAction`, a Server Action):
  1. `supabase.auth.signInWithPassword(...)` via the auth client.
  2. On success, the privileged client checks `admin_users` for that user id.
  3. If authorized and active → redirect to `/admin`.
  4. If the Supabase sign-in fails, **or** the account isn't an active admin
     → the same generic message is shown: *"Unable to sign in with those
     credentials."* The session is signed back out in the unauthorized case
     so no half-authorized session is left behind. This is deliberate: no
     response ever reveals whether the failure was a bad password or a
     valid-but-non-admin account (no account enumeration).
- Visiting `/admin/login` while already an authorized admin redirects to
  `/admin`.

## 5. Route protection

- `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) performs
  an **optimistic** check only: is there a Supabase Auth session at all? If
  not, `/admin/**` (except `/admin/login`) redirects to `/admin/login`. This
  never queries `admin_users` — proxy must stay fast and is never the real
  security boundary. Since Phase 4 (§41), this same check runs against the
  *effective* path after the admin-subdomain rewrite — see §41.
- `src/app/admin/(dashboard)/layout.tsx` calls `requireAdmin()` — the real
  boundary for `/admin` and `/admin/reviews`. An authenticated-but-
  unauthorized (or since-deactivated) user is signed out and redirected to
  `/admin/login`, never left in a lingering session.
- Every moderation Server Action **independently** calls `requireAdmin()`
  again before touching data — the app never assumes "the button only
  exists inside `/admin`" is sufficient authorization.

## 6. Admin layout

`src/app/admin/(dashboard)/layout.tsx` + `src/components/admin/admin-shell.tsx`:
a fixed left sidebar (Dashboard, Reviews, Sign out) on desktop, a compact top
bar with a slide-in nav drawer on mobile. It never renders the public
`SiteHeader`/`Footer` — those now live only in
`src/app/(marketing)/layout.tsx`, a sibling route group under the slimmed
true root layout (`src/app/layout.tsx`, html/body + fonts only). `/admin/**`
is outside `(marketing)` entirely, so it never inherits that shell.

## 7. Dashboard (`/admin`)

Always fresh (`export const dynamic = "force-dynamic"`, `revalidate = 0` —
no stale cached counts). Cards:

- Pending / Approved / Rejected / Featured review counts
  (`getAdminReviewCounts`, `src/features/admin/reviews/repository.ts`) — four
  `count: "exact", head: true` queries against `public.reviews`.
- Book Now signals, read-only (`getServiceRequestSignals`,
  `src/features/admin/dashboard/repository.ts`): requests in the last 24
  hours, Telegram-failed count, Email-failed count. This project has no
  canonical business timezone configured, so "last 24h" is used and labeled
  as such rather than silently inventing one. No lead list, no PII — full
  lead management is Phase 2.
- Pending Reviews links to `/admin/reviews?status=pending`.

## 8. Reviews page (`/admin/reviews`)

- Tabs: Pending (default), Approved, Rejected, All — URL-driven
  (`?status=&page=&q=`), so refresh/back/shareable links all work.
- Server-side pagination, 25 per page, plus an optional `ilike` search across
  `full_name`, `display_name`, `service_label`, `location_text`.
- Desktop: a compact table with fixed/truncated columns. Mobile: cards. Both
  open the same client-side detail drawer (`src/components/admin/reviews/review-board.tsx`)
  — no separate route/round trip, since the list DTO already carries every
  field the detail view needs.
- The admin DTO (`AdminReview`, `src/features/admin/reviews/types.ts`) is a
  dedicated internal shape, not the public `PublicReview` DTO — it includes
  `full_name`, `status`, `consent_to_publish`, timestamps, etc. that must
  never reach a public API response.

## 9. Moderation actions

All moderation writes go through three focused Postgres RPC functions
(`supabase/migrations/20260913120000_create_review_moderation_events.sql`),
never a plain `update public.reviews` from the application:

- `admin_set_review_status(review_id, admin_user_id, new_status)` — Approve /
  Reject / restore to Pending. Auto-clears `is_featured` when a featured
  review is rejected, in the same transaction.
- `admin_set_review_verified(review_id, admin_user_id, is_verified)`
- `admin_set_review_featured(review_id, admin_user_id, is_featured)` —
  **server-enforced** (not just hidden in the UI): rejects featuring any
  review whose status isn't `approved`.

Each function is `security definer`, re-validates the passed `admin_user_id`
against `admin_users.is_active` itself (defense in depth — the app only ever
passes the id `requireAdmin()` resolved from the caller's own verified
session, never a client-supplied value), writes the update and its audit
event in one statement/transaction, and only records an audit event when a
real state change occurs (a no-op submission writes nothing). `EXECUTE` is
revoked from `PUBLIC`/`anon`/`authenticated` and granted only to
`service_role`.

Reject uses a confirmation dialog ("Reject this review? It will remain
stored but will not appear publicly."). Moderation is reversible — status can
be moved back and forth between Pending/Approved/Rejected at any time. There
is no Delete action in Phase 1.

## 10. Verified Customer & Featured

- `is_verified_customer` is a manual admin toggle only — never inferred
  automatically from name/email/phone.
- `is_featured` may only be `true` while `status = approved` (enforced in
  the RPC, not just the UI). Rejecting a featured review clears the flag
  automatically.

## 11. Consent

Approval **never** overrides `consent_to_publish`. The public repository's
existing rule (`status = approved AND consent_to_publish = true`) is
untouched — Admin has no control that can set or clear consent, and the
review detail drawer shows a clear warning when consent is `false`.

## 12. Private review media

Review photos remain in the private `review-media` Storage bucket. The admin
detail drawer resolves a short-lived signed URL server-side
(`createReviewMediaSignedUrl`, moved to the shared
`src/features/reviews/signed-media.ts` so both the public and admin
repositories reuse the same signing logic) — the raw `media_path` is never
sent to the browser. If signing or loading fails, the review still renders,
with a "Photo unavailable" note instead of breaking the page.

## 13. Audit log

`public.review_moderation_events` — append-only, RLS enabled, zero
anon/authenticated policies, `service_role` has `select, insert` only (no
update/delete). Records: `review_id`, `admin_user_id`, `action`
(`approved` / `rejected` / `moved_to_pending` / `verified_enabled` /
`verified_disabled` / `featured_enabled` / `featured_disabled`), before/after
values for status/verified/featured, and `created_at`. No customer PII beyond
the review id. There is no public or admin-UI surface for audit history in
Phase 1 (not required; the table exists for accountability and future use).

## 14. Public cache invalidation

The homepage and `/reviews` use plain segment-level ISR (`export const
revalidate = 120`), not fetch tags — so every successful moderation Server
Action calls `revalidatePath("/")`, `revalidatePath("/reviews")`,
`revalidatePath("/admin")`, and `revalidatePath("/admin/reviews")`
immediately after the write succeeds (see
`src/features/admin/reviews/actions.ts`). A moderation change is reflected
publicly on the next request, not after several minutes.

## 15. Security summary

- Session cookies are managed entirely by `@supabase/ssr` (Secure, SameSite,
  HttpOnly where the library sets them) — no hand-rolled cookie/session code.
- `SUPABASE_SECRET_KEY` never reaches the browser bundle; it is only ever
  read in `server-only`-guarded modules.
- RLS is enabled on `admin_users` and `review_moderation_events` with zero
  anon/authenticated policies — deny by default, service_role only.
- Every mutation independently calls `requireAdmin()`; there is no
  "the button only exists in `/admin`" assumption anywhere.
- `/admin/**` is `noindex, nofollow` both via per-page/layout `robots`
  metadata and via `robots.ts`'s `disallow: "/admin"`, and is absent from
  `sitemap.ts` and the public header/footer.

## 16. Environment variables (names only)

New:

```
SUPABASE_PUBLISHABLE_KEY=
```

Unchanged, existing production variables (values not reproduced here):
`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `REVIEW_RATE_LIMIT_SALT`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `RESEND_API_KEY`,
`RESEND_FROM_EMAIL`.

`SUPABASE_PUBLISHABLE_KEY` must also be added to the Vercel project's
environment variables before Admin sign-in works in production.

## 17. Migrations

- `supabase/migrations/20260913110000_create_admin_users.sql`
- `supabase/migrations/20260913120000_create_review_moderation_events.sql`

Both are new, additive, forward migrations. Neither edits any previously
applied migration.

## 18. Bootstrap: creating the first admin

There is no seed data and no fabricated UUID anywhere in these migrations.
To create the first admin after the migrations are applied:

1. Supabase Dashboard → **Authentication → Users** → create (or invite) the
   admin's user with their real email and a password they'll use to sign in.
2. Copy that user's UUID from the Users table.
3. Run in the Supabase SQL Editor:

   ```sql
   insert into public.admin_users (user_id, role)
   values ('<AUTH_USER_UUID>', 'SUPER_ADMIN');
   ```

   (Use `'ADMIN'` instead of `'SUPER_ADMIN'` if that's the intended role —
   Phase 1 treats both identically.)
4. Sign in at `/admin/login` with that account.

To revoke access later, without deleting history:

```sql
update public.admin_users set is_active = false where user_id = '<AUTH_USER_UUID>';
```

## 19. Permission model (Phase 2)

Two roles, both already defined in Phase 1's `admin_role` enum:

| Capability | ADMIN | SUPER_ADMIN |
| --- | --- | --- |
| Dashboard, Requests, Customers, Reviews | ✅ | ✅ |
| `/admin/admins` (invite / activate / deactivate / change role) | ❌ (redirected to `/admin`) | ✅ |

`requireSuperAdmin()` (`src/features/admin/auth/require-admin.ts`) builds on
`requireAdmin()` — it re-verifies the session/authorization first, then
additionally narrows to `role === "SUPER_ADMIN"`, redirecting an ADMIN back
to `/admin` otherwise. Every admin-management Server Action
(`src/features/admin/admins/actions.ts`) calls `requireSuperAdmin()`
independently — never inferred from which nav link is visible. The sidebar
(`src/components/admin/admin-shell.tsx`) hides "Admins" from ADMIN as a UX
nicety only; it is never the security boundary.

## 20. Admin account provisioning (temporary password — no email invites)

`/admin/admins` (SUPER_ADMIN only) lists every admin (email + last sign-in
resolved live from Supabase Auth via the Admin API — never duplicated into
`public.admin_users`, which stores only
`user_id`/`role`/`is_active`/`must_change_password`), and supports:

- **Create Admin** — `createAdminAction` (`src/features/admin/admins/actions.ts`)
  takes an email + role. No email is ever sent by Apex or Supabase for this
  — see §34 for the full rationale and the flow this replaced. Three
  outcomes, all inside `createAdmin` (`src/features/admin/admins/repository.ts`):
  1. **New email** — a cryptographically-random temporary password is
     generated server-side (`generateTemporaryPassword`,
     `src/features/admin/admins/password.ts`: `node:crypto` `randomInt`,
     20 characters, guaranteed upper/lower/digit/symbol, never derived from
     the email/name/date), then `supabase.auth.admin.createUser({ email,
     password, email_confirm: true })` creates the Auth identity directly
     (`email_confirm: true` because a SUPER_ADMIN is explicitly vouching for
     a trusted internal administrator — there is no signup-confirmation step
     to wait on). `admin_provision_user(...)` (a new RPC, see §21) then
     provisions the `public.admin_users` row with `must_change_password =
     true` and its audit event, in one transaction. The temporary password is
     returned **once**, in this Server Action's return value — see §34 for
     everywhere it is guaranteed not to end up.
  2. **Existing email, already an Admin** — a clear "This email is already
     an Admin" result; nothing is created or changed.
  3. **Existing email, not yet an Admin** — `findExistingAuthUserByEmail`
     (bounded to a few hundred users — this project's Auth pool is
     admin-only and small) locates the identity, and `admin_provision_user`
     links it with `must_change_password = false` — **their existing
     password is never touched** ("do not reset its password without an
     explicit action"). No temporary password is shown for this case.
  4. **Partial-failure reconciliation** (outcome 1 only): if
     `admin_provision_user` fails after `createUser` already succeeded, the
     just-created Auth user is deleted again (best-effort, logged) so a
     retry never leaves an orphaned identity and success is never reported
     falsely.
- **Reset Password** — `resetAdminPasswordAction` → `resetAdminPassword`:
  generates a fresh temporary password, calls
  `supabase.auth.admin.updateUserById(targetUserId, { password })`, then
  `admin_mark_password_reset(...)` (§21) sets `must_change_password = true`
  and records the audit event. Confirmed in the UI before firing (a native
  `window.confirm`, since this immediately invalidates the target's current
  password). Shown once, exactly like Create Admin's reveal.
- **Activate / Deactivate** and **role change (ADMIN ↔ SUPER_ADMIN)** — each
  its own RPC (§21), same audit-log-in-the-same-transaction pattern as
  review moderation. Unchanged by this fix.
- No Auth user is ever permanently deleted through ordinary account
  management — `admin_users.is_active = false` only (the delete-on-failure
  path above is the one deliberate exception, and only ever undoes a
  creation that never actually finished provisioning).

## 21. Last active SUPER_ADMIN protection

Enforced **inside** `admin_set_admin_active` and `admin_set_admin_role`
(`supabase/migrations/20260914100000_admin_management.sql`), not just in the
UI:

- `admin_set_admin_active(..., p_is_active = false)` raises if the target is
  a SUPER_ADMIN and is currently the only active one.
- `admin_set_admin_role(..., p_new_role = 'ADMIN')` raises the same way if
  the target is an active SUPER_ADMIN and no other active SUPER_ADMIN
  exists.

Both surface as a clear message ("This is the last active Super Admin — it
can't be deactivated or demoted.") rather than a generic failure.

## 22. Admin management audit

`public.admin_management_events` — append-only, RLS enabled, `service_role`
has `select, insert` only. Actions: `created`, `activated`, `deactivated`,
`role_changed`, `password_reset`, each recording `actor_admin_user_id`,
`target_admin_user_id`, and the relevant before/after role or active state.
`password_reset` records only the target/actor/timestamp — **never** the
temporary password, a hash of it, or anything password-derived. `invited`
remains in the table's allowed-action list purely so historical rows from
the retired email-invite flow (§34) stay valid — the application itself
never writes that action anymore.

## 23. Requests (CRM)

`/admin/requests` (ADMIN or SUPER_ADMIN) — newest first, URL-driven filters
(`status`, `telegram`, `email`, `offer`, `service`, `q`, `page`), 25/page
server-side pagination. The list never renders a request's full message
(truncated preview only); the detail page
(`/admin/requests/[id]`) shows everything: contact info, service/issue,
full customer message, offer, Telegram/Email delivery state (never a
secret/token — see §24 of the original Reviews doc's equivalent posture),
operational status control, activity timeline, and a note composer, plus a
link to the linked Customer profile.

**Operational status** (`request_status`: `NEW` → `CONTACTED` → `SCHEDULED`
→ `COMPLETED` / `CANCELLED`) is a new column, entirely independent of
`telegram_status`/`email_status` (which track delivery, not the lead's
lifecycle). Changed only via `admin_set_request_status(...)` — one
transaction, one `customer_activity_events` row per real change, reversible
at any time (moving back to `NEW` is allowed). **Opening or viewing a
request never resends Telegram or Resend** — those only ever fire once, at
creation time, from `submitBookNowRequest`.

## 24. Telegram / Email visibility

Unchanged data, now surfaced in the admin UI: `telegram_status` (`pending` /
`sent` / `failed`) + `telegram_sent_at`, and `email_status` (`not_requested`
/ `pending` / `sent` / `failed`) + `email_sent_at`. Message IDs are shown
only where present; the Telegram bot token and Resend API key are never
read by any admin code path in the first place, so there is nothing to
accidentally expose.

## 25. The 10% first-time offer

Previously (Book Now Phase 1), a claimed offer was stored by overloading
`issue = 'First-Time Customer Offer'` — a display hack, not a real data
model. This phase adds dedicated columns instead:

```
service_requests.offer_code        text   -- 'FIRST_TIME_10' or null
service_requests.offer_label       text   -- 'First-Time Customer Offer' or null
service_requests.discount_percent  smallint -- 10 or null
```

`src/content/offers.ts`'s `firstTimeOffer` is the single source for
`code`/`discountPercent`; `src/features/booking/model.ts`'s
`resolveOfferContext(offer: boolean)` is the only place a submission's
boolean flag becomes these three columns. `issue` and the offer are now
fully independent — a customer can claim the offer and separately describe
a real problem. The admin UI shows "First-Time Customer — 10%" (or "No
offer"), never the raw `offer_code`.

**Historical backfill** (in
`supabase/migrations/20260914130000_service_requests_crm_fields.sql`): every
existing row with `issue = 'First-Time Customer Offer'` gets the three offer
columns populated and `issue` set back to `null` (that value was never real
problem-context text — it was only ever a stand-in for the flag). No other
`issue` text is touched.

## 26. Customers (CRM identity)

`public.customers` — deterministic identity, matched (never fuzzy, never by
name alone) with this priority, inside `resolve_or_create_customer(...)`
(`supabase/migrations/20260914110000_customers.sql`):

1. Exact match on `normalized_phone`.
2. Exact match on `normalized_email` (only if no phone match).
3. Otherwise, create a new customer.

A `pg_advisory_xact_lock` (keyed on the phone+email pair) inside that
function serializes concurrent resolutions for the same identity so two
simultaneous Book Now submissions from the same brand-new customer can't
both create duplicate rows. An existing customer's `email`/`zip_code` are
enriched only when previously `null` (progressive enrichment); `full_name`
and `phone` — the identity fields — are never overwritten by a later
submission.

**Phone normalization** (`src/features/customers/phone.ts`,
`normalizeUsPhone`) is deliberately pragmatic: digits-only, with a leading
US country-code `1` stripped when the result is 11 digits — enough to match
`(516) 555-1234`, `5165551234`, and `+1 516 555 1234` to the same key. This
is for **CRM identity matching only** — it is explicitly not call
tracking/telephony, which remains out of scope (§29).

`service_requests.customer_id` links every request to its customer
(`NOT NULL` after the one-time backfill below). New requests are created via
`book_now_create_request(...)` — one RPC, one transaction: resolve/create
the customer, insert the `service_request`, and record a `request_created`
activity event, so a failure partway through never leaves a half-created
CRM state. `src/features/booking/submission-adapter.ts` and the public Book
Now UX are unchanged; only `createServiceRequest` (`src/features/booking/repository.ts`)
was updated to call the new RPC instead of a plain insert.

**Historical backfill**: every pre-existing `service_requests` row (which
had no `customer_id`) is walked oldest-first and matched/linked using the
same phone-then-email priority (a one-time `do $$ ... $$` block, not a
persisted function), so a repeat customer's earliest historical request
becomes their "first seen" record. No row is deleted or recreated.

## 27. Customer profile & request history

`/admin/customers` (ADMIN or SUPER_ADMIN) lists customers with `total_requests`/
`last_request_at` from a small read-only aggregate view,
`public.customer_request_summary`
(`supabase/migrations/20260914140000_customer_request_summary_view.sql`) —
avoids a per-row round trip since PostgREST's query builder can't express an
arbitrary `GROUP BY`. `/admin/customers/[id]` shows the summary
(name/phone/email/ZIP/first request/most recent/total), the **full**
chronological request history (every historical request, never
summarized away), the activity timeline, and a note composer. **No customer
login, password, dashboard, or signup exists anywhere** — this is purely
internal CRM data.

## 28. Activity timeline & internal notes

`public.customer_activity_events`
(`supabase/migrations/20260914120000_customer_activity_events.sql`) —
append-only, RLS enabled, `service_role` `select, insert` only. Event
types, deliberately limited to real CRM/system actions:

```
request_created, request_status_changed, admin_note_added,
telegram_sent, telegram_failed, email_sent, email_failed
```

Notes (`event_type = admin_note_added`) are added via `admin_add_note(...)`,
shared by both the Request detail and Customer profile screens
(`src/features/admin/activity/actions.ts` → `addNoteAction`, ADMIN or
SUPER_ADMIN, not account-management-gated) — optionally scoped to one
specific request (`service_request_id` set) or to the customer generally
(`null`). Notes are append-only and never shown publicly. Actor emails
shown in the timeline are resolved from one `listAdmins()` call per page
render (a small map), never a per-event Supabase Auth API call.

## 29. Call tracking — explicitly deferred

**Not implemented, and deliberately so.** No call logs, no inbound/outbound
call status, no call-button-click tracking, no Twilio/CallRail/Aircall
integration, no phone webhooks, no call duration/recording/history. There
are no call-related `event_type` values anywhere in
`customer_activity_events` (`call_logged`, `call_started`, `call_completed`,
`call_button_clicked`, `inbound_call`, `outbound_call` do not exist and must
not be added without a dedicated future phase). `normalizeUsPhone` (§26)
exists purely for CRM identity matching, not telephony. Request/Customer
detail pages link nowhere for "Call customer" and log nothing about calls.

## 30. Review card — no-image polish

Public review cards (`src/components/reviews/review-card.tsx`, used on the
homepage and `/reviews`) now render one of two **explicit** variants based
on whether the review has a usable photo — never a generic AI/stock/fake
image:

- **Photo variant** — unchanged composition (image, then rating/text/meta).
- **Text-only variant** — a restrained brand-tinted surface
  (`bg-brand-soft/50`), a small quote mark (`QuoteMarkIcon`), rating near
  the top, the review text wrapped in a `flex-1 items-center` block (so a
  short review — e.g. "Great service!" — is vertically centered within the
  card's available height instead of leaving a large empty area below it,
  while a long review simply fills the same space top-to-bottom with no
  length-specific branching needed), and the customer/verified/service/
  location metadata anchored at the bottom via the shared footer markup.

`ReviewCard` is a client component (it already needed `ReviewMedia`'s
`onError` underneath it): a photo that 404s **after** the page rendered
(a signed URL whose object was deleted, or one served from a stale cache
past its validity window) sets `photoFailed`, and the whole card falls back
to the text-only variant — never a broken-image shell. This is on top of,
not instead of, the existing server-side fallback (a review whose signed
URL fails to mint at all already renders with `mediaUrl: null`, taking the
same text-only path). The Verified Customer badge is unchanged and sized to
never overpower the review text. `/reviews`' full/unclamped text behavior
and the homepage's clamped preview are both preserved exactly as before —
only the no-photo layout changed.

## 31. Security (Phase 2 additions)

- No table in this phase is ever written to directly from the browser:
  `customers`, `service_requests` (already true), `customer_activity_events`,
  `admin_users` (already true), `admin_management_events` are all
  service_role-only, RLS enabled, zero anon/authenticated policies.
- `resolve_or_create_customer`, `book_now_create_request`,
  `admin_set_request_status`, `admin_add_note`, `admin_finalize_invite`,
  `admin_set_admin_active`, and `admin_set_admin_role` all revoke `EXECUTE`
  from `PUBLIC`/`anon`/`authenticated` and grant it only to `service_role`;
  every admin-facing one re-validates the passed admin id against
  `admin_users.is_active` itself.
- The admin reviews search (`src/features/admin/reviews/repository.ts`) and
  the new Requests/Customers search both use the same two-layer escaping
  (ILIKE-wildcard escaping, then PostgREST quoted-literal escaping) so a
  crafted search string can never break out of its intended
  `column.ilike.<value>` clause inside the `.or()` filter.
- Customer phone/email/name are never exposed in any public route, public
  API, or logged verbatim — server logs only ever include IDs and short
  error codes, matching the existing pattern from Reviews/Book Now.

## 32. Migrations

- `supabase/migrations/20260914100000_admin_management.sql`
- `supabase/migrations/20260914110000_customers.sql`
- `supabase/migrations/20260914120000_customer_activity_events.sql`
- `supabase/migrations/20260914130000_service_requests_crm_fields.sql`
- `supabase/migrations/20260914140000_customer_request_summary_view.sql`
- `supabase/migrations/20260915100000_admin_temporary_password_provisioning.sql`
  (adds `admin_users.must_change_password`, widens the
  `admin_management_events` action allow-list, drops the now-unused
  `admin_finalize_invite`, and adds `admin_provision_user`/
  `admin_mark_password_reset` — see §34-§39)
- `supabase/migrations/20260916100000_fix_book_now_email_status_cast.sql`
  (re-issues `book_now_create_request` with an explicit
  `::public.email_delivery_status` cast on the `email_status` value — real
  Book Now regression QA found every submission failing with Postgres
  `42804` against the original, uncast version; see
  docs/BOOK_NOW_ARCHITECTURE.md)

All seven are new, additive, forward migrations, applied in that order (each
depends on tables/functions created by the ones before it). None edits any
previously-applied migration.

## 33. Future phase: telephony / call tracking

Explicitly out of scope for both Admin Phase 1 and Phase 2. When it's
scheduled: a dedicated migration would add its own event types (kept out of
the current `customer_activity_events` allowed-action list on purpose) and
likely its own table(s) for call records, plus a provider integration
(Twilio/CallRail/Aircall or similar) — none of which exists yet, and none of
which should be inferred from `normalizeUsPhone` or any other Phase 2 code.

## 34. Why email invitations were removed entirely

Two email-invitation architectures were tried and both were replaced:

1. **PKCE `?code=` + `/auth/callback`** — broke in real QA
   (`otp_expired` on a freshly-sent invite) because a confirmation link's
   own **GET** request consumes the one-time token, and email
   clients/security scanners routinely GET links automatically before the
   real recipient clicks anything.
2. **`token_hash` + `verifyOtp` behind an explicit "Accept invitation"
   button** (`/admin/accept-invite`) — fixed the prefetch problem, but the
   product direction changed: **no email dependency for admin provisioning
   at all**. `inviteUserByEmail`, Supabase invitation emails, custom SMTP,
   `TokenHash`/`verifyOtp` for admin onboarding, and `/admin/accept-invite`
   have all been removed. `/auth/callback` was also removed — nothing in
   this codebase used it once the invite flow it existed for was retired
   (audited via a full-repo grep before deletion).

Admin provisioning is now **entirely internal**: a SUPER_ADMIN generates a
temporary password themselves and hands it to the new admin through
whatever secure channel they choose (in person, a password manager share,
an internal chat DM — Apex's choice, not this application's concern). This
removes the entire email-deliverability/prefetch/template surface area at
the cost of one manual "share this password" step, which the product
decided is the simpler tradeoff. Resend's Book Now confirmation email
(`src/features/booking/email.ts`) is completely unrelated and unchanged.

## 35. Final provisioning flow

```
SUPER_ADMIN → /admin/admins → Create Admin (email + role)
  → requireSuperAdmin()
  → generateTemporaryPassword() — crypto-random, 20 chars, never derived
      from the email/name/date (src/features/admin/admins/password.ts)
  → supabase.auth.admin.createUser({ email, password, email_confirm: true })
  → admin_provision_user(...) — admin_users row + audit event, one
      transaction (see §21)
  → temporary password returned ONCE in the Server Action's return value

UI shows, inline, replacing the Create Admin form:
  "Admin created successfully"
  Email: admin@example.com
  Temporary password: XXXXXXXXXXXXXXXXXXXX  [Copy password]
  "Share this password securely with the administrator. They will be
   required to create a new password after their first login. This
   password will not be shown again."
  → this exists only in React component state; reload/navigate-away and
    it is gone for good — nothing persists it anywhere

New admin → /admin/login → email + temporary password
  → requireAdmin() sees must_change_password = true
  → redirected to /admin/change-password (every other /admin/** route
    redirects here too, until this is resolved)
  → sets a new password (+ confirmation)
  → auth.updateUser({ password }) on their OWN session
  → must_change_password cleared to false
  → redirect("/admin") — now behaves like any other admin
```

## 36. Change password route (`/admin/change-password`)

`src/app/admin/change-password/page.tsx` — standalone (no sidebar, no
marketing shell), serves **two** purposes with the same page and the same
`changePasswordAction`:

1. The mandatory first change after SUPER_ADMIN provisioning or a
   Reset Password.
2. A voluntary change later, reached from "Change Password" in the
   sidebar (`src/components/admin/admin-shell.tsx`) — any signed-in admin
   can visit this at any time.

It deliberately uses `getAdminSession()` (the non-redirecting check), never
`requireAdmin()`: `requireAdmin()` itself redirects to this exact page
whenever `mustChangePassword` is true, so if this page's own action also
called `requireAdmin()`, a forced-change admin would loop here forever
instead of ever being allowed to submit the form. An unauthenticated caller
is redirected to `/admin/login` instead.

`changePasswordAction` (`src/features/admin/auth/actions.ts`): validates
`password.length >= 8` and `password === confirmPassword` server-side
(never logged, never in a URL/query param); calls `auth.updateUser({
password })` on the **signed-in admin's own session** — never
`auth.admin.updateUserById(...)` (the service-role/admin variant), so a
SUPER_ADMIN can never see or set another admin's password; only *after*
that succeeds does it clear `admin_users.must_change_password` (a direct
privileged-client update — this is a routine self-service state clear, not
a SUPER_ADMIN action, so no audit event is recorded for it, unlike
`password_reset`); then `redirect("/admin")`. If this project's Supabase
Auth "Password Security" settings ever require re-authentication for a
password change, that requirement is enforced by Supabase's own API and
would surface as a generic `updateUser` error here — no additional
"current password" field exists in the form today.

## 37. First-login enforcement

`requireAdmin()` (`src/features/admin/auth/require-admin.ts`) now selects
`must_change_password` alongside `role`/`is_active`, and redirects to
`/admin/change-password` whenever it's true — **before** returning an
identity to any caller. Since every protected page (`/admin`,
`/admin/requests`, `/admin/customers`, `/admin/reviews`, `/admin/admins`)
and every moderation/management Server Action already calls `requireAdmin()`
independently, this one change blocks all of them uniformly with no
per-route logic needed, and with no redirect loop: `/admin/change-password`
never calls the redirecting `requireAdmin()` itself (§36).
`requireSuperAdmin()` builds on `requireAdmin()`, so a SUPER_ADMIN with
their own pending temporary password is blocked from Create Admin/Reset
Password/etc. too, until they fix their own password first.

## 38. Existing invited/Auth-only identities

Because email invitations are gone, "Resend Invite" and any
invitation-status UI were removed along with them — see §12 of this fix.
Anyone who received an old invitation email from before this change and
never completed it now simply has a Supabase Auth identity with no usable
password and (if `admin_finalize_invite` had run) an `admin_users` row.
There is no way to "resend" that old-style email anymore. Recovery is the
same **Reset Password** action §20 already describes for any existing
admin: a SUPER_ADMIN issues a fresh temporary password for that identity
and shares it directly. This reuses `resetAdminPassword` — no new code path
was needed for this case.

## 39. Environment / configuration

No new environment variable, and no Supabase Dashboard configuration is
required by this fix. The previously-required Redirect URL allow-list
entries (for the retired invite flows) are no longer read by any code path
in this project and can be removed from Supabase Dashboard → Authentication
→ URL Configuration → Redirect URLs at your discretion — leaving them is
harmless, since nothing points at them anymore. No SMTP customization, no
email template changes: `supabase.auth.admin.createUser` and
`updateUserById` never trigger a Supabase email.

## 40. Phase 3: visual redesign + dashboard analytics

A visual/structural redesign of the whole `/admin` area — no auth,
authorization, RLS, migration, or route change. Every existing Server
Action, RPC, filter, and mutation from Phases 1–2 is unchanged; this phase
only touches presentation and adds a handful of additive, read-only
dashboard queries.

**Admin shell** (`src/components/admin/admin-shell.tsx`) — desktop: a fixed
264px sidebar grouped into "Overview" / "Operations" / "Administration"
(icons + active/hover state) plus a sticky top bar (breadcrumb derived from
the current route + an account chip showing the signed-in admin's email and
role). Mobile: unchanged slide-in drawer pattern, restyled. The
Admins-nav-item role gating (`role === "SUPER_ADMIN"`) is still a UX nicety
only — `requireSuperAdmin()` on the route remains the real boundary.

**Design tokens** (`src/app/globals.css`) — two additions, both validated
against `dataviz` skill's palette rules before being added:

- `--status-critical` (`#c0362c`) — reserved for genuine operational
  failures (Telegram/Email delivery failed), never reused as a brand
  accent. 5.52:1 text contrast on white.
- `--status-pipeline-1..4` — an ordinal ramp (`color-mix` steps of
  `--brand-primary`) for the request lifecycle NEW→CONTACTED→SCHEDULED→
  COMPLETED, used **only** in the status-distribution chart's mark fills
  (validated `--ordinal`: monotone lightness, light-end contrast ≥ 2:1).
  CANCELLED deliberately stays out of this ramp — it reuses `--ink-muted`
  as a distinct off-path status. Badge/chip **text** never uses these ramp
  steps (their lighter end doesn't clear 4.5:1 text contrast); text chips
  use the existing `--brand-primary`/`--status-live`/`--status-critical`/
  `--ink-muted` tokens instead.

**Shared UI primitives** (new: `src/components/admin/ui/`) —
`AdminPageHeader`, `KpiCard`, `SectionCard`, `ChartCard`, `EmptyState`, and
`Badge` (a single tone-based chip replacing the per-page `STATUS_STYLES`
maps that used to be duplicated in `status-badge.tsx`, `request-list.tsx`,
and `admins-board.tsx`). `RequestStatusBadge`/`DeliveryStatusBadge`
(`src/components/admin/requests/`) wrap `Badge` with the request-pipeline
and Telegram/Email tone mappings respectively, reused across the Requests
list/detail, Customer request history, and the dashboard's recent-activity
feed. One behavior change: CANCELLED now renders with the `critical` tone
instead of sharing COMPLETED's neutral gray, so a cancelled request reads
as a distinct outcome rather than blending into "closed."

**Charts** (new: `src/components/admin/charts/`) — `AreaLineChart` (line +
area, requests-over-time), `DonutChart` (status-scale ring + legend,
request-status/review-moderation), `BarListChart` (horizontal ranking,
top service categories), `StackedBar` (single-row proportional breakdown,
delivery outcomes). All are plain server components — inline SVG or
HTML/CSS, zero client JS, zero new dependency (per this project's existing
"don't add a dependency when a small accessible platform/React solution is
sufficient" rule). Hover detail comes from native SVG `<title>` elements,
not a custom tooltip. Every chart ships an honest empty state
(`ChartEmptyState`/`EmptyState`) instead of a fake/placeholder chart when a
query fails or returns no data.

**Dashboard analytics reads** (additive functions in
`src/features/admin/dashboard/repository.ts` / `types.ts` — no schema
change, no new migration):

- `getRequestsOverTime(days)` — daily submission counts for 7/14/30 days
  (URL-driven `?range=`), bucketed in JS from one `created_at`-only query.
- `getRequestStatusDistribution()` — five `head: true` counts, one per
  `request_status` value (same cheap-count pattern as the existing
  `getServiceRequestSignals`).
- `getTopServiceCategories(limit)` — ranks `category_label` from the most
  recent 5,000 submissions (bounded read, reduced in JS — no `GROUP BY` RPC
  needed for a ranking chart).
- `getDeliveryOutcomes()` — Telegram (`pending`/`sent`/`failed`) and Email
  (`not_requested`/`pending`/`sent`/`failed`) breakdowns, seven `head: true`
  counts.
- `getOfferUsage()` — with-offer vs. without-offer counts, reusing the same
  `offer_code` filter as the Requests page's Offer filter.
- `getRecentRequestsFeed(limit)` — latest N submissions for the dashboard's
  recent-activity list (id/name/service/status/created_at only — not the
  full `AdminRequest` DTO).

All follow the existing repository conventions: `isSupabaseConfigured()`
guard, try/catch, `console.error` with a stable `[admin_*_failed]` tag, and
an honest `{ ok: false, message }` result the page renders as a per-card
empty state rather than crashing the whole dashboard.

## 41. Phase 4: admin.apexhomesupport.com hostname routing

DNS and the Vercel project's custom domains were already configured
(`apexhomesupport.com` and `admin.apexhomesupport.com` both point at the
same production deployment) before this phase — this phase is the
application-side routing only.

**The rewrite** (`src/proxy.ts`): a request whose `Host` header is
`admin.apexhomesupport.com` (`isAdminHost()`, `src/lib/admin-host.ts`) has
its path internally rewritten to the existing `/admin`-prefixed route tree
— `NextResponse.rewrite()`, never a redirect, so the browser's address bar
never changes. `admin.apexhomesupport.com/` → serves `/admin`;
`admin.apexhomesupport.com/login` → serves `/admin/login`;
`admin.apexhomesupport.com/requests/<id>` → serves
`/admin/requests/<id>`; query parameters carry over (`nextUrl.clone()`,
only `.pathname` is changed). A path that **already** starts with `/admin`
(an internal `<Link href="/admin/…">`, or a `redirect()` target elsewhere
in the app) is left untouched instead of being prefixed a second time —
this is both the loop-proofing and the reason the old
`apexhomesupport.com/admin` path keeps working completely unchanged
(intentionally not removed/redirected yet).

**Everything else is unaffected on purpose.** The public site (any other
host, and any path not already under `/admin`) returns from `proxy()`
immediately — no cookies read, no Supabase client created — identical to
proxy not running at all, which is exactly today's behavior. The matcher
(`'/((?!api|_next/static|_next/image|favicon\.ico|robots\.txt|sitemap\.xml
|manifest\.webmanifest|opengraph-image|twitter-image|icon\.png|
apple-icon\.png).*)'`) keeps proxy from even being invoked for API routes,
Next.js build/image internals, and the well-known metadata file-convention
routes; `isFrameworkOrStaticPath()` inside `proxy()` is the defense-in-depth
backstop for arbitrary `public/` assets that can't be enumerated in a
matcher (any path whose last segment has a file extension).

**Auth stays exactly as strict, just host-aware.** §5's optimistic
session check now runs against the *effective* (post-rewrite) path, so
`admin.apexhomesupport.com/requests` is recognized as a protected route the
same as `/admin/requests` always was, and an unauthenticated visitor is
redirected to `/login` (not `/admin/login`) so the browser stays on the
subdomain. `requireAdmin()`/`requireSuperAdmin()`
(`require-admin.ts`) remain the actual security boundary, completely
unchanged in logic — only their redirect *targets* are now host-aware
(`onAdminSubdomain()`, reading `next/headers`'s `headers().get("host")`).
The same host-aware target logic was applied to every other hardcoded
`/admin`-prefixed `redirect()` in the auth path: `loginAction`,
`logoutAction`, `changePasswordAction` (`auth/actions.ts`), and the
session-bounce checks in `/admin/login` and `/admin/change-password`'s own
page components — without this, a successful login/logout on the subdomain
would have visibly bounced the browser to
`admin.apexhomesupport.com/admin` instead of staying at
`admin.apexhomesupport.com/`.

**No RLS/RPC/migration/session-storage change.** Supabase Auth cookies are
still set with no explicit `Domain` attribute (host-only scoping, the
`@supabase/ssr` default) — a session established on
`apexhomesupport.com/admin` is **not** shared with
`admin.apexhomesupport.com` or vice versa; signing in on one host does not
carry over to the other while both remain reachable. This is deliberate
(narrower cookie scope is the safer default, and nothing in this phase
asked for cross-host session continuity) rather than an oversight — worth
revisiting only if/when the old `/admin` path is actually retired.

**No new environment variable.** `ADMIN_HOSTNAME` is a hardcoded constant
in `src/lib/admin-host.ts`, not an env var — it names a specific,
already-DNS-configured production hostname, not a per-environment value
(local dev and preview deployments simply never match it, so they keep
serving Admin at `/admin` exactly as before).
