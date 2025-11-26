import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bluetooth, Loader2, LayoutDashboard } from "lucide-react";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import ConnectionStatus from "@/components/ConnectionStatus";
import DeviceSettings from "@/components/DeviceSettings";
import MapWidget from "@/components/dashboard/MapWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import JournalWidget from "@/components/dashboard/JournalWidget";
import TasksWidget from "@/components/dashboard/TasksWidget";
import ActivityWidget from "@/components/dashboard/ActivityWidget";
import TherapyWidget from "@/components/dashboard/TherapyWidget";
import { useToast } from "@/hooks/use-toast";

type ConnectionState = "idle" | "scanning" | "connecting" | "connected";

export default function Connect() {
  const [, setLocation] = useLocation();
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [deviceInfo, setDeviceInfo] = useState<{
    name: string;
    battery: number;
    signal: number;
  } | null>(null);
  const { toast } = useToast();

  const handleScanDevices = async () => {
    setConnectionState("scanning");
    
    if (!('bluetooth' in navigator)) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.",
        variant: "destructive",
      });
      setConnectionState("idle");
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setConnectionState("connecting");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // todo: remove mock functionality - connect to real device
      setDeviceInfo({
        name: "ZenWear Neural #4891",
        battery: 78,
        signal: 85,
      });
      setConnectionState("connected");
      
      toast({
        title: "Device Connected",
        description: "Your ZenWear device is now connected and ready to use.",
      });
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to device. Please try again.",
        variant: "destructive",
      });
      setConnectionState("idle");
    }
  };

  const handleDisconnect = () => {
    setDeviceInfo(null);
    setConnectionState("idle");
    toast({
      title: "Device Disconnected",
      description: "Your device has been disconnected.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-xl font-semibold text-foreground">
              {connectionState === "connected" ? (
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  Dashboard
                </span>
              ) : (
                "Connect Device"
              )}
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {connectionState === "connected" && deviceInfo ? (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ConnectionStatus
                  deviceName={deviceInfo.name}
                  batteryLevel={deviceInfo.battery}
                  signalStrength={deviceInfo.signal}
                  lastSync="Just now"
                />
              </div>

              <div className="lg:col-span-1">
                <TherapyWidget />
              </div>

              <div className="lg:col-span-2">
                <MapWidget />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ActivityWidget />
              </div>
              <div className="lg:col-span-1">
                <CalendarWidget />
              </div>
              <div className="lg:col-span-1">
                <TasksWidget />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <JournalWidget />
              <DeviceSettings onDisconnect={handleDisconnect} />
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto pt-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground tracking-tight">
                Connect Your Device
              </h1>
              <p className="text-lg text-muted-foreground">
                Pair your ZenWear neural therapy device via Bluetooth
              </p>
            </div>

            <Card className="border-2" data-testid="card-connection-interface">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Bluetooth className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">Bluetooth Connection</CardTitle>
                <CardDescription className="text-base">
                  Make sure your device is powered on and within range
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {connectionState === "scanning" && (
                  <div className="text-center py-12">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <Bluetooth className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Scanning for devices...</p>
                  </div>
                )}

                {connectionState === "connecting" && (
                  <div className="text-center py-12">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
                      <Bluetooth className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Connecting to device...</p>
                  </div>
                )}

                {connectionState === "idle" && (
                  <div className="space-y-6">
                    <Button
                      size="lg"
                      className="w-full py-6 text-lg rounded-xl"
                      onClick={handleScanDevices}
                      data-testid="button-scan-devices"
                    >
                      <Bluetooth className="w-5 h-5 mr-2" />
                      Scan for Devices
                    </Button>

                    <div className="bg-muted/50 rounded-xl p-6">
                      <h4 className="font-medium text-foreground mb-3">Before connecting:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                          Ensure Bluetooth is enabled on your computer or phone
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                          Use Chrome, Edge, or Opera browser (Safari not supported)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                          Power on your ZenWear device and hold it nearby
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
