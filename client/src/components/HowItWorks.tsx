import { Card, CardContent } from "@/components/ui/card";
import { Watch, Bluetooth, Sparkles, Brain } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Watch,
      title: "Place Your Device",
      description: "Position ZenWear on your preferred body location - neck for vagus nerve, chest for breathing, or any pressure point."
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
    <section className="py-32 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-semibold mb-6 text-foreground tracking-tight">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to begin your neural wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="h-full hover-elevate border-2 border-transparent hover:border-primary/20 transition-colors" data-testid={`card-step-${index + 1}`}>
                  <CardContent className="p-8">
                    <div className="text-7xl font-bold text-primary/10 mb-4">
                      {step.number}
                    </div>
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-4 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-primary/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
