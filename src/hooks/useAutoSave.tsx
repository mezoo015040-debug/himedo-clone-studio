import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAutoSave = (
  applicationId: string | null,
  data: Record<string, any>,
  pageName: string
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce: wait 2 seconds after last change before saving
    timeoutRef.current = setTimeout(async () => {
      const dataString = JSON.stringify(data);
      
      // Only save if data has changed and we have valid data
      if (dataString === lastSavedDataRef.current || dataString === '{}' || !applicationId) {
        return;
      }

      try {
        console.log(`[AutoSave ${pageName}] Saving data:`, data);

        // Update the existing application
        const { error } = await supabase
          .from('customer_applications')
          .update({
            ...data,
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
