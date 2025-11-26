import HeroSection from "@/components/HeroSection";
import DeviceShowcase from "@/components/DeviceShowcase";
import FeaturesSection from "@/components/FeaturesSection";
import SpecsSection from "@/components/SpecsSection";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import ThemeToggle from "@/components/ThemeToggle";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleConnectClick = () => {
    setLocation("/connect");
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold text-foreground">
            ZenWear
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main>
        <HeroSection onConnectClick={handleConnectClick} />
        <DeviceShowcase />
        <FeaturesSection />
        <SpecsSection />
        <HowItWorks />
        <CTASection onConnectClick={handleConnectClick} />
      </main>

      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-semibold text-foreground mb-4">
            ZenWear
          </div>
          <p className="text-muted-foreground">
            Your companion for mindful living
          </p>
        </div>
      </footer>
    </div>
  );
}
