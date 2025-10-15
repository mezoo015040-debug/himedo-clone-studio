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
    <div className="min-h-screen bg-background">
      <section className="pt-16 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-lg">
          {/* Logo/Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-8">
              <Shield className="h-16 w-16 text-primary" />
            </div>
          </div>

          {/* Main Card */}
          <Card className="p-8 md:p-10 shadow-sm border">
            <div className="space-y-8">
              {/* Title */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Enter verification code
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  we sent you a verification code by text message to (966) xxx-xx12. you have 6 attempts.
                </p>
              </div>

              {/* Arabic Title */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-foreground">
                  ادخل الكود المرسل الى رقم الهاتف
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  برسالة نصية مكونة من 6 أرقام
                </p>
              </div>

              {/* Label */}
              <div className="text-center">
                <label className="text-sm font-medium text-foreground">
                  Verification code
                </label>
              </div>

              {/* OTP Input */}
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
                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border-2 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                ))}
              </div>

              {/* Resend Code Link */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    className="text-primary hover:underline font-medium text-sm uppercase tracking-wide"
                  >
                    RESEND CODE
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    يمكنك إعادة إرسال الرمز بعد{" "}
                    <span className="font-mono font-bold text-foreground">
                      {formatTime(timer)}
                    </span>
                  </p>
                )}
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleVerify}
                disabled={isVerifying || otp.join("").length !== 6}
                size="lg"
                className="w-full h-12 text-base font-semibold uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90"
              >
                {isVerifying ? (
                  <>
                    <div className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    جاري التحقق...
                  </>
                ) : (
                  "CONTINUE"
                )}
              </Button>
            </div>
          </Card>

          {/* Amount Info - Compact */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">المبلغ المراد دفعه</p>
            <p className="text-2xl font-bold text-foreground">{price} ﷼</p>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>
  );
};

export default OTPVerification;
