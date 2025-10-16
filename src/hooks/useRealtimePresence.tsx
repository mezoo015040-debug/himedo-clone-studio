import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimePresence = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const visitorId = localStorage.getItem('visitor_id') || `visitor_${Date.now()}`;
    
    const presenceChannel = supabase.channel('online-visitors', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(count);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            page: window.location.pathname,
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, []);

  return { onlineCount };
};
