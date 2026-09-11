-- Apex Home Services — Reviews follow-up: service_role table grants
--
-- Root cause of the live "42501 permission denied for table reviews" error:
-- the Supabase secret key (sb_secret_...) correctly maps to the Postgres
-- `service_role`, and that role does bypass Row Level Security — but RLS
-- bypass is a separate mechanism from ordinary Postgres GRANT privileges.
-- The original migration (20260911140000_create_reviews.sql) enabled RLS
-- and revoked access from `anon`/`authenticated`, but never explicitly
-- granted `service_role` the table-level privileges the Data API needs to
-- actually perform SELECT/INSERT/UPDATE/DELETE. Without those grants,
-- Postgres denies the operation before RLS is ever evaluated.
--
-- This migration only adds grants. It does not alter, drop, or recreate
-- any existing object — safe to run against the already-applied schema.
-- Idempotent: GRANT is a no-op if the privilege is already held.

grant usage on schema public to service_role;

grant select, insert, update, delete
  on table public.reviews
  to service_role;

grant usage on type public.review_status to service_role;

-- Explicitly NOT granted here, and must never be: anon, authenticated.
-- RLS stays enabled on public.reviews with zero policies for those roles,
-- so even if a future migration accidentally granted them table privileges,
-- RLS would still deny access by default. The two mechanisms are
-- intentionally layered — this migration only fixes the service_role side.
