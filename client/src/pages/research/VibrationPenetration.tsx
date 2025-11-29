import ResearchPaperLayout from "@/components/research/ResearchPaperLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, Beaker, Ruler, Activity, ChevronRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import labVideo from "@assets/generated_videos/lab_phantom_tissue_experiment_setup.mp4";

function AnimatedWaveSVG() {
  return (
    <svg viewBox="0 0 400 200" className="w-full h-48">
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(25, 85%, 58%)" stopOpacity="0.1" />
          <stop offset="50%" stopColor="hsl(25, 85%, 58%)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="hsl(25, 85%, 58%)" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="depthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 80%, 50%)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(220, 80%, 30%)" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      
      <rect x="50" y="40" width="300" height="120" rx="8" fill="url(#depthGrad)" opacity="0.3" />
      <text x="60" y="60" fill="white" fontSize="10" opacity="0.7">Tissue Phantom</text>
      
      <g className="animate-pulse">
        <circle cx="30" cy="100" r="15" fill="hsl(25, 85%, 58%)" opacity="0.8">
          <animate attributeName="r" values="12;18;12" dur="1s" repeatCount="indefinite" />
        </circle>
        <text x="20" y="130" fill="white" fontSize="8" opacity="0.6">Source</text>
      </g>
      
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <path
            d={`M ${80 + i * 60} 60 Q ${95 + i * 60} 100, ${80 + i * 60} 140`}
            stroke="url(#waveGrad)"
            strokeWidth="3"
            fill="none"
            opacity={1 - i * 0.18}
          >
            <animate
              attributeName="d"
              values={`M ${80 + i * 60} 60 Q ${95 + i * 60} 100, ${80 + i * 60} 140;M ${80 + i * 60} 60 Q ${65 + i * 60} 100, ${80 + i * 60} 140;M ${80 + i * 60} 60 Q ${95 + i * 60} 100, ${80 + i * 60} 140`}
              dur={`${0.8 + i * 0.1}s`}
              repeatCount="indefinite"
            />
          </path>
          <text x={75 + i * 60} y="170" fill="white" fontSize="8" opacity="0.5">
            {(i + 1) * 5}mm
          </text>
        </g>
      ))}
      
      <line x1="50" y1="175" x2="350" y2="175" stroke="white" strokeOpacity="0.3" />
      <text x="180" y="190" fill="white" fontSize="9" opacity="0.6">Depth (mm)</text>
    </svg>
  );
}

function IntensityChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = 20 + (height - 60) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }

    const phantomData = [100, 85, 68, 52, 38, 25, 15, 8];
    const underwaterData = [100, 92, 82, 70, 58, 45, 32, 20];

    const drawLine = (data: number[], color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = 50 + (i / (data.length - 1)) * (width - 70);
        const y = 20 + (height - 60) * (1 - val / 100);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawLine(phantomData, 'hsl(25, 85%, 58%)');
    drawLine(underwaterData, 'hsl(200, 80%, 60%)');

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px sans-serif';
    ctx.fillText('100%', 20, 25);
    ctx.fillText('50%', 25, height / 2);
    ctx.fillText('0%', 30, height - 35);
    
    ctx.fillText('0mm', 50, height - 10);
    ctx.fillText('35mm', width - 40, height - 10);
  }, []);

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={400} height={200} className="w-full" />
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-white/60">Phantom</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-xs text-white/60">Underwater</span>
        </div>
      </div>
    </div>
  );
}

export default function VibrationPenetration() {
  return (
    <ResearchPaperLayout
      title="Vibration Penetration Depth Analysis"
      subtitle="Phantom & Underwater Experiments"
      status="In Progress"
      date="November 2024"
      readTime="8 min read"
      authors={["MySomatra Research Team"]}
      heroGradient="bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-black"
      heroIcon={<Waves className="w-8 h-8 text-blue-400" />}
    >
      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Abstract</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            This study investigates the mechanical wave propagation characteristics of MySomatra's 
            therapeutic vibrations through tissue-mimicking phantoms and underwater environments. 
            We quantify the intensity attenuation at varying depths to establish optimal treatment 
            parameters for neural stimulation therapy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Experimental Data Collection</h2>
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <video 
                src={labVideo}
                controls
                className="w-full aspect-video"
                poster=""
              />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Video: Laboratory setup for phantom tissue vibration penetration measurements
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Wave Propagation Model</h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <AnimatedWaveSVG />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 1: Animated visualization of vibration wave propagation through tissue phantom
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Experimental Setup</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Beaker className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-medium text-white">Phantom Experiment</h3>
                </div>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400" />
                    Tissue-mimicking gelatin phantom (acoustic impedance: 1.5 MRayl)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400" />
                    Embedded accelerometers at 5mm depth intervals
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400" />
                    Frequency sweep: 20Hz - 200Hz
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-blue-400" />
                    Temperature controlled: 37°C ± 0.5°C
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/10 to-transparent border-cyan-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">Underwater Experiment</h3>
                </div>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    Saline water tank (0.9% NaCl solution)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    Hydrophone array for pressure mapping
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    Depth range: 0-50mm from source
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-cyan-400" />
                    Baseline noise: {"<"}0.01 m/s²
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Intensity vs. Depth</h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <IntensityChart />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 2: Relative vibration intensity as a function of penetration depth
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Key Findings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Effective Depth", value: "25mm", desc: "Therapeutic threshold" },
              { label: "Peak Frequency", value: "40Hz", desc: "Optimal penetration" },
              { label: "Intensity Retention", value: "52%", desc: "At 15mm depth" },
            ].map((item, i) => (
              <Card key={i} className="bg-primary/10 border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{item.value}</div>
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-white/50 text-sm">{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Conclusion</h2>
          <p className="text-white/70 leading-relaxed">
            Our experimental data demonstrates that MySomatra's vibration therapy achieves 
            meaningful penetration depths of up to 25mm in tissue-equivalent media, with 
            sufficient intensity retention for neural stimulation. The 40Hz frequency band 
            shows optimal characteristics for therapeutic applications, balancing penetration 
            depth with energy efficiency. Underwater experiments confirm enhanced transmission 
            characteristics, supporting the device's effectiveness in various usage conditions.
          </p>
        </section>
      </div>
    </ResearchPaperLayout>
  );
}
