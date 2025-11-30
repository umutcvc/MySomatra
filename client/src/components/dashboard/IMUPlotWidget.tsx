import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, RotateCcw, Crosshair } from "lucide-react";
import { useBluetooth } from "@/hooks/use-bluetooth";
import { useEffect, useRef, useCallback, useState } from "react";

interface IMUPlotWidgetProps {
  className?: string;
}

export default function IMUPlotWidget({ className }: IMUPlotWidgetProps) {
  const { pitchData, pitchHistory, isConnected, calibrateIMU } = useBluetooth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const lastDrawTimeRef = useRef(0);
  const cachedRangeRef = useRef({ min: -90, max: 90, lastMin: 0, lastMax: 0 });
  const FRAME_INTERVAL = 1000 / 60; // 60fps for smooth animation

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: false,  // No transparency = faster
      desynchronized: true // Allow browser to optimize
    });
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

    // Clear background
    ctx.fillStyle = 'hsl(240, 10%, 10%)';
    ctx.fillRect(0, 0, width, height);

    // Dynamic scaling based on actual data range (with smart caching)
    let maxPitch = 90;
    let minPitch = -90;

    if (pitchHistory.length > 1) {
      const pitches = pitchHistory.map(p => p.pitch);
      const dataMax = Math.max(...pitches);
      const dataMin = Math.min(...pitches);

      // Only recalculate if min/max actually changed (not just length)
      if (dataMin !== cachedRangeRef.current.lastMin || dataMax !== cachedRangeRef.current.lastMax) {
        // Add 10% padding to the range
        const range = Math.max(10, dataMax - dataMin);
        const padding = range * 0.1;
        maxPitch = dataMax + padding;
        minPitch = dataMin - padding;

        // Cache the results
        cachedRangeRef.current = { min: minPitch, max: maxPitch, lastMin: dataMin, lastMax: dataMax };
      } else {
        // Use cached values
        minPitch = cachedRangeRef.current.min;
        maxPitch = cachedRangeRef.current.max;
      }
    }

    const pitchRange = maxPitch - minPitch;
    const zeroY = height - ((0 - minPitch) / pitchRange * height);

    // Draw zero line if in range
    if (zeroY >= 0 && zeroY <= height) {
      ctx.strokeStyle = 'hsl(240, 10%, 30%)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(width, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw axis labels
    ctx.fillStyle = 'hsl(240, 10%, 50%)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${maxPitch.toFixed(0)}°`, 6, 14);
    if (zeroY >= 14 && zeroY <= height - 6) {
      ctx.fillText('0°', 6, zeroY - 4);
    }
    ctx.fillText(`${minPitch.toFixed(0)}°`, 6, height - 6);

    if (pitchHistory.length > 1) {
      // Decimate points if too many (only draw every Nth point for performance)
      const maxPoints = 200;
      const step = Math.max(1, Math.floor(pitchHistory.length / maxPoints));

      // Orange color matching the interface (primary color)
      ctx.strokeStyle = 'hsl(25, 85%, 58%)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      for (let i = 0; i < pitchHistory.length; i += step) {
        const x = (i / (pitchHistory.length - 1)) * width;
        const normalizedPitch = (pitchHistory[i].pitch - minPitch) / pitchRange;
        const y = height - (normalizedPitch * height);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Ensure we always draw the last point
      if (pitchHistory.length > maxPoints) {
        const lastIdx = pitchHistory.length - 1;
        const x = width;
        const normalizedPitch = (pitchHistory[lastIdx].pitch - minPitch) / pitchRange;
        const y = height - (normalizedPitch * height);
        ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Simplified gradient (less GPU work)
      const gradient = ctx.createLinearGradient(0, height * 0.3, 0, height);
      gradient.addColorStop(0, 'hsla(25, 85%, 58%, 0.15)');
      gradient.addColorStop(1, 'hsla(25, 85%, 58%, 0.05)');

      ctx.fillStyle = gradient;
      ctx.beginPath();

      for (let i = 0; i < pitchHistory.length; i += step) {
        const x = (i / (pitchHistory.length - 1)) * width;
        const normalizedPitch = (pitchHistory[i].pitch - minPitch) / pitchRange;
        const y = height - (normalizedPitch * height);

        if (i === 0) {
          ctx.moveTo(x, height);
          ctx.lineTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Close path to baseline
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Current position indicator
      if (pitchHistory.length > 0) {
        const lastPitch = pitchHistory[pitchHistory.length - 1];
        const lastNormalized = (lastPitch.pitch - minPitch) / pitchRange;
        const lastY = height - (lastNormalized * height);

        // Orange dot at current position
        ctx.fillStyle = 'hsl(25, 85%, 58%)';
        ctx.beginPath();
        ctx.arc(width - 2, lastY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Orange glow around dot
        ctx.strokeStyle = 'hsla(25, 85%, 68%, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(width - 2, lastY, 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [pitchHistory]);

  useEffect(() => {
    let running = true;

    const animate = (timestamp: number) => {
      if (!running) return;

      // Throttle to 30fps for better performance
      if (timestamp - lastDrawTimeRef.current >= FRAME_INTERVAL) {
        draw();
        lastDrawTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [draw, FRAME_INTERVAL]);

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
    setIsCalibrating(true);
    setCountdown(3);

    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Send calibration command
    await calibrateIMU(3000);

    // Clean up after calibration
    setTimeout(() => {
      setIsCalibrating(false);
      setCountdown(0);
    }, 3000);
  };

  const currentPitch = pitchData?.pitch ?? 0;

  return (
    <Card className={`${className} flex flex-col overflow-hidden`} data-testid="widget-imu-plot">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2 flex-shrink-0">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          IMU Pitch Angle
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Live' : 'Offline'}
          </span>
          <span className="text-xl font-bold font-mono text-foreground">
            {currentPitch.toFixed(1)}°
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-border flex-1 min-h-0">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            data-testid="canvas-pitch-plot"
          />

          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="text-center">
                <Crosshair className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Connect device for live data</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            {pitchHistory.length} samples
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCalibrate}
            disabled={!isConnected || isCalibrating}
            data-testid="button-calibrate-imu"
            className={isCalibrating ? 'animate-pulse' : ''}
          >
            <RotateCcw className={`w-4 h-4 mr-1 ${isCalibrating ? 'animate-spin' : ''}`} />
            {isCalibrating ? `${countdown}s...` : 'Calibrate Zero'}
          </Button>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-center flex-shrink-0">
          <div className="p-2 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground">Min</div>
            <div className="text-sm font-medium font-mono text-foreground">
              {pitchHistory.length > 0
                ? Math.min(...pitchHistory.map(p => p.pitch)).toFixed(1) + '°'
                : '--'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="text-sm font-medium font-mono text-primary">
              {currentPitch.toFixed(1)}°
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30">
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
