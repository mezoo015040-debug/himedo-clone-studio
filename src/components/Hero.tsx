import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-95" />
      
      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Icon Badge */}
          <div className="bg-primary-foreground/20 backdrop-blur-sm p-4 rounded-2xl shadow-glow">
            <Shield className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            اشترِ تأمين سيارتك
            <br />
            <span className="text-secondary">في دقائق معدودة</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl leading-relaxed">
            قارن بين عروض جميع شركات التأمين واختر الأنسب لك بأفضل سعر
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-smooth group"
            >
              شاهد العروض
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-smooth" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground text-lg px-8 py-6 backdrop-blur-sm transition-smooth"
            >
              كيف يعمل؟
            </Button>
          </div>
          
          {/* Trust Badge */}
          <div className="flex items-center gap-2 text-primary-foreground/80 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-primary-foreground/20 border-2 border-primary flex items-center justify-center text-xs font-semibold">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm md:text-base font-medium">
              أكثر من <span className="font-bold text-secondary">10,000+</span> عميل راضٍ
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};
