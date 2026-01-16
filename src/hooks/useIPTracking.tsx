import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IPInfo {
  ip: string | null;
  isBlocked: boolean;
  blockReason: string | null;
  isLoading: boolean;
}

export const useIPTracking = () => {
  const [ipInfo, setIpInfo] = useState<IPInfo>({
    ip: null,
    isBlocked: false,
    blockReason: null,
    isLoading: true
  });

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-visitor-ip');
        
        if (error) {
          console.error('Error fetching IP:', error);
          setIpInfo(prev => ({ ...prev, isLoading: false }));
          return;
        }

        setIpInfo({
          ip: data.ip,
          isBlocked: data.isBlocked,
          blockReason: data.blockReason,
          isLoading: false
        });

        // Store IP in localStorage for other components to use
        if (data.ip) {
          localStorage.setItem('visitor_ip', data.ip);
        }

        console.log('IP fetched successfully:', data);
      } catch (error) {
        console.error('Error in IP tracking:', error);
        setIpInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchIP();
  }, []);

  return ipInfo;
};