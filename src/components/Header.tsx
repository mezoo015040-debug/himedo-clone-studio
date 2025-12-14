import { useState } from "react";
import { Menu, X, Car, Home, Plane, Heart, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigationItems = [
  { label: "السيارات", icon: Car, active: true },
  { label: "الصحي", icon: Heart },
  { label: "الأخطاء الطبية", icon: Shield },
  { label: "العمالة المنزلية", icon: Users },
  { label: "السفر", icon: Plane },
  { label: "المنزل", icon: Home },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">تأميني</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              English
            </Button>
            <Button variant="default" size="sm">
              الدخول لحسابي
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 mt-8">
                {navigationItems.map((item, index) => (
                  <button
                    key={index}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors ${
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
                <div className="border-t border-border pt-4 mt-4">
                  <Button className="w-full" variant="default">
                    الدخول لحسابي
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
