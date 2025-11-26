import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Activity, MapPin } from "lucide-react";
import deviceImage from "@assets/generated_images/neural_therapy_device_product.png";

export default function DeviceShowcase() {
  const features = [
    { icon: Brain, label: "Neural Therapy", position: "top-1/4 -left-4 lg:left-8" },
    { icon: Zap, label: "Smart Vibration", position: "top-1/2 -right-4 lg:right-8" },
    { icon: Activity, label: "TinyML Activity AI", position: "bottom-1/3 left-1/4" },
    { icon: MapPin, label: "GPS Tracking", position: "bottom-1/4 right-1/4" },
  ];

  return (
    <section className="py-32 px-6 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-semibold mb-6 text-foreground tracking-tight">
            Wear It Your Way
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Place anywhere on your body — neck for vagus nerve stimulation, 
            chest for breathing, or any pressure point for targeted therapy.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <img
              src={deviceImage}
              alt="ZenWear Neural Therapy Device"
              className="w-full max-w-md mx-auto"
              style={{
                animation: 'float 6s ease-in-out infinite'
              }}
            />
            <style>
              {`@keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(2deg); }
              }`}
            </style>
          </div>

          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className={`absolute ${feature.position} hidden md:block`}
                style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
              >
                <Badge className="px-4 py-2 bg-card/80 backdrop-blur-md border border-card-border shadow-xl" data-testid={`badge-feature-${index}`}>
                  <Icon className="w-4 h-4 mr-2 text-primary" />
                  {feature.label}
                </Badge>
              </div>
            );
          })}
          <style>
            {`@keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }`}
          </style>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            { title: "Vagus Nerve", desc: "Place on neck for deep relaxation and sleep enhancement" },
            { title: "Pressure Points", desc: "Target specific body areas for therapeutic relief" },
            { title: "Activity Zones", desc: "Wear during workouts for performance optimization" },
          ].map((item, i) => (
            <div key={i} className="text-center p-6">
              <h3 className="text-xl font-medium text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
