# Unified Request System (Sep 2026)

Extends Book Now / Admin's CRM (docs/BOOK_NOW_ARCHITECTURE.md,
docs/ADMIN_ARCHITECTURE.md) so every request — public Book Now, an
admin-entered phone call, or a future Instagram/Facebook campaign click —
goes through one canonical creation path, gets a human-readable request
number, and reaches the same Telegram destination. Also adds self-service
admin password recovery and tokenized review invitations. No existing table
was recreated or had rows deleted; every migration is additive.

## Request numbers

`service_requests.request_number` (sequence-backed integer, unique, `NOT
NULL`) is assigned automatically by a column `DEFAULT nextval(...)` on
every insert, regardless of which code path creates the row — never
`COUNT(*) + 1`. `service_requests.request_code` is a generated, stored
column: `'APEX' || (case when request_number < 1000 then lpad(...) else
request_number::text end)` — `APEX001` .. `APEX999`, `APEX1000`,
`APEX1001`, ... Existing rows were backfilled oldest-first by `created_at`,
and the sequence continues from the true historical maximum. See
`supabase/migrations/20260918100000_service_request_number_and_source.sql`.

**Pre-production audit fixes (2026-09-18)** — three real bugs were found
and fixed in this migration before it was ever applied anywhere:

1. **`lpad` truncation bug.** Postgres's `lpad(string, length)` truncates
   its input on the right if it's already longer than `length` — it is not
   a "pad only if shorter" function. The original `'APEX' ||
   lpad(request_number::text, 3, '0')` would have silently turned request
   number `1000` into `"100"` the moment volume crossed 999 requests,
   colliding with the real request number 100's own code (`APEX100`). Fixed
   with a `CASE` that only pads below 1000 and passes 1000+ through
   untouched. An explicit `UNIQUE` constraint was also added directly on
   `request_code` (previously its uniqueness only followed indirectly from
   `request_number`'s), so any future change to this formula that broke
   injectivity again would fail loudly at insert time instead of silently
   producing duplicate codes.
2. **Backfill was not safe to retry.** The original backfill computed
   `row_number() over (order by created_at, id)` scoped only to the
   currently-`NULL` rows, restarting at 1 every time it ran. A migration
   that failed partway through (e.g. from bug 3 below) and was then
   re-applied would reassign numbers 1..N to the *remaining* NULL rows,
   colliding with the 1..N already committed to rows from the first,
   partial run. Fixed by continuing from `coalesce(max(request_number), 0)`
   instead of restarting at 1, so a retry is always safe.
3. **No protection against concurrent inserts during the migration
   window.** Between the backfill step and the later `ALTER COLUMN ... SET
   NOT NULL`, a live Book Now submission could have inserted a row with
   `request_number` still `NULL` (no default existed yet at that point),
   which would then make the `NOT NULL` constraint fail once real traffic
   hit that window. Fixed by wrapping the entire migration in one explicit
   transaction with `LOCK TABLE public.service_requests IN EXCLUSIVE MODE`
   taken up front — reads (e.g. the admin dashboard) are unaffected, but
   concurrent writes briefly queue instead of racing, for the short
   duration of the migration. The same transaction wrapping also closes an
   unrelated, smaller gap: without it, a request arriving in the split
   second between `DROP FUNCTION` and `CREATE FUNCTION` for
   `book_now_create_request` would have seen "function does not exist."

## Canonical creation path + source

`public.book_now_create_request(...)` (originally Book Now-only) now takes
an additional `p_source` parameter (default `'book_now'`, so existing Book
Now behavior is unchanged) and, since the campaign-links migration, an
optional `p_campaign_link_id`. `service_requests.source` remains the
existing free-text column (only a length check, no enum) — no new
enum/table was introduced. Recognized values: `book_now` (public Book Now,
unchanged default), `admin_phone` (Admin Create Request), `instagram` /
`facebook` (campaign links). Historical rows keep their original
`'website'` value — not renamed, to avoid rewriting history for a purely
cosmetic label. `resolveSourceLabel()` (`src/features/booking/model.ts`) is
the single place a `source` value becomes a display label, shared by the
Telegram message and the admin Requests UI.

Every caller — `submitBookNowRequest` (public API), `submitAdminServiceRequest`
(Admin Create Request), and a campaign-link submission — goes through
`createServiceRequest()` (`src/features/booking/repository.ts`), which
calls this one RPC. There is no second, parallel request-creation function.

## Telegram: group → channel

No code change was required — `TELEGRAM_CHAT_ID` was already the sole,
env-only destination (`src/features/booking/telegram.ts`). To switch from a
group to a channel:

1. Create the destination Telegram channel.
2. Add the existing Telegram bot as an **administrator** of that channel,
   with permission to post messages.
3. Set `TELEGRAM_CHAT_ID` to the channel's chat id (channel ids are
   typically negative, like a supergroup's) in the environment (Vercel +
   local `.env.local`), then redeploy.

The message now leads with the request's `APEXxxx` code and shows the
resolved source label (`Book Now` / `Admin / Phone` / `Instagram` /
`Facebook`) instead of a hardcoded "Book Now" string. Admin Create Request
and (once submitted) campaign-link requests use the exact same
`deliverTelegram`/`deliverConfirmationEmail` functions as public Book Now —
persistence is never rolled back if Telegram fails; the failure is recorded
on `telegram_status`/`telegram_last_error` as before.

## Admin → Create Request

`/admin/create-request` (sidebar: "Create Request", both ADMIN and
SUPER_ADMIN). Reuses `normalizeBookNowPayload`/`validateBookNowPayload`
(`src/features/booking/model.ts`) and `submitAdminServiceRequest` (a
sibling of `submitBookNowRequest` that returns the full row instead of the
public API's narrow contract) — the same Supabase insert, the same RPC, the
same Telegram/email delivery as public Book Now, with `source =
"admin_phone"`. An optional "Internal notes" field, if filled, is recorded
via the existing `admin_add_note` RPC immediately after creation. Success
state shows "Request APEXxxx created successfully." No second request table
was created.

## Password recovery (new — did not exist before)

There was no `resetPasswordForEmail` call anywhere in this codebase before
this change; only the internal SUPER_ADMIN-issued temporary-password flow
and self-service change-while-logged-in existed. This is a new, genuine
self-service flow, built to match the existing "no browser Supabase client,
everything server-action/cookie-based" convention:

- `/admin/forgot-password` — email form → `resetPasswordForEmail(email, {
  redirectTo: `${siteUrl}/admin/reset-password` })` via the existing
  `createAuthServerClient()` (`src/lib/supabase/auth-server.ts`), using
  Supabase's **default** email template (`{{ .ConfirmationURL }}`) — no
  custom Supabase email template required, since this project has no custom
  SMTP configured and cannot edit the hosted templates for that reason.
  Always returns the same generic confirmation message (no account
  enumeration).
- `/admin/reset-password?code=...` — the code is **not** exchanged on the
  page's own GET render. Only an explicit "Set new password" form submit
  (`confirmPasswordResetAction`) calls `exchangeCodeForSession(code)` then
  `updateUser({ password })`. This mirrors a fix already applied once in
  this codebase for admin invites (docs/ADMIN_ARCHITECTURE.md §34): a link's
  own GET request can consume a one-time PKCE code before a real user ever
  clicks anything (email prefetching / security scanners), so the exchange
  must never happen automatically on page load.
- `must_change_password` is cleared on a successful reset, same as a
  voluntary change via `/admin/change-password`.
- `src/proxy.ts`'s optimistic auth check also excludes `/admin/forgot-password`
  and `/admin/reset-password` (previously only `/admin/login`) — otherwise a
  signed-out visitor would be redirected to login before ever reaching them.

**Known, accepted limitation — not scanner-safe against Supabase's own
verify endpoint.** The "explicit button, not automatic GET" gating above
protects this app's own `/admin/reset-password` page, but the email link
itself points at **Supabase's own** `/auth/v1/verify?token=...&type=recovery`
endpoint (the default template's behavior) before ever reaching this app —
a server this application does not control. An email-security scanner or
mail-client link-prefetcher that automatically GETs links in incoming email
could consume the one-time recovery token there before the real admin
clicks it, exactly like the regression docs/ADMIN_ARCHITECTURE.md §34
describes for the old admin-invite flow. The alternative fix — a custom
Supabase email template using `{{ .TokenHash }}` plus `verifyOtp()` instead
of `exchangeCodeForSession()` — closes that gap (and incidentally removes
the PKCE flow's same-browser/same-device requirement below), but requires
editing the Supabase Auth email template, which needs custom SMTP configured
for this project and was reverted for that reason. Revisit if/when custom
SMTP is set up.

**Supabase Dashboard configuration required (cannot be done from the
repository):**

- **Authentication → URL Configuration → Site URL**: the real production
  domain.
- **Authentication → URL Configuration → Redirect URLs**: add
  `<production-domain>/admin/reset-password` (and `http://localhost:3000/admin/reset-password`
  for local development, if you want to test this flow locally) —
  `resetPasswordForEmail` validates `redirectTo` against this allow-list at
  the API-call level.
- No email template change needed (default `{{ .ConfirmationURL }}`).

**Not verified end-to-end** — there is no live Supabase project or real
email delivery available in this environment. The code follows Supabase's
documented `@supabase/ssr` + PKCE pattern, but the full email → click →
reset round trip should be tested against a real project before relying on
it in production. Note the PKCE code-verifier is a cookie set on the
browser that initiated `resetPasswordForEmail` — requesting the reset on
one device/browser and completing it on another will not work under this
flow.

## Review invitations

`public.review_invitations` — an admin-generated, single-use link per
request/customer, distinct from the existing plain `/review` form (which
still works unchanged). Only a SHA-256 hash of the token is ever stored
(`token_hash`) — the raw token is shown to the admin exactly once (same
"shown once, never persisted raw" posture as admin temporary passwords) and
is never recoverable from the database. "Generate review link" / "Copy
review link" lives on the request detail page
(`/admin/requests/[id]`). Opening `/review/<token>` validates the token
server-side (`get_active_review_invitation` RPC — returns nothing for a
used/revoked/unmatched token, all three indistinguishable to the caller)
and, if valid, renders the exact same `<ReviewForm>` component pre-filled
with the customer's name; an invalid link shows a graceful message with a
link to the plain `/review` form instead. On submission, the invitation's
active status is re-checked (fresh, not reused from page load) *before*
the review is inserted — a used/revoked/unrecognized token is rejected
outright (`invalid_invitation`, HTTP 410) rather than still creating an
unlinked review row. Once past that check, the review is inserted, and the
invitation is atomically marked `used` and linked to the new review id
(`redeem_review_invitation` RPC) — this still never blocks or rolls back
the review itself if the invitation happened to go stale in the narrow
window between the check and the insert (redeem is atomic, so at most one
concurrent submit wins the link-back either way). The architecture supports
(but does not implement) a future automatic Resend email carrying this link
once a job is marked complete — the "generate + copy" admin action is the
whole scope for now.

**Pre-production audit fix (2026-09-18)** — the original version only
checked invitation validity once, at `/review/<token>` page-load time, and
always inserted the review regardless of what the later best-effort
`redeem_review_invitation` call found. That meant the *same* invitation
link could be submitted more than once (each POST created a new review
row; only the redeem/link-back step silently failed on the second+
attempt). Fixed by re-checking `get_active_review_invitation` immediately
before rate limiting/insert in `submitReview()` and refusing the submission
outright if the token is no longer active.

## Campaign links

`public.campaign_links` — an admin generates a short token
(`/admin/campaign-links`, sidebar: "Campaign Links") with a platform
(Instagram/Facebook), an optional service, and an optional campaign name.
`GET /l/<token>` (`src/app/l/[token]/route.ts`) resolves the token
server-side and **redirects** into the existing public Book Now experience
(`/?book=1&category=&service=&campaign=<token>`) — `BookNowUrlSync`
(`src/features/booking/book-now-context.tsx`) already parses `book`/
`category`/`service`; it now also reads `campaign`. No second booking form
was built. An invalid/inactive token falls back to a plain homepage
redirect. When the visitor submits, `createServiceRequest()` resolves the
campaign token server-side (`get_active_campaign_link` RPC) into
`source` (the link's platform) and `campaign_link_id`, both passed into the
same `book_now_create_request` RPC used by every other path — a stale/
inactive token is silently dropped (falls back to plain `book_now`/no
attribution) rather than blocking submission, the same philosophy as a
stale service/category id. `campaign_links.is_active` lets a link be
retired without losing its historical attribution; `campaign_link_id` on
`service_requests` is designed so a future analytics view can count
conversions per link without a separate tracking table (not built here).

## Migrations (in order)

- `supabase/migrations/20260918100000_service_request_number_and_source.sql`
- `supabase/migrations/20260918110000_review_invitations.sql`
- `supabase/migrations/20260918120000_campaign_links.sql`

All three are additive and idempotent (`if not exists` / `create or
replace`), and none edits a previously-applied migration. None have been
applied to a live Supabase project from this environment — apply via
`supabase db push` or the Dashboard SQL editor, in this order, then verify
per the "Migration safety" section of each file's own comments before
relying on any of the above in production.
