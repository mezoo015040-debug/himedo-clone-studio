import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { InsurancePartners } from "@/components/InsurancePartners";
import { QuoteForm } from "@/components/QuoteForm";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { InsuranceTypes } from "@/components/InsuranceTypes";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <InsurancePartners />
      <QuoteForm />
      <WhyChooseUs />
      <InsuranceTypes />
      <ChatButton />
      <Footer />
    </div>
  );
};

export default Index;
