import ResearchPaperLayout from "@/components/research/ResearchPaperLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, Beaker, Ruler, Activity, ChevronRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import labVideo from "@assets/generated_videos/laboratory_vibration_penetration_research.mp4";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart } from 'recharts';

function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

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

const penetrationData = [
  { depth: 0, phantom: 100, underwater: 100, theoretical: 100 },
  { depth: 5, phantom: 85, underwater: 92, theoretical: 88 },
  { depth: 10, phantom: 68, underwater: 82, theoretical: 76 },
  { depth: 15, phantom: 52, underwater: 70, theoretical: 65 },
  { depth: 20, phantom: 38, underwater: 58, theoretical: 54 },
  { depth: 25, phantom: 25, underwater: 45, theoretical: 44 },
  { depth: 30, phantom: 15, underwater: 32, theoretical: 35 },
  { depth: 35, phantom: 8, underwater: 20, theoretical: 27 },
];

function IntensityChart() {
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h4 className="text-sm font-medium text-white/80">Vibration Intensity Attenuation vs. Tissue Depth</h4>
        <p className="text-xs text-white/50 mt-1">Comparative analysis across experimental conditions (n=24 trials per condition)</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={penetrationData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <defs>
            <linearGradient id="phantomGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(25, 85%, 58%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(25, 85%, 58%)" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="underwaterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(200, 80%, 60%)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(200, 80%, 60%)" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="depth" 
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
            label={{ value: 'Tissue Depth (mm)', position: 'bottom', offset: 20, fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
            domain={[0, 100]}
            label={{ value: 'Relative Intensity (%)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.9)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'white' }}
            formatter={(value: number, name: string) => [
              `${value}%`, 
              name === 'phantom' ? 'Phantom Tissue' : name === 'underwater' ? 'Aquatic Medium' : 'Theoretical Model'
            ]}
            labelFormatter={(label) => `Depth: ${label}mm`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                {value === 'phantom' ? 'Phantom Tissue (μ=0.042/mm)' : value === 'underwater' ? 'Aquatic Medium (μ=0.028/mm)' : 'Theoretical Model'}
              </span>
            )}
          />
          <ReferenceLine y={52} stroke="rgba(255,255,255,0.3)" strokeDasharray="5 5" label={{ value: 'Therapeutic Threshold', fill: 'rgba(255,255,255,0.4)', fontSize: 10, position: 'right' }} />
          <Area type="monotone" dataKey="phantom" fill="url(#phantomGradient)" stroke="none" />
          <Area type="monotone" dataKey="underwater" fill="url(#underwaterGradient)" stroke="none" />
          <Line type="monotone" dataKey="theoretical" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          <Line type="monotone" dataKey="phantom" stroke="hsl(25, 85%, 58%)" strokeWidth={3} dot={{ fill: 'hsl(25, 85%, 58%)', r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="underwater" stroke="hsl(200, 80%, 60%)" strokeWidth={3} dot={{ fill: 'hsl(200, 80%, 60%)', r: 4 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-xs text-white/40">
        Figure 1: Intensity attenuation curves showing exponential decay (I = I₀e^(-μd)) across tissue depths.
        <br />Error bars represent ±1 SD. Statistical significance: p &lt; 0.001 for all pairwise comparisons.
      </div>
    </div>
  );
}

export default function VibrationPenetration() {
  useScrollToTop();
  
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
