import { Card, CardContent } from "@/components/ui/card";
import { Watch, Bluetooth, Sparkles, Brain } from "lucide-react";
import { ScrollFade } from "@/components/ScrollFade";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Watch,
      title: "Place Your Device",
      description: "Position MySomatra on your preferred body location - neck for vagus nerve, chest for breathing, or any pressure point."
    },
    {
      number: "02",
      icon: Bluetooth,
      title: "Connect via Browser",
      description: "Open this web app on any device and connect instantly using Web Bluetooth. No app downloads required."
    },
    {
      number: "03",
      icon: Brain,
      title: "Select Your Mode",
      description: "Choose from Relax, Sleep, Focus, Hype, or create custom therapy patterns tailored to your needs."
    },
    {
      number: "04",
      icon: Sparkles,
      title: "Experience Wellness",
      description: "Let neural-tuned vibrations guide your nervous system to your desired state of mind and body."
    }
  ];

  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <ScrollFade direction="up" duration={0.7}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Four simple steps to begin your neural wellness journey
            </p>
          </div>
        </ScrollFade>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollFade 
                key={index} 
                direction="up" 
                delay={0.1 * index} 
                duration={0.6}
              >
                <div className="relative h-full">
                  <Card className="h-full hover-elevate" data-testid={`card-step-${index + 1}`}>
                    <CardContent className="p-6">
                      <div className="text-5xl font-bold text-primary/10 mb-3">
                        {step.number}
                      </div>
                      <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>

                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-0.5 bg-primary/20" />
                    </div>
                  )}
                </div>
              </ScrollFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
