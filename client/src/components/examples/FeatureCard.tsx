import FeatureCard from '../FeatureCard';
import { Activity } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <div className="p-8">
      <FeatureCard
        icon={Activity}
        title="Advanced Motion Sensors"
        description="Track your movements with precision using state-of-the-art accelerometer and gyroscope sensors. Perfect for yoga, meditation, and daily activities."
      />
    </div>
  );
}
