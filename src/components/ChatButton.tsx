import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-16 h-16 rounded-full hero-gradient shadow-glow hover:scale-110 transition-smooth z-50 group"
        size="icon"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <MessageCircle className="w-6 h-6 text-primary-foreground group-hover:scale-110 transition-smooth" />
        )}
      </Button>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-80 bg-card rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden z-50 animate-scale-in">
          <div className="hero-gradient p-4">
            <h3 className="text-lg font-bold text-primary-foreground">محادثة فورية</h3>
            <p className="text-sm text-primary-foreground/80">كيف نقدر نساعدك؟</p>
          </div>
          <div className="p-4 space-y-3 bg-accent/30 h-64">
            <div className="bg-card p-3 rounded-lg shadow-sm">
              <p className="text-sm text-foreground">مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
            </div>
          </div>
          <div className="p-4 border-t bg-card">
            <input
              type="text"
              placeholder="اكتب رسالتك..."
              className="w-full px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}
    </>
  );
};
