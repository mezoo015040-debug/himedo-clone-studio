import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
export const QuoteForm = () => {
  const [insuranceType, setInsuranceType] = useState<"new" | "transfer">("new");
  const [documentType, setDocumentType] = useState<"customs" | "registration">("registration");
  const [birthDate, setBirthDate] = useState<Date>();
  const [idNumber, setIdNumber] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const { toast } = useToast();
  
  // للتقويم
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    { value: "0", label: "يناير" },
    { value: "1", label: "فبراير" },
    { value: "2", label: "مارس" },
    { value: "3", label: "أبريل" },
    { value: "4", label: "مايو" },
    { value: "5", label: "يونيو" },
    { value: "6", label: "يوليو" },
    { value: "7", label: "أغسطس" },
    { value: "8", label: "سبتمبر" },
    { value: "9", label: "أكتوبر" },
    { value: "10", label: "نوفمبر" },
    { value: "11", label: "ديسمبر" },
  ];
  
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    birthDate || new Date(1990, 0, 1)
  );

  const handleSubmit = () => {
    // التحقق من جميع الحقول
    if (!idNumber.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهوية / الإقامة",
        variant: "destructive",
      });
      return;
    }
    
    if (!ownerName.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم مالك الوثيقة",
        variant: "destructive",
      });
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف",
        variant: "destructive",
      });
      return;
    }
    
    if (!birthDate) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تاريخ الميلاد",
        variant: "destructive",
      });
      return;
    }
    
    if (serialNumber.length !== 9) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الرقم التسلسلي كاملاً (9 أرقام)",
        variant: "destructive",
      });
      return;
    }
    
    // إذا كانت جميع البيانات صحيحة
    toast({
      title: "تم بنجاح",
      description: "جاري الانتقال إلى الصفحة التالية...",
    });
    // هنا يمكن إضافة كود الانتقال إلى الصفحة التالية
  };
  return <section className="pt-8 pb-16 px-4 md:px-6 bg-background">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 shadow-glow">
          {/* Insurance Type Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button variant={insuranceType === "new" ? "default" : "outline"} size="lg" onClick={() => setInsuranceType("new")} className="w-full">
              تأمين جديد
            </Button>
            <Button variant={insuranceType === "transfer" ? "default" : "outline"} size="lg" onClick={() => setInsuranceType("transfer")} className="w-full">
              نقل ملكية
            </Button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* ID/Iqama Number */}
            <div className="space-y-2">
              <Input 
                type="text" 
                placeholder="رقم الهوية / الإقامة الخاص بك" 
                className="w-full text-right"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Input 
                type="text" 
                placeholder="اسم مالك الوثيقة كاملاً" 
                className="w-full text-right"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Input 
                type="tel" 
                placeholder="رقم الهاتف 5xxxxxxxxxx" 
                className="w-full text-right" 
                dir="ltr"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between text-right font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    {birthDate ? (
                      format(birthDate, "PPP", { locale: ar })
                    ) : (
                      <span>تاريخ الميلاد</span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <div className="flex gap-2 p-3 border-b">
                    <Select
                      value={calendarMonth.getMonth().toString()}
                      onValueChange={(value) => {
                        const newDate = new Date(calendarMonth);
                        newDate.setMonth(parseInt(value));
                        setCalendarMonth(newDate);
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={calendarMonth.getFullYear().toString()}
                      onValueChange={(value) => {
                        const newDate = new Date(calendarMonth);
                        newDate.setFullYear(parseInt(value));
                        setCalendarMonth(newDate);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Document Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button variant={documentType === "customs" ? "outline" : "default"} size="lg" onClick={() => setDocumentType("registration")} className="w-full">
                استمارة
              </Button>
              <Button variant={documentType === "customs" ? "default" : "outline"} size="lg" onClick={() => setDocumentType("customs")} className="w-full">
                بطاقة جمركية
              </Button>
            </div>

            {/* Serial Number / Customs Card */}
            <div className="space-y-2">
              <Label className="text-right block">الرقم التسلسلي / بطاقة جمركية</Label>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={9} value={serialNumber} onChange={setSerialNumber}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                    <InputOTPSlot index={6} />
                    <InputOTPSlot index={7} />
                    <InputOTPSlot index={8} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              
            </div>

            {/* Submit Button */}
            <Button 
              size="lg" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSubmit}
            >
              التالي
            </Button>

            {/* Disclaimer Text */}
            <p className="text-center text-sm text-muted-foreground leading-relaxed">
              أوافق على منح شركة عناية الوسيط الحق في الاستعلام من شركة نجم
              و/أو مركز المعلومات الوطني عن بياناتي
            </p>
          </div>
        </Card>
      </div>
    </section>;
};