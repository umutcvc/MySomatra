import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RotateCcw, Crosshair } from "lucide-react";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { useEffect, useRef, useCallback } from "react";

interface IMUPlotWidgetProps {
  className?: string;
}

export default function IMUPlotWidget({ className }: IMUPlotWidgetProps) {
  const { pitchData, pitchHistory, isConnected, calibrateIMU } = useBluetooth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;
    
    ctx.fillStyle = 'hsl(240, 10%, 10%)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'hsl(240, 10%, 20%)';
    ctx.lineWidth = 1;
    
    const gridLines = 8;
    for (let i = 1; i < gridLines; i++) {
      const y = (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    for (let i = 1; i < 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = 'hsl(240, 10%, 30%)';
    ctx.lineWidth = 2;
    const centerY = height / 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    ctx.fillStyle = 'hsl(240, 10%, 40%)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('+90°', 4, 14);
    ctx.fillText('0°', 4, centerY - 4);
    ctx.fillText('-90°', 4, height - 4);

    if (pitchHistory.length > 1) {
      ctx.strokeStyle = 'hsl(142, 76%, 50%)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      const maxPitch = 90;
      const minPitch = -90;
      const pitchRange = maxPitch - minPitch;
      
      for (let i = 0; i < pitchHistory.length; i++) {
        const x = (i / (pitchHistory.length - 1)) * width;
        const normalizedPitch = (pitchHistory[i].pitch - minPitch) / pitchRange;
        const y = height - (normalizedPitch * height);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'hsla(142, 76%, 50%, 0.3)');
      gradient.addColorStop(0.5, 'hsla(142, 76%, 50%, 0.1)');
      gradient.addColorStop(1, 'hsla(142, 76%, 50%, 0.3)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      for (let i = 0; i < pitchHistory.length; i++) {
        const x = (i / (pitchHistory.length - 1)) * width;
        const normalizedPitch = (pitchHistory[i].pitch - minPitch) / pitchRange;
        const y = height - (normalizedPitch * height);
        
        if (i === 0) {
          ctx.moveTo(x, centerY);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      const lastX = width;
      ctx.lineTo(lastX, centerY);
      ctx.closePath();
      ctx.fill();

      if (pitchHistory.length > 0) {
        const lastPitch = pitchHistory[pitchHistory.length - 1];
        const lastNormalized = (lastPitch.pitch - minPitch) / pitchRange;
        const lastY = height - (lastNormalized * height);
        
        ctx.fillStyle = 'hsl(142, 76%, 50%)';
        ctx.beginPath();
        ctx.arc(width - 2, lastY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'hsla(142, 76%, 70%, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width - 2, lastY, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [pitchHistory]);

  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) return;
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      draw();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  const handleCalibrate = async () => {
    await calibrateIMU(3000);
  };

  const currentPitch = pitchData?.pitch ?? 0;

  return (
    <Card className={className} data-testid="widget-imu-plot">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-base font-medium">IMU Pitch Angle</CardTitle>
        <Activity className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live' : 'Not connected'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {currentPitch.toFixed(1)}°
            </span>
          </div>
        </div>

        <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-border">
          <canvas 
            ref={canvasRef}
            className="w-full"
            style={{ height: '180px' }}
            data-testid="canvas-pitch-plot"
          />
          
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <Crosshair className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connect device to see live data</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">
            {pitchHistory.length} samples
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCalibrate}
            disabled={!isConnected}
            data-testid="button-calibrate-imu"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Calibrate Zero
          </Button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Min</div>
            <div className="text-sm font-medium font-mono text-foreground">
              {pitchHistory.length > 0 
                ? Math.min(...pitchHistory.map(p => p.pitch)).toFixed(1) + '°'
                : '--'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="text-sm font-medium font-mono text-foreground">
              {currentPitch.toFixed(1)}°
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Max</div>
            <div className="text-sm font-medium font-mono text-foreground">
              {pitchHistory.length > 0 
                ? Math.max(...pitchHistory.map(p => p.pitch)).toFixed(1) + '°'
                : '--'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
