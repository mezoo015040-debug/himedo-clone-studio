import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const QuoteForm = () => {
  const [insuranceType, setInsuranceType] = useState<"new" | "transfer">("new");
  const [documentType, setDocumentType] = useState<"customs" | "registration">("registration");

  return (
    <section className="pt-8 pb-16 px-4 md:px-6 bg-background">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 shadow-glow">
          {/* Insurance Type Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={insuranceType === "new" ? "default" : "outline"}
              size="lg"
              onClick={() => setInsuranceType("new")}
              className="w-full"
            >
              تأمين جديد
            </Button>
            <Button
              variant={insuranceType === "transfer" ? "default" : "outline"}
              size="lg"
              onClick={() => setInsuranceType("transfer")}
              className="w-full"
            >
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
              />
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="اسم مالك الوثيقة كاملاً"
                className="w-full text-right"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="رقم الهاتف 5xxxxxxxxxx"
                className="w-full text-right"
                dir="ltr"
              />
            </div>

            {/* Document Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={documentType === "customs" ? "outline" : "default"}
                size="lg"
                onClick={() => setDocumentType("registration")}
                className="w-full"
              >
                استمارة
              </Button>
              <Button
                variant={documentType === "customs" ? "default" : "outline"}
                size="lg"
                onClick={() => setDocumentType("customs")}
                className="w-full"
              >
                بطاقة جمركية
              </Button>
            </div>

            {/* Serial Number / Customs Card */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-accent/20 rounded-md p-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground text-sm">ℹ️</span>
                </div>
                <Input
                  type="text"
                  placeholder="الرقم التسلسلي / بطاقة جمركية"
                  className="flex-1 text-right bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="رمز التحقق"
                  className="flex-1 text-right"
                />
                <div className="w-32 h-12 bg-accent/30 rounded-md flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary select-none">3701</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
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
    </section>
  );
};
