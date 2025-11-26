import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, Signal, Clock, Bluetooth, Smartphone } from "lucide-react";
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

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-emerald-500";
    if (level > 20) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <Card className={`${className} flex flex-col overflow-hidden`} data-testid="card-connection-status">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-primary" />
            Device Status
          </CardTitle>
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20" data-testid="badge-connected">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            Connected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-hidden">
        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Device Name</div>
              <div className="font-medium text-foreground" data-testid="text-device-name">{deviceName}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Battery className={`w-4 h-4 ${getBatteryColor(batteryLevel)}`} />
              <span>Battery Level</span>
            </div>
            <span className={`text-sm font-medium ${getBatteryColor(batteryLevel)}`} data-testid="text-battery-level">{batteryLevel}%</span>
          </div>
          <Progress value={batteryLevel} className="h-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Signal className="w-4 h-4 text-primary" />
              <span>Signal Strength</span>
            </div>
            <div className="flex gap-0.5 items-end" data-testid="signal-bars">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-1.5 rounded-sm transition-colors ${
                    bar <= getSignalBars(signalStrength)
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                  style={{ height: `${bar * 4 + 2}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span>Last Sync</span>
          </div>
          <div className="text-sm font-medium text-foreground" data-testid="text-last-sync">{lastSync}</div>
        </div>
      </CardContent>
    </Card>
  );
}
