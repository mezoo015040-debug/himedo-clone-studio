import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Star, Tag, Clock, Award, Car, Banknote } from "lucide-react";
import { InsurancePartners } from "@/components/InsurancePartners";
import { Footer } from "@/components/Footer";
const LandingPrices = () => {
  const navigate = useNavigate();
  const pricePlans = [{
    type: "تأمين ضد الغير",
    price: "499",
    features: ["تغطية الطرف الثالث", "حوادث السير", "أضرار الممتلكات", "إصدار فوري"],
    popular: false
  }, {
    type: "تأمين ضد الغير+",
    price: "699",
    features: ["تغطية الطرف الثالث", "الحوادث الشخصية", "الكوارث الطبيعية", "مساعدة على الطريق"],
    popular: true
  }, {
    type: "تأمين شامل",
    price: "1,789",
    features: ["تغطية شاملة كاملة", "سرقة وحريق", "أضرار طبيعية", "سيارة بديلة", "صيانة مجانية"],
    popular: false
  }];
  return <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-lg px-6 py-2">
              <Tag className="w-5 h-5 ml-2" />
              أسعار تبدأ من 499 ريال
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              أسعار تأمين السيارات <span className="text-primary">تبدأ من 499 ريال</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              احصل على أفضل أسعار تأمين السيارات في المملكة من أكثر من 25 شركة تأمين معتمدة
            </p>

            <Button size="lg" className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/")}>
              احصل على عرض سعر الآن
            </Button>

            <div className="flex items-center justify-center gap-8 mt-8 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>بدون رسوم إضافية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>مقارنة فورية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>خصومات حصرية</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      

      {/* Why Us */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تأميني؟</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[{
            icon: Banknote,
            title: "أقل الأسعار",
            desc: "نضمن لك أفضل سعر في السوق"
          }, {
            icon: Clock,
            title: "إصدار فوري",
            desc: "وثيقتك جاهزة خلال دقائق"
          }, {
            icon: Shield,
            title: "شركات معتمدة",
            desc: "جميع الشركات مرخصة من ساما"
          }, {
            icon: Car,
            title: "+25 شركة",
            desc: "أكبر شبكة شركات تأمين"
          }].map((item, i) => <Card key={i} className="p-6 text-center">
                <item.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">+50,000</div>
              <p className="text-xl text-muted-foreground">عميل سعيد</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">25+</div>
              <p className="text-xl text-muted-foreground">شركة تأمين</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">499</div>
              <p className="text-xl text-muted-foreground">ريال أقل سعر</p>
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
            name: "محمد السعيد",
            review: "حصلت على تأمين بـ 499 ريال فقط! أرخص سعر لقيته",
            rating: 5
          }, {
            name: "نورة الحربي",
            review: "خدمة ممتازة وأسعار تنافسية جداً",
            rating: 5
          }, {
            name: "عبدالله القحطاني",
            review: "وفرت أكثر من 1000 ريال مقارنة بالتجديد المباشر",
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
          <h2 className="text-3xl font-bold mb-4">لا تفوّت العرض!</h2>
          <p className="text-xl text-muted-foreground mb-8">أسعار تبدأ من 499 ريال فقط - احصل على عرضك الآن</p>
          <Button size="lg" className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/")}>
            ابدأ الآن
          </Button>
        </div>
      </section>

      <Footer />
    </div>;
};
export default LandingPrices;