import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useApplicationData = () => {
  const [applicationId, setApplicationId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get existing application ID from localStorage
    const storedId = localStorage.getItem('applicationId');
    if (storedId) {
      setApplicationId(storedId);
    }
  }, []);

  const createOrUpdateApplication = async (data: Record<string, any>) => {
    try {
      if (applicationId) {
        // Update existing application
        const { error } = await supabase
          .from('customer_applications')
          .update(data)
          .eq('id', applicationId);

        if (error) throw error;
      } else {
        // Create new application
        const { data: newApp, error } = await supabase
          .from('customer_applications')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        
        if (newApp) {
          setApplicationId(newApp.id);
          localStorage.setItem('applicationId', newApp.id);
        }
      }

      return applicationId;
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