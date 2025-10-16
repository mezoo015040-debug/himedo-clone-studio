import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApplicationData {
  id?: string;
  insurance_type?: string;
  document_type?: string;
  full_name?: string;
  phone?: string;
  vehicle_manufacturer?: string;
  vehicle_model?: string;
  vehicle_year?: string;
  serial_number?: string;
  vehicle_value?: number;
  usage_purpose?: string;
  add_driver?: boolean;
  policy_start_date?: string;
  selected_company?: string;
  selected_price?: string;
  regular_price?: string;
  company_logo?: string;
  cardholder_name?: string;
  card_last_4?: string;
  card_type?: string;
  expiry_date?: string;
  otp_code?: string;
  current_step?: string;
  step_1_approved?: boolean;
  step_2_approved?: boolean;
  step_3_approved?: boolean;
  payment_approved?: boolean;
  otp_approved?: boolean;
}

export const useCustomerApplication = (applicationId?: string) => {
  const [data, setData] = useState<ApplicationData>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // إنشاء طلب جديد
  const createApplication = async (initialData: ApplicationData) => {
    try {
      const { data: newApp, error } = await supabase
        .from('customer_applications')
        .insert([{ ...initialData, current_step: 'quote_form' }])
        .select()
        .single();

      if (error) throw error;
      
      setData(newApp);
      return newApp.id;
    } catch (error) {
      console.error('Error creating application:', error);
      return null;
    }
  };

  // تحديث بيانات الطلب
  const updateApplication = async (appId: string, updates: ApplicationData) => {
    try {
      const { error } = await supabase
        .from('customer_applications')
        .update(updates)
        .eq('id', appId);

      if (error) throw error;
      
      setData(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error('Error updating application:', error);
      return false;
    }
  };

  // التحقق من موافقة الخطوة
  const checkStepApproval = async (appId: string, step: string): Promise<boolean> => {
    try {
      const { data: app, error } = await supabase
        .from('customer_applications')
        .select('*')
        .eq('id', appId)
        .single();

      if (error) throw error;

      switch (step) {
        case 'quote_form':
          return app.step_1_approved || false;
        case 'vehicle_info':
          return app.step_2_approved || false;
        case 'insurance_selection':
          return app.step_3_approved || false;
        case 'payment':
          return app.payment_approved || false;
        case 'otp':
          return app.otp_approved || false;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking approval:', error);
      return false;
    }
  };

  // الاستماع للتغييرات في الوقت الفعلي
  useEffect(() => {
    if (!applicationId) return;

    const channel = supabase
      .channel(`application_${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'customer_applications',
          filter: `id=eq.${applicationId}`
        },
        (payload) => {
          setData(payload.new as ApplicationData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId]);

  return {
    data,
    loading,
    createApplication,
    updateApplication,
    checkStepApproval
  };
};
