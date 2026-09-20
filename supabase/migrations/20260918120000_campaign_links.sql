-- Apex Home Services -- Unified Request System, Phase 6: campaign links
--
-- Lets an admin generate a unique, shareable link for an Instagram/Facebook
-- ad that opens the EXISTING public Book Now experience with a service
-- pre-selected, and keeps campaign/source attribution on the resulting
-- request. No second booking form is introduced -- a campaign link only
-- ever resolves to the same public Book Now flow every other entry point
-- already uses (see src/app/l/[token]/route.ts).
--
-- Adds:
--   public.campaign_links        -- one row per generated link
--   service_requests.campaign_link_id -- nullable FK, set only when a
--                                        request came from a campaign link
--
-- Also re-issues public.book_now_create_request(...) once more (same
-- pattern as the two migrations before this one: DROP the old signature,
-- CREATE the new one) to accept an optional p_campaign_link_id, so a
-- campaign submission's attribution is recorded in the exact same
-- transaction as the request itself -- never a second write.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or existing row.
--
-- *** PRODUCTION-SAFETY NOTE (pre-production audit fix) ***
-- Wrapped in one explicit transaction so the DROP+CREATE FUNCTION pair for
-- book_now_create_request below is never visible mid-flight to another
-- session (Postgres DDL is transactional: other sessions only ever see the
-- fully-applied before/after state, never a moment where the function
-- doesn't exist under either signature) — see the identical note in
-- 20260918100000_service_request_number_and_source.sql, which this
-- migration's function change follows the same pattern as.

begin;

create table if not exists public.campaign_links (
  id uuid primary key default gen_random_uuid(),

  token text not null unique,
  platform text not null,

  campaign_name text,
  category_id text,
  service_id text,

  is_active boolean not null default true,

  created_by uuid references public.admin_users(user_id),
  created_at timestamptz not null default now(),

  constraint campaign_links_platform_allowed check (platform in ('instagram', 'facebook')),
  constraint campaign_links_token_length check (char_length(token) between 4 and 64),
  constraint campaign_links_campaign_name_length check (campaign_name is null or char_length(campaign_name) <= 120),
  constraint campaign_links_category_id_length check (category_id is null or char_length(category_id) <= 60),
  constraint campaign_links_service_id_length check (service_id is null or char_length(service_id) <= 60)
);

comment on table public.campaign_links is
  'Admin-generated Instagram/Facebook link tokens. A public visit to /l/<token> resolves the token (platform/category/service/campaign_name) and redirects into the existing Book Now query-string contract (?book=1&category=&service=&campaign=<token>) -- never a second booking form. is_active lets an admin retire a link without deleting its historical attribution.';

create index if not exists campaign_links_token_idx on public.campaign_links (token);
create index if not exists campaign_links_created_at_idx on public.campaign_links (created_at desc);

alter table public.campaign_links enable row level security;

revoke all on public.campaign_links from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update
  on table public.campaign_links
  to service_role;

alter table public.service_requests
  add column if not exists campaign_link_id uuid references public.campaign_links(id);

create index if not exists service_requests_campaign_link_id_idx
  on public.service_requests (campaign_link_id) where campaign_link_id is not null;

comment on column public.service_requests.campaign_link_id is
  'Set only when this request originated from a campaign link (source = ''instagram''/''facebook''); null for Book Now and Admin Create Request. Lets future analytics count conversions per link without a separate tracking table.';

-- Admin-only creation RPC -- mirrors admin_create_review_invitation's shape:
-- validates the acting admin, inserts, returns the row.
create or replace function public.admin_create_campaign_link(
  p_admin_user_id uuid,
  p_token text,
  p_platform text,
  p_campaign_name text,
  p_category_id text,
  p_service_id text
)
returns public.campaign_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.campaign_links;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  insert into public.campaign_links (token, platform, campaign_name, category_id, service_id, created_by)
  values (p_token, p_platform, nullif(trim(coalesce(p_campaign_name, '')), ''), nullif(p_category_id, ''), nullif(p_service_id, ''), p_admin_user_id)
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.admin_set_campaign_link_active(
  p_campaign_link_id uuid,
  p_admin_user_id uuid,
  p_is_active boolean
)
returns public.campaign_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.campaign_links;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  update public.campaign_links set is_active = p_is_active where id = p_campaign_link_id returning * into v_row;
  if not found then
    raise exception 'campaign link not found: %', p_campaign_link_id using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

-- Public resolution: looks up an active link by token only -- no admin
-- context, callable from the unauthenticated redirect route. Returns
-- nothing for an inactive/unmatched token, so an expired/disabled link just
-- falls through to the plain homepage (see src/app/l/[token]/route.ts).
create or replace function public.get_active_campaign_link(p_token text)
returns public.campaign_links
language sql
security definer
set search_path = public
stable
as $$
  select * from public.campaign_links where token = p_token and is_active = true;
$$;

revoke all on function public.admin_create_campaign_link(uuid, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.admin_set_campaign_link_active(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.get_active_campaign_link(text) from public, anon, authenticated;

grant execute on function public.admin_create_campaign_link(uuid, text, text, text, text, text) to service_role;
grant execute on function public.admin_set_campaign_link_active(uuid, uuid, boolean) to service_role;
grant execute on function public.get_active_campaign_link(text) to service_role;

-- Generalize book_now_create_request(...) once more to accept the resolved
-- campaign_link_id (set by the caller only after it has already validated
-- the token via get_active_campaign_link -- this RPC trusts its caller the
-- same way it already trusts p_source, since both are resolved server-side
-- in src/features/booking/repository.ts, never taken from the client
-- directly).
drop function if exists public.book_now_create_request(
  text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint, text
);

create function public.book_now_create_request(
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
  p_discount_percent smallint,
  p_source text default 'book_now',
  p_campaign_link_id uuid default null
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
    issue, message, sms_consent, source_path, email_status, customer_id, offer_code, offer_label, discount_percent,
    source, campaign_link_id
  ) values (
    p_full_name, p_phone, p_email, p_zip_code, p_service_id, p_service_label, p_category_id, p_category_label,
    p_issue, p_message, p_sms_consent, p_source_path,
    (case when p_email is not null then 'pending' else 'not_requested' end)::public.email_delivery_status,
    v_customer_id, p_offer_code, p_offer_label, p_discount_percent,
    coalesce(nullif(trim(p_source), ''), 'book_now'), p_campaign_link_id
  )
  returning * into v_row;

  insert into public.customer_activity_events (customer_id, service_request_id, event_type, metadata)
  values (v_customer_id, v_row.id, 'request_created', jsonb_build_object('service_label', p_service_label, 'category_label', p_category_label, 'source', v_row.source));

  return v_row;
end;
$$;

revoke all on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint, text, uuid) from public, anon, authenticated;
grant execute on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint, text, uuid) to service_role;

commit;
