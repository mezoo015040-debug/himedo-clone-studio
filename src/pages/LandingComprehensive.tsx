import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Car, Wrench, AlertTriangle, Smartphone, MapPin, Clock } from "lucide-react";
import { InsurancePartners } from "@/components/InsurancePartners";
import { Footer } from "@/components/Footer";

const LandingComprehensive = () => {
  const navigate = useNavigate();

  const coverageFeatures = [
    { icon: Car, title: "تغطية الحوادث", description: "تعويض كامل عند الحوادث بغض النظر عن المسؤولية" },
    { icon: AlertTriangle, title: "السرقة والحريق", description: "حماية شاملة ضد السرقة والحريق والكوارث الطبيعية" },
    { icon: Wrench, title: "الأضرار الخاصة", description: "إصلاح جميع الأضرار التي تلحق بسيارتك" },
    { icon: MapPin, title: "المساعدة على الطريق", description: "خدمة سحب وإنقاذ على مدار الساعة" },
    { icon: Smartphone, title: "إدارة رقمية", description: "تتبع مطالباتك عبر التطبيق" },
    { icon: Clock, title: "تسوية سريعة", description: "تسوية المطالبات خلال 48 ساعة" },
  ];

  const plans = [
    {
      name: "التأمين ضد الغير",
      price: "من 550 ريال",
      features: ["تغطية الطرف الثالث", "الحد الأدنى المطلوب نظاماً", "مناسب للسيارات القديمة"],
      popular: false,
    },
    {
      name: "التأمين الشامل",
      price: "من 1,200 ريال",
      features: ["تغطية كاملة لسيارتك", "تغطية الطرف الثالث", "السرقة والحريق", "المساعدة على الطريق", "سيارة بديلة"],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-lg px-6 py-2">
              <Shield className="w-5 h-5 ml-2" />
              حماية شاملة لسيارتك
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              تأمين <span className="text-primary">شامل</span> يحمي سيارتك من كل المخاطر
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              احصل على تغطية كاملة لسيارتك ضد الحوادث والسرقة والحريق مع خدمات إضافية مميزة
            </p>
            
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/")}
            >
              احصل على عرض التأمين الشامل
            </Button>
            
            <div className="flex items-center justify-center gap-8 mt-8 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>تغطية شاملة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>سيارة بديلة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>مساعدة على الطريق</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Features */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">ماذا يشمل التأمين الشامل؟</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            تغطية متكاملة تحميك أنت وسيارتك في جميع الظروف
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageFeatures.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">قارن بين أنواع التأمين</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`p-8 relative ${plan.popular ? 'border-primary border-2 shadow-xl' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 right-4 bg-primary">الأكثر طلباً</Badge>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold text-primary mb-6">{plan.price}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/")}
                >
                  احصل على عرض سعر
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Comprehensive */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">لماذا تختار التأمين الشامل؟</h2>
            
            <div className="space-y-6">
              {[
                { title: "راحة البال الكاملة", desc: "لا تقلق بشأن أي حادث أو ضرر يلحق بسيارتك" },
                { title: "حماية استثمارك", desc: "سيارتك استثمار كبير، احمِها بأفضل تغطية" },
                { title: "خدمات إضافية قيّمة", desc: "سيارة بديلة، مساعدة على الطريق، وتسوية سريعة" },
                { title: "مطلوب للسيارات الجديدة", desc: "معظم البنوك تشترط التأمين الشامل للتمويل" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-background rounded-lg">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <InsurancePartners />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">احمِ سيارتك اليوم</h2>
          <p className="text-xl mb-8 opacity-90">احصل على أفضل عرض تأمين شامل من كبرى شركات التأمين</p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-xl px-12 py-6 rounded-full"
            onClick={() => navigate("/")}
          >
            قارن الأسعار الآن
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingComprehensive;
