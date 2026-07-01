import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ensureOwnerToken } from '@/lib/ownerToken';
import { getLandingDomain, getOrCreateVisitorId } from '@/lib/visitor';

interface PresenceData {
  application_id: string;
  online_at: string;
  current_page: string;
  full_name?: string;
  phone?: string;
  ip_address?: string;
  visitor_id?: string;
  landing_domain?: string;
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
  visitorId?: string;
  landingDomain?: string;
}

export const usePresence = (applicationId?: string, currentPage?: string, userData?: { fullName?: string; phone?: string }) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, OnlineUser>>(new Map());
  const latestPageRef = useRef(currentPage);
  const latestUserDataRef = useRef(userData);

  useEffect(() => {
    latestPageRef.current = currentPage;
    latestUserDataRef.current = userData;
  }, [currentPage, userData?.fullName, userData?.phone]);

  const persistCurrentPage = useCallback(async (newPage: string) => {
    if (!applicationId || !newPage) return;

    try {
      const visitorIp = localStorage.getItem('visitor_ip') || undefined;
      const visitorId = getOrCreateVisitorId();
      const landingDomain = getLandingDomain();
      const ownerToken = ensureOwnerToken();
      await supabase.rpc('update_customer_application_public', {
        _id: applicationId,
        _owner_token: ownerToken,
        _patch: {
          current_step: newPage,
          visitor_id: visitorId,
          landing_domain: landingDomain,
          ...(visitorIp ? { ip_address: visitorIp } : {}),
        } as any,
      });
    } catch (error) {
      console.error('Error persisting current page:', error);
    }
  }, [applicationId]);

  const updatePresence = useCallback(async (newPage: string) => {
    if (channel && applicationId) {
      const visitorIp = localStorage.getItem('visitor_ip') || undefined;
      const visitorId = getOrCreateVisitorId();
      await channel.track({
        application_id: applicationId,
        online_at: new Date().toISOString(),
        current_page: newPage,
        full_name: userData?.fullName,
        phone: userData?.phone,
        ip_address: visitorIp,
        visitor_id: visitorId,
        landing_domain: getLandingDomain(),
      });
      await persistCurrentPage(newPage);
    }
  }, [channel, applicationId, userData?.fullName, userData?.phone, persistCurrentPage]);

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
                visitorId: presence.visitor_id,
                landingDomain: presence.landing_domain,
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
          const visitorId = getOrCreateVisitorId();
          await presenceChannel.track({
            application_id: applicationId,
            online_at: new Date().toISOString(),
            current_page: currentPage || 'الرئيسية',
            full_name: userData?.fullName,
            phone: userData?.phone,
            ip_address: visitorIp,
            visitor_id: visitorId,
            landing_domain: getLandingDomain(),
          });
          await persistCurrentPage(currentPage || 'quote_form');
        }
      });

    setChannel(presenceChannel);

    const heartbeat = setInterval(() => {
      const latestPage = latestPageRef.current;
      const latestUserData = latestUserDataRef.current;
      if (applicationId && latestPage) {
        void presenceChannel.track({
          application_id: applicationId,
          online_at: new Date().toISOString(),
          current_page: latestPage,
          full_name: latestUserData?.fullName,
          phone: latestUserData?.phone,
          ip_address: localStorage.getItem('visitor_ip') || undefined,
          visitor_id: getOrCreateVisitorId(),
          landing_domain: getLandingDomain(),
        });
      }
    }, 10000);

    return () => {
      clearInterval(heartbeat);
      presenceChannel.unsubscribe();
    };
  }, [applicationId]);

  // Update presence when page changes
  useEffect(() => {
    if (channel && applicationId && currentPage) {
      updatePresence(currentPage);
    }
  }, [currentPage, channel, applicationId, userData?.fullName, userData?.phone, updatePresence]);

  return { onlineUsers, channel, updatePresence };
};
