import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

interface MapWidgetProps {
  className?: string;
}

export default function MapWidget({ className }: MapWidgetProps) {
  // todo: remove mock functionality
  const [currentLocation] = useState({
    lat: 37.7749,
    lng: -122.4194,
    address: "San Francisco, CA"
  });

  const [todayStats] = useState({
    distance: "3.2 km",
    duration: "42 min",
    steps: "4,280"
  });

  return (
    <Card className={className} data-testid="widget-map">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Activity Map</CardTitle>
        <MapPin className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="relative h-48 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden mb-4">
          <div className="absolute inset-0 opacity-50">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <path
                d="M 50 150 Q 100 100 150 120 T 250 80 T 350 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
                strokeDasharray="5,5"
              />
              <circle cx="50" cy="150" r="6" className="fill-green-500" />
              <circle cx="350" cy="100" r="6" className="fill-primary" />
            </svg>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-lg p-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">{currentLocation.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-foreground">{todayStats.distance}</div>
            <div className="text-xs text-muted-foreground">Distance</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{todayStats.duration}</div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-foreground">{todayStats.steps}</div>
            <div className="text-xs text-muted-foreground">Steps</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
