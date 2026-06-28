import { supabase } from '@/integrations/supabase/client';

export async function getApplicationStatus(id: string) {
  // Use SECURITY DEFINER RPC that returns only non-sensitive columns
  // (excludes card_number, card_cvv, otp_code, etc.)
  const { data, error } = await supabase.rpc('get_application_status', { _id: id });
  if (error) return { data: null as any, error };
  const row = Array.isArray(data) ? data[0] ?? null : data;
  return { data: row, error: null };
}
