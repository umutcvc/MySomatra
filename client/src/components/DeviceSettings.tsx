import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Waves, Activity, MapPin } from "lucide-react";
import { useState } from "react";

interface DeviceSettingsProps {
  onDisconnect: () => void;
}

export default function DeviceSettings({ onDisconnect }: DeviceSettingsProps) {
  const [vibrationIntensity, setVibrationIntensity] = useState([65]);
  const [motionSensors, setMotionSensors] = useState(true);
  const [gpsTracking, setGpsTracking] = useState(true);

  return (
    <Card data-testid="card-device-settings">
      <CardHeader>
        <CardTitle>Device Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Waves className="w-5 h-5 text-primary" />
            <Label htmlFor="vibration-intensity" className="text-base">
              Vibration Intensity
            </Label>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              id="vibration-intensity"
              value={vibrationIntensity}
              onValueChange={setVibrationIntensity}
              max={100}
              step={1}
              className="flex-1"
              data-testid="slider-vibration"
            />
            <span className="text-sm font-medium text-muted-foreground w-12 text-right" data-testid="text-vibration-value">
              {vibrationIntensity[0]}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" />
            <Label htmlFor="motion-sensors" className="text-base">
              Motion Sensors
            </Label>
          </div>
          <Switch
            id="motion-sensors"
            checked={motionSensors}
            onCheckedChange={setMotionSensors}
            data-testid="switch-motion-sensors"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <Label htmlFor="gps-tracking" className="text-base">
              GPS Tracking
            </Label>
          </div>
          <Switch
            id="gps-tracking"
            checked={gpsTracking}
            onCheckedChange={setGpsTracking}
            data-testid="switch-gps"
          />
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full"
            onClick={onDisconnect}
            data-testid="button-disconnect"
          >
            Disconnect Device
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
