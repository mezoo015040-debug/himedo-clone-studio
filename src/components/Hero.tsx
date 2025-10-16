import { Shield, Sparkles } from "lucide-react";

export const Hero = () => {
  return <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient with animated overlay */}
      <div className="absolute inset-0 hero-gradient opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_50%)]" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{
      animationDelay: '1s'
    }} />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-8 max-w-5xl mx-auto">
          {/* Icon Badge with enhanced styling */}
          <div className="relative group animate-fade-in">
            <div className="absolute inset-0 bg-primary-foreground/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-primary-foreground/20 backdrop-blur-md p-5 rounded-2xl shadow-glow border border-primary-foreground/20 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Main Heading with enhanced styling */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight animate-fade-in" style={{animationDelay: '0.1s'}}>
            اشترِ تأمين سيارتك
            <br />
            <span className="relative inline-block">
              <span className="text-secondary drop-shadow-[0_0_25px_rgba(52,211,153,0.5)]">في دقائق معدودة</span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-60 blur-sm" />
            </span>
          </h1>
          
          {/* Subtitle with enhanced styling */}
          <p className="text-xl md:text-2xl text-primary-foreground/95 max-w-2xl leading-relaxed font-light animate-fade-in backdrop-blur-sm bg-primary/10 px-8 py-4 rounded-2xl border border-primary-foreground/10" style={{animationDelay: '0.2s'}}>
            قارن بين عروض جميع شركات التأمين واختر الأنسب لك بأفضل سعر
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            
            
          </div>
          
          {/* Trust Badge with enhanced styling */}
          <div className="flex items-center gap-3 text-primary-foreground/90 pt-6 animate-fade-in backdrop-blur-sm bg-primary-foreground/5 px-6 py-3 rounded-full border border-primary-foreground/10" style={{animationDelay: '0.4s'}}>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-primary-foreground/40 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform duration-300" style={{animationDelay: `${i * 0.1}s`}} />
              ))}
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>;
};