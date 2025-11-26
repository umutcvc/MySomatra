import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroImage from "@assets/generated_images/hero_meditation_wellness_scene.png";

interface HeroSectionProps {
  onConnectClick: () => void;
}

export default function HeroSection({ onConnectClick }: HeroSectionProps) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Person meditating in peaceful nature"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-4 tracking-tight leading-tight max-w-4xl">
          Your Wellness Journey Begins Here
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl">
          Experience mindful living with intelligent motion tracking, relaxation feedback, and seamless connectivity
        </p>
        <Button
          size="lg"
          onClick={onConnectClick}
          className="px-8 py-6 text-lg rounded-2xl bg-primary/90 backdrop-blur-md border border-primary-border hover-elevate active-elevate-2"
          data-testid="button-connect-hero"
        >
          Connect Your Device
        </Button>

        <div className="absolute bottom-12 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/70" />
        </div>
      </div>
    </section>
  );
}
