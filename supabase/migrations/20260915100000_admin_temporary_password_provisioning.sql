-- Apex Home Services — Admin: replace email-invite provisioning with
-- SUPER_ADMIN-issued temporary passwords
--
-- The previous admin_finalize_invite RPC (20260914100000_admin_management.sql)
-- backed an email-invitation flow that is no longer wanted. This migration:
--
--   1. Adds admin_users.must_change_password (existing rows default false).
--   2. Widens the admin_management_events action allow-list to add
--      'created' and 'password_reset' — 'invited' is KEPT (never removed)
--      so historical audit rows written by the retired invite flow remain
--      valid; the application simply never writes that action anymore.
--   3. Drops admin_finalize_invite (no longer called by the application).
--   4. Adds admin_provision_user(...) and admin_mark_password_reset(...) —
--      the same "write + audit event, one transaction, service_role only"
--      pattern as every other moderation/management RPC in this project.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or table row.

-- 1. must_change_password -------------------------------------------------

alter table public.admin_users
  add column if not exists must_change_password boolean not null default false;

comment on column public.admin_users.must_change_password is
  'True immediately after a SUPER_ADMIN sets a temporary password for this admin (creation or Reset Password), until the admin successfully sets their own password via requireAdmin()-gated changePasswordAction. Existing rows default to false. Never itself proves a password was actually reset — see admin_provision_user / admin_mark_password_reset below, the only writers of this column.';

-- 2. Audit action allow-list ------------------------------------------------

alter table public.admin_management_events
  drop constraint if exists admin_management_events_action_allowed;

alter table public.admin_management_events
  add constraint admin_management_events_action_allowed check (
    action in ('invited', 'activated', 'deactivated', 'role_changed', 'created', 'password_reset')
  );

-- 3. Retire the invite-based provisioning RPC -------------------------------

drop function if exists public.admin_finalize_invite(uuid, uuid, public.admin_role);

-- 4. Provisioning RPCs -------------------------------------------------------

-- Creates (or re-provisions, via `on conflict`) the admin_users row for a
-- Supabase Auth user the application has already created/located via the
-- Admin API (auth.admin.createUser, or an existing-identity lookup) — this
-- function only ever handles the public.admin_users side. `p_must_change_password`
-- is passed explicitly by the caller rather than always forced true: a
-- brand-new user (a fresh temporary password was just set) needs it true;
-- linking an already-existing-but-non-admin Auth identity (instruction: "do
-- not reset its password without an explicit action") needs it false, since
-- no new credential was issued in that case.
create or replace function public.admin_provision_user(
  p_target_user_id uuid,
  p_actor_user_id uuid,
  p_role public.admin_role,
  p_must_change_password boolean
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

  insert into public.admin_users (user_id, role, is_active, must_change_password)
  values (p_target_user_id, p_role, true, p_must_change_password)
  on conflict (user_id) do update
    set role = excluded.role, is_active = true, must_change_password = excluded.must_change_password
  returning * into v_row;

  insert into public.admin_management_events (actor_admin_user_id, target_admin_user_id, action, new_role, new_active)
  values (p_actor_user_id, p_target_user_id, 'created', p_role, true);

  return v_row;
end;
$$;

-- Flags that a SUPER_ADMIN issued a fresh temporary password for an
-- existing admin (the actual Supabase Auth password update happens via the
-- Admin API in application code — not a SQL operation this function could
-- perform itself). Never records the password itself, only the fact that a
-- reset occurred.
create or replace function public.admin_mark_password_reset(
  p_target_user_id uuid,
  p_actor_user_id uuid
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

  if not exists (select 1 from public.admin_users where user_id = p_target_user_id) then
    raise exception 'admin not found: %', p_target_user_id using errcode = 'P0002';
  end if;

  update public.admin_users set must_change_password = true where user_id = p_target_user_id returning * into v_row;

  insert into public.admin_management_events (actor_admin_user_id, target_admin_user_id, action)
  values (p_actor_user_id, p_target_user_id, 'password_reset');

  return v_row;
end;
$$;

revoke all on function public.admin_provision_user(uuid, uuid, public.admin_role, boolean) from public, anon, authenticated;
revoke all on function public.admin_mark_password_reset(uuid, uuid) from public, anon, authenticated;

grant execute on function public.admin_provision_user(uuid, uuid, public.admin_role, boolean) to service_role;
grant execute on function public.admin_mark_password_reset(uuid, uuid) to service_role;
