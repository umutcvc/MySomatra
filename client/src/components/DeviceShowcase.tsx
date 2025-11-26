import { Badge } from "@/components/ui/badge";
import { Battery, MapPin, Zap } from "lucide-react";
import deviceImage from "@assets/generated_images/product_showcase_device_render.png";

export default function DeviceShowcase() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative">
              <img
                src={deviceImage}
                alt="ZenWear Wellness Device"
                className="w-full max-w-lg mx-auto animate-float"
                style={{
                  animation: 'float 6s ease-in-out infinite'
                }}
              />
              <style>
                {`@keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-20px); }
                }`}
              </style>
            </div>

            <div className="absolute top-1/4 -left-4 lg:left-0">
              <Badge className="px-4 py-2 bg-card border border-card-border shadow-lg" data-testid="badge-gps">
                <MapPin className="w-4 h-4 mr-2" />
                GPS Enabled
              </Badge>
            </div>

            <div className="absolute top-1/2 -right-4 lg:right-0">
              <Badge className="px-4 py-2 bg-card border border-card-border shadow-lg" data-testid="badge-battery">
                <Battery className="w-4 h-4 mr-2" />
                7-Day Battery
              </Badge>
            </div>

            <div className="absolute bottom-1/4 left-1/4">
              <Badge className="px-4 py-2 bg-card border border-card-border shadow-lg" data-testid="badge-vibration">
                <Zap className="w-4 h-4 mr-2" />
                Smart Vibration
              </Badge>
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-foreground">
              Elegantly Designed for Your Lifestyle
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              ZenWear combines cutting-edge sensor technology with minimalist design. Lightweight, comfortable, and powerful enough to track your wellness journey 24/7.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every detail has been crafted to seamlessly integrate into your daily routine, from morning meditation to evening relaxation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
