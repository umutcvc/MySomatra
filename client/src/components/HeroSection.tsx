import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import heroImage from "@assets/generated_images/dynamic_device_hero_visual.png";

interface HeroSectionProps {
  onConnectClick: () => void;
}

export default function HeroSection({ onConnectClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Neural therapy device with energy visualization"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-white/90">Neural Therapy Technology</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 tracking-tight leading-tight max-w-5xl">
          Restore Your
          <span className="block bg-gradient-to-r from-primary via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Neural Balance
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl leading-relaxed">
          Advanced wearable therapy using precision vibrations to stimulate your nervous system. 
          Place anywhere on your body for sleep, relaxation, or performance enhancement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={onConnectClick}
            className="px-8 py-6 text-lg rounded-full bg-white text-slate-900 hover:bg-white/90"
            data-testid="button-connect-hero"
          >
            Connect Device
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg rounded-full border-white/30 text-white bg-white/10 backdrop-blur-md hover:bg-white/20"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>

        <div className="absolute bottom-12 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </div>
    </section>
  );
}
