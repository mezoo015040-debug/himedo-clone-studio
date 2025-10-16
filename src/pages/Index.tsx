import { Hero } from "@/components/Hero";
import { QuoteForm } from "@/components/QuoteForm";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { InsuranceTypes } from "@/components/InsuranceTypes";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";

const Index = () => {
  // تتبع زيارة المستخدم
  useVisitorTracking();
  
  return (
    <div className="min-h-screen">
      <Hero />
      <QuoteForm />
      <WhyChooseUs />
      <InsuranceTypes />
      <ChatButton />
      <Footer />
    </div>
  );
};

export default Index;
