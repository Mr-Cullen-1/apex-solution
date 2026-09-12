-- Apex Home Services — Book Now Phase 2: Resend email delivery tracking
--
-- Adds email delivery tracking columns to the already-applied
-- public.service_requests table (20260912100000_create_service_requests.sql
-- is NOT edited — this is a new, additive migration).
--
-- Email is a second, independent, best-effort operational delivery channel
-- alongside Telegram: the database insert remains the sole source of truth,
-- and this table tracks the Resend confirmation-email attempt the same way
-- telegram_status/telegram_last_error already track the Telegram attempt —
-- as its own status, never gating or gated by the other channel.
--
-- Idempotent: safe to re-run. Does not touch any other schema object.

-- 1. Email delivery status enum ---------------------------------------------
--
-- Distinct from telegram_delivery_status because email additionally needs a
-- "no email was provided" state — Telegram always has an operational chat
-- to notify, so it only ever needed pending/sent/failed.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'email_delivery_status') then
    create type public.email_delivery_status as enum ('not_requested', 'pending', 'sent', 'failed');
  end if;
end
$$;

-- 2. Columns -----------------------------------------------------------------
--
-- No column default drives the initial value here on purpose: the
-- application (src/features/booking/repository.ts createServiceRequest)
-- always sets email_status explicitly at insert time — 'not_requested' when
-- the customer left email blank, 'pending' when one was supplied — so the
-- default below is only a safety net for a row inserted by some other path.

alter table public.service_requests
  add column if not exists email_status public.email_delivery_status not null default 'not_requested',
  add column if not exists email_message_id text,
  add column if not exists email_sent_at timestamptz,
  add column if not exists email_last_error text;

comment on column public.service_requests.email_status is
  'not_requested when no email was supplied; pending until a Resend send is attempted; sent or failed after. Independent of telegram_status. Never exposed to the customer.';
comment on column public.service_requests.email_message_id is 'Resend email id, set only on a successful send.';
comment on column public.service_requests.email_last_error is
  'Sanitized failure summary only — never the Resend API key or a raw API response body.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'service_requests_email_last_error_length'
  ) then
    alter table public.service_requests
      add constraint service_requests_email_last_error_length
      check (email_last_error is null or char_length(email_last_error) <= 500);
  end if;
end
$$;

-- 3. Index -------------------------------------------------------------------
--
-- Mirrors the existing (telegram_status, created_at desc) index — supports a
-- future "show failed email deliveries to retry, newest first" view.

create index if not exists service_requests_email_status_created_at_idx
  on public.service_requests (email_status, created_at desc);

-- 4. service_role grants -------------------------------------------------
--
-- The existing `grant select, insert, update on table public.service_requests
-- to service_role` (20260912100000_create_service_requests.sql) already
-- covers these new columns — Postgres table-level grants apply to all
-- columns, current and future. Only the new enum type needs its own grant.

grant usage on type public.email_delivery_status to service_role;

-- Explicitly NOT granted here, and must never be: anon, authenticated. RLS
-- stays enabled on public.service_requests with zero policies for those
-- roles (unchanged from the original migration), so even if a future
-- migration accidentally granted them table privileges, RLS would still
-- deny access by default.
