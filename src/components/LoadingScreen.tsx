import loadingLogo from "@/assets/loading-logo.png";

interface LoadingScreenProps {
  isLoading: boolean;
}

export const LoadingScreen = ({ isLoading }: LoadingScreenProps) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative">
        {/* Animated circles around logo */}
        <div className="absolute inset-0 -m-8">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          <div className="absolute inset-0 rounded-full border-4 border-primary/40 animate-pulse" />
        </div>
        
        {/* Logo with animations */}
        <div className="relative animate-[scale-in_0.5s_ease-out,fade-in_0.5s_ease-out]">
          <img
            src={loadingLogo}
            alt="تأميني"
            className="w-32 h-32 md:w-40 md:h-40 object-contain animate-[pulse_2s_ease-in-out_infinite]"
            style={{
              filter: "drop-shadow(0 10px 30px rgba(59, 130, 246, 0.3))"
            }}
          />
        </div>

        {/* Loading text */}
        <p className="mt-6 text-center text-lg font-semibold text-primary animate-fade-in">
          جاري التحميل...
        </p>
        
        {/* Loading dots animation */}
        <div className="mt-3 flex justify-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
};
