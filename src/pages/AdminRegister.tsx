import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Shield } from "lucide-react";

// كلمة السر السرية للوصول لهذه الصفحة
const SECRET_ACCESS_CODE = "ADMIN2024SECURE";

const AdminRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // التحقق من تسجيل الدخول المسبق
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleAccessCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode === SECRET_ACCESS_CODE) {
      setIsUnlocked(true);
      toast({
        title: "تم التحقق بنجاح",
        description: "يمكنك الآن إنشاء حساب مسؤول جديد",
      });
    } else {
      toast({
        title: "كود خاطئ",
        description: "الرجاء إدخال كود الوصول الصحيح",
        variant: "destructive",
      });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "خطأ في التسجيل",
        description: error.message === "User already registered"
          ? "البريد الإلكتروني مسجل بالفعل"
          : error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.session) {
      toast({
        title: "تم التسجيل بنجاح",
        description: "مرحباً بك في لوحة التحكم",
      });
      navigate("/dashboard");
    } else if (data.user) {
      toast({
        title: "تم إنشاء الحساب",
        description: "يمكنك الآن تسجيل الدخول",
      });
      navigate("/login");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
        <Card className="w-full max-w-md p-8 shadow-glow">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold text-center">صفحة محمية</h1>
            <p className="text-muted-foreground text-center mt-2">
              أدخل كود الوصول السري
            </p>
          </div>

          <form onSubmit={handleAccessCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-code">كود الوصول</Label>
              <Input
                id="access-code"
                type="password"
                placeholder="أدخل الكود السري"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <Button type="submit" className="w-full">
              تحقق من الكود
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              هذه الصفحة محمية. فقط المسؤولين المصرح لهم يمكنهم الوصول.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md p-8 shadow-glow">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-center">إنشاء حساب مسؤول</h1>
          <p className="text-muted-foreground text-center mt-2">
            إضافة مسؤول جديد للنظام
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">الاسم الكامل</Label>
            <Input
              id="signup-name"
              type="text"
              placeholder="أحمد محمد"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">البريد الإلكتروني</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">كلمة المرور</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              dir="ltr"
              className="text-left"
            />
            <p className="text-xs text-muted-foreground">
              يجب أن تكون 6 أحرف على الأقل
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري إنشاء الحساب...
              </>
            ) : (
              "إنشاء حساب مسؤول"
            )}
          </Button>
        </form>
        
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            تسجيل الدخول بحساب موجود
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminRegister;