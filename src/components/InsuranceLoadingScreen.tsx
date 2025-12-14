import { useEffect, useState } from "react";
import { Shield, Search, CheckCircle2 } from "lucide-react";
import loadingLogo from "@/assets/loading-logo.png";

interface InsuranceLoadingScreenProps {
  isLoading: boolean;
  insuranceType?: "comprehensive" | "third-party";
}

export const InsuranceLoadingScreen = ({ isLoading, insuranceType = "third-party" }: InsuranceLoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "جاري البحث عن أفضل العروض...",
    "مقارنة الأسعار من 25 شركة تأمين...",
    "تحليل المزايا والخصومات...",
    "تجهيز العروض المناسبة لك..."
  ];

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setCurrentStep(0);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [isLoading, steps.length]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary to-primary/90" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl animate-pulse" />
            <img
              src={loadingLogo}
              alt="تأميني"
              className="relative w-24 h-24 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground text-center mb-2">
          {insuranceType === "comprehensive" ? "تأمين شامل" : "تأمين ضد الغير"}
        </h2>
        <p className="text-primary-foreground/80 text-center mb-8">
          نبحث لك عن أفضل الأسعار والعروض
        </p>

        {/* Road Animation Container */}
        <div className="relative h-32 mb-8 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-400/30 to-sky-600/30">
          {/* Sky with clouds */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 right-10 w-16 h-6 bg-white/40 rounded-full animate-[slide-cloud_8s_linear_infinite]" />
            <div className="absolute top-8 right-40 w-12 h-4 bg-white/30 rounded-full animate-[slide-cloud_12s_linear_infinite]" style={{ animationDelay: '-4s' }} />
            <div className="absolute top-2 right-60 w-20 h-5 bg-white/35 rounded-full animate-[slide-cloud_10s_linear_infinite]" style={{ animationDelay: '-2s' }} />
          </div>
          
          {/* Sun/Moon glow */}
          <div className="absolute top-4 left-8 w-12 h-12 bg-yellow-300/60 rounded-full blur-md animate-pulse" />
          <div className="absolute top-5 left-9 w-10 h-10 bg-yellow-200/80 rounded-full" />

          {/* Mountains in background */}
          <div className="absolute bottom-12 left-0 right-0 h-16">
            <svg viewBox="0 0 400 60" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="0,60 50,20 100,50 150,15 200,45 250,10 300,40 350,25 400,60" fill="rgba(100,116,139,0.4)" />
              <polygon points="0,60 30,35 80,55 130,30 180,50 230,25 280,55 330,35 380,50 400,60" fill="rgba(71,85,105,0.5)" />
            </svg>
          </div>

          {/* Road */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-700 to-slate-600">
            {/* Road lines */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex gap-8 animate-[road-lines_1s_linear_infinite]">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="w-12 h-1.5 bg-yellow-400/80 rounded-full flex-shrink-0" />
              ))}
            </div>
            {/* Road edges */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/50" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30" />
          </div>

          {/* Animated Car */}
          <div className="absolute bottom-3 right-1/2 transform translate-x-1/2 animate-[car-bounce_0.3s_ease-in-out_infinite]">
            <div className="relative">
              {/* Car shadow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/30 rounded-full blur-sm" />
              
              {/* Car body */}
              <svg width="70" height="35" viewBox="0 0 70 35" className="drop-shadow-lg">
                {/* Car body */}
                <path d="M10 25 L15 25 L18 18 L30 12 L50 12 L58 18 L62 25 L65 25 L65 28 L5 28 L5 25 Z" fill="hsl(var(--secondary))" />
                {/* Car roof */}
                <path d="M20 18 L25 10 L45 10 L52 18 Z" fill="hsl(var(--secondary))" opacity="0.9" />
                {/* Windows */}
                <path d="M22 17 L26 11 L35 11 L35 17 Z" fill="rgba(135,206,250,0.8)" />
                <path d="M37 17 L37 11 L46 11 L50 17 Z" fill="rgba(135,206,250,0.8)" />
                {/* Headlights */}
                <circle cx="8" cy="24" r="2" fill="#fef08a" />
                <circle cx="62" cy="24" r="2" fill="#fca5a5" />
                {/* Wheels */}
                <circle cx="18" cy="28" r="5" fill="#1e293b" />
                <circle cx="18" cy="28" r="2.5" fill="#64748b" />
                <circle cx="52" cy="28" r="5" fill="#1e293b" />
                <circle cx="52" cy="28" r="2.5" fill="#64748b" />
              </svg>

              {/* Exhaust smoke */}
              <div className="absolute -left-4 bottom-2 flex gap-1">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-[smoke_1s_ease-out_infinite]" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full animate-[smoke_1s_ease-out_infinite]" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 h-1 bg-white/20 rounded-full animate-[smoke_1s_ease-out_infinite]" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          </div>

          {/* Insurance company icons floating */}
          <div className="absolute top-6 right-8 animate-[float-icon_2s_ease-in-out_infinite]">
            <div className="w-8 h-8 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="absolute top-10 left-16 animate-[float-icon_2s_ease-in-out_infinite]" style={{ animationDelay: '-0.5s' }}>
            <div className="w-7 h-7 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-secondary" />
            </div>
          </div>
          <div className="absolute top-4 left-1/3 animate-[float-icon_2s_ease-in-out_infinite]" style={{ animationDelay: '-1s' }}>
            <div className="w-6 h-6 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <Shield className="w-3 h-3 text-primary" />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary-foreground/80">جاري البحث</span>
            <span className="text-sm font-bold text-primary-foreground">{Math.min(progress, 100)}%</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-secondary via-secondary to-green-400 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
        </div>

        {/* Current step */}
        <div className="flex items-center justify-center gap-3 text-primary-foreground">
          <Search className="w-5 h-5 animate-pulse" />
          <p className="text-center font-medium animate-fade-in" key={currentStep}>
            {steps[currentStep]}
          </p>
        </div>

        {/* Features being checked */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { text: "25 شركة تأمين", delay: 0 },
            { text: "أفضل الأسعار", delay: 0.2 },
            { text: "خصومات حصرية", delay: 0.4 },
            { text: "مقارنة شاملة", delay: 0.6 }
          ].map((item, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 animate-fade-in"
              style={{ animationDelay: `${item.delay}s` }}
            >
              <CheckCircle2 className="w-4 h-4 text-secondary" />
              <span className="text-sm text-primary-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes road-lines {
          0% { transform: translateX(0); }
          100% { transform: translateX(-80px); }
        }
        
        @keyframes car-bounce {
          0%, 100% { transform: translateX(50%) translateY(0); }
          50% { transform: translateX(50%) translateY(-2px); }
        }
        
        @keyframes smoke {
          0% { opacity: 0.4; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(-20px, -10px) scale(2); }
        }
        
        @keyframes float-icon {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        
        @keyframes slide-cloud {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-400%); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
