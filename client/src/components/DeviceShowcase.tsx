import { Brain, Zap, Activity, MapPin, Moon, Sparkles, Heart, Wind } from "lucide-react";
import { useState } from "react";
import { ScrollFade } from "@/components/ScrollFade";
import deviceImage from "@assets/generated_images/3d_mysomatra_device_circular_design.png";

const modes = [
  {
    id: "relax",
    name: "Relax",
    icon: Wind,
    color: "from-blue-500 to-cyan-500",
    description: "Gentle waves for stress relief",
    frequency: "4-8 Hz Delta",
  },
  {
    id: "sleep",
    name: "Sleep",
    icon: Moon,
    color: "from-indigo-500 to-purple-500",
    description: "Deep calming pulses for rest",
    frequency: "0.5-4 Hz Theta",
  },
  {
    id: "focus",
    name: "Focus",
    icon: Brain,
    color: "from-emerald-500 to-teal-500",
    description: "Sharp patterns for concentration",
    frequency: "12-30 Hz Beta",
  },
  {
    id: "hype",
    name: "Hype",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    description: "Energizing bursts for motivation",
    frequency: "30-100 Hz Gamma",
  },
  {
    id: "meditate",
    name: "Meditate",
    icon: Sparkles,
    color: "from-violet-500 to-pink-500",
    description: "Rhythmic patterns for mindfulness",
    frequency: "8-12 Hz Alpha",
  },
  {
    id: "recovery",
    name: "Recovery",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    description: "Soothing vibrations for healing",
    frequency: "2-6 Hz Delta",
  },
];

const features = [
  { icon: Brain, label: "Neural Therapy" },
  { icon: Zap, label: "Smart Vibration" },
  { icon: Activity, label: "TinyML Activity AI" },
  { icon: MapPin, label: "GPS Tracking" },
];

interface DeviceShowcaseProps {
  selectedMode?: string;
  onModeSelect?: (mode: string) => void;
}

export default function DeviceShowcase({ selectedMode, onModeSelect }: DeviceShowcaseProps) {
  const [activeMode, setActiveMode] = useState(selectedMode || "relax");

  const handleSelect = (modeId: string) => {
    setActiveMode(modeId);
    onModeSelect?.(modeId);
  };

  return (
    <section className="py-24 px-6 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <ScrollFade direction="left" delay={0} duration={0.8}>
            <div className="relative flex flex-col items-center">
              <div className="relative">
                <div 
                  className="absolute inset-0 blur-3xl opacity-30"
                  style={{
                    background: 'radial-gradient(circle at center, hsl(25, 85%, 50%) 0%, transparent 70%)',
                  }}
                />
                <img
                  src={deviceImage}
                  alt="MySomatra Neural Therapy Device"
                  className="relative z-10 w-full max-w-[320px] mx-auto"
                  style={{
                    animation: 'float 6s ease-in-out infinite',
                    filter: 'drop-shadow(0 25px 50px rgba(249, 115, 22, 0.15))',
                  }}
                />
                <style>
                  {`@keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                  }`}
                </style>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-10">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                      data-testid={`badge-feature-${index}`}
                    >
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm text-white/70">{feature.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollFade>

          <ScrollFade direction="right" delay={0.15} duration={0.8}>
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-white tracking-tight">
                Wear It Your Way
              </h2>
              <p className="text-lg text-white/50 mb-10 leading-relaxed">
                Place anywhere on your body — neck for vagus nerve stimulation, 
                chest for breathing, or any pressure point for targeted therapy.
              </p>

              <div className="space-y-5">
                {[
                  { title: "Vagus Nerve", desc: "Place on neck for deep relaxation" },
                  { title: "Pressure Points", desc: "Target specific body areas" },
                  { title: "Activity Zones", desc: "Wear during workouts" },
                ].map((item, i) => (
                  <ScrollFade key={i} direction="up" delay={0.2 + i * 0.1} duration={0.6}>
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-white">{item.title}</span>
                        <span className="text-white/40 ml-2">— {item.desc}</span>
                      </div>
                    </div>
                  </ScrollFade>
                ))}
              </div>
            </div>
          </ScrollFade>
        </div>

        <ScrollFade direction="up" delay={0} duration={0.7}>
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-semibold mb-4 text-white tracking-tight">
              Choose Your State
            </h3>
            <p className="text-lg text-white/40 max-w-xl mx-auto">
              Neural-tuned vibration patterns for every moment
            </p>
          </div>
        </ScrollFade>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <ScrollFade 
                key={mode.id} 
                direction="up" 
                delay={0.05 * index} 
                duration={0.5}
              >
                <div
                  className={`cursor-pointer transition-all duration-300 rounded-2xl p-5 border ${
                    isActive 
                      ? 'bg-white/10 border-primary/50' 
                      : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                  }`}
                  onClick={() => handleSelect(mode.id)}
                  data-testid={`card-mode-${mode.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${mode.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-white">
                        {mode.name}
                      </h4>
                      <p className="text-sm text-white/40">
                        {mode.description}
                      </p>
                    </div>
                    <div className="text-xs text-primary/80 font-medium">
                      {mode.frequency}
                    </div>
                  </div>
                </div>
              </ScrollFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
