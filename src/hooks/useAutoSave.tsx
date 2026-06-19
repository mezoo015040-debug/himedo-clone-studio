import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVisitorIP } from '@/lib/visitorIP';

export const useAutoSave = (
  applicationId: string | null,
  data: Record<string, any>,
  pageName: string
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      const dataString = JSON.stringify(data);

      if (dataString === lastSavedDataRef.current || dataString === '{}' || !applicationId) {
        return;
      }

      try {
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== '' && value !== null && value !== undefined) {
            filteredData[key] = value;
          }
        }

        if (Object.keys(filteredData).length === 0) return;

        const ipAddress = await getVisitorIP();

        console.log(`[AutoSave ${pageName}] Saving data:`, filteredData);

        const { error } = await supabase
          .from('customer_applications')
          .update({
            ...filteredData,
            ip_address: ipAddress,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (error) {
          console.error(`[AutoSave ${pageName}] Error:`, error);
          return;
        }

        lastSavedDataRef.current = dataString;
        console.log(`[AutoSave ${pageName}] Data saved successfully`);
      } catch (error) {
        console.error(`[AutoSave ${pageName}] Exception:`, error);
      }
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, pageName, applicationId]);
};
