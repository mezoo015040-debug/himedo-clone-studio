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
  ipAddress?: string;
}

export const useRealtimePresence = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineVisitors, setOnlineVisitors] = useState<OnlineVisitor[]>([]);
  const [visitorsFromVisitorChannel, setVisitorsFromVisitorChannel] = useState<OnlineVisitor[]>([]);
  const [visitorsFromCustomerChannel, setVisitorsFromCustomerChannel] = useState<OnlineVisitor[]>([]);

  const getLatestPresence = (presences: any[]) => {
    return [...presences].sort((a, b) => {
      const bTime = new Date(b.last_activity || b.online_at || 0).getTime();
      const aTime = new Date(a.last_activity || a.online_at || 0).getTime();
      return bTime - aTime;
    })[0];
  };

  const parseVisitorPresence = useCallback((state: Record<string, any[]>): OnlineVisitor[] => {
    const visitors: OnlineVisitor[] = [];
    Object.entries(state).forEach(([key, presences]) => {
      if (presences && presences.length > 0) {
        const presence = getLatestPresence(presences);
        visitors.push({
          visitorId: key,
          currentPage: presence.page || '/',
          onlineAt: presence.online_at || new Date().toISOString(),
          lastActivity: presence.last_activity || presence.online_at || new Date().toISOString(),
          applicationId: presence.application_id,
          fullName: presence.full_name,
          phone: presence.phone,
          ipAddress: presence.ip_address,
        });
      }
    });
    return visitors;
  }, []);

  const parseCustomerPresence = useCallback((state: Record<string, any[]>): OnlineVisitor[] => {
    const visitors: OnlineVisitor[] = [];
    Object.entries(state).forEach(([key, presences]) => {
      if (presences && presences.length > 0) {
        const presence = getLatestPresence(presences);
        // Skip dashboard users from the customer channel
        if (key === 'dashboard') return;
        visitors.push({
          visitorId: key,
          currentPage: presence.current_page || '/',
          onlineAt: presence.online_at || new Date().toISOString(),
          lastActivity: presence.online_at || new Date().toISOString(),
          applicationId: presence.application_id,
          fullName: presence.full_name,
          phone: presence.phone,
          ipAddress: presence.ip_address,
        });
      }
    });
    return visitors;
  }, []);

  // Merge both channels, deduplicate by visitorId
  useEffect(() => {
    const merged = new Map<string, OnlineVisitor>();
    
    // Customer channel visitors take priority (have more info)
    visitorsFromCustomerChannel.forEach(v => merged.set(v.visitorId, v));
    visitorsFromVisitorChannel.forEach(v => {
      if (!merged.has(v.visitorId)) {
        merged.set(v.visitorId, v);
      }
    });

    const sorted = Array.from(merged.values()).sort((a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
    
    setOnlineVisitors(sorted);
    setOnlineCount(sorted.length);
  }, [visitorsFromVisitorChannel, visitorsFromCustomerChannel]);

  useEffect(() => {
    const visitorId = localStorage.getItem('visitor_id') || `visitor_${Date.now()}`;

    // Channel 1: online-visitors (dashboard/general tracking)
    const visitorChannel = supabase.channel('online-visitors', {
      config: { presence: { key: visitorId } },
    });

    visitorChannel
      .on('presence', { event: 'sync' }, () => {
        const state = visitorChannel.presenceState();
        setVisitorsFromVisitorChannel(parseVisitorPresence(state));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const visitorIp = localStorage.getItem('visitor_ip') || undefined;
          await visitorChannel.track({
            online_at: new Date().toISOString(),
            last_activity: new Date().toISOString(),
            page: window.location.pathname,
            ip_address: visitorIp,
          });
        }
      });

    // Channel 2: online-customers (customer-facing pages)
    const customerChannel = supabase.channel('online-customers', {
      config: { presence: { key: 'dashboard' } },
    });

    customerChannel
      .on('presence', { event: 'sync' }, () => {
        const state = customerChannel.presenceState();
        setVisitorsFromCustomerChannel(parseCustomerPresence(state));
      })
      .subscribe();

    const handleLocationChange = async () => {
      const visitorIp = localStorage.getItem('visitor_ip') || undefined;
      await visitorChannel.track({
        online_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        page: window.location.pathname,
        ip_address: visitorIp,
      });
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      visitorChannel.unsubscribe();
      customerChannel.unsubscribe();
    };
  }, [parseVisitorPresence, parseCustomerPresence]);

  return { onlineCount, onlineVisitors };
};
