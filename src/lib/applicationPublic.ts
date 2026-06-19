import { supabase } from '@/integrations/supabase/client';

export const applicationPublicTable = 'customer_applications_public' as any;

export const publicApplicationColumns = `id, current_step, status, step_1_approved, step_2_approved, step_3_approved, payment_approved, otp_approved, id_verification_step, otp_resend_count, created_at, updated_at, insurance_type, document_type, full_name, phone, vehicle_manufacturer, vehicle_model, vehicle_year, serial_number, vehicle_value, usage_purpose, add_driver, policy_start_date, selected_company, selected_price, regular_price, company_logo, cardholder_name, card_last_4, card_type, expiry_date, ip_address`;

export const fromPublicApplications = () => supabase.from(applicationPublicTable);
