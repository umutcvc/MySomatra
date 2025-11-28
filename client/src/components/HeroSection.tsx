import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import relaxVideo from "@assets/generated_videos/person_relaxing_with_mysomatra_device.mp4";

interface HeroSectionProps {
  onConnectClick: () => void;
}

export default function HeroSection({ onConnectClick }: HeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
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
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const lineCount = 12;
    const lines: { y: number; speed: number; phase: number; thickness: number }[] = [];
    
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        y: (window.innerHeight / (lineCount + 1)) * (i + 1),
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        thickness: 1.5 + Math.random() * 2.5,
      });
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      ctx.clearRect(0, 0, width, height);

      timeRef.current += 0.02;
      const time = timeRef.current;

      lines.forEach((line, i) => {
        const vibrationOffset = Math.sin(time * line.speed + line.phase) * 3;
        const y = line.y + vibrationOffset;
        
        const pulse = 0.15 + Math.sin(time * 1.5 + i * 0.5) * 0.1;
        
        const gradient = ctx.createLinearGradient(0, y, width, y);
        gradient.addColorStop(0, `hsla(25, 85%, 58%, 0)`);
        gradient.addColorStop(0.2, `hsla(25, 85%, 58%, ${pulse * 0.5})`);
        gradient.addColorStop(0.5, `hsla(25, 85%, 65%, ${pulse})`);
        gradient.addColorStop(0.8, `hsla(25, 85%, 58%, ${pulse * 0.5})`);
        gradient.addColorStop(1, `hsla(25, 85%, 58%, 0)`);
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        
        for (let x = 0; x <= width; x += 8) {
          const wave1 = Math.sin(x * 0.015 + time * 2 + line.phase) * 8;
          const wave2 = Math.sin(x * 0.008 + time * 1.5 - line.phase) * 5;
          const wave3 = Math.sin(x * 0.025 + time * 3 + i) * 3;
          const waveY = y + wave1 + wave2 + wave3;
          ctx.lineTo(x, waveY);
        }
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = line.thickness;
        ctx.stroke();
        
        const glowGradient = ctx.createLinearGradient(0, y - 30, 0, y + 30);
        glowGradient.addColorStop(0, `hsla(25, 85%, 58%, 0)`);
        glowGradient.addColorStop(0.5, `hsla(25, 85%, 58%, ${pulse * 0.15})`);
        glowGradient.addColorStop(1, `hsla(25, 85%, 58%, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, y - 30, width, 60);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.4)',
          }}
        >
          <source src={relaxVideo} type="video/mp4" />
        </video>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        style={{ 
          mixBlendMode: 'screen',
        }}
      />

      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none z-20" 
        style={{ opacity: 0.9 }}
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
