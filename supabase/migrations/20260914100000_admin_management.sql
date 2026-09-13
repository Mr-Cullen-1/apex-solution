-- Apex Home Services — Admin Phase 2: SUPER_ADMIN account management
--
-- Adds public.admin_management_events (an append-only audit trail of admin
-- account changes — invited/activated/deactivated/role_changed) and three
-- focused, service-role-only RPC functions that perform an admin_users
-- write and its audit event together in one transaction, mirroring the
-- review-moderation RPC pattern from
-- 20260913120000_create_review_moderation_events.sql:
--
--   public.admin_finalize_invite(target_user_id, actor_user_id, role)
--   public.admin_set_admin_active(target_user_id, actor_user_id, is_active)
--   public.admin_set_admin_role(target_user_id, actor_user_id, new_role)
--
-- Each function re-validates the calling actor is an active SUPER_ADMIN
-- itself (defense in depth on top of requireSuperAdmin() in the
-- application), and enforces "the last active SUPER_ADMIN can never be
-- deactivated or demoted" server-side, not just in the UI.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or object.

-- 1. Table ---------------------------------------------------------------

create table if not exists public.admin_management_events (
  id uuid primary key default gen_random_uuid(),

  actor_admin_user_id uuid not null references public.admin_users(user_id),
  target_admin_user_id uuid not null references public.admin_users(user_id),

  action text not null,

  previous_role public.admin_role,
  new_role public.admin_role,
  previous_active boolean,
  new_active boolean,

  created_at timestamptz not null default now(),

  constraint admin_management_events_action_allowed check (
    action in ('invited', 'activated', 'deactivated', 'role_changed')
  )
);

comment on table public.admin_management_events is
  'Append-only audit trail of SUPER_ADMIN account-management actions (invite/activate/deactivate/role change). No passwords or tokens — only admin UUIDs and role/active states. No anon/authenticated/public access; written only by the admin_finalize_invite/admin_set_admin_active/admin_set_admin_role RPC functions below.';

create index if not exists admin_management_events_target_idx
  on public.admin_management_events (target_admin_user_id, created_at desc);

-- 2. Row Level Security ----------------------------------------------------

alter table public.admin_management_events enable row level security;

revoke all on public.admin_management_events from anon, authenticated;

grant usage on schema public to service_role;

-- Append-only from the application's point of view: no update/delete grant.
grant select, insert
  on table public.admin_management_events
  to service_role;

-- 3. Admin management RPCs ---------------------------------------------------

-- Provisions (or re-provisions) an admin_users row for a Supabase Auth user
-- that has already been created/invited via supabase.auth.admin.inviteUserByEmail
-- (an Auth Admin API call made from the application, not SQL — this
-- function only ever handles the public.admin_users side). `on conflict do
-- update` gracefully covers the "Auth identity exists but admin_users row
-- is missing/inactive" re-invite case (instruction: never leave
-- inconsistent authorization state silently) without ever creating a
-- duplicate row.
create or replace function public.admin_finalize_invite(
  p_target_user_id uuid,
  p_actor_user_id uuid,
  p_role public.admin_role
)
returns public.admin_users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_active boolean;
  v_actor_role public.admin_role;
  v_row public.admin_users;
begin
  select is_active, role into v_actor_active, v_actor_role from public.admin_users where user_id = p_actor_user_id;
  if v_actor_active is not true or v_actor_role <> 'SUPER_ADMIN' then
    raise exception 'actor is not an active super admin: %', p_actor_user_id using errcode = '42501';
  end if;

  insert into public.admin_users (user_id, role, is_active)
  values (p_target_user_id, p_role, true)
  on conflict (user_id) do update set role = excluded.role, is_active = true
  returning * into v_row;

  insert into public.admin_management_events (actor_admin_user_id, target_admin_user_id, action, new_role, new_active)
  values (p_actor_user_id, p_target_user_id, 'invited', p_role, true);

  return v_row;
end;
$$;

create or replace function public.admin_set_admin_active(
  p_target_user_id uuid,
  p_actor_user_id uuid,
  p_is_active boolean
)
returns public.admin_users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_active boolean;
  v_actor_role public.admin_role;
  v_row public.admin_users;
  v_old_active boolean;
  v_target_role public.admin_role;
  v_active_super_admins int;
begin
  select is_active, role into v_actor_active, v_actor_role from public.admin_users where user_id = p_actor_user_id;
  if v_actor_active is not true or v_actor_role <> 'SUPER_ADMIN' then
    raise exception 'actor is not an active super admin: %', p_actor_user_id using errcode = '42501';
  end if;

  select is_active, role into v_old_active, v_target_role from public.admin_users where user_id = p_target_user_id for update;
  if not found then
    raise exception 'admin not found: %', p_target_user_id using errcode = 'P0002';
  end if;

  if v_old_active = p_is_active then
    select * into v_row from public.admin_users where user_id = p_target_user_id;
    return v_row;
  end if;

  if p_is_active = false and v_target_role = 'SUPER_ADMIN' then
    select count(*) into v_active_super_admins from public.admin_users where role = 'SUPER_ADMIN' and is_active = true;
    if v_active_super_admins <= 1 then
      raise exception 'cannot deactivate the last active super admin' using errcode = '22023';
    end if;
  end if;

  update public.admin_users set is_active = p_is_active where user_id = p_target_user_id returning * into v_row;

  insert into public.admin_management_events (actor_admin_user_id, target_admin_user_id, action, previous_active, new_active)
  values (p_actor_user_id, p_target_user_id, case when p_is_active then 'activated' else 'deactivated' end, v_old_active, p_is_active);

  return v_row;
end;
$$;

create or replace function public.admin_set_admin_role(
  p_target_user_id uuid,
  p_actor_user_id uuid,
  p_new_role public.admin_role
)
returns public.admin_users
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_active boolean;
  v_actor_role public.admin_role;
  v_row public.admin_users;
  v_old_role public.admin_role;
  v_target_active boolean;
  v_other_active_super_admins int;
begin
  select is_active, role into v_actor_active, v_actor_role from public.admin_users where user_id = p_actor_user_id;
  if v_actor_active is not true or v_actor_role <> 'SUPER_ADMIN' then
    raise exception 'actor is not an active super admin: %', p_actor_user_id using errcode = '42501';
  end if;

  select role, is_active into v_old_role, v_target_active from public.admin_users where user_id = p_target_user_id for update;
  if not found then
    raise exception 'admin not found: %', p_target_user_id using errcode = 'P0002';
  end if;

  if v_old_role = p_new_role then
    select * into v_row from public.admin_users where user_id = p_target_user_id;
    return v_row;
  end if;

  if v_old_role = 'SUPER_ADMIN' and p_new_role = 'ADMIN' and v_target_active then
    select count(*) into v_other_active_super_admins
      from public.admin_users where role = 'SUPER_ADMIN' and is_active = true and user_id <> p_target_user_id;
    if v_other_active_super_admins < 1 then
      raise exception 'cannot demote the last active super admin' using errcode = '22023';
    end if;
  end if;

  update public.admin_users set role = p_new_role where user_id = p_target_user_id returning * into v_row;

  insert into public.admin_management_events (actor_admin_user_id, target_admin_user_id, action, previous_role, new_role)
  values (p_actor_user_id, p_target_user_id, 'role_changed', v_old_role, p_new_role);

  return v_row;
end;
$$;

revoke all on function public.admin_finalize_invite(uuid, uuid, public.admin_role) from public, anon, authenticated;
revoke all on function public.admin_set_admin_active(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.admin_set_admin_role(uuid, uuid, public.admin_role) from public, anon, authenticated;

grant execute on function public.admin_finalize_invite(uuid, uuid, public.admin_role) to service_role;
grant execute on function public.admin_set_admin_active(uuid, uuid, boolean) to service_role;
grant execute on function public.admin_set_admin_role(uuid, uuid, public.admin_role) to service_role;
