import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Star, Gift, Clock, Award, Percent, PartyPopper } from "lucide-react";
import { InsurancePartners } from "@/components/InsurancePartners";
import { Footer } from "@/components/Footer";
const LandingFoundingDay = () => {
  const navigate = useNavigate();
  const offers = [{
    company: "أمانة للتأمين",
    discount: "50%",
    originalPrice: "998",
    newPrice: "499",
    type: "ضد الغير"
  }, {
    company: "ملاذ للتأمين",
    discount: "40%",
    originalPrice: "1,165",
    newPrice: "699",
    type: "ضد الغير+"
  }, {
    company: "ولاء للتأمين",
    discount: "35%",
    originalPrice: "2,752",
    newPrice: "1,789",
    type: "شامل"
  }];
  return <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24" style={{
      background: "linear-gradient(135deg, hsl(153, 60%, 15%) 0%, hsl(153, 40%, 25%) 50%, hsl(40, 60%, 30%) 100%)"
    }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, hsl(40, 70%, 50%) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(153, 50%, 40%) 0%, transparent 50%)"
        }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-5xl">🇸🇦</span>
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-lg px-6 py-2">
                <PartyPopper className="w-5 h-5 ml-2" />
                عروض يوم التأسيس
              </Badge>
              
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              خصومات تصل إلى <span className="text-yellow-400">50%</span>
              <br />
              بمناسبة يوم التأسيس السعودي 🎉
            </h1>

            <p className="text-xl text-green-100/80 mb-8 max-w-2xl mx-auto">
              احتفالاً بيوم التأسيس نقدم لكم أقوى العروض والخصومات على تأمين السيارات من أفضل الشركات
            </p>

            <Button size="lg" className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-yellow-500 hover:bg-yellow-600 text-black font-bold" onClick={() => navigate("/")}>
              <Gift className="w-6 h-6 ml-2" />
              استفد من العرض الآن
            </Button>

            <div className="flex items-center justify-center gap-8 mt-8 text-green-100/70 flex-wrap">
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

      {/* Discount Cards */}
      

      {/* Founding Day Banner */}
      <section className="py-12" style={{
      background: "linear-gradient(135deg, hsl(153, 50%, 20%) 0%, hsl(40, 50%, 25%) 100%)"
    }}>
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">🏆 نفتخر بخدمة أبناء الوطن</h2>
            <p className="text-green-100/80 text-lg mb-6">
              منذ تأسيس المملكة العربية السعودية ونحن نسعى لتقديم أفضل الخدمات التأمينية لأبناء هذا الوطن الغالي
            </p>
            <div className="grid grid-cols-3 gap-6 text-white">
              <div>
                <div className="text-4xl font-bold text-yellow-400">+50,000</div>
                <p className="text-green-100/70 mt-1">عميل</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">25+</div>
                <p className="text-green-100/70 mt-1">شركة تأمين</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400">50%</div>
                <p className="text-green-100/70 mt-1">خصم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">آراء عملائنا</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[{
            name: "فهد الدوسري",
            review: "استفدت من عرض يوم التأسيس ووفرت 50% على التأمين!",
            rating: 5
          }, {
            name: "منال الزهراني",
            review: "أسعار ممتازة وإصدار فوري، شكراً تأميني",
            rating: 5
          }, {
            name: "سلطان العنزي",
            review: "أفضل عرض حصلت عليه بمناسبة يوم التأسيس",
            rating: 5
          }].map((review, index) => <Card key={index} className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-muted-foreground mb-4">"{review.review}"</p>
                <p className="font-semibold">{review.name}</p>
              </Card>)}
          </div>
        </div>
      </section>

      <InsurancePartners />

      {/* Final CTA */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">⏰ العرض لفترة محدودة!</h2>
          <p className="text-xl text-muted-foreground mb-8">
            لا تفوّت خصومات يوم التأسيس - خصم يصل إلى 50% على جميع أنواع التأمين
          </p>
          <Button size="lg" className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/")}>
            <Gift className="w-6 h-6 ml-2" />
            استفد من العرض الآن
          </Button>
        </div>
      </section>

      <Footer />
    </div>;
};
export default LandingFoundingDay;