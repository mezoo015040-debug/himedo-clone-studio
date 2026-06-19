import { supabase } from '@/integrations/supabase/client';

export const getVisitorIP = async (): Promise<string | null> => {
  let ip = localStorage.getItem('visitor_ip');
  if (ip) return ip;

  try {
    const { data } = await supabase.functions.invoke('get-visitor-ip');
    if (data?.ip) {
      localStorage.setItem('visitor_ip', data.ip);
      return data.ip;
    }
  } catch (error) {
    console.error('Error fetching IP:', error);
  }
  return null;
};
