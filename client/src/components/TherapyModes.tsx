import { Card, CardContent } from "@/components/ui/card";
import { Moon, Sparkles, Zap, Brain, Heart, Wind } from "lucide-react";
import { useState } from "react";

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

interface TherapyModesProps {
  selectedMode?: string;
  onModeSelect?: (mode: string) => void;
}

export default function TherapyModes({ selectedMode, onModeSelect }: TherapyModesProps) {
  const [activeMode, setActiveMode] = useState(selectedMode || "relax");

  const handleSelect = (modeId: string) => {
    setActiveMode(modeId);
    onModeSelect?.(modeId);
  };

  return (
    <section className="py-32 px-6 bg-card">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-semibold mb-6 text-foreground tracking-tight">
            Choose Your State
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Neural-tuned vibration patterns designed for every moment of your day
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <Card
                key={mode.id}
                className={`cursor-pointer transition-all duration-300 hover-elevate ${
                  isActive 
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                    : ''
                }`}
                onClick={() => handleSelect(mode.id)}
                data-testid={`card-mode-${mode.id}`}
              >
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${mode.color} mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium text-foreground mb-2">
                    {mode.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {mode.description}
                  </p>
                  <div className="text-sm text-primary font-medium">
                    {mode.frequency}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
