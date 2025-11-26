import { Brain, Cpu, MapPin, Battery, Bluetooth, Waves } from "lucide-react";
import { ScrollFade } from "@/hooks/use-scroll-fade";

const specs = [
  {
    icon: Brain,
    title: "Neural Vibration",
    spec: "0.5-100 Hz precision actuator",
  },
  {
    icon: Cpu,
    title: "TinyML Activity AI",
    spec: "9-axis IMU with edge processing",
  },
  {
    icon: MapPin,
    title: "GPS Tracking",
    spec: "Multi-constellation GNSS",
  },
  {
    icon: Battery,
    title: "7-Day Battery",
    spec: "USB-C fast charging",
  },
  {
    icon: Bluetooth,
    title: "Web Bluetooth",
    spec: "Connect from any browser",
  },
  {
    icon: Waves,
    title: "6 Therapy Modes",
    spec: "Custom pattern creator",
  },
];

export default function TechSpecs() {
  return (
    <section className="py-20 px-6 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto">
        <ScrollFade direction="up" duration={0.7}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-3 tracking-tight">
              Built for the Future
            </h2>
            <p className="text-white/50">
              Advanced technology in a device under 20 grams
            </p>
          </div>
        </ScrollFade>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <ScrollFade 
                key={index} 
                direction="up" 
                delay={0.05 * index} 
                duration={0.5}
              >
                <div 
                  className="text-center p-4"
                  data-testid={`spec-${index}`}
                >
                  <div className="inline-flex p-3 rounded-xl bg-white/5 mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    {spec.title}
                  </h3>
                  <p className="text-xs text-white/50">
                    {spec.spec}
                  </p>
                </div>
              </ScrollFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
