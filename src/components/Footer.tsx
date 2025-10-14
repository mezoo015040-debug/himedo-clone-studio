import { Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-secondary-foreground" />
              </div>
              <span className="text-2xl font-bold">تأميني</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              منصة مقارنة وشراء تأمين السيارات الأولى في المملكة. نساعدك في إيجاد أفضل عرض بأفضل سعر.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-secondary transition-smooth">من نحن</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">كيف يعمل</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-secondary transition-smooth">اتصل بنا</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>البريد الإلكتروني: info@ta2meeny.sa</li>
              <li>الهاتف: 920000000</li>
              <li>المملكة العربية السعودية</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
          <p>© 2025 تأميني. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};
