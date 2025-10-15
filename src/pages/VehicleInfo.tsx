import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";

const VehicleInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [usagePurpose, setUsagePurpose] = useState("");
  const [policyStartDate, setPolicyStartDate] = useState<Date>();
  const [addDriver, setAddDriver] = useState<"yes" | "no" | null>(null);
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleValue, setVehicleValue] = useState("");

  // Send data to Formspree in real-time
  useFormspreeSync({
    usagePurpose,
    policyStartDate: policyStartDate ? format(policyStartDate, "PPP", { locale: ar }) : "",
    addDriver,
    vehicleType,
    vehicleValue
  }, "صفحة بيانات المركبة - Vehicle Info");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
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
    policyStartDate || new Date()
  );

  const handleSubmit = () => {
    if (!usagePurpose.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الغرض من الاستخدام",
        variant: "destructive",
      });
      return;
    }

    if (!vehicleType.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع السيارة",
        variant: "destructive",
      });
      return;
    }

    if (!vehicleValue.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال القيمة التقديرية للسيارة",
        variant: "destructive",
      });
      return;
    }

    if (!policyStartDate) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تاريخ بداية الوثيقة",
        variant: "destructive",
      });
      return;
    }

    if (addDriver === null) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار إضافة سائق",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    // محاكاة البحث عن العروض
    setTimeout(() => {
      setIsLoading(false);
      navigate("/insurance-selection");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Loading Animation */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center mb-8 space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <h2 className="text-2xl font-bold text-center">
                جاري البحث عن عروض الأسعار في شركات التأمين بناءً على معلومات سيارتك
              </h2>
            </div>
          )}

          {!isLoading && (
            <Card className="p-8 shadow-glow">
              <h2 className="text-2xl font-bold text-center mb-8">
                تأمين مركبات - معلومات المركبة
              </h2>

              <div className="space-y-6">
                {/* Usage Purpose */}
                <div className="space-y-2">
                  <Label className="text-right block">الغرض من الإستخدام</Label>
                  <Select value={usagePurpose} onValueChange={setUsagePurpose}>
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="اختر الغرض من الاستخدام" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">شخصي</SelectItem>
                      <SelectItem value="rental">تأجير</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                      <SelectItem value="cargo">نقل بضائع</SelectItem>
                      <SelectItem value="waste">نقل نفايات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-2">
                  <Label className="text-right block">نوع السيارة</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="اختر نوع السيارة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">سيدان</SelectItem>
                      <SelectItem value="suv">دفع رباعي</SelectItem>
                      <SelectItem value="pickup">بيك أب</SelectItem>
                      <SelectItem value="van">فان</SelectItem>
                      <SelectItem value="truck">شاحنة</SelectItem>
                      <SelectItem value="bus">حافلة</SelectItem>
                      <SelectItem value="motorcycle">دراجة نارية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Value */}
                <div className="space-y-2">
                  <Label className="text-right block">القيمة التقديرية للسيارة</Label>
                  <Input
                    type="number"
                    placeholder="أدخل القيمة التقديرية"
                    value={vehicleValue}
                    onChange={(e) => setVehicleValue(e.target.value)}
                    className="text-right"
                  />
                </div>

                {/* Policy Start Date */}
                <div className="space-y-2">
                  <Label className="text-right block">تاريخ بداية الوثيقة</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-right font-normal",
                          !policyStartDate && "text-muted-foreground"
                        )}
                      >
                        {policyStartDate ? (
                          format(policyStartDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
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
                        selected={policyStartDate}
                        onSelect={setPolicyStartDate}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Add Driver */}
                <div className="space-y-2">
                  <Label className="text-right block">إضافة سائق*</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={addDriver === "yes" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setAddDriver("yes")}
                      className="w-full"
                    >
                      نعم
                    </Button>
                    <Button
                      variant={addDriver === "no" ? "default" : "outline"}
                      size="lg"
                      onClick={() => setAddDriver("no")}
                      className="w-full"
                    >
                      لا
                    </Button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/")}
                    className="w-full"
                  >
                    السابق
                  </Button>
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleSubmit}
                  >
                    تقديم
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>
  );
};

export default VehicleInfo;
