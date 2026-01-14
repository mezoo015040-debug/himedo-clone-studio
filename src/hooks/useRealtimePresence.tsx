import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface OnlineVisitor {
  visitorId: string;
  currentPage: string;
  onlineAt: string;
  lastActivity: string;
  applicationId?: string;
  fullName?: string;
  phone?: string;
}

export const useRealtimePresence = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineVisitors, setOnlineVisitors] = useState<OnlineVisitor[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const parsePresenceState = useCallback((state: Record<string, any[]>) => {
    const visitors: OnlineVisitor[] = [];
    
    Object.entries(state).forEach(([key, presences]) => {
      if (presences && presences.length > 0) {
        const presence = presences[0];
        visitors.push({
          visitorId: key,
          currentPage: presence.page || '/',
          onlineAt: presence.online_at || new Date().toISOString(),
          lastActivity: presence.last_activity || presence.online_at || new Date().toISOString(),
          applicationId: presence.application_id,
          fullName: presence.full_name,
          phone: presence.phone,
        });
      }
    });
    
    return visitors.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, []);

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
        setOnlineVisitors(parsePresenceState(state));
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
            last_activity: new Date().toISOString(),
            page: window.location.pathname,
          });
        }
      });

    setChannel(presenceChannel);

    // تحديث الصفحة عند التنقل
    const handleLocationChange = async () => {
      if (presenceChannel) {
        await presenceChannel.track({
          online_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          page: window.location.pathname,
        });
      }
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, [parsePresenceState]);

  return { onlineCount, onlineVisitors, channel };
};
