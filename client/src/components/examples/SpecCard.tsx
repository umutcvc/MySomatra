import SpecCard from '../SpecCard';
import { Activity } from 'lucide-react';

export default function SpecCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <SpecCard
        icon={Activity}
        title="Motion Sensors"
        specs={[
          "3-axis accelerometer",
          "3-axis gyroscope",
          "Real-time motion tracking"
        ]}
      />
    </div>
  );
}
