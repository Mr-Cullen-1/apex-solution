-- Apex Home Services — Reviews Phase 2.5: optional review photo attachment.
--
-- Adds nullable media columns to public.reviews and provisions a PRIVATE
-- Supabase Storage bucket (`review-media`) to hold the uploaded object.
-- Storage object paths are server-generated random UUIDs (see
-- src/features/reviews/repository.ts) — never the customer's raw filename,
-- and never derived from full_name.
--
-- Idempotent, and does not modify any previously-applied migration or
-- object:
--   20260911140000_create_reviews.sql
--   20260911150000_grant_reviews_service_role.sql
--   20260911160000_review_submission_rate_limit.sql

-- 1. Media columns ---------------------------------------------------------

alter table public.reviews
  add column if not exists media_path text,
  add column if not exists media_mime_type text,
  add column if not exists media_size_bytes integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_media_path_length') then
    alter table public.reviews
      add constraint reviews_media_path_length check (media_path is null or char_length(media_path) <= 300);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'reviews_media_mime_type_allowed') then
    alter table public.reviews
      add constraint reviews_media_mime_type_allowed check (
        media_mime_type is null or media_mime_type in ('image/jpeg', 'image/png', 'image/webp')
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'reviews_media_size_bytes_range') then
    alter table public.reviews
      add constraint reviews_media_size_bytes_range check (
        media_size_bytes is null or media_size_bytes between 1 and 5242880
      );
  end if;

  -- Either all three media columns are set, or none are — prevents a
  -- half-written row (e.g. a path with no known mime type/size).
  if not exists (select 1 from pg_constraint where conname = 'reviews_media_columns_consistent') then
    alter table public.reviews
      add constraint reviews_media_columns_consistent check (
        (media_path is null and media_mime_type is null and media_size_bytes is null)
        or (media_path is not null and media_mime_type is not null and media_size_bytes is not null)
      );
  end if;
end
$$;

comment on column public.reviews.media_path is
  'Private Supabase Storage object path in the review-media bucket, e.g. reviews/<uuid>.jpg. Never a public URL, never derived from the customer full_name or uploaded filename.';
comment on column public.reviews.media_mime_type is
  'One of image/jpeg, image/png, image/webp. Set server-side from magic-byte detection of the uploaded bytes, never trusted from the client-declared Content-Type or filename.';
comment on column public.reviews.media_size_bytes is
  'Actual uploaded byte size, capped at 5 MiB (5242880 bytes) — enforced both at the application layer and by this CHECK constraint.';

-- 2. Storage bucket ---------------------------------------------------------
-- Private: `public = false`. No public URL is ever generated for objects in
-- this bucket in this phase — see docs/REVIEWS_ARCHITECTURE.md. Bucket-level
-- `file_size_limit`/`allowed_mime_types` are defense in depth on top of, not
-- a replacement for, the application-level checks in
-- src/app/api/reviews/route.ts and src/features/reviews/media.ts.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-media', 'review-media', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage access ----------------------------------------------------
-- Supabase enables RLS on storage.objects by default, and grants no
-- anon/authenticated access to any bucket unless a policy explicitly says
-- so. This migration deliberately adds ZERO such policies for
-- `review-media` — the same deny-by-default posture as public.reviews
-- itself (see the original create_reviews migration's RLS section). The
-- only way in or out is the Next.js server using the Supabase secret
-- (service_role) key, which bypasses Storage RLS the same way it bypasses
-- table RLS. Do not add anon/authenticated storage policies for this bucket
-- in a later phase without an explicit, reviewed reason — pending review
-- media must not become reachable before the corresponding review is
-- approved (and even then, only via a future signed-URL layer, never a
-- public bucket).
