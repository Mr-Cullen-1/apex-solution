-- Apex Home Services — Admin Phase 1: admin authorization directory
--
-- Creates public.admin_users, the authorization directory that sits behind
-- Supabase Auth. A valid Supabase Auth session only proves *identity*
-- ("who are you?") — this table is the *authorization* check ("are you
-- allowed to administer Apex?"), consulted by src/features/admin/auth's
-- requireAdmin() on every protected page/action.
--
-- No public sign-up exists anywhere in this app. Rows here are created
-- manually by the project owner after inviting/creating a Supabase Auth
-- user via the Supabase Dashboard — see docs/ADMIN_ARCHITECTURE.md for the
-- exact bootstrap steps and a safe SQL template. Never insert a fabricated
-- UUID.
--
-- Idempotent: safe to re-run. Does not touch any other schema object, and
-- reuses public.set_updated_at() — already defined by
-- 20260911140000_create_reviews.sql — rather than redefining it.

-- 1. Role enum ---------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'admin_role') then
    create type public.admin_role as enum ('ADMIN', 'SUPER_ADMIN');
  end if;
end
$$;

-- 2. Table ---------------------------------------------------------------
-- Phase 1 treats ADMIN and SUPER_ADMIN identically for review moderation —
-- the role column exists for future permission differentiation, not used
-- yet. No account-management UI is built in this phase; rows are managed
-- directly in Supabase.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.admin_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Authorization directory for the Apex admin area. A row here (with is_active = true) is what makes an authenticated Supabase Auth user an Apex admin — Auth identity alone is never sufficient. No anon/authenticated access; read only via the privileged server client (service_role). See docs/ADMIN_ARCHITECTURE.md.';
comment on column public.admin_users.role is
  'ADMIN or SUPER_ADMIN. Phase 1 treats both as authorized for review moderation; the distinction is reserved for future use.';
comment on column public.admin_users.is_active is
  'Must be true for requireAdmin() to authorize this user. Set to false to revoke admin access without deleting the row/history.';

-- 3. updated_at trigger ----------------------------------------------------

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row
  execute function public.set_updated_at();

-- 4. Row Level Security ----------------------------------------------------
-- Same deny-by-default posture as public.reviews and public.service_requests:
-- RLS enabled, zero policies for anon/authenticated, so PostgREST denies all
-- direct access. The server looks this table up using the privileged
-- service_role client (src/lib/supabase/server.ts) after independently
-- verifying the Supabase Auth session — never from browser code, and never
-- exposed through any public API route.

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;

grant usage on schema public to service_role;

grant select, insert, update
  on table public.admin_users
  to service_role;

grant usage on type public.admin_role to service_role;

-- Explicitly NOT granted here, and must never be: anon, authenticated.
-- Nothing in this application ever deletes an admin_users row (deactivate
-- via is_active = false instead), so delete is deliberately not granted
-- either.
