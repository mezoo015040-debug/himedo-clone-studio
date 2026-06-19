import { supabase } from '@/integrations/supabase/client';

export const publicApplications = (): any => supabase.from('customer_applications_public' as any) as any;
