import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bluetooth, LayoutDashboard, Power } from "lucide-react";
import { useLocation } from "wouter";
import ConnectionStatus from "@/components/ConnectionStatus";
import MapWidget from "@/components/dashboard/MapWidget";
import CalendarWidget from "@/components/dashboard/CalendarWidget";
import JournalWidget from "@/components/dashboard/JournalWidget";
import TasksWidget from "@/components/dashboard/TasksWidget";
import TherapyWidget from "@/components/dashboard/TherapyWidget";
import IMUPlotWidget from "@/components/dashboard/IMUPlotWidget";
import { ActivityTrainingWidget } from "@/components/dashboard/ActivityTrainingWidget";
import { useToast } from "@/hooks/use-toast";
import { useBluetooth } from "@/hooks/use-bluetooth";

export default function Connect() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const {
    isSupported,
    isConnecting,
    isConnected,
    device,
    batteryLevel,
    pitchHistory,
    error,
    scanAndConnect,
    disconnect,
  } = useBluetooth();

  const handleScanDevices = async () => {
    if (!isSupported) {
      toast({
        title: "Bluetooth Not Supported",
        description: "Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await scanAndConnect();
      
      if (success) {
        toast({
          title: "Device Connected",
          description: `Connected to ${device?.name || 'your device'}. Ready to use.`,
        });
      } else if (error) {
        toast({
          title: "Connection Issue",
          description: error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Connection error:', err);
      toast({
        title: "Connection Failed",
        description: "Unable to connect to device. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
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
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                  Dashboard
                </span>
              ) : (
                "Connect Device"
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isConnected && device ? (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1">
                <ConnectionStatus
                  deviceName={device.name}
                  batteryLevel={batteryLevel || 0}
                  signalStrength={85}
                  lastSync="Just now"
                  className="h-[380px]"
                />
              </div>

              <div className="lg:col-span-1">
                <TherapyWidget className="h-[380px]" />
              </div>

              <div className="lg:col-span-2">
                <IMUPlotWidget className="h-[380px]" />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="h-full overflow-hidden" data-testid="card-activity-training">
                  <CardContent className="p-6 h-full overflow-y-auto">
                    <ActivityTrainingWidget 
                      isConnected={isConnected}
                      isStreaming={pitchHistory.length > 0}
                      pitchHistory={pitchHistory}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1 flex flex-col gap-4">
                <CalendarWidget className="flex-1" />
                <TasksWidget className="flex-1" />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <MapWidget className="h-[380px]" />
              <JournalWidget className="h-[380px]" />
            </div>
            
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleDisconnect}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                data-testid="button-disconnect"
              >
                <Power className="w-4 h-4 mr-2" />
                Disconnect Device
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto pt-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-foreground tracking-tight">
                Connect Your Device
              </h1>
              <p className="text-lg text-muted-foreground">
                Pair your neural therapy device via Bluetooth
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
                {isConnecting && (
                  <div className="text-center py-12">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <Bluetooth className="absolute inset-0 m-auto w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Connecting to device...</p>
                  </div>
                )}

                {!isConnecting && (
                  <div className="space-y-6">
                    <Button
                      size="lg"
                      className="w-full py-6 text-lg rounded-xl"
                      onClick={handleScanDevices}
                      disabled={isConnecting}
                      data-testid="button-scan-devices"
                    >
                      <Bluetooth className="w-5 h-5 mr-2" />
                      Scan for Devices
                    </Button>

                    {!isSupported && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
                        <p className="text-sm text-destructive">
                          Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera on desktop.
                        </p>
                      </div>
                    )}

                    <div className="bg-muted/50 rounded-xl p-6">
                      <h4 className="font-medium text-foreground mb-3">Before connecting:</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                          Ensure Bluetooth is enabled on your computer
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                          Use Chrome, Edge, or Opera browser (Safari not supported)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                          Power on your device - look for "DevOpBreadBoard" in the list
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <h4 className="font-medium text-foreground mb-2 text-sm">Device Commands</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground font-mono">
                        <div>PWM,freq,duty</div>
                        <div className="text-right">Start vibration</div>
                        <div>STOP</div>
                        <div className="text-right">Stop vibration</div>
                        <div>CAL,3000</div>
                        <div className="text-right">Calibrate IMU (3s)</div>
                        <div>STREAM,ON/OFF</div>
                        <div className="text-right">Toggle data stream</div>
                      </div>
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
