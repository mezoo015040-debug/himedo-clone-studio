import { supabase } from '@/integrations/supabase/client';

export async function getApplicationStatus(id: string) {
  const { data, error } = await (supabase as any).rpc('get_application_status', {
    _id: id,
  });
  if (error) return { data: null as any, error };

  const application = Array.isArray(data) ? data[0] ?? null : data;
  return { data: application, error: null };
}
