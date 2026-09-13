-- Apex Home Services — Admin Phase 2: service_requests CRM fields
--
-- Adds to the already-applied public.service_requests
-- (20260912100000_create_service_requests.sql, NOT edited here):
--
--   request_status   — operational CRM status, independent of
--                       telegram_status/email_status
--   customer_id      — FK to public.customers (backfilled below, then
--                       made NOT NULL)
--   offer_code / offer_label / discount_percent — the 10% first-time offer,
--                       now tracked as its own columns instead of being
--                       overloaded into `issue` (see backfill below)
--
-- ...and two RPCs:
--
--   public.book_now_create_request(...) — the new atomic entry point for
--   the public Book Now flow: resolve/create the customer, insert the
--   service_request, and record a `request_created` activity event, all
--   in one transaction (never a half-created CRM state).
--
--   public.admin_set_request_status(...) — admin-only operational status
--   change + history event, mirroring admin_set_review_status.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration, and never deletes/recreates public.service_requests or any
-- existing row.

-- 1. request_status enum + column -----------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'request_status') then
    create type public.request_status as enum ('NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');
  end if;
end
$$;

alter table public.service_requests
  add column if not exists request_status public.request_status not null default 'NEW',
  add column if not exists customer_id uuid references public.customers(id),
  add column if not exists offer_code text,
  add column if not exists offer_label text,
  add column if not exists discount_percent smallint;

comment on column public.service_requests.request_status is
  'Operational CRM status (NEW/CONTACTED/SCHEDULED/COMPLETED/CANCELLED), distinct from telegram_status and email_status. Changed only via admin_set_request_status(), which also records a customer_activity_events entry.';
comment on column public.service_requests.offer_code is
  'Machine identifier for a claimed promotion (currently only FIRST_TIME_10), null when no offer was claimed. Independent of `issue` — see the backfill below for how historical rows were split apart.';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'service_requests_offer_code_length') then
    alter table public.service_requests
      add constraint service_requests_offer_code_length check (offer_code is null or char_length(offer_code) <= 40);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_requests_offer_label_length') then
    alter table public.service_requests
      add constraint service_requests_offer_label_length check (offer_label is null or char_length(offer_label) <= 120);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'service_requests_discount_percent_range') then
    alter table public.service_requests
      add constraint service_requests_discount_percent_range check (discount_percent is null or discount_percent between 1 and 100);
  end if;

  -- Either all three offer columns are set, or none are.
  if not exists (select 1 from pg_constraint where conname = 'service_requests_offer_columns_consistent') then
    alter table public.service_requests
      add constraint service_requests_offer_columns_consistent check (
        (offer_code is null and offer_label is null and discount_percent is null)
        or (offer_code is not null and offer_label is not null and discount_percent is not null)
      );
  end if;
end
$$;

create index if not exists service_requests_request_status_created_at_idx
  on public.service_requests (request_status, created_at desc);
create index if not exists service_requests_customer_id_idx
  on public.service_requests (customer_id);

-- 2. Backfill: split the historical offer/issue overload apart -------------
--
-- Book Now Phase 1 stored a claimed first-time offer by overloading
-- `issue = 'First-Time Customer Offer'` (see
-- src/features/booking/repository.ts prior to this migration) — that value
-- was never real problem-context text, only a stand-in for the offer flag.
-- After this backfill: `issue` holds only real service/problem context
-- (or null), and the offer is fully represented by offer_code/offer_label/
-- discount_percent. No unrelated `issue` text is touched.

update public.service_requests
  set offer_code = 'FIRST_TIME_10',
      offer_label = 'First-Time Customer Offer',
      discount_percent = 10,
      issue = null
  where issue = 'First-Time Customer Offer';

-- 3. Backfill: link every existing request to a customer -------------------
--
-- One-time, set-based-per-row backfill (not a permanent function) using
-- the same phone-then-email matching priority as
-- resolve_or_create_customer() (20260914110000_customers.sql) — processed
-- oldest-first so a repeat customer's earliest historical request
-- naturally becomes their "first seen" record. Never deletes/recreates a
-- service_requests row; only fills in customer_id.

do $$
declare
  r record;
  v_customer_id uuid;
  v_norm_phone text;
  v_norm_email text;
begin
  for r in select * from public.service_requests where customer_id is null order by created_at asc loop
    v_norm_phone := regexp_replace(coalesce(r.phone, ''), '\D', '', 'g');
    if length(v_norm_phone) = 11 and left(v_norm_phone, 1) = '1' then
      v_norm_phone := substring(v_norm_phone from 2);
    end if;
    v_norm_email := nullif(lower(trim(coalesce(r.email, ''))), '');

    v_customer_id := null;
    if v_norm_phone <> '' then
      select id into v_customer_id from public.customers where normalized_phone = v_norm_phone limit 1;
    end if;
    if v_customer_id is null and v_norm_email is not null then
      select id into v_customer_id from public.customers where normalized_email = v_norm_email limit 1;
    end if;

    if v_customer_id is null then
      insert into public.customers (full_name, phone, normalized_phone, email, normalized_email, zip_code, created_at, updated_at)
      values (r.full_name, r.phone, v_norm_phone, r.email, v_norm_email, r.zip_code, r.created_at, r.created_at)
      returning id into v_customer_id;
    else
      update public.customers
        set email = coalesce(email, r.email),
            normalized_email = coalesce(normalized_email, v_norm_email),
            zip_code = coalesce(zip_code, r.zip_code)
        where id = v_customer_id;
    end if;

    update public.service_requests set customer_id = v_customer_id where id = r.id;

    insert into public.customer_activity_events (customer_id, service_request_id, event_type, metadata)
    values (v_customer_id, r.id, 'request_created', jsonb_build_object('backfilled', true));
  end loop;
end
$$;

-- Every row now has a customer_id (backfilled above; the RPC below always
-- supplies one for new rows) — safe to enforce going forward.
alter table public.service_requests alter column customer_id set not null;

-- 4. service_role grants for the new enum -----------------------------------
-- Table-level grants from 20260912100000_create_service_requests.sql
-- already cover these new columns.

grant usage on type public.request_status to service_role;

-- 5. RPCs -------------------------------------------------------------------

-- The new atomic Book Now entry point. Returns the full service_requests
-- row (same shape the application already used from the old plain insert)
-- so Telegram/Resend delivery downstream needs no changes.
create or replace function public.book_now_create_request(
  p_full_name text,
  p_phone text,
  p_normalized_phone text,
  p_email text,
  p_normalized_email text,
  p_zip_code text,
  p_service_id text,
  p_service_label text,
  p_category_id text,
  p_category_label text,
  p_issue text,
  p_message text,
  p_sms_consent boolean,
  p_source_path text,
  p_offer_code text,
  p_offer_label text,
  p_discount_percent smallint
)
returns public.service_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_row public.service_requests;
begin
  v_customer_id := public.resolve_or_create_customer(p_full_name, p_phone, p_normalized_phone, p_email, p_normalized_email, p_zip_code);

  insert into public.service_requests (
    full_name, phone, email, zip_code, service_id, service_label, category_id, category_label,
    issue, message, sms_consent, source_path, email_status, customer_id, offer_code, offer_label, discount_percent
  ) values (
    p_full_name, p_phone, p_email, p_zip_code, p_service_id, p_service_label, p_category_id, p_category_label,
    p_issue, p_message, p_sms_consent, p_source_path,
    case when p_email is not null then 'pending' else 'not_requested' end,
    v_customer_id, p_offer_code, p_offer_label, p_discount_percent
  )
  returning * into v_row;

  insert into public.customer_activity_events (customer_id, service_request_id, event_type, metadata)
  values (v_customer_id, v_row.id, 'request_created', jsonb_build_object('service_label', p_service_label, 'category_label', p_category_label));

  return v_row;
end;
$$;

-- Admin-only operational status change + history event. Every real
-- transition records one event; a no-op submission (same status) records
-- nothing.
create or replace function public.admin_set_request_status(
  p_request_id uuid,
  p_admin_user_id uuid,
  p_new_status public.request_status
)
returns public.service_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.service_requests;
  v_old_status public.request_status;
  v_customer_id uuid;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  select request_status, customer_id into v_old_status, v_customer_id
    from public.service_requests where id = p_request_id for update;
  if not found then
    raise exception 'request not found: %', p_request_id using errcode = 'P0002';
  end if;

  if v_old_status = p_new_status then
    select * into v_row from public.service_requests where id = p_request_id;
    return v_row;
  end if;

  update public.service_requests set request_status = p_new_status where id = p_request_id returning * into v_row;

  insert into public.customer_activity_events (customer_id, service_request_id, actor_admin_user_id, event_type, metadata)
  values (v_customer_id, p_request_id, p_admin_user_id, 'request_status_changed',
          jsonb_build_object('previous_status', v_old_status, 'new_status', p_new_status));

  return v_row;
end;
$$;

revoke all on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint) from public, anon, authenticated;
revoke all on function public.admin_set_request_status(uuid, uuid, public.request_status) from public, anon, authenticated;

grant execute on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint) to service_role;
grant execute on function public.admin_set_request_status(uuid, uuid, public.request_status) to service_role;
