-- Apex Home Services — Admin Phase 2: customers (CRM identity)
--
-- Creates public.customers and public.resolve_or_create_customer(...), the
-- single deterministic entry point that turns a Book Now submission's
-- contact details into a customer_id — either an existing customer
-- (matched by normalized phone, then normalized email) or a newly created
-- one. Never fuzzy-matches by name.
--
-- Private table — no anon/authenticated access, same posture as every
-- other table in this project. Phone/email are stored in both their
-- original (customer-facing) form and a normalized form used only for
-- matching (see src/features/customers/phone.ts) — normalization here is
-- for CRM identity only, never call tracking/telephony.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or object.

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),

  full_name text not null,
  phone text not null,
  normalized_phone text not null,

  email text,
  normalized_email text,

  zip_code text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint customers_full_name_length check (char_length(trim(full_name)) between 1 and 120),
  constraint customers_phone_length check (char_length(trim(phone)) between 1 and 40),
  constraint customers_normalized_phone_length check (char_length(normalized_phone) <= 20),
  constraint customers_email_length check (email is null or char_length(email) <= 320),
  constraint customers_zip_code_length check (zip_code is null or char_length(zip_code) <= 20)
);

comment on table public.customers is
  'Internal CRM customer identity, resolved deterministically from Book Now submissions (phone, then email — never fuzzy name matching). Private table — all access goes through the Next.js server using the service-role key. No customer login/account is ever built on top of this table.';
comment on column public.customers.normalized_phone is
  'Digits-only US phone key used only for deterministic customer matching (see resolve_or_create_customer below and src/features/customers/phone.ts) — not call tracking/telephony.';

create index if not exists customers_normalized_phone_idx on public.customers (normalized_phone);
create index if not exists customers_normalized_email_idx on public.customers (normalized_email) where normalized_email is not null;
create index if not exists customers_created_at_idx on public.customers (created_at desc);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();

alter table public.customers enable row level security;

revoke all on public.customers from anon, authenticated;

grant usage on schema public to service_role;

-- No delete grant: customers are never deleted, only ever created/enriched.
grant select, insert, update
  on table public.customers
  to service_role;

-- Deterministic customer resolution, callable only by service_role.
-- `pg_advisory_xact_lock` serializes concurrent resolutions for the same
-- identity within this transaction so two simultaneous Book Now
-- submissions from the same brand-new customer can't both observe "no
-- match" and create two duplicate customer rows — the actual match/create
-- logic below is otherwise a plain sequential select-then-insert, which
-- would not be safe under concurrency on its own.
--
-- Matching priority: normalized phone first, then normalized email
-- (matches instruction — never fuzzy name matching). An existing
-- customer's email/zip is enriched only when it was previously null
-- (progressive enrichment) — full_name and phone, the identity fields, are
-- never overwritten by a later submission.
create or replace function public.resolve_or_create_customer(
  p_full_name text,
  p_phone text,
  p_normalized_phone text,
  p_email text,
  p_normalized_email text,
  p_zip_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(coalesce(p_normalized_phone, '') || '|' || coalesce(p_normalized_email, ''), 0));

  select id into v_customer_id from public.customers where normalized_phone = p_normalized_phone limit 1;

  if v_customer_id is null and p_normalized_email is not null then
    select id into v_customer_id from public.customers where normalized_email = p_normalized_email limit 1;
  end if;

  if v_customer_id is null then
    insert into public.customers (full_name, phone, normalized_phone, email, normalized_email, zip_code)
    values (p_full_name, p_phone, p_normalized_phone, p_email, p_normalized_email, p_zip_code)
    returning id into v_customer_id;
  else
    update public.customers
      set email = coalesce(email, p_email),
          normalized_email = coalesce(normalized_email, p_normalized_email),
          zip_code = coalesce(zip_code, p_zip_code)
      where id = v_customer_id;
  end if;

  return v_customer_id;
end;
$$;

revoke all on function public.resolve_or_create_customer(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.resolve_or_create_customer(text, text, text, text, text, text) to service_role;
