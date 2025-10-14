import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2 } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";

interface InsuranceCompany {
  id: number;
  name: string;
  price: string;
  logo: string;
}

const InsuranceSelection = () => {
  const navigate = useNavigate();
  const [insuranceType, setInsuranceType] = useState<"comprehensive" | "third-party" | null>(null);

  // شركات التأمين - ضد الغير
  const thirdPartyCompanies: InsuranceCompany[] = [
    { id: 1, name: "شركة إتحاد الخليج الاهلية للتأمين التعاوني", price: "853.95 ريال", logo: "🛡️" },
    { id: 2, name: "شركة المجموعة المتحدة للتأمين التعاوني", price: "483.00 ريال", logo: "🛡️" },
    { id: 3, name: "شركة الاتحاد للتأمين التعاوني", price: "411.15 ريال", logo: "🛡️" },
    { id: 4, name: "شركة التأمين العربية التعاونية", price: "592.00 ريال", logo: "🛡️" },
    { id: 5, name: "شركة الجزيرة تكافل تعاوني", price: "807.00 ريال", logo: "🛡️" },
    { id: 6, name: "شركة المتوسط والخليج للتأمين (ميدغلف)", price: "691.00 ريال", logo: "🛡️" },
    { id: 7, name: "الراجحي تكافل", price: "398.00 ريال", logo: "🛡️" },
    { id: 8, name: "شركة التعاونية للتأمين التعاوني", price: "414.58 ريال", logo: "🛡️" },
    { id: 9, name: "تأمين وافي سمارت - الراجحي تكافل", price: "735.50 ريال", logo: "🛡️" },
  ];

  // شركات التأمين - شامل
  const comprehensiveCompanies: InsuranceCompany[] = [
    { id: 9, name: "شركة التأمين التاسعة", price: "2,450 ريال", logo: "🏆" },
    { id: 10, name: "شركة التأمين العاشرة", price: "2,575 ريال", logo: "🏆" },
    { id: 11, name: "شركة التأمين الحادية عشر", price: "2,690 ريال", logo: "🏆" },
    { id: 12, name: "شركة التأمين الثانية عشر", price: "2,810 ريال", logo: "🏆" },
    { id: 13, name: "شركة التأمين الثالثة عشر", price: "2,925 ريال", logo: "🏆" },
    { id: 14, name: "شركة التأمين الرابعة عشر", price: "3,040 ريال", logo: "🏆" },
    { id: 15, name: "شركة التأمين الخامسة عشر", price: "3,155 ريال", logo: "🏆" },
    { id: 16, name: "شركة التأمين السادسة عشر", price: "3,270 ريال", logo: "🏆" },
  ];

  const displayedCompanies = insuranceType === "comprehensive" 
    ? comprehensiveCompanies 
    : insuranceType === "third-party" 
    ? thirdPartyCompanies 
    : [...thirdPartyCompanies, ...comprehensiveCompanies];

  return (
    <div className="min-h-screen bg-background">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            اختر نوع التأمين
          </h2>

          {/* Insurance Type Selection */}
          <div className="flex justify-center gap-4 mb-12">
            <Button
              variant={insuranceType === "comprehensive" ? "default" : "outline"}
              size="lg"
              onClick={() => setInsuranceType("comprehensive")}
              className="text-lg px-8 py-6"
            >
              <Shield className="ml-2 h-5 w-5" />
              شامل
            </Button>
            <Button
              variant={insuranceType === "third-party" ? "default" : "outline"}
              size="lg"
              onClick={() => setInsuranceType("third-party")}
              className="text-lg px-8 py-6"
            >
              <Shield className="ml-2 h-5 w-5" />
              ضد الغير
            </Button>
          </div>

          {/* Additional Coverage Option */}
          <div className="flex justify-center mb-8">
            <Card className="p-4 inline-flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-medium">أعطال ميكانيكية</span>
            </Card>
          </div>

          {/* Insurance Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayedCompanies.map((company) => (
              <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-6xl">{company.logo}</div>
                  <h3 className="font-bold text-center">{company.name}</h3>
                  <p className="text-2xl font-bold text-primary">{company.price}</p>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      // يمكن إضافة التنقل إلى صفحة الشراء هنا
                    }}
                  >
                    إشتري الآن
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/vehicle-info")}
              className="px-12"
            >
              السابق
            </Button>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>
  );
};

export default InsuranceSelection;
