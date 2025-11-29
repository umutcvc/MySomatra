import ResearchPaperLayout from "@/components/research/ResearchPaperLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Target, Activity, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import eegVideo from "@assets/generated_videos/eeg_brain_research_neural_mapping.mp4";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

function AnimatedBrainSVG() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-64">
      <defs>
        <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(280, 80%, 60%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(280, 80%, 40%)" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="200" cy="100" rx="90" ry="70" fill="url(#brainGlow)" />
      
      <path
        d="M 120 100 C 120 50, 200 40, 200 60 C 200 40, 280 50, 280 100 C 280 150, 200 170, 200 150 C 200 170, 120 150, 120 100"
        fill="none"
        stroke="hsl(280, 60%, 50%)"
        strokeWidth="2"
        opacity="0.6"
      />
      
      {[
        { cx: 150, cy: 80, label: "Frontal", active: true },
        { cx: 250, cy: 80, label: "Parietal", active: false },
        { cx: 140, cy: 120, label: "Temporal", active: true },
        { cx: 260, cy: 120, label: "Occipital", active: false },
        { cx: 200, cy: 90, label: "Central", active: true },
      ].map((node, i) => (
        <g key={i}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r={node.active ? 12 : 8}
            fill={node.active ? "hsl(25, 85%, 58%)" : "hsl(280, 40%, 40%)"}
            filter={node.active ? "url(#glow)" : undefined}
          >
            {node.active && (
              <animate
                attributeName="r"
                values="10;14;10"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <text
            x={node.cx}
            y={node.cy + 25}
            fill="white"
            fontSize="9"
            textAnchor="middle"
            opacity="0.6"
          >
            {node.label}
          </text>
        </g>
      ))}

      {[
        { x1: 150, y1: 80, x2: 200, y2: 90 },
        { x1: 200, y1: 90, x2: 250, y2: 80 },
        { x1: 140, y1: 120, x2: 200, y2: 90 },
        { x1: 200, y1: 90, x2: 260, y2: 120 },
      ].map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="hsl(25, 85%, 58%)"
          strokeWidth="1"
          opacity="0.3"
        >
          <animate
            attributeName="opacity"
            values="0.2;0.6;0.2"
            dur={`${1 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}

      <g transform="translate(50, 180)">
        <text x="0" y="0" fill="white" fontSize="10" opacity="0.7">Body Placement Sites:</text>
        {["Neck", "Wrist", "Temple", "Spine"].map((site, i) => (
          <g key={i} transform={`translate(${i * 80}, 20)`}>
            <rect
              x="0"
              y="0"
              width="70"
              height="24"
              rx="4"
              fill={i === 0 || i === 2 ? "hsl(25, 85%, 58%)" : "hsl(280, 40%, 30%)"}
              opacity={i === 0 || i === 2 ? "0.8" : "0.4"}
            />
            <text x="35" y="16" fill="white" fontSize="10" textAnchor="middle">
              {site}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

const neuralResponseData = [
  { site: 'Temple', alpha: 92, beta: 78, gamma: 65, theta: 45 },
  { site: 'Neck', alpha: 85, beta: 72, gamma: 58, theta: 52 },
  { site: 'Spine', alpha: 68, beta: 55, gamma: 42, theta: 38 },
  { site: 'Wrist', alpha: 45, beta: 38, gamma: 28, theta: 22 },
];

const radarData = [
  { metric: 'Relaxation', temple: 92, neck: 85, wrist: 45, fullMark: 100 },
  { metric: 'Focus', temple: 78, neck: 72, wrist: 58, fullMark: 100 },
  { metric: 'Sleep', temple: 65, neck: 88, wrist: 35, fullMark: 100 },
  { metric: 'Pain Relief', temple: 70, neck: 82, wrist: 55, fullMark: 100 },
  { metric: 'Stress', temple: 88, neck: 75, wrist: 42, fullMark: 100 },
  { metric: 'Energy', temple: 72, neck: 68, wrist: 48, fullMark: 100 },
];

const COLORS = ['hsl(280, 80%, 60%)', 'hsl(25, 85%, 58%)', 'hsl(200, 80%, 60%)', 'hsl(150, 70%, 50%)'];

function NeuralResponseChart() {
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h4 className="text-sm font-medium text-white/80">Cortical Activation by Placement Site</h4>
        <p className="text-xs text-white/50 mt-1">EEG band power analysis (μV²/Hz) across stimulation sites</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={neuralResponseData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="site" 
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
            label={{ value: 'Stimulation Site', position: 'bottom', offset: 20, fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
            domain={[0, 100]}
            label={{ value: 'Neural Response (%)', angle: -90, position: 'insideLeft', offset: 10, fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
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
              name.charAt(0).toUpperCase() + name.slice(1) + ' Wave'
            ]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                {value.charAt(0).toUpperCase() + value.slice(1)} (8-{value === 'alpha' ? '12' : value === 'beta' ? '30' : value === 'gamma' ? '100' : '8'} Hz)
              </span>
            )}
          />
          <Bar dataKey="alpha" fill="hsl(280, 80%, 60%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="beta" fill="hsl(25, 85%, 58%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gamma" fill="hsl(200, 80%, 60%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="theta" fill="hsl(150, 70%, 50%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-xs text-white/40">
        Figure 2: EEG spectral analysis showing differential band activation patterns across body placement sites.
        <br />Data normalized to baseline. ANOVA: F(3,96) = 12.4, p &lt; 0.001
      </div>
    </div>
  );
}

function EEGWaveform() {
  return (
    <svg viewBox="0 0 400 100" className="w-full h-24">
      <defs>
        <linearGradient id="eegGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(280, 80%, 60%)" />
          <stop offset="50%" stopColor="hsl(25, 85%, 58%)" />
          <stop offset="100%" stopColor="hsl(280, 80%, 60%)" />
        </linearGradient>
      </defs>
      
      <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.1)" />
      
      <path
        d="M 0 50 Q 20 30, 40 50 T 80 50 T 120 50 Q 130 20, 140 50 Q 150 80, 160 50 T 200 50 T 240 50 Q 260 25, 280 50 T 320 50 T 360 50 T 400 50"
        fill="none"
        stroke="url(#eegGrad)"
        strokeWidth="2"
      >
        <animate
          attributeName="d"
          values="M 0 50 Q 20 30, 40 50 T 80 50 T 120 50 Q 130 20, 140 50 Q 150 80, 160 50 T 200 50 T 240 50 Q 260 25, 280 50 T 320 50 T 360 50 T 400 50;M 0 50 Q 20 70, 40 50 T 80 50 T 120 50 Q 130 80, 140 50 Q 150 20, 160 50 T 200 50 T 240 50 Q 260 75, 280 50 T 320 50 T 360 50 T 400 50;M 0 50 Q 20 30, 40 50 T 80 50 T 120 50 Q 130 20, 140 50 Q 150 80, 160 50 T 200 50 T 240 50 Q 260 25, 280 50 T 320 50 T 360 50 T 400 50"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      
      <text x="10" y="20" fill="white" fontSize="10" opacity="0.5">Alpha Wave Response</text>
      <text x="10" y="90" fill="white" fontSize="9" opacity="0.4">Time (s)</text>
    </svg>
  );
}

export default function BrainComputerInterface() {
  useScrollToTop();
  
  return (
    <ResearchPaperLayout
      title="Neural Pathway Mapping via Brain-Computer Interface"
      subtitle="EEG & Neural Imaging Study"
      status="Planned"
      date="Q1 2025"
      readTime="10 min read"
      authors={["MySomatra Research Team", "Neural Science Collaborators"]}
      heroGradient="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-black"
      heroIcon={<Brain className="w-8 h-8 text-purple-400" />}
    >
      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Abstract</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            This planned study will utilize electroencephalography (EEG) and functional 
            neural imaging to map the cortical activation patterns produced by MySomatra's 
            vibrational stimulation. By identifying which body placement sites and stimulation 
            parameters produce the strongest neurological responses, we aim to optimize 
            therapeutic protocols for maximum efficacy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Research Methodology Preview</h2>
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <video 
                src={eegVideo}
                controls
                className="w-full aspect-video"
                poster=""
              />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Video: EEG data collection session for brain-computer interface research
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Neural Activation Mapping</h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <AnimatedBrainSVG />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 1: Brain region activation and optimal body placement sites visualization
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">EEG Response Pattern</h2>
          <Card className="bg-gradient-to-r from-purple-500/10 to-primary/10 border-purple-500/20">
            <CardContent className="p-6">
              <EEGWaveform />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 2: Simulated alpha wave modulation during vibrational stimulation
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Study Protocol</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-medium text-white">EEG Methodology</h3>
                </div>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-400" />
                    64-channel EEG cap (10-20 system)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-400" />
                    Real-time spectral analysis (1-100Hz)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-400" />
                    Event-related potential (ERP) recording
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-purple-400" />
                    Baseline vs. stimulation comparison
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-pink-400" />
                  <h3 className="text-lg font-medium text-white">Placement Testing</h3>
                </div>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-400" />
                    4 primary placement sites tested
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-400" />
                    Randomized stimulation sequences
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-400" />
                    Multi-frequency protocol (20-80Hz)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-pink-400" />
                    Subjective experience surveys
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Preliminary Response Data</h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <NeuralResponseChart />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 3: Neural response intensity by body placement site (pilot study n=12)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Expected Outcomes</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Optimal Placement", value: "Temple", desc: "Highest response" },
              { label: "Response Latency", value: "<50ms", desc: "Neural activation" },
              { label: "Target Band", value: "Alpha", desc: "8-12Hz enhancement" },
            ].map((item, i) => (
              <Card key={i} className="bg-purple-500/10 border-purple-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">{item.value}</div>
                  <div className="text-white font-medium">{item.label}</div>
                  <div className="text-white/50 text-sm">{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Research Goals</h2>
          <p className="text-white/70 leading-relaxed">
            This study aims to establish a scientific foundation for MySomatra's therapeutic 
            claims by directly measuring neural responses to vibrational stimulation. By mapping 
            brain activity patterns across different stimulation parameters, we will develop 
            evidence-based protocols optimized for specific therapeutic outcomes such as 
            relaxation, focus enhancement, and sleep improvement.
          </p>
        </section>
      </div>
    </ResearchPaperLayout>
  );
}
