import HeroSection from "@/components/HeroSection";
import DeviceShowcase from "@/components/DeviceShowcase";
import UseCasesSection from "@/components/UseCasesSection";
import TechSpecs from "@/components/TechSpecs";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnectClick = () => {
    setLocation("/connect");
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold text-white tracking-tight">
            My<span className="text-primary">Somatra</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#therapy" className="text-sm text-white/50 hover:text-white transition-colors">Therapy</a>
            <a href="#specs" className="text-sm text-white/50 hover:text-white transition-colors">Specs</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button 
              onClick={handleConnectClick}
              className="hidden md:inline-flex rounded-full"
              data-testid="button-connect-header"
            >
              Connect Device
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-md">
            <nav className="flex flex-col p-4 gap-4">
              <a href="#features" className="text-sm text-white/50">Features</a>
              <a href="#therapy" className="text-sm text-white/50">Therapy</a>
              <a href="#specs" className="text-sm text-white/50">Specs</a>
              <Button onClick={handleConnectClick} className="w-full rounded-full">
                Connect Device
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <HeroSection onConnectClick={handleConnectClick} />
        <section id="therapy">
          <DeviceShowcase />
        </section>
        <section id="features">
          <UseCasesSection />
        </section>
        <section id="specs">
          <TechSpecs />
        </section>
        <HowItWorks />
        <CTASection onConnectClick={handleConnectClick} />
      </main>

      <footer className="bg-black text-white py-8 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-semibold">
              My<span className="text-primary">Somatra</span>
            </div>
            <div className="text-white/30 text-sm">
              2024 MySomatra. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
