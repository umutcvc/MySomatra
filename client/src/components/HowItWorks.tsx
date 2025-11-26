import { Card, CardContent } from "@/components/ui/card";
import { Watch, Bluetooth, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Watch,
      title: "Wear Your Device",
      description: "Slip on your ZenWear device and feel the comfort of premium materials designed for all-day wear."
    },
    {
      number: "02",
      icon: Bluetooth,
      title: "Connect via Bluetooth",
      description: "Pair seamlessly with any modern browser on your PC or phone using Web Bluetooth technology."
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Experience Wellness",
      description: "Let ZenWear guide your journey with intelligent feedback, tracking, and insights tailored to you."
    }
  ];

  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to begin your wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="h-full hover-elevate" data-testid={`card-step-${index + 1}`}>
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl font-bold text-primary/20 mb-4">
                      {step.number}
                    </div>
                    <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
                      <Icon className="w-10 h-10 text-primary" />
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
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-primary/30" />
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
