-- Sprint 2.1: order-independent facts and durable, leased reconciliation.
-- Additive to Sprint 2; never touches booking/customer/analytics objects.
begin;

alter table public.quo_calls
  add column status_updated_at timestamptz,
  add column outcome_phase smallint,
  add column outcome_updated_at timestamptz,
  add column caller_updated_at timestamptz,
  add column duration_updated_at timestamptz;
update public.quo_calls set
  status_updated_at=source_updated_at,
  outcome_phase=case when outcome<>'unknown' then phase end,
  outcome_updated_at=case when outcome<>'unknown' then source_updated_at end,
  caller_updated_at=case when caller_number is not null then source_updated_at end,
  duration_updated_at=case when duration_seconds is not null then source_updated_at end;
alter table public.quo_calls alter column status_updated_at set not null;

create or replace function public.quo_ingest_call(p_event jsonb)
returns text language plpgsql security invoker set search_path = '' set lock_timeout = '2s'
as $$
declare
  c public.quo_calls%rowtype; prior public.quo_calls%rowtype; m public.quo_calls%rowtype;
  seen public.quo_call_events%rowtype;
  resolution text; old_resolution text; result text := 'processed';
begin
  select * into c from jsonb_populate_record(null::public.quo_calls,p_event->'call');
  if c.org_id is null or c.quo_call_id is null or p_event->>'eventId' is null
     or c.source_updated_at is null or c.started_at is null or c.phase is null
     or c.phase not between 1 and 3 or c.duration_seconds<0 or c.duration_seconds>31536000 then
    raise exception 'invalid_quo_event';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(c.org_id||':'||c.quo_call_id,0));
  select * into seen from public.quo_call_events
    where (org_id=c.org_id and event_id=p_event->>'eventId') or delivery_id=p_event->>'deliveryId' limit 1;
  if found then
    update public.quo_call_events set duplicate_count=duplicate_count+1 where org_id=seen.org_id and event_id=seen.event_id;
    return 'duplicate';
  end if;
  insert into public.quo_call_events(org_id,event_id,delivery_id,quo_call_id,event_type,source,source_updated_at,processing_status)
    values(c.org_id,p_event->>'eventId',p_event->>'deliveryId',c.quo_call_id,p_event->>'eventType',p_event->>'source',c.source_updated_at,'processing');
  resolution := coalesce(c.metadata->>'caller_resolution','unavailable');
  if resolution not in ('single_external_participant','ambiguous','withheld') then resolution:='unavailable'; end if;
  if resolution<>'single_external_participant' then c.caller_number:=null; end if;
  select * into prior from public.quo_calls where org_id=c.org_id and quo_call_id=c.quo_call_id for update;
  if not found then
    insert into public.quo_calls(org_id,quo_call_id,phone_number_id,caller_number,direction,status,outcome,phase,duration_seconds,started_at,answered_at,completed_at,source_updated_at,has_voicemail,metadata,status_updated_at,outcome_phase,outcome_updated_at,caller_updated_at,duration_updated_at)
      values(c.org_id,c.quo_call_id,c.phone_number_id,c.caller_number,c.direction,c.status,c.outcome,c.phase,c.duration_seconds,c.started_at,c.answered_at,c.completed_at,c.source_updated_at,c.has_voicemail,
        jsonb_build_object('api_version','2026-03-30','caller_resolution',resolution),c.source_updated_at,
        case when c.outcome<>'unknown' then c.phase end,case when c.outcome<>'unknown' then c.source_updated_at end,
        case when resolution<>'unavailable' then c.source_updated_at end,case when c.duration_seconds is not null then c.source_updated_at end);
  else
    m:=prior;
    -- Lifecycle is a monotonic max. A sparse terminal status cannot erase facts.
    if (c.phase,c.source_updated_at,c.status)>(prior.phase,prior.status_updated_at,prior.status) then
      m.phase:=c.phase; m.status:=c.status; m.status_updated_at:=c.source_updated_at;
    end if;
    -- Unknown carries no outcome evidence. Conflicts use phase, provider time,
    -- then a deterministic tie-break, not delivery order.
    if c.outcome<>'unknown' and (prior.outcome='unknown' or
       (c.phase,c.source_updated_at,c.outcome)>(prior.outcome_phase,prior.outcome_updated_at,prior.outcome)) then
      m.outcome:=c.outcome; m.outcome_phase:=c.phase; m.outcome_updated_at:=c.source_updated_at;
    end if;
    old_resolution:=coalesce(prior.metadata->>'caller_resolution','unavailable');
    -- Available ambiguity/withholding beats a single caller at the same time.
    -- Unavailable context is absence of evidence and cannot clear known facts.
    if resolution='single_external_participant' and old_resolution='single_external_participant'
       and c.source_updated_at=prior.caller_updated_at and c.caller_number is distinct from prior.caller_number then
      -- Equal-time conflicting identities have no trustworthy winner.
      m.caller_number:=null; old_resolution:='ambiguous';
    elsif resolution<>'unavailable' and (prior.caller_updated_at is null or
      (c.source_updated_at,case when resolution='single_external_participant' then 0 else 1 end,coalesce(c.caller_number,''),resolution)>
      (prior.caller_updated_at,case when old_resolution='single_external_participant' then 0 else 1 end,coalesce(prior.caller_number,''),old_resolution)) then
      m.caller_number:=c.caller_number; m.caller_updated_at:=c.source_updated_at; old_resolution:=resolution;
    end if;
    if c.duration_seconds is not null and (prior.duration_updated_at is null or
      (c.source_updated_at,c.duration_seconds)>(prior.duration_updated_at,prior.duration_seconds)) then
      m.duration_seconds:=c.duration_seconds; m.duration_updated_at:=c.source_updated_at;
    end if;
    m.started_at:=least(prior.started_at,c.started_at);
    m.answered_at:=least(prior.answered_at,c.answered_at);
    m.completed_at:=greatest(prior.completed_at,c.completed_at);
    m.source_updated_at:=greatest(prior.source_updated_at,c.source_updated_at);
    m.has_voicemail:=case when prior.has_voicemail is true or c.has_voicemail is true then true else coalesce(prior.has_voicemail,c.has_voicemail) end;
    m.metadata:=jsonb_build_object('api_version','2026-03-30','caller_resolution',old_resolution);
    if m is not distinct from prior then result:='stale';
    else
      update public.quo_calls set phase=m.phase,status=m.status,status_updated_at=m.status_updated_at,
        outcome=m.outcome,outcome_phase=m.outcome_phase,outcome_updated_at=m.outcome_updated_at,
        caller_number=m.caller_number,caller_updated_at=m.caller_updated_at,
        duration_seconds=m.duration_seconds,duration_updated_at=m.duration_updated_at,
        started_at=m.started_at,answered_at=m.answered_at,completed_at=m.completed_at,
        source_updated_at=m.source_updated_at,has_voicemail=m.has_voicemail,metadata=m.metadata,updated_at=now()
        where org_id=c.org_id and quo_call_id=c.quo_call_id;
    end if;
  end if;
  update public.quo_call_events set processing_status=result,processed_at=now() where org_id=c.org_id and event_id=p_event->>'eventId';
  return result;
end;
$$;

alter table public.quo_reconciliation_runs
  add column page_events jsonb,
  add column page_index integer not null default 0,
  add column page_next_cursor text,
  add column cursor_history text[] not null default '{}',
  add column lease_owner uuid,
  add column lease_until timestamptz,
  add column last_claimed_at timestamptz,
  add constraint quo_run_window check (from_at<to_at and to_at-from_at<=interval '31 days'),
  add constraint quo_run_counts check (pages_processed>=0 and calls_processed>=0 and page_index>=0),
  add constraint quo_run_page check (page_events is null or (jsonb_typeof(page_events)='array' and jsonb_array_length(page_events)<=50 and page_index<=jsonb_array_length(page_events)));
create index quo_runs_scope_lease_idx on public.quo_reconciliation_runs(org_id,phone_number_id,lease_until);
create index quo_runs_scope_claim_idx on public.quo_reconciliation_runs(org_id,phone_number_id,last_claimed_at desc);
create index quo_runs_status_started_idx on public.quo_reconciliation_runs(status,started_at);

create function public.quo_claim_run(p_scope jsonb,p_owner uuid,p_run_id uuid,p_from timestamptz,p_to timestamptz)
returns jsonb language plpgsql security invoker set search_path='' set lock_timeout='2s'
as $$
declare r public.quo_reconciliation_runs%rowtype;
begin
  if p_owner is null or p_scope->>'orgId' is null or p_scope->>'phoneNumberId' is null then raise exception 'invalid_window'; end if;
  perform pg_advisory_xact_lock(hashtextextended('quo_run:'||(p_scope->>'orgId')||':'||(p_scope->>'phoneNumberId'),0));
  if p_run_id is not null then
    select * into r from public.quo_reconciliation_runs where id=p_run_id and org_id=p_scope->>'orgId' and phone_number_id=p_scope->>'phoneNumberId' for update;
    if not found then raise exception 'run_not_found'; end if;
    if r.status='completed' then return to_jsonb(r); end if;
  elsif p_from is null or p_to is null or p_from>=p_to or p_to-p_from>interval '31 days' then raise exception 'invalid_window';
  else
    -- Recover even when the first HTTP response (and its runId) was lost.
    select * into r from public.quo_reconciliation_runs
      where org_id=p_scope->>'orgId' and phone_number_id=p_scope->>'phoneNumberId'
        and from_at=p_from and to_at=p_to and status<>'completed'
      order by started_at desc,id desc limit 1 for update;
  end if;
  if exists(select 1 from public.quo_reconciliation_runs where org_id=p_scope->>'orgId' and phone_number_id=p_scope->>'phoneNumberId' and lease_until>clock_timestamp()) then raise exception 'run_busy'; end if;
  if exists(select 1 from public.quo_reconciliation_runs where org_id=p_scope->>'orgId' and phone_number_id=p_scope->>'phoneNumberId' and last_claimed_at>clock_timestamp()-interval '5 seconds') then raise exception 'run_throttled'; end if;
  if r.id is null then
    insert into public.quo_reconciliation_runs(org_id,phone_number_id,from_at,to_at,status) values(p_scope->>'orgId',p_scope->>'phoneNumberId',p_from,p_to,'running') returning * into r;
  end if;
  update public.quo_reconciliation_runs set lease_owner=p_owner,lease_until=clock_timestamp()+interval '90 seconds',last_claimed_at=clock_timestamp(),status='running',error_code=null,finished_at=null where id=r.id returning * into r;
  return to_jsonb(r);
end;
$$;

-- All mutation RPCs lock and recheck the lease, including after a lock wait.
create function public.quo_locked_run(p_scope jsonb,p_owner uuid,p_run_id uuid)
returns public.quo_reconciliation_runs language plpgsql security invoker set search_path='' set lock_timeout='2s'
as $$
declare r public.quo_reconciliation_runs%rowtype;
begin
  select * into r from public.quo_reconciliation_runs where id=p_run_id and org_id=p_scope->>'orgId' and phone_number_id=p_scope->>'phoneNumberId' for update;
  if not found then raise exception 'run_not_found'; end if;
  if p_owner is null or r.lease_owner is distinct from p_owner or r.lease_until is null or r.lease_until<=clock_timestamp() then raise exception 'lease_lost'; end if;
  return r;
end;
$$;

create function public.quo_stage_page(p_scope jsonb,p_owner uuid,p_run_id uuid,p_events jsonb,p_next_cursor text)
returns jsonb language plpgsql security invoker set search_path='' set lock_timeout='2s'
as $$
declare r public.quo_reconciliation_runs%rowtype; e jsonb;
begin
  r:=public.quo_locked_run(p_scope,p_owner,p_run_id);
  if r.page_events is not null or r.status='completed' or p_events is null or jsonb_typeof(p_events)<>'array' or jsonb_array_length(p_events)>50 then raise exception 'invalid_page'; end if;
  if p_next_cursor is not null and (length(p_next_cursor)=0 or length(p_next_cursor)>2048) then raise exception 'invalid_page'; end if;
  if p_next_cursor is not null and (p_next_cursor=r.next_cursor or p_next_cursor=any(r.cursor_history)) then raise exception 'cursor_loop'; end if;
  if cardinality(r.cursor_history)>=10000 then raise exception 'cursor_history_limit'; end if;
  for e in select value from jsonb_array_elements(p_events) loop
    if (e->'call'->>'org_id') is distinct from r.org_id or (e->'call'->>'phone_number_id') is distinct from r.phone_number_id or (e->>'source') is distinct from 'reconciliation' then raise exception 'invalid_page'; end if;
  end loop;
  update public.quo_reconciliation_runs set page_events=p_events,page_index=0,page_next_cursor=p_next_cursor where id=r.id returning * into r;
  return to_jsonb(r);
end;
$$;

create function public.quo_advance_run(p_scope jsonb,p_owner uuid,p_run_id uuid)
returns jsonb language plpgsql security invoker set search_path='' set lock_timeout='2s'
as $$
declare r public.quo_reconciliation_runs%rowtype; n integer;
begin
  r:=public.quo_locked_run(p_scope,p_owner,p_run_id);
  if r.page_events is null or r.status='completed' then raise exception 'invalid_page'; end if;
  n:=jsonb_array_length(r.page_events);
  if r.page_index<n then
    perform public.quo_ingest_call(r.page_events->r.page_index);
    r.page_index:=r.page_index+1; r.calls_processed:=r.calls_processed+1;
  end if;
  if r.page_index=n then
    r.pages_processed:=r.pages_processed+1; r.next_cursor:=r.page_next_cursor;
    if r.next_cursor is not null then r.cursor_history:=array_append(r.cursor_history,r.next_cursor); end if;
    r.page_events:=null; r.page_index:=0; r.page_next_cursor:=null;
    if r.next_cursor is null then r.status:='completed'; r.finished_at:=now(); end if;
  end if;
  update public.quo_reconciliation_runs set page_index=r.page_index,calls_processed=r.calls_processed,pages_processed=r.pages_processed,
    next_cursor=r.next_cursor,cursor_history=r.cursor_history,page_events=r.page_events,page_next_cursor=r.page_next_cursor,status=r.status,finished_at=r.finished_at
    where id=r.id returning * into r;
  return to_jsonb(r);
end;
$$;

create function public.quo_release_run(p_scope jsonb,p_owner uuid,p_run_id uuid,p_status text,p_error text)
returns jsonb language plpgsql security invoker set search_path='' set lock_timeout='2s'
as $$
declare r public.quo_reconciliation_runs%rowtype;
begin
  r:=public.quo_locked_run(p_scope,p_owner,p_run_id);
  if p_status not in ('partial','completed','failed') or p_status is null or (p_error is not null and p_error !~ '^[a-z_]{1,64}$') then raise exception 'invalid_page'; end if;
  -- A lost RPC response must not overwrite a committed completion/progress.
  if r.status<>'completed' then
    if p_status='completed' then raise exception 'invalid_page'; end if;
    r.status:=p_status; r.error_code:=p_error;
  else r.error_code:=null;
  end if;
  update public.quo_reconciliation_runs set status=r.status,error_code=r.error_code,finished_at=now(),lease_owner=null,lease_until=null where id=r.id returning * into r;
  return to_jsonb(r);
end;
$$;

revoke all on function public.quo_ingest_call(jsonb),public.quo_claim_run(jsonb,uuid,uuid,timestamptz,timestamptz),public.quo_locked_run(jsonb,uuid,uuid),public.quo_stage_page(jsonb,uuid,uuid,jsonb,text),public.quo_advance_run(jsonb,uuid,uuid),public.quo_release_run(jsonb,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.quo_ingest_call(jsonb),public.quo_claim_run(jsonb,uuid,uuid,timestamptz,timestamptz),public.quo_locked_run(jsonb,uuid,uuid),public.quo_stage_page(jsonb,uuid,uuid,jsonb,text),public.quo_advance_run(jsonb,uuid,uuid),public.quo_release_run(jsonb,uuid,uuid,text,text) to service_role;
comment on column public.quo_reconciliation_runs.page_events is 'Restricted normalized operational snapshots for an unfinished page. Cleared after page completion. No transcripts, recordings or raw API payloads.';
commit;
