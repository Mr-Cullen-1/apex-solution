-- Apex Home Services — fix: book_now_create_request email_status cast
--
-- Bug found during Admin Phase 2 final QA (real Book Now regression test):
-- every Book Now submission failed with Postgres error 42804
-- ("column \"email_status\" is of type email_delivery_status but expression
-- is of type text"). public.service_requests.email_status is a real enum
-- (public.email_delivery_status, see
-- 20260913100000_add_service_request_email_delivery.sql), but
-- book_now_create_request (20260914130000_service_requests_crm_fields.sql)
-- assigned it from an untyped `case when ... then 'pending' else
-- 'not_requested' end` expression, which Postgres infers as `text` — never
-- valid for a strict enum column, regardless of the two literals being
-- valid enum labels.
--
-- Fix: cast the case expression to public.email_delivery_status. Does not
-- touch 20260914130000_service_requests_crm_fields.sql (already-applied
-- migration history) — this only re-issues `create or replace function`,
-- which is how a deployed function is corrected without editing history.
-- Idempotent: safe to re-run.

create or replace function public.book_now_create_request(
  p_full_name text,
  p_phone text,
  p_normalized_phone text,
  p_email text,
  p_normalized_email text,
  p_zip_code text,
  p_service_id text,
  p_service_label text,
  p_category_id text,
  p_category_label text,
  p_issue text,
  p_message text,
  p_sms_consent boolean,
  p_source_path text,
  p_offer_code text,
  p_offer_label text,
  p_discount_percent smallint
)
returns public.service_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_row public.service_requests;
begin
  v_customer_id := public.resolve_or_create_customer(p_full_name, p_phone, p_normalized_phone, p_email, p_normalized_email, p_zip_code);

  insert into public.service_requests (
    full_name, phone, email, zip_code, service_id, service_label, category_id, category_label,
    issue, message, sms_consent, source_path, email_status, customer_id, offer_code, offer_label, discount_percent
  ) values (
    p_full_name, p_phone, p_email, p_zip_code, p_service_id, p_service_label, p_category_id, p_category_label,
    p_issue, p_message, p_sms_consent, p_source_path,
    (case when p_email is not null then 'pending' else 'not_requested' end)::public.email_delivery_status,
    v_customer_id, p_offer_code, p_offer_label, p_discount_percent
  )
  returning * into v_row;

  insert into public.customer_activity_events (customer_id, service_request_id, event_type, metadata)
  values (v_customer_id, v_row.id, 'request_created', jsonb_build_object('service_label', p_service_label, 'category_label', p_category_label));

  return v_row;
end;
$$;

revoke all on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint) from public, anon, authenticated;
grant execute on function public.book_now_create_request(text, text, text, text, text, text, text, text, text, text, text, text, boolean, text, text, text, smallint) to service_role;
