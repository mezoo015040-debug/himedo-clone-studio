import { useEffect, useRef } from 'react';

const FORMSPREE_URL = 'https://formspree.io/f/xnnglvvz';

export const useFormspreeSync = (data: Record<string, any>, pageName: string) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentDataRef = useRef<string>('');

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce: wait 2 seconds after last change before sending
    timeoutRef.current = setTimeout(async () => {
      const dataString = JSON.stringify(data);
      
      // Only send if data has changed
      if (dataString === lastSentDataRef.current || dataString === '{}') {
        return;
      }

      try {
        const formData = new FormData();
        formData.append('page', pageName);
        formData.append('timestamp', new Date().toISOString());
        
        // Add all data fields
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            formData.append(key, String(value));
          }
        });

        await fetch(FORMSPREE_URL, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        lastSentDataRef.current = dataString;
      } catch (error) {
        console.error('Error sending data to Formspree:', error);
      }
    }, 2000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, pageName]);
};
