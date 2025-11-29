import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Waves, Brain, Users, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ScrollFade from "./ScrollFade";

const researchPapers = [
  {
    id: 1,
    title: "Vibration Penetration Depth Analysis",
    subtitle: "Phantom & Underwater Experiments",
    description: "Measuring mechanical wave propagation through tissue-mimicking phantoms and underwater environments to quantify therapeutic vibration intensity at varying depths.",
    icon: Waves,
    status: "In Progress",
    metrics: ["Tissue depth mapping", "Intensity gradients", "Frequency response"],
    bgColor: "bg-gradient-to-br from-blue-900/60 to-cyan-900/40",
    borderColor: "border-blue-500/50",
    iconBg: "bg-blue-500/30",
    iconColor: "text-blue-400",
    link: "/research/vibration-penetration",
  },
  {
    id: 2,
    title: "Neural Pathway Mapping",
    subtitle: "Brain-Computer Interface Study",
    description: "Using EEG and neural imaging to identify which body placement sites and stimulation patterns produce the strongest neurological responses.",
    icon: Brain,
    status: "Planned",
    metrics: ["Cortical activation", "Optimal placement", "Response latency"],
    bgColor: "bg-gradient-to-br from-purple-900/60 to-pink-900/40",
    borderColor: "border-purple-500/50",
    iconBg: "bg-purple-500/30",
    iconColor: "text-purple-400",
    link: "/research/brain-computer-interface",
  },
  {
    id: 3,
    title: "User Experience & Efficacy",
    subtitle: "Clinical User Studies",
    description: "Comprehensive user research evaluating device effectiveness, interface usability, and subjective therapeutic outcomes across diverse user groups.",
    icon: Users,
    status: "Ongoing",
    metrics: ["Usability scores", "Efficacy ratings", "Long-term outcomes"],
    bgColor: "bg-gradient-to-br from-orange-900/60 to-amber-900/40",
    borderColor: "border-primary/50",
    iconBg: "bg-primary/30",
    iconColor: "text-primary",
    link: "/research/user-experience",
  },
];

export default function ResearchSection() {
  return (
    <section id="research" className="py-24 px-6 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950/50 to-black" />
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <ScrollFade direction="up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/70">Scientific Validation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
              Research & White Papers
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Rigorous scientific research backing the effectiveness of MySomatra's neural therapy technology
            </p>
          </div>
        </ScrollFade>

        <div className="grid md:grid-cols-3 gap-6">
          {researchPapers.map((paper, index) => {
            const Icon = paper.icon;
            return (
              <ScrollFade key={paper.id} direction="up" delay={index * 100}>
                <Card 
                  className={`${paper.bgColor} border ${paper.borderColor} backdrop-blur-sm h-full hover:scale-[1.02] transition-all duration-300`}
                  data-testid={`card-research-${paper.id}`}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${paper.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${paper.iconColor}`} />
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-white/20 text-white/70"
                      >
                        {paper.status}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-1">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-primary mb-3">
                      {paper.subtitle}
                    </p>
                    <p className="text-sm text-white/50 mb-6 flex-grow">
                      {paper.description}
                    </p>

                    <div className="space-y-3">
                      <div className="text-xs text-white/40 uppercase tracking-wider">
                        Key Metrics
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {paper.metrics.map((metric, i) => (
                          <span 
                            key={i}
                            className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/60 border border-white/10"
                          >
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10">
                      <Link href={paper.link}>
                        <Button 
                          variant="outline" 
                          className="w-full justify-between bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white group"
                          data-testid={`button-read-paper-${paper.id}`}
                        >
                          <span>Read White Paper</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </ScrollFade>
            );
          })}
        </div>

        <ScrollFade direction="up" delay={400}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">3</div>
                <div className="text-xs text-white/50">Active Studies</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary">2025</div>
                <div className="text-xs text-white/50">Publication Target</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-semibold text-white">Peer</div>
                <div className="text-xs text-white/50">Reviewed</div>
              </div>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  );
}
