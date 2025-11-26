import HeroSection from "@/components/HeroSection";
import DeviceShowcase from "@/components/DeviceShowcase";
import TherapyModes from "@/components/TherapyModes";
import UseCasesSection from "@/components/UseCasesSection";
import TechSpecs from "@/components/TechSpecs";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import ThemeToggle from "@/components/ThemeToggle";
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
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/60 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold text-foreground tracking-tight">
            Zen<span className="text-primary">Wear</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#therapy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Therapy</a>
            <a href="#specs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Specs</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
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
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="flex flex-col p-4 gap-4">
              <a href="#features" className="text-sm text-muted-foreground">Features</a>
              <a href="#therapy" className="text-sm text-muted-foreground">Therapy</a>
              <a href="#specs" className="text-sm text-muted-foreground">Specs</a>
              <Button onClick={handleConnectClick} className="w-full rounded-full">
                Connect Device
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <HeroSection onConnectClick={handleConnectClick} />
        <DeviceShowcase />
        <section id="therapy">
          <TherapyModes />
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

      <footer className="bg-slate-950 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="text-2xl font-semibold mb-4">
                Zen<span className="text-primary">Wear</span>
              </div>
              <p className="text-white/60 max-w-md">
                Advanced neural therapy wearable technology designed to restore balance, enhance performance, and promote wellness.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technology</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Specifications</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Firmware</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
            2024 ZenWear. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
