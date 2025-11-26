import { useEffect, useRef } from "react";

interface SineWaveLogoProps {
  className?: string;
  width?: number;
  height?: number;
  color?: string;
  animated?: boolean;
}

export default function SineWaveLogo({ 
  className = "", 
  width = 40, 
  height = 20,
  color = "#f97316",
  animated = true
}: SineWaveLogoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      const amplitude = height * 0.35;
      const centerY = height / 2;
      const frequency = 2;
      
      for (let x = 0; x <= width; x += 0.5) {
        const normalizedX = x / width;
        const y = centerY + amplitude * Math.sin((normalizedX * frequency * Math.PI * 2) + phaseRef.current);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.stroke();

      ctx.shadowColor = color;
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      if (animated) {
        phaseRef.current += 0.05;
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, color, animated]);

  return (
    <canvas 
      ref={canvasRef}
      className={className}
      style={{ width, height }}
      data-testid="sine-wave-logo"
    />
  );
}

export function SineWaveLogoSVG({ 
  className = "", 
  width = 40, 
  height = 20,
  color = "currentColor"
}: Omit<SineWaveLogoProps, 'animated'>) {
  const amplitude = height * 0.35;
  const centerY = height / 2;
  const frequency = 2;
  
  let pathD = "";
  for (let x = 0; x <= width; x += 1) {
    const normalizedX = x / width;
    const y = centerY + amplitude * Math.sin(normalizedX * frequency * Math.PI * 2);
    
    if (x === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  }

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      data-testid="sine-wave-logo-svg"
    >
      <path 
        d={pathD}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
