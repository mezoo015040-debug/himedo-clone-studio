import { Hero } from "@/components/Hero";
import { InsurancePartners } from "@/components/InsurancePartners";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { InsuranceTypes } from "@/components/InsuranceTypes";
import { ChatButton } from "@/components/ChatButton";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <InsurancePartners />
      <WhyChooseUs />
      <InsuranceTypes />
      <ChatButton />
      <Footer />
    </div>
  );
};

export default Index;
