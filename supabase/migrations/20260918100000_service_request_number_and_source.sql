-- Apex Home Services — Unified Request System, Phase 1: human-readable
-- request number + generalized `source`.
--
-- Adds to the already-applied public.service_requests
-- (20260912100000_create_service_requests.sql / 20260914130000_..., NOT
-- edited here):
--
--   request_number  — sequence-backed integer, unique, NOT NULL, assigned
--                      automatically (column DEFAULT nextval(...)) on every
--                      future insert regardless of which code path creates
--                      the row (Book Now, Admin Create Request, or a future
--                      campaign-link submission all go through the same
--                      table). Never COUNT(*)+1 — nextval() on a real
--                      Postgres sequence is atomic/concurrency-safe by
--                      construction.
--   request_code    — generated, stored column: 'APEX' || the number
--                      zero-padded to at least 3 digits (APEX001 .. APEX999,
--                      APEX1000, APEX1001, ...). Derived 1:1 from
--                      request_number, so uniqueness follows from
--                      request_number's own unique constraint (also given
--                      its own explicit UNIQUE constraint below, as
--                      defense in depth against a future change to this
--                      formula silently breaking that guarantee).
--
--      *** CORRECTNESS NOTE (pre-production audit fix) ***
--      Postgres's lpad() TRUNCATES its input on the right if it is already
--      longer than the target length — it does not behave like a
--      "pad-if-shorter, else leave alone" function. A naive
--      `lpad(request_number::text, 3, '0')` would silently turn request
--      number 1000 into the 3-character string "100" (and collide with the
--      real request number 100's own code, "APEX100") the moment volume
--      crossed 999 requests. The CASE expression below only pads when the
--      number is still under 1000, and passes 1000+ through unpadded and
--      untruncated, matching the spec (APEX001..APEX999, APEX1000, ...)
--      exactly and preserving uniqueness at any volume.
--
-- Historical rows are backfilled deterministically, oldest-first by
-- created_at (ties broken by id for a stable order), so the sequence
-- continues from the true historical maximum rather than colliding with it.
-- No existing row is deleted or recreated; no existing column is dropped or
-- renamed.
--
-- Also generalizes public.book_now_create_request(...) to accept an
-- optional p_source (default 'book_now', preserving today's behavior for
-- the existing Book Now caller) so the same RPC becomes the one canonical
-- creator for every request origin (Book Now, Admin Create Request, and —
-- once supabase/migrations/<campaign-links migration> lands — campaign
-- links), per the "one canonical request entity" requirement. `source`
-- remains the existing free-text column (only ever length-checked, no
-- enum) — no new enum/table was introduced for this, since the existing
-- column already extends cleanly.
--
-- *** PRODUCTION-SAFETY NOTE (pre-production audit fix) ***
-- The entire migration now runs inside one explicit transaction, and takes
-- an EXCLUSIVE table lock on public.service_requests before touching
-- anything. EXCLUSIVE mode still permits concurrent SELECTs (the admin
-- dashboard/requests list keeps working) but blocks concurrent
-- INSERT/UPDATE/DELETE — i.e. new Book Now submissions briefly queue,
-- rather than failing — for the (short, backfill-bound) duration of this
-- migration. Without this lock, a Book Now submission arriving between the
-- backfill step and the later `ALTER COLUMN ... SET NOT NULL` could insert
-- a row with request_number still NULL (no default exists yet at that
-- point) and make that ALTER fail outright once applied against a table
-- with live traffic. Wrapping the DROP+CREATE FUNCTION pair in the same
-- transaction also closes a separate, unrelated gap: without it, any
-- session calling book_now_create_request in the split second between the
-- DROP and the CREATE would see "function does not exist" (Postgres DDL is
-- transactional, so other sessions only ever observe the fully-applied
-- before/after state, never the gap in between).
--
-- The backfill's numbering formula was also changed to continue from the
-- table's current highest request_number (`coalesce(max(request_number), 0)
-- + row_number() over (...)`) rather than always restarting the window's
-- own row_number() at 1. This migration is safe to re-run after a partial
-- failure (e.g. it previously failed at the NOT NULL step because of the
-- exact race above, before this fix): a retry only ever needs to backfill
-- whatever rows are still NULL, and it now assigns them numbers starting
-- immediately after the ones already assigned in the failed attempt,
-- instead of restarting at 1 and colliding with them.
--
-- Idempotent: safe to re-run, including after a partial failure.

begin;

-- See "PRODUCTION-SAFETY NOTE" above — must be the first statement, before
-- any schema change or read this migration relies on being stable.
lock table public.service_requests in exclusive mode;

-- 1. Column (nullable first, so the backfill below can run) ------------------

alter table public.service_requests
  add column if not exists request_number integer;

-- 2. Sequence, owned by the column ---------------------------------------

create sequence if not exists public.service_requests_request_number_seq
  as integer
  start with 1
  owned by public.service_requests.request_number;

-- 3. Backfill existing rows, oldest-first -------------------------------------
--
-- One-time, deterministic assignment: row_number() over (order by
-- created_at, id) starting immediately after the current max (0 on a fresh
-- table), so a fresh/empty table, a table with real historical leads, and a
-- retry after a partial failure all get a stable, collision-free
-- continuation of the sequence based on when each request actually came in.

with base as (
  select coalesce(max(request_number), 0) as start_from from public.service_requests
),
ordered as (
  select id, row_number() over (order by created_at asc, id asc) as rn
  from public.service_requests
  where request_number is null
)
update public.service_requests sr
set request_number = base.start_from + ordered.rn
from ordered, base
where sr.id = ordered.id;

-- 4. Point the sequence past the historical maximum, then wire the column
--    to it as the default for every future insert -----------------------------

select setval(
  'public.service_requests_request_number_seq',
  coalesce((select max(request_number) from public.service_requests), 0) + 1,
  false
);

alter table public.service_requests
  alter column request_number set default nextval('public.service_requests_request_number_seq'),
  alter column request_number set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'service_requests_request_number_unique') then
    alter table public.service_requests
      add constraint service_requests_request_number_unique unique (request_number);
  end if;
end
$$;

-- 5. Human-readable code, derived (never a second source of truth) -----------
--
-- See the "CORRECTNESS NOTE" above re: lpad's truncating behavior — this
-- CASE expression is the fix.

alter table public.service_requests
  add column if not exists request_code text generated always as (
    'APEX' || (case when request_number < 1000 then lpad(request_number::text, 3, '0') else request_number::text end)
  ) stored;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'service_requests_request_code_unique') then
    alter table public.service_requests
      add constraint service_requests_request_code_unique unique (request_code);
  end if;
end
$$;

comment on column public.service_requests.request_number is
  'Sequence-backed, concurrency-safe, unique request number — never assigned via COUNT(*)+1. Backfilled oldest-first by created_at for pre-existing rows; every new row gets one automatically via the column default.';
comment on column public.service_requests.request_code is
  'Human-readable "APEXxxx" form of request_number (APEX001..APEX999, APEX1000, ...) — generated, always in sync with request_number by construction. The CASE in this column''s generation expression exists specifically to avoid Postgres lpad()''s truncating (not padding-only) behavior once request_number reaches 4+ digits.';

grant usage, select on sequence public.service_requests_request_number_seq to service_role;

-- 6. Generalize book_now_create_request(...) to accept an optional source ----
--
-- Postgres identifies a function by name + argument type list, so adding a
-- parameter (even a defaulted one) requires dropping the old 17-argument
-- signature explicitly before creating the new 18-argument one — a plain
-- `create or replace function` with a different argument list creates a
-- second, orphaned overload instead of replacing the original. This drops
-- only the function (code), never any table or row. Running both statements
-- inside this migration's single transaction (see "PRODUCTION-SAFETY NOTE"
-- above) means no other session ever observes a moment where the function
-- doesn't exist under either signature.

drop function if exists public.book_now_create_request(
  text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint
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
  p_source text default 'book_now'
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
    source
  ) values (
    p_full_name, p_phone, p_email, p_zip_code, p_service_id, p_service_label, p_category_id, p_category_label,
    p_issue, p_message, p_sms_consent, p_source_path,
    (case when p_email is not null then 'pending' else 'not_requested' end)::public.email_delivery_status,
    v_customer_id, p_offer_code, p_offer_label, p_discount_percent,
    coalesce(nullif(trim(p_source), ''), 'book_now')
  )
  returning * into v_row;

  insert into public.customer_activity_events (customer_id, service_request_id, event_type, metadata)
  values (v_customer_id, v_row.id, 'request_created', jsonb_build_object('service_label', p_service_label, 'category_label', p_category_label, 'source', v_row.source));

  return v_row;
end;
$$;

revoke all on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint, text) from public, anon, authenticated;
grant execute on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint, text) to service_role;

commit;
