import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Star, Gift, Moon, Sparkles, Percent } from "lucide-react";
import { InsurancePartners } from "@/components/InsurancePartners";
import { Footer } from "@/components/Footer";

const LandingRamadan = () => {
  const navigate = useNavigate();

  const offers = [
    {
      company: "أمانة للتأمين",
      discount: "50%",
      originalPrice: "998",
      newPrice: "499",
      type: "ضد الغير",
    },
    {
      company: "ملاذ للتأمين",
      discount: "40%",
      originalPrice: "1,165",
      newPrice: "699",
      type: "ضد الغير+",
    },
    {
      company: "ولاء للتأمين",
      discount: "35%",
      originalPrice: "2,752",
      newPrice: "1,789",
      type: "شامل",
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section - Ramadan Theme */}
      <section
        className="relative overflow-hidden py-16 lg:py-24"
        style={{
          background:
            "linear-gradient(135deg, hsl(260, 50%, 12%) 0%, hsl(270, 40%, 18%) 40%, hsl(35, 60%, 20%) 100%)",
        }}
      >
        {/* Decorative stars/sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 30%, hsl(45, 80%, 60%) 0%, transparent 40%), radial-gradient(circle at 85% 60%, hsl(270, 50%, 50%) 0%, transparent 40%), radial-gradient(circle at 50% 10%, hsl(45, 70%, 50%) 0%, transparent 30%)",
            }}
          />
          {/* Floating stars decoration */}
          <div className="absolute top-10 left-[10%] text-yellow-400/30 text-4xl animate-pulse">✦</div>
          <div className="absolute top-20 right-[15%] text-yellow-400/20 text-2xl animate-pulse" style={{ animationDelay: "0.5s" }}>✦</div>
          <div className="absolute bottom-20 left-[20%] text-yellow-400/25 text-3xl animate-pulse" style={{ animationDelay: "1s" }}>✦</div>
          <div className="absolute top-32 left-[50%] text-yellow-400/15 text-xl animate-pulse" style={{ animationDelay: "1.5s" }}>✦</div>
          <div className="absolute bottom-32 right-[25%] text-yellow-400/20 text-2xl animate-pulse" style={{ animationDelay: "0.8s" }}>✦</div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-5xl">🌙</span>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg px-6 py-2">
                <Moon className="w-5 h-5 ml-2" />
                عروض رمضان
              </Badge>
              <span className="text-5xl">✨</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              خصومات رمضانية تصل إلى{" "}
              <span className="text-yellow-400">50%</span>
              <br />
              على تأمين السيارات 🌙
            </h1>

            <p className="text-xl text-purple-100/80 mb-8 max-w-2xl mx-auto">
              بمناسبة شهر رمضان المبارك نقدم لكم أقوى العروض والخصومات على التأمين
              الشامل وضد الغير من أفضل الشركات
            </p>

            <Button
              size="lg"
              className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all font-bold"
              style={{
                background: "linear-gradient(135deg, hsl(45, 90%, 50%) 0%, hsl(35, 85%, 45%) 100%)",
                color: "hsl(260, 50%, 12%)",
              }}
              onClick={() => navigate("/")}
            >
              <Gift className="w-6 h-6 ml-2" />
              استفد من عروض رمضان
            </Button>

            <div className="flex items-center justify-center gap-8 mt-8 text-purple-100/70 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>عرض لفترة محدودة</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>خصم فوري</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>إصدار فوري</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🌙 عروض رمضان الحصرية
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              وفّر على تأمين سيارتك مع خصومات رمضان المميزة
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {offers.map((offer, index) => (
              <Card
                key={index}
                className="relative p-6 hover:shadow-xl transition-all border-2 hover:border-yellow-500/50 overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{
                    background: "linear-gradient(90deg, hsl(270, 50%, 50%), hsl(45, 90%, 50%))",
                  }}
                />
                <Badge className="mb-4 bg-red-500/10 text-red-500 border-red-500/20">
                  <Percent className="w-4 h-4 ml-1" />
                  خصم {offer.discount}
                </Badge>
                <h3 className="text-xl font-bold mb-2">{offer.company}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  تأمين {offer.type}
                </p>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {offer.newPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">ريال</span>
                  <span className="text-lg text-muted-foreground line-through">
                    {offer.originalPrice}
                  </span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  احصل على العرض
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ramadan Banner */}
      <section
        className="py-12"
        style={{
          background:
            "linear-gradient(135deg, hsl(260, 45%, 18%) 0%, hsl(270, 35%, 22%) 50%, hsl(35, 50%, 22%) 100%)",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              🌙 رمضان كريم… وتأمينك أكرم
            </h2>
            <p className="text-purple-100/80 text-lg mb-6">
              في شهر الخير والبركة نقدم لكم أفضل العروض على تأمين السيارات بأقل
              الأسعار وأعلى التغطيات
            </p>
            <div className="grid grid-cols-3 gap-6 text-white">
              <div>
                <div className="text-4xl font-bold text-yellow-400">+50,000</div>
                <p className="text-purple-100/70 mt-1">عميل</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">25+</div>
                <p className="text-purple-100/70 mt-1">شركة تأمين</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">50%</div>
                <p className="text-purple-100/70 mt-1">خصم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Types */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">أنواع التأمين المتاحة</h2>
            <p className="text-muted-foreground text-lg">
              خصومات رمضان تشمل جميع أنواع التأمين
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(270, 50%, 50%), hsl(45, 80%, 50%))" }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">تأمين ضد الغير</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                التأمين الإلزامي بأسعار رمضانية مميزة
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">من 249</span>
                <span className="text-muted-foreground">ريال</span>
              </div>
              <ul className="space-y-2 mb-6">
                {["تغطية الأضرار للغير", "إلزامي حسب نظام المرور", "تغطية تصل إلى 10 مليون ريال", "إصدار فوري"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => navigate("/")}>
                اطلب الآن
              </Button>
            </Card>

            <Card className="p-8 border-2 border-yellow-500/50 hover:border-yellow-500 transition-all hover:shadow-lg relative overflow-hidden">
              <div className="absolute -top-1 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, hsl(270, 50%, 50%), hsl(45, 90%, 50%))" }} />
              <Badge className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                <Sparkles className="w-3 h-3 ml-1" />
                الأكثر طلباً
              </Badge>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(45, 90%, 50%), hsl(35, 85%, 45%))" }}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">تأمين شامل</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                تغطية كاملة بخصم رمضاني حصري
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-primary">من 899</span>
                <span className="text-muted-foreground">ريال</span>
              </div>
              <ul className="space-y-2 mb-6">
                {["جميع مزايا ضد الغير", "تغطية الحوادث والسرقة والحريق", "خدمة المساعدة على الطريق", "سيارة بديلة", "تغطية الكوارث الطبيعية"].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(45, 90%, 50%), hsl(35, 85%, 45%))",
                  color: "hsl(260, 50%, 12%)",
                }}
                onClick={() => navigate("/")}
              >
                اطلب الآن
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            آراء عملائنا في رمضان
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "عبدالله القحطاني",
                review: "استفدت من عروض رمضان ووفرت 50% على التأمين الشامل!",
                rating: 5,
              },
              {
                name: "نورة السبيعي",
                review: "أسعار رمضانية ممتازة وإصدار فوري، شكراً تأميني",
                rating: 5,
              },
              {
                name: "خالد المطيري",
                review: "أفضل عرض رمضاني حصلت عليه على تأمين سيارتي",
                rating: 5,
              },
            ].map((review, index) => (
              <Card key={index} className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{review.review}"</p>
                <p className="font-semibold">{review.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <InsurancePartners />

      {/* Final CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            🌙 لا تفوّت عروض رمضان!
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            خصومات تصل إلى 50% على التأمين الشامل وضد الغير - العرض لفترة محدودة
          </p>
          <Button
            size="lg"
            className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all font-bold"
            style={{
              background: "linear-gradient(135deg, hsl(45, 90%, 50%), hsl(35, 85%, 45%))",
              color: "hsl(260, 50%, 12%)",
            }}
            onClick={() => navigate("/")}
          >
            <Moon className="w-6 h-6 ml-2" />
            استفد من عروض رمضان الآن
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingRamadan;
