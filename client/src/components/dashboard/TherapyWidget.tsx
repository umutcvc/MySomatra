import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves, Play, Pause, Moon, Wind, Brain, Zap, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useBluetooth } from "@/hooks/use-bluetooth";

interface TherapyWidgetProps {
  className?: string;
}

const modes = [
  { id: "relax", name: "Relax", icon: Wind, color: "bg-blue-500" },
  { id: "sleep", name: "Sleep", icon: Moon, color: "bg-indigo-500" },
  { id: "focus", name: "Focus", icon: Brain, color: "bg-emerald-500" },
  { id: "hype", name: "Hype", icon: Zap, color: "bg-orange-500" },
  { id: "meditate", name: "Meditate", icon: Sparkles, color: "bg-violet-500" },
  { id: "recovery", name: "Recover", icon: Heart, color: "bg-rose-500" },
];

export default function TherapyWidget({ className }: TherapyWidgetProps) {
  const [activeMode, setActiveMode] = useState("relax");
  const [isPlaying, setIsPlaying] = useState(false);
  const [intensity, setIntensity] = useState([65]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { startTherapy, stopTherapy, isConnected } = useBluetooth();

  const startSessionMutation = useMutation({
    mutationFn: async (data: { mode: string; intensity: number; duration: number }) => {
      const res = await apiRequest('POST', '/api/therapy-sessions', data);
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/therapy-sessions'] });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('PATCH', `/api/therapy-sessions/${id}/end`);
    },
    onSuccess: () => {
      setSessionId(null);
      setElapsedTime(0);
      queryClient.invalidateQueries({ queryKey: ['/api/therapy-sessions'] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await stopTherapy();
      if (sessionId) {
        endSessionMutation.mutate(sessionId);
      }
      setIsPlaying(false);
    } else {
      await startTherapy(activeMode, intensity[0]);
      startSessionMutation.mutate({
        mode: activeMode,
        intensity: intensity[0],
        duration: 0,
      });
      setIsPlaying(true);
    }
  };

  const handleModeChange = async (modeId: string) => {
    setActiveMode(modeId);
    if (isPlaying) {
      await startTherapy(modeId, intensity[0]);
    }
  };

  const handleIntensityChange = async (newIntensity: number[]) => {
    setIntensity(newIntensity);
    if (isPlaying) {
      await startTherapy(activeMode, newIntensity[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMode = modes.find(m => m.id === activeMode)!;
  const CurrentIcon = currentMode.icon;

  return (
    <Card className={className} data-testid="widget-therapy">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Neural Therapy</CardTitle>
        <Waves className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-center mb-6">
          <div className={`inline-flex p-4 rounded-full ${currentMode.color} mb-3 ${isPlaying ? 'animate-pulse' : ''}`}>
            <CurrentIcon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-medium text-foreground">{currentMode.name} Mode</h3>
          <p className="text-sm text-muted-foreground">
            {isPlaying ? `Session: ${formatTime(elapsedTime)}` : 'Tap play to start'}
          </p>
          {!isConnected && (
            <p className="text-xs text-orange-500 mt-1">Device not connected - simulating</p>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <Button
            size="lg"
            className={`w-16 h-16 rounded-full ${isPlaying ? 'bg-destructive hover:bg-destructive/90' : ''}`}
            onClick={handlePlayPause}
            data-testid="button-play-pause"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Intensity</span>
            <span className="text-sm font-medium text-foreground">{intensity[0]}%</span>
          </div>
          <Slider
            value={intensity}
            onValueChange={handleIntensityChange}
            max={100}
            step={5}
            data-testid="slider-intensity"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant={activeMode === mode.id ? "default" : "outline"}
                size="sm"
                className="flex-col h-auto py-2 gap-1"
                onClick={() => handleModeChange(mode.id)}
                data-testid={`button-mode-${mode.id}`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{mode.name}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
