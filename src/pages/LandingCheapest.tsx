import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Shield, CheckCircle, Star, TrendingDown, Clock, Award } from "lucide-react";
import { InsurancePartners } from "@/components/InsurancePartners";
import { Footer } from "@/components/Footer";
const LandingCheapest = () => {
  const navigate = useNavigate();
  const benefits = [{
    icon: TrendingDown,
    title: "أقل الأسعار",
    description: "نقارن أسعار أكثر من 15 شركة تأمين"
  }, {
    icon: Clock,
    title: "إصدار فوري",
    description: "احصل على وثيقتك خلال دقائق"
  }, {
    icon: Shield,
    title: "تغطية شاملة",
    description: "حماية كاملة لسيارتك وراحة بالك"
  }, {
    icon: Award,
    title: "شركات موثوقة",
    description: "شركات تأمين معتمدة من ساما"
  }];
  return <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-lg px-6 py-2">
              <TrendingDown className="w-5 h-5 ml-2" />
              أرخص الأسعار في المملكة
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              وفّر حتى <span className="text-primary">50%</span> على تأمين سيارتك
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              قارن أسعار أفضل شركات التأمين في المملكة واحصل على أرخص عرض يناسب احتياجاتك
            </p>
            
            <Button size="lg" className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all" onClick={() => navigate("/")}>
              احصل على عرض سعر مجاني
            </Button>
            
            <div className="flex items-center justify-center gap-8 mt-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>بدون التزام</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>مقارنة مجانية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>إصدار فوري</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">+50,000</div>
              <p className="text-xl text-muted-foreground">عميل سعيد</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">15+</div>
              <p className="text-xl text-muted-foreground">شركة تأمين</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-primary mb-2">50%</div>
              <p className="text-xl text-muted-foreground">توفير بالمتوسط</p>
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
            name: "أحمد محمد",
            review: "وفرت أكثر من 800 ريال على تأمين سيارتي!",
            rating: 5
          }, {
            name: "سارة العتيبي",
            review: "خدمة سريعة وأسعار لا تُنافس",
            rating: 5
          }, {
            name: "خالد الشمري",
            review: "أفضل موقع لمقارنة أسعار التأمين",
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

      {/* CTA Section */}
      

      <Footer />
    </div>;
};
export default LandingCheapest;