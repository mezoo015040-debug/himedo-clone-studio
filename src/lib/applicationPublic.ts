import { supabase } from '@/integrations/supabase/client';

export async function getApplicationStatus(id: string) {
  const { data, error } = await supabase
    .from('customer_applications')
    .select(`
      id,
      current_step,
      status,
      step_1_approved,
      step_2_approved,
      step_3_approved,
      payment_approved,
      otp_approved,
      id_verification_step,
      otp_resend_count,
      created_at,
      updated_at,
      full_name,
      phone,
      insurance_type,
      vehicle_manufacturer,
      vehicle_model,
      vehicle_year,
      vehicle_value,
      usage_purpose,
      add_driver,
      policy_start_date,
      selected_company,
      selected_price,
      regular_price,
      company_logo,
      cardholder_name,
      card_last_4,
      card_type,
      expiry_date
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) return { data: null as any, error };
  return { data, error: null };
}
