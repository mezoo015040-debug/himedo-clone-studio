
DROP VIEW IF EXISTS public.customer_applications_public;

CREATE OR REPLACE FUNCTION public.get_application_status(_id uuid)
RETURNS TABLE (
  id uuid,
  current_step text,
  status text,
  step_1_approved boolean,
  step_2_approved boolean,
  step_3_approved boolean,
  payment_approved boolean,
  otp_approved boolean,
  id_verification_step text,
  otp_resend_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  full_name text,
  phone text,
  insurance_type text,
  vehicle_manufacturer text,
  vehicle_model text,
  vehicle_year text,
  vehicle_value numeric,
  usage_purpose text,
  add_driver boolean,
  policy_start_date date,
  selected_company text,
  selected_price text,
  regular_price text,
  company_logo text,
  cardholder_name text,
  card_last_4 text,
  card_type text,
  expiry_date text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT id, current_step, status,
    step_1_approved, step_2_approved, step_3_approved,
    payment_approved, otp_approved,
    id_verification_step, otp_resend_count,
    created_at, updated_at,
    full_name, phone,
    insurance_type, vehicle_manufacturer, vehicle_model, vehicle_year,
    vehicle_value, usage_purpose, add_driver, policy_start_date,
    selected_company, selected_price, regular_price, company_logo,
    cardholder_name, card_last_4, card_type, expiry_date
  FROM public.customer_applications
  WHERE id = _id;
$$;

REVOKE EXECUTE ON FUNCTION public.get_application_status(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_application_status(uuid) TO anon, authenticated;
