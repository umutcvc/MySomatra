import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface HeroSectionProps {
  onConnectClick: () => void;
}

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  connections: number[];
}

export default function HeroSection({ onConnectClick }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const neuronsRef = useRef<Neuron[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const neuronCount = 25;
    const neurons: Neuron[] = [];
    
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        hue: 180 + Math.random() * 60,
        connections: [],
      });
    }
    neuronsRef.current = neurons;

    const connectionDistance = 200;

    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      timeRef.current += 0.01;
      const time = timeRef.current;

      neurons.forEach((neuron, i) => {
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;

        if (neuron.x < 0 || neuron.x > width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > height) neuron.vy *= -1;

        neuron.x = Math.max(0, Math.min(width, neuron.x));
        neuron.y = Math.max(0, Math.min(height, neuron.y));

        const hueShift = Math.sin(time + i * 0.5) * 30;
        const currentHue = neuron.hue + hueShift;

        neurons.forEach((other, j) => {
          if (i >= j) return;
          
          const dx = other.x - neuron.x;
          const dy = other.y - neuron.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const alpha = (1 - distance / connectionDistance) * 0.3;
            
            const gradient = ctx.createLinearGradient(
              neuron.x, neuron.y, other.x, other.y
            );
            gradient.addColorStop(0, `hsla(${currentHue}, 70%, 50%, ${alpha})`);
            gradient.addColorStop(0.5, `hsla(${(currentHue + 30) % 360}, 80%, 60%, ${alpha * 1.5})`);
            gradient.addColorStop(1, `hsla(${other.hue + hueShift}, 70%, 50%, ${alpha})`);
            
            ctx.beginPath();
            ctx.moveTo(neuron.x, neuron.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        const glowSize = neuron.radius + Math.sin(time * 2 + i) * 1;
        
        const glow = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, glowSize * 8
        );
        glow.addColorStop(0, `hsla(${currentHue}, 80%, 60%, 0.8)`);
        glow.addColorStop(0.3, `hsla(${currentHue}, 70%, 50%, 0.3)`);
        glow.addColorStop(1, `hsla(${currentHue}, 60%, 40%, 0)`);
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, glowSize * 8, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${currentHue}, 80%, 70%, 0.9)`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black pointer-events-none" />

      <div className="relative h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <span className="text-sm text-white/70">Neural Therapy Technology</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 tracking-tight leading-tight max-w-5xl">
          Restore Your
          <span className="block text-primary">
            Neural Balance
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl leading-relaxed">
          Advanced wearable therapy using precision vibrations to stimulate your nervous system. 
          Place anywhere on your body for sleep, relaxation, or performance enhancement.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            onClick={onConnectClick}
            className="px-8 py-6 text-lg rounded-full"
            data-testid="button-connect-hero"
          >
            Connect Device
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-lg rounded-full border-white/20 text-white bg-white/5 hover:bg-white/10"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>

        <div className="absolute bottom-12 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/30" />
        </div>
      </div>
    </section>
  );
}
