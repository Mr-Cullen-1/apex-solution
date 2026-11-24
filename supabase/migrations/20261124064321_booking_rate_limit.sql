-- Local preparation only. Apply to isolated staging before deploying the API.
begin;
create table public.booking_rate_buckets (
  rate_key text not null check (rate_key ~ '^[a-f0-9]{64}$'),
  bucket_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (rate_key, bucket_start)
);
alter table public.booking_rate_buckets enable row level security;
revoke all on public.booking_rate_buckets from public, anon, authenticated;
grant select, insert, update, delete on public.booking_rate_buckets to service_role;
create index booking_rate_buckets_expiry on public.booking_rate_buckets(bucket_start);

create function public.reserve_booking_attempt(p_ip_key text, p_phone_key text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_start timestamptz := date_bin(interval '15 minutes', statement_timestamp(), timestamptz '2000-01-01 00:00:00+00');
  v_key text;
begin
  if p_ip_key is null or p_phone_key is null or p_ip_key !~ '^[a-f0-9]{64}$' or p_phone_key !~ '^[a-f0-9]{64}$' or p_ip_key = p_phone_key then
    raise exception 'invalid_rate_keys';
  end if;
  -- Stable lock order avoids deadlocks for requests sharing either bucket.
  for v_key in select unnest(array[p_ip_key, p_phone_key]) order by 1 loop
    perform pg_advisory_xact_lock(hashtextextended(v_key, 64137));
  end loop;
  if coalesce((select attempts from public.booking_rate_buckets where rate_key = p_ip_key and bucket_start = v_start), 0) >= 5
     or coalesce((select attempts from public.booking_rate_buckets where rate_key = p_phone_key and bucket_start = v_start), 0) >= 3 then
    return jsonb_build_object('allowed', false);
  end if;
  insert into public.booking_rate_buckets(rate_key, bucket_start, attempts)
    values (p_ip_key, v_start, 1), (p_phone_key, v_start, 1)
    on conflict (rate_key, bucket_start) do update set attempts = public.booking_rate_buckets.attempts + 1;
  delete from public.booking_rate_buckets where bucket_start < v_start - interval '1 day';
  return jsonb_build_object('allowed', true);
end;
$$;
revoke all on function public.reserve_booking_attempt(text, text) from public, anon, authenticated;
grant execute on function public.reserve_booking_attempt(text, text) to service_role;
commit;
