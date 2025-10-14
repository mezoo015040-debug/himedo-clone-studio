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
  regularPrice: string;
  salePrice: string;
  logo: string;
  discount?: string;
}
const InsuranceSelection = () => {
  const navigate = useNavigate();
  const [insuranceType, setInsuranceType] = useState<"comprehensive" | "third-party" | null>(null);

  // شركات التأمين - ضد الغير
  const thirdPartyCompanies: InsuranceCompany[] = [{
    id: 1,
    name: "شركة إتحاد الخليج الاهلية للتأمين التعاوني - تأمين ضد الغير",
    regularPrice: "1,707.90",
    salePrice: "853.95",
    logo: "https://static.wixstatic.com/media/a4d98c_9873f910cc224608b9d1b0007837a6a5~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9873f910cc224608b9d1b0007837a6a5~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات"
  }, {
    id: 2,
    name: "شركة المجموعة المتحدة للتأمين التعاوني - تأمين ضد الغير",
    regularPrice: "966.00",
    salePrice: "483.00",
    logo: "https://static.wixstatic.com/media/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_6b75cf96336d45d695451575f3ef2085~mv2.png"
  }, {
    id: 3,
    name: "شركة الاتحاد للتأمين التعاوني - تأمين على المركبات ضد الغير",
    regularPrice: "822.30",
    salePrice: "411.15",
    logo: "https://static.wixstatic.com/media/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_dd5f9c85126a4f30a98387a634f532e0~mv2.png"
  }, {
    id: 4,
    name: "شركة التأمين العربية التعاونية - تأمين على المركبات ضد الغير",
    regularPrice: "1,184.00",
    salePrice: "592.00",
    logo: "https://static.wixstatic.com/media/a4d98c_1e0c38a4a61348bcacf9a0bdf1c51479~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_1e0c38a4a61348bcacf9a0bdf1c51479~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات"
  }, {
    id: 5,
    name: "شركة الجزيرة تكافل تعاوني - تأمين على المركبات ضد الغير",
    regularPrice: "1,614.00",
    salePrice: "807.00",
    logo: "https://static.wixstatic.com/media/a4d98c_8976d5e542994c5499cec8fc13c0a246~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_8976d5e542994c5499cec8fc13c0a246~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات"
  }, {
    id: 6,
    name: "شركة المتوسط والخليج للتأمين وإعادة التأمين التعاوني (ميدغلف)",
    regularPrice: "1,382.00",
    salePrice: "691.00",
    logo: "https://static.wixstatic.com/media/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_9c1dfedac34147069c29fb21657bcb6a~mv2.png",
    discount: "خصم 20% لعدم وجود مطالبات"
  }, {
    id: 7,
    name: "تأمين على المركبات ضد الغير – من الراجحي تكافل",
    regularPrice: "796.00",
    salePrice: "398.00",
    logo: "https://static.wixstatic.com/media/a4d98c_d4e7dc60346e4e81a1f3aeda42ef6896~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_d4e7dc60346e4e81a1f3aeda42ef6896~mv2.png"
  }, {
    id: 8,
    name: "شركة التعاونية للتأمين التعاوني - يغطي إصلاح مركبتك",
    regularPrice: "1,176.00",
    salePrice: "588.00",
    logo: "https://static.wixstatic.com/media/a4d98c_450384b2f0ee4a8aa21117e019e113fd~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_450384b2f0ee4a8aa21117e019e113fd~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات"
  }, {
    id: 9,
    name: "شركة التعاونية للتأمين التعاوني - تأمين ضد الغير",
    regularPrice: "829.15",
    salePrice: "414.58",
    logo: "https://static.wixstatic.com/media/a4d98c_e2b99711c7d24cae95feab8bd606b23a~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_e2b99711c7d24cae95feab8bd606b23a~mv2.png",
    discount: "خصم 10% لعدم وجود مطالبات"
  }, {
    id: 10,
    name: "تأمين المركبات وافي سمارت – الراجحي تكافل - يغطي إصلاح مركبتك",
    regularPrice: "1,471.00",
    salePrice: "735.50",
    logo: "https://static.wixstatic.com/media/a4d98c_99b70bfb782c45fc869bc94e2a4b21f3~mv2.png/v1/fill/w_223,h_125,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/a4d98c_99b70bfb782c45fc869bc94e2a4b21f3~mv2.png",
    discount: "خصم 30% لعدم وجود مطالبات"
  }];

  // شركات التأمين - شامل
  const comprehensiveCompanies: InsuranceCompany[] = [{
    id: 11,
    name: "شركة بروج للتأمين التعاوني - التأمين الشامل على المركبات",
    regularPrice: "2,051.00",
    salePrice: "1,025.50",
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
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => {
                // يمكن إضافة التنقل إلى صفحة الشراء هنا
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