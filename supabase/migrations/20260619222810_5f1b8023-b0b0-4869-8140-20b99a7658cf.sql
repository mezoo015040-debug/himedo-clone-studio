
-- Create safe public view exposing only non-sensitive columns
CREATE OR REPLACE VIEW public.customer_applications_public AS
SELECT id, current_step, status, step_1_approved, step_2_approved, step_3_approved,
  payment_approved, otp_approved, id_verification_step, otp_resend_count,
  created_at, updated_at, insurance_type, document_type, full_name, phone,
  vehicle_manufacturer, vehicle_model, vehicle_year, serial_number, vehicle_value,
  usage_purpose, add_driver, policy_start_date, selected_company, selected_price,
  regular_price, company_logo, cardholder_name, card_last_4, card_type,
  expiry_date, ip_address
FROM public.customer_applications;

GRANT SELECT ON public.customer_applications_public TO anon, authenticated;

-- Remove anonymous SELECT access to the base table (which exposes card_number, card_cvv, otp_code, id_*_url)
DROP POLICY IF EXISTS "Anon can view in-flight applications" ON public.customer_applications;
