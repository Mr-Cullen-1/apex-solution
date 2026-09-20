-- Apex Home Services -- Unified Request System, Phase 5: review invitations
--
-- Lets an admin generate a secure, unpredictable, per-request review-
-- submission link ("Generate Review Link" on a request's detail page)
-- instead of the customer-facing /review form's plain, un-scoped URL. The
-- public token in the URL (/review/<token>) is never the sequential
-- request number and is never stored in plaintext here -- only its SHA-256
-- hash is persisted, the same "shown once, never persisted raw" posture
-- already used for admin temporary passwords (see
-- src/features/admin/admins/password.ts /
-- supabase/migrations/20260915100000_admin_temporary_password_provisioning.sql).
-- A database leak of this table alone can never be used to submit a review
-- as a real customer, because the raw token is not recoverable from its
-- hash.
--
-- Reuses the existing public.reviews table unchanged -- an invitation only
-- links to it (review_id) once a review has actually been submitted through
-- it; no new review-storage schema was introduced.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or existing row.

create table if not exists public.review_invitations (
  id uuid primary key default gen_random_uuid(),

  token_hash text not null unique,

  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,

  status text not null default 'active',

  created_by uuid references public.admin_users(user_id),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  review_id uuid references public.reviews(id),

  constraint review_invitations_status_allowed check (status in ('active', 'used', 'revoked')),
  constraint review_invitations_token_hash_length check (char_length(token_hash) = 64),
  -- used_at/review_id are set together, exactly once, only when status = 'used'.
  constraint review_invitations_used_consistent check (
    (status = 'used' and used_at is not null and review_id is not null)
    or (status <> 'used' and used_at is null and review_id is null)
  )
);

comment on table public.review_invitations is
  'Admin-generated, single-use review invitation links. token_hash is SHA-256(token) -- the raw token is never stored, only shown once to the admin at generation time (src/features/admin/reviews/invitations-repository.ts). Public lookup at /review/<token> hashes the incoming token and matches token_hash; an unmatched/inactive/used token never reveals which case it is beyond a generic "invalid or expired" message.';

create index if not exists review_invitations_service_request_id_idx
  on public.review_invitations (service_request_id, created_at desc);
create index if not exists review_invitations_customer_id_idx
  on public.review_invitations (customer_id);

alter table public.review_invitations enable row level security;

revoke all on public.review_invitations from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update
  on table public.review_invitations
  to service_role;

-- Admin-only creation RPC: validates the acting admin, resolves the
-- request's customer, and inserts the invitation row -- one transaction,
-- same defense-in-depth pattern as every other admin_* RPC in this project
-- (re-validates admin_users.is_active itself rather than trusting the
-- caller already checked).
create or replace function public.admin_create_review_invitation(
  p_service_request_id uuid,
  p_admin_user_id uuid,
  p_token_hash text
)
returns public.review_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_customer_id uuid;
  v_row public.review_invitations;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  select customer_id into v_customer_id from public.service_requests where id = p_service_request_id;
  if not found then
    raise exception 'request not found: %', p_service_request_id using errcode = 'P0002';
  end if;

  insert into public.review_invitations (token_hash, service_request_id, customer_id, created_by)
  values (p_token_hash, p_service_request_id, v_customer_id, p_admin_user_id)
  returning * into v_row;

  return v_row;
end;
$$;

-- Public redemption path: looks up by token_hash only (never by id/request),
-- and only ever returns an 'active' invitation -- a used/revoked/unmatched
-- token returns no row, indistinguishable from "doesn't exist" to the caller.
create or replace function public.get_active_review_invitation(p_token_hash text)
returns table (
  id uuid,
  service_request_id uuid,
  customer_id uuid,
  full_name text,
  service_label text,
  category_label text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ri.id,
    ri.service_request_id,
    ri.customer_id,
    c.full_name,
    sr.service_label,
    sr.category_label
  from public.review_invitations ri
  join public.customers c on c.id = ri.customer_id
  join public.service_requests sr on sr.id = ri.service_request_id
  where ri.token_hash = p_token_hash and ri.status = 'active';
$$;

-- Marks an invitation used and links it to the submitted review, atomically
-- guarded so a token can never be redeemed twice (the `where status =
-- 'active'` re-check happens inside the same statement that flips it to
-- 'used', closing the race a plain select-then-update would leave open).
create or replace function public.redeem_review_invitation(
  p_token_hash text,
  p_review_id uuid
)
returns public.review_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.review_invitations;
begin
  update public.review_invitations
    set status = 'used', used_at = now(), review_id = p_review_id
    where token_hash = p_token_hash and status = 'active'
    returning * into v_row;

  if not found then
    raise exception 'invitation not active or not found' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

revoke all on function public.admin_create_review_invitation(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.get_active_review_invitation(text) from public, anon, authenticated;
revoke all on function public.redeem_review_invitation(text, uuid) from public, anon, authenticated;

grant execute on function public.admin_create_review_invitation(uuid, uuid, text) to service_role;
grant execute on function public.get_active_review_invitation(text) to service_role;
grant execute on function public.redeem_review_invitation(text, uuid) to service_role;
