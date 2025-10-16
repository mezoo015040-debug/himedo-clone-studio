import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceState {
  [key: string]: Array<{
    presence_ref: string;
    application_id: string;
    online_at: string;
  }>;
}

export const usePresence = (applicationId?: string) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const presenceChannel = supabase.channel('online-customers', {
      config: {
        presence: {
          key: applicationId || 'dashboard'
        }
      }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState() as PresenceState;
        const online = new Set<string>();
        
        Object.values(state).forEach(presences => {
          presences.forEach(presence => {
            if (presence.application_id) {
              online.add(presence.application_id);
            }
          });
        });
        
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && applicationId) {
          await presenceChannel.track({
            application_id: applicationId,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [applicationId]);

  return { onlineUsers, channel };
};
