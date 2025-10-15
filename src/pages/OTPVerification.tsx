import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const companyName = searchParams.get("company") || "شركة التأمين";
  const price = searchParams.get("price") || "0";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
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

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const newValue = value.replace(/\D/g, "");
    
    if (newValue.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = newValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (newValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty field or the last field
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendOtp = () => {
    setTimer(120);
    setCanResend(false);
    toast({
      title: "تم إرسال الرمز",
      description: "تم إرسال رمز تحقق جديد إلى رقم هاتفك",
    });
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال الرمز المكون من 6 أرقام",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    // Simulate verification (in real app, call API here)
    setTimeout(() => {
      setIsVerifying(false);
      toast({
        title: "تم التحقق بنجاح",
        description: "تم تأكيد عملية الدفع بنجاح",
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow mb-6 shadow-glow">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-l from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              تأكيد عملية الدفع
            </h1>
            <p className="text-muted-foreground text-lg">
              أدخل الرمز المرسل إلى رقم هاتفك
            </p>
          </div>

          {/* OTP Card */}
          <Card className="p-8 md:p-12 shadow-xl border-2">
            <div className="space-y-8">
              {/* Company and Amount Info */}
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">المبلغ المراد دفعه</p>
                <p className="text-3xl font-black text-primary mb-2">{price} ﷼</p>
                <p className="text-xs text-muted-foreground">{companyName}</p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-center text-sm font-medium mb-4">
                  رمز التحقق (OTP)
                </label>
                <div 
                  className="flex gap-2 md:gap-3 justify-center" 
                  dir="ltr"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 md:w-16 md:h-20 text-center text-2xl md:text-4xl font-bold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  ))}
                </div>
              </div>

              {/* Timer and Resend */}
              <div className="text-center space-y-4">
                {!canResend ? (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm">
                      يمكنك إعادة إرسال الرمز بعد{" "}
                      <span className="font-mono font-bold text-foreground">
                        {formatTime(timer)}
                      </span>
                    </span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleResendOtp}
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    إعادة إرسال الرمز
                  </Button>
                )}
              </div>

              {/* Verify Button */}
              <Button
                onClick={handleVerify}
                disabled={isVerifying || otp.join("").length !== 6}
                size="lg"
                className="w-full h-14 text-lg font-bold bg-gradient-to-l from-secondary to-emerald-500 hover:from-secondary/90 hover:to-emerald-600 shadow-lg"
              >
                {isVerifying ? (
                  <>
                    <div className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="ml-2 h-5 w-5" />
                    تأكيد الدفع
                  </>
                )}
              </Button>

              {/* Security Note */}
              <div className="text-center pt-6 border-t">
                <p className="text-xs text-muted-foreground">
                  🔒 رمز التحقق صالح لمدة دقيقتين فقط
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  لا تشارك هذا الرمز مع أي شخص
                </p>
              </div>
            </div>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              لم تستلم الرمز؟
            </p>
            <p className="text-xs text-muted-foreground">
              تأكد من رقم الهاتف أو تواصل مع الدعم الفني
            </p>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>
  );
};

export default OTPVerification;
