import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";

export const Hero = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('quote-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-sky-50 to-background min-h-[70vh] flex items-center overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.08),transparent_50%)]" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Right Content - Text (RTL) */}
          <div className="text-right order-1 lg:order-2 space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              أول منصة لتأمين السيارات
              <br />
              <span className="text-primary">في السعودية</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mr-auto">
              جميع وأفضل شركات التأمين… في مكان واحد، لمجموعة واسعة من الخيارات وإصدار فوري لوثائق التأمين
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={scrollToForm}
              >
                ابدأ الآن
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 justify-end pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>مرخص من هيئة التأمين</span>
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Left Content - Image/Illustration */}
          <div className="relative order-2 lg:order-1 flex justify-center">
            <div className="relative">
              {/* Main illustration container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96">
                {/* Background circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-sky-100 rounded-full" />
                
                {/* Car icon placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-20 h-20 md:w-24 md:h-24 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-primary">تأميني معك</p>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-background shadow-lg rounded-xl p-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">إصدار فوري</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-background shadow-lg rounded-xl p-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium">أفضل الأسعار</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};