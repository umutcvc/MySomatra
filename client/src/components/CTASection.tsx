import { Button } from "@/components/ui/button";
import { Bluetooth, Globe, Sparkles } from "lucide-react";

interface CTASectionProps {
  onConnectClick: () => void;
}

export default function CTASection({ onConnectClick }: CTASectionProps) {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-background to-card">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">Start Your Journey</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-semibold mb-6 text-foreground tracking-tight">
          Ready to Transform
          <span className="block">Your Wellness?</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Connect your neural therapy device and experience the future of personalized wellness
        </p>

        <Button
          size="lg"
          onClick={onConnectClick}
          className="px-10 py-7 text-lg rounded-full"
          data-testid="button-connect-cta"
        >
          <Bluetooth className="w-5 h-5 mr-2" />
          Connect Device
        </Button>

        <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4" />
            <span>Bluetooth 5.2 LE</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Works on PC & Mobile</span>
          </div>
        </div>
      </div>
    </section>
  );
}
