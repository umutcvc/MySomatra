import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import relaxVideo from "@assets/generated_videos/person_relaxing_with_mysomatra_device.mp4";

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
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fadeStart = windowHeight * 0.2;
      const fadeEnd = windowHeight * 0.7;
      
      if (scrollY < fadeStart) {
        setScrollOpacity(1);
      } else if (scrollY > fadeEnd) {
        setScrollOpacity(0);
      } else {
        setScrollOpacity(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth * 0.6;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const neuronCount = 35;
    const neurons: Neuron[] = [];
    const canvasWidth = window.innerWidth * 0.6;
    const canvasHeight = window.innerHeight;
    
    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 3 + 2,
        hue: 15 + Math.random() * 25,
        connections: [],
      });
    }
    neuronsRef.current = neurons;

    const connectionDistance = 220;

    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = window.innerWidth * 0.6;
      const height = window.innerHeight;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      timeRef.current += 0.006;
      const time = timeRef.current;

      neurons.forEach((neuron, i) => {
        neuron.x += neuron.vx + Math.sin(time * 0.5 + i) * 0.1;
        neuron.y += neuron.vy + Math.cos(time * 0.5 + i) * 0.1;

        if (neuron.x < 0 || neuron.x > width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > height) neuron.vy *= -1;

        neuron.x = Math.max(0, Math.min(width, neuron.x));
        neuron.y = Math.max(0, Math.min(height, neuron.y));

        const hueShift = Math.sin(time + i * 0.2) * 10;
        const currentHue = neuron.hue + hueShift;

        neurons.forEach((other, j) => {
          if (i >= j) return;
          
          const dx = other.x - neuron.x;
          const dy = other.y - neuron.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const alpha = Math.pow(1 - distance / connectionDistance, 1.5) * 0.5;
            const pulse = 0.8 + Math.sin(time * 3 + (i + j) * 0.1) * 0.2;
            
            const gradient = ctx.createLinearGradient(
              neuron.x, neuron.y, other.x, other.y
            );
            gradient.addColorStop(0, `hsla(${currentHue}, 80%, 60%, ${alpha * pulse})`);
            gradient.addColorStop(0.5, `hsla(${(currentHue + 8) % 360}, 85%, 70%, ${alpha * pulse * 1.2})`);
            gradient.addColorStop(1, `hsla(${other.hue + hueShift}, 80%, 60%, ${alpha * pulse})`);
            
            ctx.beginPath();
            ctx.moveTo(neuron.x, neuron.y);
            
            const midX = (neuron.x + other.x) / 2 + Math.sin(time * 2 + i) * 5;
            const midY = (neuron.y + other.y) / 2 + Math.cos(time * 2 + j) * 5;
            ctx.quadraticCurveTo(midX, midY, other.x, other.y);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.2 + alpha;
            ctx.stroke();
          }
        });

        const glowSize = neuron.radius + Math.sin(time * 1.5 + i) * 1.5;
        const pulseIntensity = 0.7 + Math.sin(time * 2.5 + i * 0.5) * 0.3;
        
        const outerGlow = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, glowSize * 15
        );
        outerGlow.addColorStop(0, `hsla(${currentHue}, 85%, 70%, ${0.8 * pulseIntensity})`);
        outerGlow.addColorStop(0.15, `hsla(${currentHue}, 80%, 60%, ${0.35 * pulseIntensity})`);
        outerGlow.addColorStop(0.4, `hsla(${currentHue}, 75%, 50%, ${0.12 * pulseIntensity})`);
        outerGlow.addColorStop(0.7, `hsla(${currentHue}, 70%, 45%, ${0.04 * pulseIntensity})`);
        outerGlow.addColorStop(1, `hsla(${currentHue}, 65%, 40%, 0)`);
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, glowSize * 15, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        const coreGlow = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, glowSize * 2
        );
        coreGlow.addColorStop(0, `hsla(${currentHue}, 95%, 90%, 1)`);
        coreGlow.addColorStop(0.4, `hsla(${currentHue}, 90%, 75%, 0.9)`);
        coreGlow.addColorStop(1, `hsla(${currentHue}, 85%, 65%, 0)`);
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, glowSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = coreGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, glowSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${currentHue}, 100%, 95%, 1)`;
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
        className="absolute left-0 top-0 h-full"
        style={{ 
          opacity: 0.8,
          width: '60%',
        }}
      />

      <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to right, black 0%, transparent 40%), linear-gradient(to bottom, transparent 70%, black 100%)',
          }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'blur(1px) brightness(0.85)',
            opacity: 0.75,
          }}
        >
          <source src={relaxVideo} type="video/mp4" />
        </video>
      </div>

      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-20" 
        style={{ opacity: 0.8 }}
      />

      <div 
        className="relative z-30 h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
          opacity: scrollOpacity,
          transform: `translateY(${(1 - scrollOpacity) * 30}px)`,
          transition: 'opacity 0.1s ease-out, transform 0.1s ease-out',
        }}
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
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
          Experience deep relaxation, better sleep, and enhanced focus.
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
            className="px-8 py-6 text-lg rounded-full border-white/20 text-white bg-white/5 backdrop-blur-sm hover:bg-white/10"
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
