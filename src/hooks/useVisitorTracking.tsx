import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getLandingDomain, getOrCreateVisitorId } from '@/lib/visitor';

const EXCLUDED_PATHS = ['/login', '/dashboard', '/admin-register-secure-2024'];

const isCustomerPath = (path: string): boolean => {
  return !EXCLUDED_PATHS.some(excluded => path.startsWith(excluded));
};

// دالة لتحديد مصدر الزيارة
const getReferrerSource = (referrer: string): string => {
  if (!referrer) return 'مباشر';
  
  const url = referrer.toLowerCase();
  
  if (url.includes('google')) return 'جوجل';
  if (url.includes('facebook') || url.includes('fb.')) return 'فيسبوك';
  if (url.includes('snapchat')) return 'سناب شات';
  if (url.includes('instagram')) return 'انستجرام';
  if (url.includes('twitter') || url.includes('x.com')) return 'تويتر / X';
  if (url.includes('tiktok')) return 'تيك توك';
  if (url.includes('youtube')) return 'يوتيوب';
  if (url.includes('whatsapp')) return 'واتساب';
  if (url.includes('telegram')) return 'تيليجرام';
  if (url.includes('linkedin')) return 'لينكد إن';
  if (url.includes('pinterest')) return 'بينترست';
  if (url.includes('reddit')) return 'ريديت';
  
  // إذا كان من موقع آخر، نأخذ اسم النطاق
  try {
    const domain = new URL(referrer).hostname.replace('www.', '');
    return domain;
  } catch {
    return 'مصدر آخر';
  }
};

export const useVisitorTracking = (pagePath = window.location.pathname) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const latestPathRef = useRef(pagePath);

  const trackPresence = useCallback(async (path: string) => {
    const channel = channelRef.current;
    if (!channel) return;

    if (!isCustomerPath(path)) {
      await channel.untrack();
      return;
    }

    await channel.track({
      online_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      page: path,
      application_id: localStorage.getItem('applicationId') || undefined,
      ip_address: localStorage.getItem('visitor_ip') || undefined,
      landing_domain: getLandingDomain(),
    });
  }, []);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    const channel = supabase.channel('online-visitors', {
      config: { presence: { key: visitorId } },
    });

    channelRef.current = channel;

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void trackPresence(latestPathRef.current);
      }
    });

    const interval = setInterval(() => {
      void trackPresence(latestPathRef.current);
    }, 10000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [trackPresence]);

  useEffect(() => {
    const trackVisit = async () => {
      if (!isCustomerPath(pagePath)) {
        void trackPresence(pagePath);
        return;
      }

      try {
        const visitorId = getOrCreateVisitorId();
        const landingDomain = getLandingDomain();
        const referrer = document.referrer;
        const referrerSource = getReferrerSource(referrer);
        const userAgent = navigator.userAgent;

        // جلب IP من الـ edge function
        let ipAddress = localStorage.getItem('visitor_ip') || null;
        
        if (!ipAddress) {
          try {
            const { data: ipData } = await supabase.functions.invoke('get-visitor-ip');
            if (ipData?.ip) {
              ipAddress = ipData.ip;
              localStorage.setItem('visitor_ip', ipAddress);
            }
          } catch (ipError) {
            console.error('Error fetching IP:', ipError);
          }
        }

        const { error } = await supabase
          .from('page_views')
          .insert({
            visitor_id: visitorId,
            page_path: pagePath,
            referrer: referrer || null,
            referrer_source: referrerSource,
            user_agent: userAgent,
            ip_address: ipAddress,
            landing_domain: landingDomain,
          });

        if (error) {
          console.error('Error tracking visit:', error);
        } else {
          console.log('Visit tracked successfully');
        }

        await trackPresence(pagePath);
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    latestPathRef.current = pagePath;
    trackVisit();
  }, [pagePath, trackPresence]);
};