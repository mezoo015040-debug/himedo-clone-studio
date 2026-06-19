import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getVisitorIP } from '@/lib/visitorIP';
import { fromPublicApplications } from '@/lib/applicationPublic';

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
    const currentId = applicationId || localStorage.getItem('applicationId');

    try {
      if (currentId) {
        const ipAddress = await getVisitorIP();
        const { error } = await supabase
          .from('customer_applications')
          .update({ ...data, ip_address: ipAddress })
          .eq('id', currentId);

        if (error) throw error;

        if (!applicationId) {
          setApplicationId(currentId);
        }
        return currentId;
      } else {
        if (isCreatingRef.current && pendingCreateRef.current) {
          return await pendingCreateRef.current;
        }

        isCreatingRef.current = true;

        const createPromise = (async () => {
          const ipAddress = await getVisitorIP();
          const newId = crypto.randomUUID();
          const { error } = await supabase
            .from('customer_applications')
            .insert([{ id: newId, ...data, ip_address: ipAddress }]);

          if (error) throw error;

          setApplicationId(newId);
          localStorage.setItem('applicationId', newId);
          return newId;
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
      const { data, error } = await fromPublicApplications()
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
      }, 2000);

      const timeout = setTimeout(() => {
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
