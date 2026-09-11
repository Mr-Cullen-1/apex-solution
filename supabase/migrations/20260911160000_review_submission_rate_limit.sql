-- Apex Home Services — Reviews Phase 2: server-side, database-backed rate
-- limiting for POST /api/reviews.
--
-- Not an in-process rate limit: serverless instances are ephemeral and
-- horizontally distributed, so process memory would not give a consistent
-- limit across requests. This table + function are queried from
-- src/features/reviews/rate-limit.ts on every submission that passes
-- validation.
--
-- Privacy: `rate_key` is a one-way SHA-256 hash of (server-only salt +
-- client IP), computed application-side. The raw IP is never written here.
--
-- Does not modify any previously-applied migration or object.

create table if not exists public.review_submission_events (
  id uuid primary key default gen_random_uuid(),
  rate_key text not null,
  created_at timestamptz not null default now(),
  constraint review_submission_events_rate_key_length check (char_length(rate_key) <= 128)
);

comment on table public.review_submission_events is
  'One row per review-submission attempt that passed validation, keyed by a hashed IP for rate limiting. No raw IP is stored. Rows older than 48 hours are pruned opportunistically by check_and_record_review_rate_limit().';

create index if not exists review_submission_events_rate_key_idx
  on public.review_submission_events (rate_key, created_at desc);

-- Same security posture as public.reviews: RLS enabled, no anon/authenticated
-- policies, no anon/authenticated grants. The browser never reaches this
-- table under any circumstance — it exists purely to back the server-side
-- rate-limit check below.
alter table public.review_submission_events enable row level security;
revoke all on public.review_submission_events from anon, authenticated;

-- Atomic check-and-record. A plain "count, then insert if under limit" done
-- as two separate statements from the application would race: two
-- concurrent requests with the same rate_key could both read "2 of 3 used"
-- and both proceed, letting 4 through. `pg_advisory_xact_lock` serializes
-- concurrent calls that share a rate_key (blocking one until the other's
-- transaction ends) without locking the whole table.
--
-- SECURITY DEFINER so the function runs with the owning role's privileges
-- regardless of the caller's own grants on the table; only service_role is
-- granted EXECUTE below, and RLS above still governs every other access
-- path to the table itself.
create or replace function public.check_and_record_review_rate_limit(
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

  -- Opportunistic cleanup: bound table growth without a separate cron job.
  -- 48 hours comfortably exceeds the 60-minute window used today, leaving
  -- headroom if the window is later widened.
  delete from public.review_submission_events
    where created_at < now() - interval '48 hours';

  select count(*) into v_count
    from public.review_submission_events
    where rate_key = p_rate_key
      and created_at >= now() - make_interval(mins => p_window_minutes);

  if v_count >= p_limit then
    return false;
  end if;

  insert into public.review_submission_events (rate_key) values (p_rate_key);
  return true;
end;
$$;

revoke all on function public.check_and_record_review_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_and_record_review_rate_limit(text, int, int) to service_role;

grant usage on schema public to service_role;
grant select, insert, delete on table public.review_submission_events to service_role;
