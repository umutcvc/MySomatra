import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Signal, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ConnectionStatusProps {
  deviceName: string;
  batteryLevel: number;
  signalStrength: number;
  lastSync: string;
  className?: string;
}

export default function ConnectionStatus({
  deviceName,
  batteryLevel,
  signalStrength,
  lastSync,
  className
}: ConnectionStatusProps) {
  const getSignalBars = (strength: number) => {
    if (strength >= 80) return 4;
    if (strength >= 60) return 3;
    if (strength >= 40) return 2;
    return 1;
  };

  return (
    <Card className={className} data-testid="card-connection-status">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Device Status</CardTitle>
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" data-testid="badge-connected">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Device Name</div>
          <div className="font-medium text-foreground" data-testid="text-device-name">{deviceName}</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Battery className="w-4 h-4" />
              <span>Battery Level</span>
            </div>
            <span className="text-sm font-medium text-foreground" data-testid="text-battery-level">{batteryLevel}%</span>
          </div>
          <Progress value={batteryLevel} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Signal className="w-4 h-4" />
              <span>Signal Strength</span>
            </div>
            <div className="flex gap-1" data-testid="signal-bars">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-full ${
                    bar <= getSignalBars(signalStrength)
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                  style={{ height: `${bar * 4}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span>Last Sync</span>
          </div>
          <div className="text-sm font-medium text-foreground" data-testid="text-last-sync">{lastSync}</div>
        </div>
      </CardContent>
    </Card>
  );
}
