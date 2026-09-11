-- Apex Home Services — Reviews: rate-limit policy correction.
--
-- Problem being fixed: the original check_and_record_review_rate_limit()
-- (20260911160000_review_submission_rate_limit.sql) records one event the
-- moment a request passes text validation — *before* the media upload or
-- the review insert itself is attempted. A subsequent upload failure or
-- insert failure still permanently consumed the customer's quota, and 3
-- attempts/hour was tight enough that ordinary QA (a few corrected
-- resubmissions) could trip it.
--
-- This migration does not touch or drop that original function (still a
-- harmless, unused artifact after this change) or the
-- review_submission_events table it created — it only adds one new
-- function with reservation semantics. See
-- src/features/reviews/rate-limit.ts for how it's used.
--
-- Does not modify any previously-applied migration or object:
--   20260911140000_create_reviews.sql
--   20260911150000_grant_reviews_service_role.sql
--   20260911160000_review_submission_rate_limit.sql
--   20260911190000_review_media.sql

-- check_and_reserve_review_rate_limit: same atomic
-- check-under-limit-then-insert as the original function (same
-- pg_advisory_xact_lock + 48-hour opportunistic prune), but returns the
-- inserted event's id alongside the boolean. The application reserves a
-- slot *before* attempting the actual upload/insert, then deletes that
-- specific row (see releaseRateLimitReservation in rate-limit.ts) if the
-- submission it was reserved for ultimately fails — so the row only stays
-- recorded, and only counts toward the window, when the submission that
-- reserved it actually succeeded. This reserve-then-release shape (rather
-- than a plain "check, then separately record only on success") is what
-- keeps the check atomic: two concurrent requests from the same rate key
-- can still never both read "under limit" and both proceed, which a
-- non-atomic two-step check/record would allow.
create or replace function public.check_and_reserve_review_rate_limit(
  p_rate_key text,
  p_limit int,
  p_window_minutes int
)
returns table(allowed boolean, event_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_event_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext(p_rate_key));

  delete from public.review_submission_events
    where created_at < now() - interval '48 hours';

  select count(*) into v_count
    from public.review_submission_events
    where rate_key = p_rate_key
      and created_at >= now() - make_interval(mins => p_window_minutes);

  if v_count >= p_limit then
    return query select false, null::uuid;
    return;
  end if;

  insert into public.review_submission_events (rate_key)
    values (p_rate_key)
    returning id into v_event_id;

  return query select true, v_event_id;
end;
$$;

comment on function public.check_and_reserve_review_rate_limit(text, int, int) is
  'Atomically checks the rolling window and, if under p_limit, reserves one slot by inserting an event row and returning its id. Caller must delete that row (service_role already has DELETE on review_submission_events) if the submission it reserved ultimately fails, so a failed submission never permanently costs quota.';

-- Same access posture as the original function: only service_role, never
-- anon/authenticated/public. No new table grant is needed for the release
-- (delete) step — service_role already holds SELECT/INSERT/DELETE on
-- review_submission_events from 20260911160000_review_submission_rate_limit.sql.
revoke all on function public.check_and_reserve_review_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_and_reserve_review_rate_limit(text, int, int) to service_role;
