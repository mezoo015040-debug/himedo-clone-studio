import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const InsuranceTypes = () => {
  const types = [
    {
      name: "تأمين ضد الغير",
      price: "من 250 ريال",
      description: "التأمين الإلزامي الأساسي",
      features: [
        "تغطية الأضرار التي تسببها للغير",
        "إلزامي حسب نظام المرور",
        "تغطية تصل إلى 10 مليون ريال",
        "صالح لمدة سنة واحدة"
      ],
      gradient: "from-primary/20 to-primary/5"
    },
    {
      name: "تأمين شامل",
      price: "من 850 ريال",
      description: "تغطية كاملة لسيارتك",
      features: [
        "يشمل جميع مزايا تأمين ضد الغير",
        "تغطية سيارتك ضد الحوادث",
        "تغطية السرقة والحريق",
        "خدمة المساعدة على الطريق",
        "سيارة بديلة عند الحاجة",
        "تغطية الكوارث الطبيعية"
      ],
      popular: true,
      gradient: "from-secondary/20 to-secondary/5"
    }
  ];

  return (
    <section className="py-20 px-4 md:px-6 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            إيش هي التغطية التأمينية اللي تختارها؟
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            فيه تغطيتين رئيسيتين يقدمها موقع تأميني
            <br />
            تقدر تختار واحدة منهم لتأمين سيارتك
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {types.map((type, index) => (
            <Card 
              key={index}
              className={`relative p-8 hover:shadow-xl transition-smooth border-2 ${
                type.popular ? 'border-secondary shadow-lg scale-105' : 'border-border hover:border-primary/50'
              }`}
            >
              {type.popular && (
                <div className="absolute -top-4 right-1/2 translate-x-1/2">
                  <span className="accent-gradient text-secondary-foreground text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                    الأكثر شعبية
                  </span>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {type.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{type.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">{type.price}</span>
                    <span className="text-muted-foreground">/سنوياً</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        type.popular ? 'accent-gradient' : 'hero-gradient'
                      }`}>
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-foreground leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full text-lg py-6 ${
                    type.popular 
                      ? 'accent-gradient hover:opacity-90 shadow-lg' 
                      : 'hero-gradient hover:opacity-90'
                  } text-white transition-smooth`}
                >
                  اشترِ الآن
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
