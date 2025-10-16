import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

// دالة للحصول على أو إنشاء visitor ID
const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  
  return visitorId;
};

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisit = async () => {
      try {
        const visitorId = getOrCreateVisitorId();
        const referrer = document.referrer;
        const referrerSource = getReferrerSource(referrer);
        const pagePath = window.location.pathname;
        const userAgent = navigator.userAgent;

        const { error } = await supabase
          .from('page_views')
          .insert({
            visitor_id: visitorId,
            page_path: pagePath,
            referrer: referrer || null,
            referrer_source: referrerSource,
            user_agent: userAgent,
          });

        if (error) {
          console.error('Error tracking visit:', error);
        } else {
          console.log('Visit tracked successfully');
        }
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    trackVisit();
  }, []);
};
