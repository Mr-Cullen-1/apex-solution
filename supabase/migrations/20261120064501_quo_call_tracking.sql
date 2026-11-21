-- Additive only. No booking/customer/analytics objects are changed.
begin;
create table public.quo_calls (
  org_id text not null,
  quo_call_id text not null,
  phone_number_id text not null,
  caller_number text check (caller_number is null or caller_number ~ '^\+[1-9][0-9]{1,14}$'),
  direction text not null check (direction = 'incoming'),
  status text not null check (length(status) between 1 and 40),
  outcome text not null check (outcome in ('answered','missed','unknown','failed','forwarded','abandoned','ai_handled')),
  phase smallint not null check (phase between 1 and 3),
  duration_seconds numeric check (duration_seconds between 0 and 31536000),
  started_at timestamptz not null,
  answered_at timestamptz,
  completed_at timestamptz,
  source_updated_at timestamptz not null,
  has_voicemail boolean,
  metadata jsonb not null default '{}' check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (org_id, quo_call_id)
);
create index quo_calls_number_started_idx on public.quo_calls (phone_number_id, started_at desc);

create table public.quo_call_events (
  org_id text not null,
  event_id text not null,
  delivery_id text unique,
  quo_call_id text not null,
  event_type text not null,
  source text not null check (source in ('webhook','reconciliation')),
  source_updated_at timestamptz not null,
  processing_status text not null check (processing_status in ('processing','processed','stale')),
  duplicate_count integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  primary key (org_id, event_id)
);
create index quo_call_events_call_idx on public.quo_call_events (org_id, quo_call_id, received_at desc);

create table public.quo_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,
  phone_number_id text not null,
  from_at timestamptz not null,
  to_at timestamptz not null,
  next_cursor text,
  pages_processed integer not null default 0,
  calls_processed integer not null default 0,
  status text not null check (status in ('running','partial','completed','failed')),
  error_code text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Privileged server only. No browser/admin-session read policies are granted.
alter table public.quo_calls enable row level security;
alter table public.quo_call_events enable row level security;
alter table public.quo_reconciliation_runs enable row level security;
revoke all on public.quo_calls, public.quo_call_events, public.quo_reconciliation_runs from public, anon, authenticated;
grant select, insert, update on public.quo_calls, public.quo_call_events, public.quo_reconciliation_runs to service_role;

-- Event dedup + call snapshot are a single transaction. Failure rolls both back,
-- so a non-2xx response can safely be retried by Quo. No background work after ACK.
create function public.quo_ingest_call(p_event jsonb)
returns text language plpgsql security invoker set search_path = ''
as $$
declare
  c public.quo_calls%rowtype;
  prior public.quo_calls%rowtype;
  seen public.quo_call_events%rowtype;
  result text := 'processed';
begin
  select * into c from jsonb_populate_record(null::public.quo_calls, p_event->'call');
  if c.org_id is null or c.quo_call_id is null or p_event->>'eventId' is null then
    raise exception 'invalid_quo_event';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(c.org_id || ':' || c.quo_call_id, 0));
  select * into seen from public.quo_call_events
    where (org_id = c.org_id and event_id = p_event->>'eventId')
      or delivery_id = p_event->>'deliveryId' limit 1;
  if found then
    update public.quo_call_events set duplicate_count = duplicate_count + 1
      where org_id = seen.org_id and event_id = seen.event_id;
    return 'duplicate';
  end if;
  insert into public.quo_call_events (org_id,event_id,delivery_id,quo_call_id,event_type,source,source_updated_at,processing_status)
    values(c.org_id,p_event->>'eventId',p_event->>'deliveryId',c.quo_call_id,p_event->>'eventType',p_event->>'source',c.source_updated_at,'processing');
  select * into prior from public.quo_calls where org_id=c.org_id and quo_call_id=c.quo_call_id for update;
  if found and (c.source_updated_at < prior.source_updated_at or c.phase < prior.phase) then
    result := 'stale';
  else
    insert into public.quo_calls (org_id,quo_call_id,phone_number_id,caller_number,direction,status,outcome,phase,duration_seconds,started_at,answered_at,completed_at,source_updated_at,has_voicemail,metadata)
      values(c.org_id,c.quo_call_id,c.phone_number_id,c.caller_number,c.direction,c.status,c.outcome,c.phase,c.duration_seconds,c.started_at,c.answered_at,c.completed_at,c.source_updated_at,c.has_voicemail,c.metadata)
    on conflict (org_id,quo_call_id) do update set
      caller_number=coalesce(excluded.caller_number,quo_calls.caller_number),
      status=excluded.status,
      outcome=case when excluded.outcome='unknown' then quo_calls.outcome else excluded.outcome end,
      phase=excluded.phase,
      duration_seconds=coalesce(excluded.duration_seconds,quo_calls.duration_seconds),
      answered_at=coalesce(excluded.answered_at,quo_calls.answered_at),
      completed_at=coalesce(excluded.completed_at,quo_calls.completed_at),
      source_updated_at=excluded.source_updated_at,
      has_voicemail=case when quo_calls.has_voicemail is true or excluded.has_voicemail is true then true else coalesce(excluded.has_voicemail,quo_calls.has_voicemail) end,
      metadata=excluded.metadata,
      updated_at=now();
  end if;
  update public.quo_call_events set processing_status=result,processed_at=now()
    where org_id=c.org_id and event_id=p_event->>'eventId';
  return result;
end;
$$;
revoke all on function public.quo_ingest_call(jsonb) from public, anon, authenticated;
grant execute on function public.quo_ingest_call(jsonb) to service_role;
comment on table public.quo_calls is 'Operational inbound calls only. Answered is not a qualified lead; no automatic booking or GA4 conversion. Caller number is restricted personal data.';
comment on table public.quo_call_events is 'Minimal event receipt ledger; no raw webhook bodies, transcripts or recordings. Keep dedup keys for at least the provider retry window (28 hours), preferably the approved call retention period.';
commit;
