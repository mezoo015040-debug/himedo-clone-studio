import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceData {
  application_id: string;
  online_at: string;
  current_page: string;
  full_name?: string;
  phone?: string;
}

interface PresenceState {
  [key: string]: Array<{
    presence_ref: string;
  } & PresenceData>;
}

export interface OnlineUser {
  applicationId: string;
  currentPage: string;
  onlineAt: string;
  fullName?: string;
  phone?: string;
}

export const usePresence = (applicationId?: string, currentPage?: string, userData?: { fullName?: string; phone?: string }) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());

  const updatePresence = useCallback(async (newPage: string) => {
    if (channel && applicationId) {
      await channel.track({
        application_id: applicationId,
        online_at: new Date().toISOString(),
        current_page: newPage,
        full_name: userData?.fullName,
        phone: userData?.phone,
      });
    }
  }, [channel, applicationId, userData]);

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
        const online = new Map<string, OnlineUser>();
        
        Object.values(state).forEach(presences => {
          presences.forEach(presence => {
            if (presence.application_id) {
              online.set(presence.application_id, {
                applicationId: presence.application_id,
                currentPage: presence.current_page || 'غير معروف',
                onlineAt: presence.online_at,
                fullName: presence.full_name,
                phone: presence.phone,
              });
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
            current_page: currentPage || 'الرئيسية',
            full_name: userData?.fullName,
            phone: userData?.phone,
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [applicationId]);

  // Update presence when page changes
  useEffect(() => {
    if (channel && applicationId && currentPage) {
      updatePresence(currentPage);
    }
  }, [currentPage, channel, applicationId, updatePresence]);

  return { onlineUsers, channel, updatePresence };
};
