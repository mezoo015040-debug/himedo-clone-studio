import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getApplicationStatus } from '@/lib/applicationPublic';
import { ensureOwnerToken } from '@/lib/ownerToken';

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

  const createNewApplication = async (data: Record<string, any>, ipAddress: string | null) => {
    const newId = crypto.randomUUID();
    const ownerToken = ensureOwnerToken();
    const { error } = await supabase
      .from('customer_applications')
      .insert([{ id: newId, ...data, ip_address: ipAddress, owner_token: ownerToken }]);

    if (error) throw error;
    setApplicationId(newId);
    localStorage.setItem('applicationId', newId);
    return newId;
  };

  const createOrUpdateApplication = async (data: Record<string, any>) => {
    const currentId = applicationId || localStorage.getItem('applicationId');
    
    try {
      if (currentId) {
        const ipAddress = await getVisitorIP();
        const ownerToken = ensureOwnerToken();
        const { data: ok, error } = await supabase.rpc(
          'update_customer_application_public',
          {
            _id: currentId,
            _owner_token: ownerToken,
            _patch: { ...data, ip_address: ipAddress } as any,
          }
        );

        if (error || ok === false) {
          localStorage.removeItem('applicationId');
          return await createNewApplication(data, ipAddress);
        }
        
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
          return await createNewApplication(data, ipAddress);
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
      const { data, error } = await getApplicationStatus(applicationId);
      if (error) throw error;
      return (data as any)?.[step] || false;
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
