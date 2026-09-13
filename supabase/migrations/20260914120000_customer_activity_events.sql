-- Apex Home Services — Admin Phase 2: customer activity timeline + notes
--
-- Creates public.customer_activity_events — the append-only history shown
-- on both the Request detail and Customer profile screens — and
-- public.admin_add_note(...), the one function that writes an internal
-- admin note as an activity event.
--
-- Event types are deliberately limited to real CRM/system actions.
-- Explicitly, and permanently for this phase: NO call-tracking event types
-- (call_logged, call_started, call_completed, call_button_clicked,
-- inbound_call, outbound_call) exist here. Telephony/call tracking is out
-- of scope for Admin Phase 2 and belongs to a future dedicated phase — see
-- docs/ADMIN_ARCHITECTURE.md.
--
-- Idempotent: safe to re-run. Does not touch any previously-applied
-- migration or object.

create table if not exists public.customer_activity_events (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null references public.customers(id) on delete cascade,
  service_request_id uuid references public.service_requests(id) on delete set null,
  actor_admin_user_id uuid references public.admin_users(user_id),

  event_type text not null,
  note text,
  metadata jsonb,

  created_at timestamptz not null default now(),

  constraint customer_activity_events_event_type_allowed check (
    event_type in (
      'request_created', 'request_status_changed', 'admin_note_added',
      'telegram_sent', 'telegram_failed', 'email_sent', 'email_failed'
    )
  ),
  constraint customer_activity_events_note_length check (note is null or char_length(note) <= 2000)
);

comment on table public.customer_activity_events is
  'Append-only CRM activity timeline for a customer (and, where applicable, one of their service_requests) — system events and internal admin notes. No customer PII duplicated beyond customer_id/service_request_id. No anon/authenticated/public access. Event types are limited to real CRM/system actions — no call-tracking event types exist here (telephony is a future, separate phase).';
comment on column public.customer_activity_events.note is
  'Internal admin note text (event_type = admin_note_added). Never shown publicly.';

create index if not exists customer_activity_events_customer_idx
  on public.customer_activity_events (customer_id, created_at desc);
create index if not exists customer_activity_events_service_request_idx
  on public.customer_activity_events (service_request_id, created_at desc)
  where service_request_id is not null;

alter table public.customer_activity_events enable row level security;

revoke all on public.customer_activity_events from anon, authenticated;

grant usage on schema public to service_role;

-- Append-only from the application's point of view: no update/delete grant.
grant select, insert
  on table public.customer_activity_events
  to service_role;

-- Adds one internal note, attributed to the acting admin. `p_service_request_id`
-- is optional — a note can be scoped to a specific request or to the
-- customer generally.
create or replace function public.admin_add_note(
  p_customer_id uuid,
  p_service_request_id uuid,
  p_admin_user_id uuid,
  p_note text
)
returns public.customer_activity_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_active boolean;
  v_row public.customer_activity_events;
begin
  select is_active into v_admin_active from public.admin_users where user_id = p_admin_user_id;
  if v_admin_active is not true then
    raise exception 'not an active admin: %', p_admin_user_id using errcode = '42501';
  end if;

  if p_note is null or char_length(trim(p_note)) = 0 then
    raise exception 'note text is required' using errcode = '22023';
  end if;

  if not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'customer not found: %', p_customer_id using errcode = 'P0002';
  end if;

  insert into public.customer_activity_events (customer_id, service_request_id, actor_admin_user_id, event_type, note)
  values (p_customer_id, p_service_request_id, p_admin_user_id, 'admin_note_added', trim(p_note))
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.admin_add_note(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.admin_add_note(uuid, uuid, uuid, text) to service_role;
