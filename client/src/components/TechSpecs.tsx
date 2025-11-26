import { Card, CardContent } from "@/components/ui/card";
import { Brain, Cpu, MapPin, Battery, Bluetooth, Waves } from "lucide-react";
import neuralImage from "@assets/generated_images/neural_viz_transparent_bg.png";

const specs = [
  {
    icon: Brain,
    title: "Neural Vibration Engine",
    specs: ["Precision linear actuator", "0.5-100 Hz frequency range", "256 intensity levels", "Custom waveform patterns"],
  },
  {
    icon: Cpu,
    title: "TinyML Activity AI",
    specs: ["9-axis IMU sensor", "On-device activity classification", "Real-time motion tracking", "Edge AI processing"],
  },
  {
    icon: MapPin,
    title: "GPS Tracking",
    specs: ["Multi-constellation GNSS", "±5m location accuracy", "Route recording", "Activity mapping"],
  },
  {
    icon: Battery,
    title: "Power System",
    specs: ["7-day battery life", "USB-C fast charging", "90-minute full charge", "Battery optimization AI"],
  },
  {
    icon: Bluetooth,
    title: "Connectivity",
    specs: ["Bluetooth 5.2 LE", "Web Bluetooth API", "Works on any browser", "Real-time data sync"],
  },
  {
    icon: Waves,
    title: "Therapy Modes",
    specs: ["6 preset programs", "Custom pattern creator", "Adaptive intensity", "Smart scheduling"],
  },
];

export default function TechSpecs() {
  return (
    <section className="py-32 px-6 bg-slate-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <img
          src={neuralImage}
          alt="Neural visualization"
          className="w-full h-full object-cover"
          style={{ filter: 'blur(1px)' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/80" />

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tight">
            Built for the Future
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Advanced technology in a device that weighs less than 20 grams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specs.map((spec, index) => {
            const Icon = spec.icon;
            return (
              <Card 
                key={index} 
                className="bg-white/5 border-white/10 backdrop-blur-md hover-elevate"
                data-testid={`card-spec-${index}`}
              >
                <CardContent className="p-8">
                  <div className="inline-flex p-3 rounded-xl bg-primary/20 mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-4">
                    {spec.title}
                  </h3>
                  <ul className="space-y-2">
                    {spec.specs.map((item, i) => (
                      <li key={i} className="text-white/60 flex items-start">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
