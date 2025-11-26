import FeatureCard from "./FeatureCard";
import { Activity, Waves, MapPin, Battery } from "lucide-react";
import sensorImage from "@assets/generated_images/device_sensor_close-up.png";
import gpsImage from "@assets/generated_images/gps_tracking_outdoor_scene.png";
import chargingImage from "@assets/generated_images/usb-c_charging_station.png";

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-card">
      <div className="max-w-7xl mx-auto space-y-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground">
            Powerful Features for Mindful Living
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature designed to enhance your wellness journey
          </p>
        </div>

        <FeatureCard
          icon={Activity}
          title="Advanced Motion Sensors"
          description="Track your movements with precision using state-of-the-art accelerometer and gyroscope sensors. Perfect for yoga, meditation postures, and daily activity monitoring."
          image={sensorImage}
          imagePosition="right"
        />

        <FeatureCard
          icon={Waves}
          title="Intelligent Vibration Feedback"
          description="Experience gentle, customizable vibration patterns designed to guide your breathing, signal transitions, and promote relaxation throughout your day."
          imagePosition="left"
        />

        <FeatureCard
          icon={MapPin}
          title="Precise GPS Tracking"
          description="Map your outdoor activities with accuracy. Track your walking meditation routes, nature hikes, and mindful movement sessions with built-in GPS technology."
          image={gpsImage}
          imagePosition="right"
        />

        <FeatureCard
          icon={Battery}
          title="Long-Lasting Battery & USB-C"
          description="Enjoy up to 7 days of continuous use on a single charge. Quick recharge with modern USB-C connectivity means less time plugged in, more time in motion."
          image={chargingImage}
          imagePosition="left"
        />
      </div>
    </section>
  );
}
