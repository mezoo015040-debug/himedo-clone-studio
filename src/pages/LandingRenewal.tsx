import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { RefreshCw, CheckCircle, Clock, AlertCircle, Calendar, FileText, Zap, Shield } from "lucide-react";
import { InsurancePartners } from "@/components/InsurancePartners";
import { Footer } from "@/components/Footer";

const LandingRenewal = () => {
  const navigate = useNavigate();

  const steps = [
    { icon: FileText, title: "أدخل بياناتك", description: "رقم الهوية أو الإقامة ورقم الهاتف" },
    { icon: RefreshCw, title: "قارن العروض", description: "نعرض لك أفضل العروض من شركات التأمين" },
    { icon: Zap, title: "جدد فوراً", description: "اختر العرض المناسب وجدد في دقائق" },
  ];

  const reasons = [
    { icon: Clock, title: "وفّر وقتك", description: "لا حاجة لزيارة شركات التأمين" },
    { icon: Shield, title: "أفضل الأسعار", description: "قارن واختر أرخص عرض" },
    { icon: Calendar, title: "تذكير بالتجديد", description: "نذكرك قبل انتهاء وثيقتك" },
    { icon: CheckCircle, title: "إصدار فوري", description: "استلم وثيقتك على الواتساب" },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 lg:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-500/20 text-orange-600 border-orange-500/30 text-lg px-6 py-2">
              <AlertCircle className="w-5 h-5 ml-2" />
              لا تخاطر بالغرامات
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              جدد تأمين سيارتك <span className="text-primary">أونلاين</span> في دقائق
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              تجديد سريع وسهل بأفضل الأسعار - احصل على وثيقتك فوراً دون مغادرة منزلك
            </p>
            
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/")}
            >
              <RefreshCw className="w-6 h-6 ml-2" />
              جدد الآن
            </Button>
            
            <div className="flex items-center justify-center gap-8 mt-8 text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>تجديد فوري</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>أسعار تنافسية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>معتمد من ساما</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="bg-orange-500/10 border-y border-orange-500/20 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 text-center">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <div>
              <p className="font-semibold text-lg">غرامة التأخير في تجديد التأمين قد تصل إلى 500 ريال</p>
              <p className="text-muted-foreground">جدد الآن وتجنب المخالفات</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">كيف يعمل التجديد؟</h2>
          <p className="text-center text-muted-foreground mb-12">3 خطوات بسيطة لتجديد تأمينك</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <step.icon className="w-10 h-10 text-primary" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-primary/20 -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">لماذا تجدد معنا؟</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reasons.map((reason, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <reason.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
                <p className="text-muted-foreground">{reason.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">أسئلة شائعة عن التجديد</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "متى يجب أن أجدد تأمين سيارتي؟", a: "يفضل التجديد قبل انتهاء الوثيقة بأسبوع على الأقل لتجنب أي انقطاع في التغطية." },
              { q: "هل يمكنني تغيير شركة التأمين عند التجديد؟", a: "نعم، يمكنك اختيار أي شركة تأمين معتمدة عند التجديد والحصول على أفضل سعر." },
              { q: "كم يستغرق التجديد؟", a: "التجديد يتم خلال دقائق وتحصل على وثيقتك فوراً بعد الدفع." },
              { q: "ما المستندات المطلوبة؟", a: "رقم الهوية أو الإقامة ورقم الهاتف فقط، ونحن نستخرج بيانات سيارتك تلقائياً." },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <InsurancePartners />

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">لا تنتظر حتى تنتهي وثيقتك</h2>
          <p className="text-xl mb-8 opacity-90">جدد الآن واحصل على أفضل سعر مع تغطية فورية</p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-xl px-12 py-6 rounded-full"
            onClick={() => navigate("/")}
          >
            <RefreshCw className="w-6 h-6 ml-2" />
            جدد تأمينك الآن
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingRenewal;
