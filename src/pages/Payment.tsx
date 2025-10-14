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
  const { toast } = useToast();
  
  const companyName = searchParams.get("company") || "شركة التأمين";
  const price = searchParams.get("price") || "0";
  
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
    
    if ((firstTwo >= 51 && firstTwo <= 55) || (firstFour >= 2221 && firstFour <= 2720)) {
      return "mastercard";
    }
    
    return "unknown";
  };

  const cardType = getCardType(formData.cardNumber);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
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
    
    // هنا يمكن إضافة منطق الدفع الفعلي
    toast({
      title: "تم الدفع بنجاح",
      description: "شكراً لك! سيتم التواصل معك قريباً",
    });
    
    // التوجيه إلى صفحة النجاح أو الرئيسية
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              الدفع بالبطاقات البنكية
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <p className="text-sm">جميع المعاملات آمنة ومشفرة</p>
            </div>
          </div>

          {/* ملخص الطلب */}
          <Card className="p-6 mb-6 bg-muted/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">الشركة:</span>
              <span className="font-medium">{companyName}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-bold">المبلغ الإجمالي:</span>
              <span className="text-2xl font-bold text-primary">{price}﷼</span>
            </div>
          </Card>

          {/* نموذج الدفع */}
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* اسم حامل البطاقة */}
              <div className="space-y-2">
                <Label htmlFor="cardholderName">
                  اسم حامل البطاقة <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  placeholder="الاسم كما هو مكتوب على البطاقة"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  required
                  className="text-right"
                />
              </div>

              {/* رقم البطاقة */}
              <div className="space-y-2">
                <Label htmlFor="cardNumber">
                  رقم البطاقة <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    className="pr-16"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {cardType === "visa" ? (
                      <div className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                        VISA
                      </div>
                    ) : cardType === "mastercard" ? (
                      <div className="flex items-center gap-0.5">
                        <div className="w-6 h-6 rounded-full bg-red-500 opacity-80" />
                        <div className="w-6 h-6 rounded-full bg-orange-500 opacity-80 -ml-3" />
                      </div>
                    ) : (
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* تاريخ الانتهاء و CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    تاريخ الانتهاء <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      name="expiryMonth"
                      type="text"
                      inputMode="numeric"
                      placeholder="MM"
                      value={formData.expiryMonth}
                      onChange={handleInputChange}
                      maxLength={2}
                      required
                      className="text-center"
                    />
                    <span className="flex items-center">/</span>
                    <Input
                      name="expiryYear"
                      type="text"
                      inputMode="numeric"
                      placeholder="YY"
                      value={formData.expiryYear}
                      onChange={handleInputChange}
                      maxLength={2}
                      required
                      className="text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">
                    رمز الأمان (CVV) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    maxLength={4}
                    required
                    className="text-center"
                  />
                </div>
              </div>

              {/* أزرار التحكم */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  ادفع الآن
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </div>

              {/* ملاحظة أمان */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>معلوماتك محمية بتشفير SSL 256-bit</p>
              </div>
            </form>
          </Card>

          {/* شعارات بطاقات الدفع */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">نقبل جميع البطاقات الرئيسية</p>
            <div className="flex justify-center gap-4 items-center opacity-70">
              <span className="text-2xl">💳</span>
              <span className="text-2xl">🏦</span>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>
  );
};

export default Payment;
