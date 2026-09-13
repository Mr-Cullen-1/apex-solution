-- Apex Home Services — Admin Phase 1: review moderation audit log + RPCs
--
-- Creates public.review_moderation_events (an append-only audit trail of
-- every consequential moderation action) and three focused, service-role-
-- only RPC functions that perform a moderation write and its audit event
-- together in one transaction:
--
--   public.admin_set_review_status(review_id, admin_user_id, new_status)
--   public.admin_set_review_verified(review_id, admin_user_id, is_verified)
--   public.admin_set_review_featured(review_id, admin_user_id, is_featured)
--
-- These are the ONLY way review moderation writes happen — never a plain
-- `update public.reviews` from the application. Each function re-validates
-- the calling admin against public.admin_users itself (defense in depth on
-- top of src/features/admin/auth's requireAdmin(), which already verified
-- this before the application ever calls in) and only records an audit
-- event when a real state change occurs (no-op submissions write nothing).
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or object.

-- 1. Table ---------------------------------------------------------------

create table if not exists public.review_moderation_events (
  id uuid primary key default gen_random_uuid(),

  review_id uuid not null references public.reviews(id) on delete cascade,
  admin_user_id uuid not null references public.admin_users(user_id),

  action text not null,

  previous_status public.review_status,
  new_status public.review_status,
  previous_verified boolean,
  new_verified boolean,
  previous_featured boolean,
  new_featured boolean,

  created_at timestamptz not null default now(),

  constraint review_moderation_events_action_allowed check (
    action in (
      'approved', 'rejected', 'moved_to_pending',
      'verified_enabled', 'verified_disabled',
      'featured_enabled', 'featured_disabled'
    )
  )
);

comment on table public.review_moderation_events is
  'Append-only audit trail of admin review-moderation actions. No customer PII beyond review_id — identifies only the admin UUID and review UUID involved. No anon/authenticated/public access; written only by the admin_set_review_* RPC functions below.';

create index if not exists review_moderation_events_review_id_idx
  on public.review_moderation_events (review_id, created_at desc);

-- 2. Row Level Security ----------------------------------------------------

alter table public.review_moderation_events enable row level security;

revoke all on public.review_moderation_events from anon, authenticated;

grant usage on schema public to service_role;

-- Append-only from the application's point of view: no update/delete grant.
grant select, insert
  on table public.review_moderation_events
  to service_role;

-- 3. Moderation RPCs ---------------------------------------------------------
-- `security definer` so these can perform the update + audit insert in one
-- statement's transaction regardless of the caller's own grants, but each
-- function pins `search_path` and independently re-checks
-- admin_users.is_active for the passed-in admin_user_id — a caller cannot
-- use these functions to act as an admin_user_id it doesn't itself already
-- hold (the application only ever passes the id requireAdmin() resolved
-- server-side from the caller's own verified session, never a client-
-- supplied value). Execute is revoked from PUBLIC/anon/authenticated and
-- granted only to service_role, which is exactly who the Next.js server
-- repository connects as.

create or replace function public.admin_set_review_status(
  p_review_id uuid,
  p_admin_user_id uuid,
  p_new_status public.review_status
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.reviews;
  v_old_status public.review_status;
  v_old_featured boolean;
  v_action text;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  select status, is_featured into v_old_status, v_old_featured
    from public.reviews where id = p_review_id for update;
  if not found then
    raise exception 'review not found: %', p_review_id using errcode = 'P0002';
  end if;

  if v_old_status = p_new_status then
    -- No-op: return the row unchanged, no audit event (instruction: only
    -- record an event when a real state change occurs).
    select * into v_row from public.reviews where id = p_review_id;
    return v_row;
  end if;

  v_action := case p_new_status
    when 'approved' then 'approved'
    when 'rejected' then 'rejected'
    when 'pending' then 'moved_to_pending'
  end;

  update public.reviews
    set status = p_new_status,
        -- A rejected review can never remain editorially featured — this
        -- clears it in the same statement/transaction as the status change,
        -- never as a separate follow-up write the caller could skip.
        is_featured = case when p_new_status = 'rejected' then false else is_featured end
    where id = p_review_id
    returning * into v_row;

  insert into public.review_moderation_events
    (review_id, admin_user_id, action, previous_status, new_status, previous_featured, new_featured)
  values
    (p_review_id, p_admin_user_id, v_action, v_old_status, p_new_status,
     case when p_new_status = 'rejected' and v_old_featured then v_old_featured else null end,
     case when p_new_status = 'rejected' and v_old_featured then false else null end);

  if p_new_status = 'rejected' and v_old_featured then
    insert into public.review_moderation_events
      (review_id, admin_user_id, action, previous_featured, new_featured)
    values
      (p_review_id, p_admin_user_id, 'featured_disabled', true, false);
  end if;

  return v_row;
end;
$$;

create or replace function public.admin_set_review_verified(
  p_review_id uuid,
  p_admin_user_id uuid,
  p_is_verified boolean
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.reviews;
  v_old_verified boolean;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  select is_verified_customer into v_old_verified
    from public.reviews where id = p_review_id for update;
  if not found then
    raise exception 'review not found: %', p_review_id using errcode = 'P0002';
  end if;

  if v_old_verified = p_is_verified then
    select * into v_row from public.reviews where id = p_review_id;
    return v_row;
  end if;

  update public.reviews
    set is_verified_customer = p_is_verified
    where id = p_review_id
    returning * into v_row;

  insert into public.review_moderation_events
    (review_id, admin_user_id, action, previous_verified, new_verified)
  values
    (p_review_id, p_admin_user_id, case when p_is_verified then 'verified_enabled' else 'verified_disabled' end,
     v_old_verified, p_is_verified);

  return v_row;
end;
$$;

create or replace function public.admin_set_review_featured(
  p_review_id uuid,
  p_admin_user_id uuid,
  p_is_featured boolean
)
returns public.reviews
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.reviews;
  v_old_featured boolean;
  v_status public.review_status;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  select status, is_featured into v_status, v_old_featured
    from public.reviews where id = p_review_id for update;
  if not found then
    raise exception 'review not found: %', p_review_id using errcode = 'P0002';
  end if;

  -- Server-enforced, not just a UI restriction: only an approved review may
  -- ever be featured.
  if p_is_featured and v_status <> 'approved' then
    raise exception 'only approved reviews may be featured: %', p_review_id using errcode = '22023';
  end if;

  if v_old_featured = p_is_featured then
    select * into v_row from public.reviews where id = p_review_id;
    return v_row;
  end if;

  update public.reviews
    set is_featured = p_is_featured
    where id = p_review_id
    returning * into v_row;

  insert into public.review_moderation_events
    (review_id, admin_user_id, action, previous_featured, new_featured)
  values
    (p_review_id, p_admin_user_id, case when p_is_featured then 'featured_enabled' else 'featured_disabled' end,
     v_old_featured, p_is_featured);

  return v_row;
end;
$$;

revoke all on function public.admin_set_review_status(uuid, uuid, public.review_status) from public, anon, authenticated;
revoke all on function public.admin_set_review_verified(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_set_review_featured(uuid, uuid, boolean) from public, anon, authenticated;

grant execute on function public.admin_set_review_status(uuid, uuid, public.review_status) to service_role;
grant execute on function public.admin_set_review_verified(uuid, uuid, boolean) to service_role;
grant execute on function public.admin_set_review_featured(uuid, uuid, boolean) to service_role;
