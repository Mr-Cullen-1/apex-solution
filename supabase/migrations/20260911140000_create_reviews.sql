-- Apex Home Services — Reviews Phase 1
--
-- Creates the private `public.reviews` table that backs the future customer
-- review submission + moderation flow. No public UI reads this table
-- directly: all access is mediated by the Next.js server using the
-- Supabase service-role key (see src/lib/supabase/server.ts and
-- src/features/reviews/repository.ts).
--
-- Idempotent: safe to re-run. Does not touch any other schema object.

create extension if not exists pgcrypto;

-- 1. Status enum -------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'approved', 'rejected');
  end if;
end
$$;

-- 2. Table ---------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),

  -- Private — never returned by the public read path. Kept for moderation
  -- and, potentially, future direct follow-up with the customer.
  full_name text not null,

  -- Public-safe derived name (e.g. "Mary-Jane O'Connor" -> "Mary-Jane O.").
  -- Computed server-side at submission time by features/reviews/model.ts.
  display_name text not null,

  rating smallint not null,
  review_text text not null,

  -- Snapshot fields rather than a foreign key / enum: the active service
  -- catalog (src/content/services.ts) can change over time, and a review
  -- must keep reading sensibly even after a service is renamed or retired.
  service_slug text,
  service_label text,

  location_text text,

  status public.review_status not null default 'pending',
  is_verified_customer boolean not null default false,
  is_featured boolean not null default false,

  -- Must be explicitly sent as true by the submitter; publication also
  -- requires status = 'approved' regardless of this flag (see the partial
  -- index and repository query below).
  consent_to_publish boolean not null default false,

  -- Where the review came from. Always "website" for the Phase 1 public
  -- form; the column exists so a later manual/Google/Facebook import does
  -- not require a schema change.
  source text not null default 'website',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  approved_at timestamptz,
  rejected_at timestamptz,

  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_full_name_length check (char_length(trim(full_name)) between 1 and 120),
  constraint reviews_display_name_length check (char_length(trim(display_name)) between 1 and 120),
  constraint reviews_review_text_length check (char_length(trim(review_text)) between 10 and 2000),
  constraint reviews_location_text_length check (location_text is null or char_length(location_text) <= 160),
  constraint reviews_service_slug_length check (service_slug is null or char_length(service_slug) <= 60),
  constraint reviews_service_label_length check (service_label is null or char_length(service_label) <= 120),
  constraint reviews_source_length check (char_length(source) <= 40)
);

comment on table public.reviews is
  'Customer review submissions. Private table — all access goes through the Next.js server using the service-role key. Public visibility requires status = approved AND consent_to_publish = true.';
comment on column public.reviews.full_name is 'Private. Never exposed by the public read path.';
comment on column public.reviews.display_name is 'Public-safe derived name shown in place of full_name.';

-- 3. updated_at trigger ----------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row
  execute function public.set_updated_at();

-- 4. Moderation-timestamp trigger ------------------------------------------
-- Keeps approved_at/rejected_at in lockstep with `status` so callers never
-- need to (and can't accidentally forget to) maintain them by hand.

create or replace function public.set_review_moderation_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'approved' then
      new.approved_at = now();
      new.rejected_at = null;
    elsif new.status = 'rejected' then
      new.rejected_at = now();
      new.approved_at = null;
    elsif new.status = 'pending' then
      new.approved_at = null;
      new.rejected_at = null;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists reviews_set_moderation_timestamps on public.reviews;
create trigger reviews_set_moderation_timestamps
  before update on public.reviews
  for each row
  execute function public.set_review_moderation_timestamps();

-- 5. Indexes -----------------------------------------------------------

-- Moderation queue: "show pending reviews, oldest/newest first".
create index if not exists reviews_pending_queue_idx
  on public.reviews (status, created_at desc);

-- Public read path: approved + consented reviews, newest first. Partial so
-- the index stays small and only covers rows that can ever be public.
create index if not exists reviews_public_approved_idx
  on public.reviews (approved_at desc)
  where status = 'approved' and consent_to_publish = true;

-- 6. Row Level Security ----------------------------------------------------
-- No policies are created for anon/authenticated: with RLS enabled and zero
-- policies, PostgREST denies all access by default. The service-role key
-- used by the Next.js server bypasses RLS entirely, which is the only way
-- this table is ever read or written.

alter table public.reviews enable row level security;

revoke all on public.reviews from anon, authenticated;
revoke all on function public.set_updated_at() from anon, authenticated;
revoke all on function public.set_review_moderation_timestamps() from anon, authenticated;
