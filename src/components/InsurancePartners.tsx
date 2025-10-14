import { Card } from "@/components/ui/card";

export const InsurancePartners = () => {
  // Partner company names (as we don't have actual logos)
  const partners = [
    "الراجحي",
    "التعاونية",
    "ملاذ",
    "سلامة",
    "الأهلي",
    "سايكو",
    "أكسا",
    "وقاية"
  ];

  return (
    <section className="py-16 px-4 md:px-6 bg-accent/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            شركاؤنا من شركات التأمين
          </h2>
          <p className="text-muted-foreground text-lg">
            نقارن بين عروض أفضل شركات التأمين في المملكة
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <Card 
              key={index}
              className="flex items-center justify-center p-8 hover:shadow-lg transition-smooth bg-card hover:scale-105 cursor-pointer"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{partner.charAt(0)}</span>
                </div>
                <p className="font-semibold text-foreground">{partner}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
