-- Apex Home Services — Book Now Phase 1: service_requests + Telegram delivery tracking
--
-- Creates the private `public.service_requests` table that backs the Book Now
-- lead-delivery workflow (browser -> POST /api/book-now -> Supabase ->
-- Telegram). No public UI reads or writes this table directly: all access is
-- mediated by the Next.js server using the Supabase service-role key (see
-- src/lib/supabase/server.ts and src/features/booking/submission-adapter.ts).
--
-- The database insert is the source of truth. Telegram is a best-effort
-- operational notification attempted only after the insert succeeds, and its
-- outcome is tracked via telegram_status/telegram_last_error rather than
-- ever affecting whether the lead itself is stored.
--
-- Idempotent: safe to re-run. Does not touch any other schema object, and
-- reuses public.set_updated_at() — already defined by
-- 20260911140000_create_reviews.sql — rather than redefining it.

create extension if not exists pgcrypto;

-- 1. Telegram delivery status enum -----------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'telegram_delivery_status') then
    create type public.telegram_delivery_status as enum ('pending', 'sent', 'failed');
  end if;
end
$$;

-- 2. Table -------------------------------------------------------------------

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  phone text not null,
  email text,
  zip_code text not null,

  -- Snapshot fields derived server-side from the live catalog
  -- (src/content/services.ts) at submission time via
  -- resolveServiceRequestContext in src/features/booking/model.ts — never
  -- accepted verbatim from the browser. Kept as plain text, not a foreign
  -- key: the catalog can change, or a service/category can be renamed or
  -- retired, without breaking a historical lead record.
  service_id text,
  service_label text,
  category_id text,
  category_label text,

  -- Short free-form context tag. Today only ever "Other" (the symptom-grid
  -- "Other" card) or "First-Time Customer Offer" (a Claim this offer CTA);
  -- null otherwise. Not a customer-typed field.
  issue text,

  message text not null,
  sms_consent boolean not null default false,

  -- Where the lead came from. Always "website" for this Phase 1 form; the
  -- column exists so a future phone/manual-entry channel does not require a
  -- schema change.
  source text not null default 'website',

  -- Originating route (e.g. "/services/heating"), captured client-side at
  -- submit time via window.location.pathname. Never the full URL, query
  -- string, or request headers.
  source_path text,

  telegram_status public.telegram_delivery_status not null default 'pending',
  telegram_message_id bigint,
  telegram_sent_at timestamptz,
  -- Sanitized delivery-failure summary only — never the bot token or a raw
  -- Telegram API response. See src/features/booking/telegram.ts.
  telegram_last_error text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint service_requests_full_name_length check (char_length(trim(full_name)) between 1 and 120),
  constraint service_requests_phone_length check (char_length(trim(phone)) between 1 and 40),
  constraint service_requests_email_length check (email is null or char_length(email) <= 320),
  constraint service_requests_zip_code_length check (char_length(trim(zip_code)) between 1 and 20),
  constraint service_requests_service_id_length check (service_id is null or char_length(service_id) <= 60),
  constraint service_requests_service_label_length check (service_label is null or char_length(service_label) <= 120),
  constraint service_requests_category_id_length check (category_id is null or char_length(category_id) <= 60),
  constraint service_requests_category_label_length check (category_label is null or char_length(category_label) <= 120),
  constraint service_requests_issue_length check (issue is null or char_length(issue) <= 60),
  constraint service_requests_message_length check (char_length(trim(message)) between 1 and 1200),
  constraint service_requests_source_length check (char_length(source) <= 40),
  constraint service_requests_source_path_length check (source_path is null or char_length(source_path) <= 200),
  constraint service_requests_telegram_last_error_length check (telegram_last_error is null or char_length(telegram_last_error) <= 500)
);

comment on table public.service_requests is
  'Book Now lead submissions. Private table — all access goes through the Next.js server using the service-role key. The database insert is the source of truth; Telegram is a best-effort operational notification tracked via telegram_status.';
comment on column public.service_requests.telegram_status is
  'pending until a Telegram send is attempted; sent or failed after. Never exposed to the customer.';
comment on column public.service_requests.telegram_last_error is
  'Sanitized failure summary only — never the bot token or a raw Telegram API response body.';

-- 3. updated_at trigger --------------------------------------------------
-- Reuses public.set_updated_at(), already defined by
-- 20260911140000_create_reviews.sql — not redefined here.

drop trigger if exists service_requests_set_updated_at on public.service_requests;
create trigger service_requests_set_updated_at
  before update on public.service_requests
  for each row
  execute function public.set_updated_at();

-- 4. Indexes -----------------------------------------------------------------

-- Newest-first listing (Phase 2 operational view).
create index if not exists service_requests_created_at_idx
  on public.service_requests (created_at desc);

-- Supports "show failed Telegram deliveries to retry, newest first" (Phase 2).
create index if not exists service_requests_telegram_status_created_at_idx
  on public.service_requests (telegram_status, created_at desc);

-- 5. Row Level Security -------------------------------------------------
-- No policies are created for anon/authenticated: with RLS enabled and zero
-- policies, PostgREST denies all access by default. The service-role key
-- used by the Next.js server bypasses RLS entirely, which is the only way
-- this table is ever read or written.

alter table public.service_requests enable row level security;

revoke all on public.service_requests from anon, authenticated;

-- 6. service_role grants -------------------------------------------------
-- service_role bypassing RLS does not replace ordinary Postgres object
-- grants — both are required (see the incident documented in
-- 20260911150000_grant_reviews_service_role.sql). Only select/insert/update
-- are granted: nothing in this application ever deletes a service_request.

grant usage on schema public to service_role;

grant select, insert, update
  on table public.service_requests
  to service_role;

grant usage on type public.telegram_delivery_status to service_role;

-- Explicitly NOT granted here, and must never be: anon, authenticated.
-- RLS stays enabled on public.service_requests with zero policies for those
-- roles, so even if a future migration accidentally granted them table
-- privileges, RLS would still deny access by default.
