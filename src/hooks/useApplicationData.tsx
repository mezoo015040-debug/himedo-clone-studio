import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// دالة مساعدة لجلب IP
const getVisitorIP = async (): Promise<string | null> => {
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

export const useApplicationData = () => {
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const isCreatingRef = useRef(false);
  const pendingCreateRef = useRef<Promise<string | null> | null>(null);

  useEffect(() => {
    const storedId = localStorage.getItem('applicationId');
    if (storedId) {
      setApplicationId(storedId);
    }
  }, []);

  const createOrUpdateApplication = async (data: Record<string, any>) => {
    // Check localStorage directly to avoid stale state
    const currentId = applicationId || localStorage.getItem('applicationId');
    
    try {
      if (currentId) {
        const ipAddress = await getVisitorIP();
        const { error } = await supabase
          .from('customer_applications')
          .update({ ...data, ip_address: ipAddress })
          .eq('id', currentId);

        if (error) throw error;
        
        // Sync state if it was from localStorage
        if (!applicationId) {
          setApplicationId(currentId);
        }
        return currentId;
      } else {
        // Prevent duplicate creation with a lock
        if (isCreatingRef.current && pendingCreateRef.current) {
          // Wait for the existing creation to finish
          return await pendingCreateRef.current;
        }
        
        isCreatingRef.current = true;
        
        const createPromise = (async () => {
          const ipAddress = await getVisitorIP();
          const { data: newApp, error } = await supabase
            .from('customer_applications')
            .insert([{ ...data, ip_address: ipAddress }])
            .select()
            .single();

          if (error) throw error;
          
          if (newApp) {
            setApplicationId(newApp.id);
            localStorage.setItem('applicationId', newApp.id);
            return newApp.id;
          }
          return null;
        })();
        
        pendingCreateRef.current = createPromise;
        
        try {
          const result = await createPromise;
          return result;
        } finally {
          isCreatingRef.current = false;
          pendingCreateRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error creating/updating application:', error);
      throw error;
    }
  };

  const checkApproval = async (step: string): Promise<boolean> => {
    if (!applicationId) return false;

    try {
      const { data, error } = await supabase
        .from('customer_applications')
        .select(step)
        .eq('id', applicationId)
        .single();

      if (error) throw error;
      return data?.[step] || false;
    } catch (error) {
      console.error('Error checking approval:', error);
      return false;
    }
  };

  const waitForApproval = async (step: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const checkInterval = setInterval(async () => {
        const approved = await checkApproval(step);
        if (approved) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 2000); // Check every 2 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 300000);
    });
  };

  return {
    applicationId,
    createOrUpdateApplication,
    checkApproval,
    waitForApproval
  };
};