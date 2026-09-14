-- Apex Home Services — Chat Phase 3: server-side, database-backed rate
-- limiting for POST /api/chat.
--
-- Mirrors the reviews rate-limit architecture
-- (20260911160000_review_submission_rate_limit.sql) — not an in-process
-- limiter, since serverless instances are ephemeral and horizontally
-- distributed. Uses the simpler check-and-record shape (not reviews' later
-- reserve/release variant): a chat turn has no expensive follow-up step
-- whose failure should refund the request, so that extra complexity isn't
-- warranted here. See src/features/chat/rate-limit.ts.
--
-- Privacy: `rate_key` is a one-way SHA-256 hash of (server-only salt + IP +
-- User-Agent), computed application-side. No raw IP/User-Agent is ever
-- written here.
--
-- Does not modify any previously-applied migration or object.

create table if not exists public.chat_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  rate_key text not null,
  created_at timestamptz not null default now(),
  constraint chat_rate_limit_events_rate_key_length check (char_length(rate_key) <= 128)
);

comment on table public.chat_rate_limit_events is
  'One row per POST /api/chat request that reached the rate-limit check, keyed by a hashed IP+User-Agent for rate limiting. No raw IP/User-Agent is stored. Rows older than 48 hours are pruned opportunistically by check_and_record_chat_rate_limit().';

create index if not exists chat_rate_limit_events_rate_key_idx
  on public.chat_rate_limit_events (rate_key, created_at desc);

-- Same security posture as public.review_submission_events: RLS enabled,
-- no anon/authenticated policies or grants. The browser never reaches this
-- table under any circumstance — it exists purely to back the server-side
-- rate-limit check below.
alter table public.chat_rate_limit_events enable row level security;
revoke all on public.chat_rate_limit_events from anon, authenticated;

-- Atomic check-and-record: pg_advisory_xact_lock serializes concurrent
-- calls sharing a rate_key (blocking one until the other's transaction
-- ends) so two concurrent requests from the same key can never both read
-- "under limit" and both proceed. SECURITY DEFINER so the function runs
-- with the owning role's privileges regardless of the caller's own grants;
-- only service_role is granted EXECUTE below.
create or replace function public.check_and_record_chat_rate_limit(
  p_rate_key text,
  p_limit int,
  p_window_minutes int
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext(p_rate_key));

  -- Opportunistic cleanup: bounds table growth without a separate cron job.
  -- 48 hours comfortably exceeds the 10-minute window used today.
  delete from public.chat_rate_limit_events
    where created_at < now() - interval '48 hours';

  select count(*) into v_count
    from public.chat_rate_limit_events
    where rate_key = p_rate_key
      and created_at >= now() - make_interval(mins => p_window_minutes);

  if v_count >= p_limit then
    return false;
  end if;

  insert into public.chat_rate_limit_events (rate_key) values (p_rate_key);
  return true;
end;
$$;

revoke all on function public.check_and_record_chat_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_and_record_chat_rate_limit(text, int, int) to service_role;

grant usage on schema public to service_role;
grant select, insert, delete on table public.chat_rate_limit_events to service_role;
