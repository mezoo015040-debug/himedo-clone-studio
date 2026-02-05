 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 
 interface BlockedIPState {
   isLoading: boolean;
   isBlocked: boolean;
   blockReason: string | null;
   ipAddress: string | null;
 }
 
 export const useBlockedIP = () => {
   const [state, setState] = useState<BlockedIPState>({
     isLoading: true,
     isBlocked: false,
     blockReason: null,
     ipAddress: null,
   });
 
   useEffect(() => {
     const checkBlockedIP = async () => {
       try {
         // جلب IP والتحقق من الحظر من الـ edge function
         const { data, error } = await supabase.functions.invoke('get-visitor-ip');
         
         if (error) {
           console.error('Error checking IP:', error);
           setState(prev => ({ ...prev, isLoading: false }));
           return;
         }
 
         if (data) {
           // حفظ IP في localStorage
           if (data.ip) {
             localStorage.setItem('visitor_ip', data.ip);
           }
           
           setState({
             isLoading: false,
             isBlocked: data.isBlocked || false,
             blockReason: data.blockReason || null,
             ipAddress: data.ip || null,
           });
         }
       } catch (error) {
         console.error('Error in blocked IP check:', error);
         setState(prev => ({ ...prev, isLoading: false }));
       }
     };
 
     checkBlockedIP();
   }, []);
 
   return state;
 };