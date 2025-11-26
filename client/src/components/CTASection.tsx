import { Button } from "@/components/ui/button";
import { Bluetooth, Globe } from "lucide-react";

interface CTASectionProps {
  onConnectClick: () => void;
}

export default function CTASection({ onConnectClick }: CTASectionProps) {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
          Ready to Begin Your Wellness Journey?
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Connect your ZenWear device now and experience the future of mindful living
        </p>

        <Button
          size="lg"
          onClick={onConnectClick}
          className="px-8 py-6 text-lg rounded-2xl mb-8"
          data-testid="button-connect-cta"
        >
          <Bluetooth className="w-5 h-5 mr-2" />
          Connect Device
        </Button>

        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4" />
            <span>Bluetooth Enabled</span>
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
