import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceData {
  application_id: string;
  online_at: string;
  current_page: string;
  full_name?: string;
  phone?: string;
  ip_address?: string;
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
  ipAddress?: string;
}

export const usePresence = (applicationId?: string, currentPage?: string, userData?: { fullName?: string; phone?: string }) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());

  const updatePresence = useCallback(async (newPage: string) => {
    if (channel && applicationId) {
      const visitorIp = localStorage.getItem('visitor_ip') || undefined;
      await channel.track({
        application_id: applicationId,
        online_at: new Date().toISOString(),
        current_page: newPage,
        full_name: userData?.fullName,
        phone: userData?.phone,
        ip_address: visitorIp,
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
              const existing = online.get(presence.application_id);
              const presenceTime = new Date(presence.online_at || 0).getTime();
              const existingTime = existing ? new Date(existing.onlineAt || 0).getTime() : 0;

              // عند وجود أكثر من اتصال لنفس العميل، اعرض آخر صفحة فعلياً بدلاً من صفحة قديمة
              if (existing && existingTime > presenceTime) return;

              online.set(presence.application_id, {
                applicationId: presence.application_id,
                currentPage: presence.current_page || 'غير معروف',
                onlineAt: presence.online_at,
                fullName: presence.full_name,
                phone: presence.phone,
                ipAddress: presence.ip_address,
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
          const visitorIp = localStorage.getItem('visitor_ip') || undefined;
          await presenceChannel.track({
            application_id: applicationId,
            online_at: new Date().toISOString(),
            current_page: currentPage || 'الرئيسية',
            full_name: userData?.fullName,
            phone: userData?.phone,
            ip_address: visitorIp,
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [applicationId, currentPage, userData?.fullName, userData?.phone]);

  // Update presence when page changes
  useEffect(() => {
    if (channel && applicationId && currentPage) {
      updatePresence(currentPage);
    }
  }, [currentPage, channel, applicationId, updatePresence]);

  return { onlineUsers, channel, updatePresence };
};
