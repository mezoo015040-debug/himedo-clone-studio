import { supabase } from '@/integrations/supabase/client';

export async function getApplicationStatus(id: string) {
  const { data, error } = await (supabase as any).rpc('get_application_status', { _id: id });
  if (error) return { data: null as any, error };
  const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return { data: row, error: null };
}
