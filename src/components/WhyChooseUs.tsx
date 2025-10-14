import { Card } from "@/components/ui/card";
import { Search, DollarSign, Clock, Shield } from "lucide-react";

export const WhyChooseUs = () => {
  const features = [
    {
      icon: Search,
      title: "مقارنة شاملة",
      description: "نعرض لك جميع العروض المتاحة من كل شركات التأمين في مكان واحد"
    },
    {
      icon: DollarSign,
      title: "أفضل الأسعار",
      description: "وفر المال واحصل على أفضل سعر مضمون دون الحاجة للبحث"
    },
    {
      icon: Clock,
      title: "سرعة وسهولة",
      description: "اشترِ وثيقة التأمين في دقائق معدودة من منزلك"
    },
    {
      icon: Shield,
      title: "موثوق ومعتمد",
      description: "نعمل مع جميع شركات التأمين المعتمدة من البنك المركزي"
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            ليه تشتري وثيقة التأمين من تأميني؟
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ممكن صار لك موقف واشتريت وثيقة تأمين واكتشفت إن فيه عرض أفضل!
            <br />
            <span className="text-primary font-semibold">مع تأميني.. ما راح تتكرر لك هالتجربة!</span>
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-lg transition-smooth bg-card hover:scale-105 border-2 hover:border-primary/50 group"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 hero-gradient rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-smooth">
                  <feature.icon className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
