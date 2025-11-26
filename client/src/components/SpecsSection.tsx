import SpecCard from "./SpecCard";
import { Activity, Waves, MapPin, Battery } from "lucide-react";

export default function SpecsSection() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
            Technical Specifications
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced technology in a compact, elegant form
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SpecCard
            icon={Activity}
            title="Motion Sensors"
            specs={[
              "3-axis accelerometer",
              "3-axis gyroscope",
              "50Hz sampling rate",
              "Real-time motion tracking"
            ]}
          />

          <SpecCard
            icon={Waves}
            title="Vibration Feedback"
            specs={[
              "Linear resonant actuator",
              "Customizable intensity levels",
              "Multiple vibration patterns",
              "Silent operation"
            ]}
          />

          <SpecCard
            icon={MapPin}
            title="GPS Tracking"
            specs={[
              "Multi-constellation GNSS",
              "± 5m accuracy",
              "Fast signal acquisition",
              "Low power consumption"
            ]}
          />

          <SpecCard
            icon={Battery}
            title="Power & Charging"
            specs={[
              "7-day battery life",
              "USB-C fast charging",
              "Full charge in 90 minutes",
              "Battery saver mode"
            ]}
          />
        </div>
      </div>
    </section>
  );
}
