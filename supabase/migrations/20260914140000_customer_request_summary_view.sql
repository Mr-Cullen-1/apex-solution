-- Apex Home Services — Admin Phase 2: /admin/customers list aggregates
--
-- A small read-only view so the Customers list can show "Last request" and
-- "Total requests" per customer without a per-row round trip or a hand-
-- rolled GROUP BY through PostgREST (which doesn't support arbitrary
-- aggregation via the query builder). Views carry no RLS of their own, but
-- that's not a gap here: it is queried only via the privileged service_role
-- client (see src/features/admin/customers/repository.ts), and the
-- underlying public.service_requests grants already restrict who can read
-- the data being aggregated — anon/authenticated still have zero access.
--
-- Idempotent (create or replace): safe to re-run. Does not touch any
-- previously-applied migration or table.

create or replace view public.customer_request_summary as
select
  customer_id,
  count(*)::int as total_requests,
  max(created_at) as last_request_at
from public.service_requests
group by customer_id;

comment on view public.customer_request_summary is
  'Per-customer request count + most recent request timestamp, for the /admin/customers list. Read-only aggregate; service_role access only.';

revoke all on public.customer_request_summary from anon, authenticated;
grant select on public.customer_request_summary to service_role;
