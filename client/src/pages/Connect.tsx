import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bluetooth, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import ConnectionStatus from "@/components/ConnectionStatus";
import DeviceSettings from "@/components/DeviceSettings";
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
    
    // Check if Web Bluetooth is supported
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
      // Simulate scanning for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would use:
      // const device = await navigator.bluetooth.requestDevice({
      //   filters: [{ services: ['heart_rate'] }]
      // });
      
      setConnectionState("connecting");
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful connection with mock data
      setDeviceInfo({
        name: "ZenWear Device #4891",
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
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {connectionState === "connected" && deviceInfo ? (
          <div>
            <h1 className="text-4xl font-semibold mb-2 text-foreground">
              Device Connected
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Your ZenWear device is active and ready
            </p>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ConnectionStatus
                  deviceName={deviceInfo.name}
                  batteryLevel={deviceInfo.battery}
                  signalStrength={deviceInfo.signal}
                  lastSync="Just now"
                />
              </div>

              <div className="lg:col-span-2">
                <DeviceSettings onDisconnect={handleDisconnect} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-semibold mb-2 text-center text-foreground">
              Connect Your Device
            </h1>
            <p className="text-lg text-muted-foreground mb-12 text-center">
              Pair your ZenWear device via Bluetooth
            </p>

            <Card data-testid="card-connection-interface">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bluetooth className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Bluetooth Connection</CardTitle>
                <CardDescription>
                  Make sure your device is powered on and within range
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {connectionState === "scanning" && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Scanning for devices...</p>
                  </div>
                )}

                {connectionState === "connecting" && (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Connecting to device...</p>
                  </div>
                )}

                {connectionState === "idle" && (
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleScanDevices}
                      data-testid="button-scan-devices"
                    >
                      <Bluetooth className="w-5 h-5 mr-2" />
                      Scan for Devices
                    </Button>

                    <div className="text-sm text-muted-foreground text-center space-y-2">
                      <p>Requirements:</p>
                      <ul className="space-y-1">
                        <li>• Bluetooth must be enabled on your device</li>
                        <li>• Use Chrome, Edge, or Opera browser</li>
                        <li>• Device must be powered on and nearby</li>
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
