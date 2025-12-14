import malathLogo from "@/assets/malath-logo.png";
import amanaLogo from "@/assets/amana-logo.png";
import walaaLogo from "@/assets/walaa-logo.png";

export const InsurancePartners = () => {
  const partners = [
    { name: "ملاذ", logo: malathLogo },
    { name: "أمانة", logo: amanaLogo },
    { name: "ولاء", logo: walaaLogo },
  ];

  return (
    <section className="py-8 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {/* License badge */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium">مرخص من</span>
            <div className="bg-background border border-border rounded-lg px-3 py-1.5">
              <span className="font-semibold text-foreground">هيئة التأمين</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-8 bg-border" />

          {/* Partners logos */}
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
