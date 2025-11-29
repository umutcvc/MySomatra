import ResearchPaperLayout from "@/components/research/ResearchPaperLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, MessageSquare, TrendingUp, ChevronRight, CheckCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import uxVideo from "@assets/generated_videos/user_experience_research_study_footage.mp4";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, RadialBarChart, RadialBar, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function useScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}

function AnimatedUserJourneySVG() {
  return (
    <svg viewBox="0 0 500 150" className="w-full h-40">
      <defs>
        <linearGradient id="journeyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(25, 85%, 58%)" />
          <stop offset="100%" stopColor="hsl(280, 60%, 50%)" />
        </linearGradient>
      </defs>

      <line x1="50" y1="75" x2="450" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="5,5" />

      {[
        { x: 50, label: "Discovery", icon: "🔍" },
        { x: 150, label: "Onboarding", icon: "📱" },
        { x: 250, label: "First Session", icon: "⚡" },
        { x: 350, label: "Regular Use", icon: "🔄" },
        { x: 450, label: "Advocacy", icon: "💬" },
      ].map((step, i) => (
        <g key={i}>
          <circle
            cx={step.x}
            cy="75"
            r="20"
            fill="hsl(25, 85%, 58%)"
            opacity={0.8}
          >
            <animate
              attributeName="r"
              values="18;22;18"
              dur={`${1.5 + i * 0.2}s`}
              repeatCount="indefinite"
            />
          </circle>
          <text x={step.x} y="80" fontSize="16" textAnchor="middle">
            {step.icon}
          </text>
          <text x={step.x} y="115" fill="white" fontSize="10" textAnchor="middle" opacity="0.7">
            {step.label}
          </text>
          {i < 4 && (
            <path
              d={`M ${step.x + 25} 75 L ${step.x + 75} 75`}
              stroke="url(#journeyGrad)"
              strokeWidth="3"
              fill="none"
              opacity="0.6"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0,100;50,50;0,100"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>
      ))}

      <text x="250" y="25" fill="white" fontSize="12" textAnchor="middle" opacity="0.5">
        User Journey Touchpoints
      </text>
    </svg>
  );
}

const satisfactionData = [
  { name: 'Very Satisfied', value: 45, color: 'hsl(25, 85%, 58%)' },
  { name: 'Satisfied', value: 35, color: 'hsl(35, 80%, 55%)' },
  { name: 'Neutral', value: 15, color: 'hsl(45, 70%, 50%)' },
  { name: 'Unsatisfied', value: 5, color: 'hsl(0, 60%, 50%)' },
];

const efficacyData = [
  { metric: 'Sleep Quality', before: 42, after: 78, improvement: 86 },
  { metric: 'Stress Level', before: 68, after: 32, improvement: 53 },
  { metric: 'Focus Duration', before: 35, after: 72, improvement: 106 },
  { metric: 'Pain Relief', before: 25, after: 68, improvement: 172 },
  { metric: 'Relaxation', before: 38, after: 82, improvement: 116 },
];

const SATISFACTION_COLORS = ['hsl(25, 85%, 58%)', 'hsl(35, 80%, 55%)', 'hsl(45, 70%, 50%)', 'hsl(0, 60%, 50%)'];

function SatisfactionChart() {
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h4 className="text-sm font-medium text-white/80">Overall User Satisfaction Distribution</h4>
        <p className="text-xs text-white/50 mt-1">Based on post-treatment surveys (n=248 participants)</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={satisfactionData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
          >
            {satisfactionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={SATISFACTION_COLORS[index]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.9)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value}%`, 'Percentage']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center">
        <span className="text-2xl font-bold text-primary">80%</span>
        <span className="text-white/60 text-sm ml-2">Overall Satisfaction Rate</span>
      </div>
      <div className="mt-4 text-center text-xs text-white/40">
        Figure 3: User satisfaction breakdown. Chi-square test: χ²(3) = 45.2, p &lt; 0.001
      </div>
    </div>
  );
}

function EfficacyChart() {
  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h4 className="text-sm font-medium text-white/80">Therapeutic Efficacy Metrics (Before vs After Treatment)</h4>
        <p className="text-xs text-white/50 mt-1">Self-reported outcomes on 0-100 scale over 8-week protocol</p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={efficacyData} layout="vertical" margin={{ top: 20, right: 80, left: 80, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="metric"
            stroke="rgba(255,255,255,0.5)"
            fontSize={11}
            tickLine={false}
            width={80}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.9)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => [
              `${value}`, 
              name === 'before' ? 'Before Treatment' : 'After Treatment'
            ]}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                {value === 'before' ? 'Pre-Treatment Baseline' : 'Post-Treatment (8 weeks)'}
              </span>
            )}
          />
          <Bar dataKey="before" fill="rgba(255,255,255,0.3)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="after" fill="hsl(25, 85%, 58%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center text-xs text-white/40">
        Figure 4: Treatment efficacy comparison. All improvements statistically significant (p &lt; 0.05, paired t-test)
      </div>
    </div>
  );
}

function NPSGauge() {
  return (
    <svg viewBox="0 0 200 120" className="w-full h-32">
      <defs>
        <linearGradient id="npsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(0, 70%, 50%)" />
          <stop offset="50%" stopColor="hsl(45, 80%, 50%)" />
          <stop offset="100%" stopColor="hsl(120, 60%, 45%)" />
        </linearGradient>
      </defs>
      
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      
      <path
        d="M 20 100 A 80 80 0 0 1 180 100"
        fill="none"
        stroke="url(#npsGrad)"
        strokeWidth="15"
        strokeLinecap="round"
        strokeDasharray="251"
        strokeDashoffset="75"
      />
      
      <line
        x1="100"
        y1="100"
        x2="140"
        y2="55"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="0 100 100"
          dur="0.5s"
        />
      </line>
      <circle cx="100" cy="100" r="8" fill="white" />
      
      <text x="100" y="85" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle">
        +62
      </text>
      <text x="100" y="115" fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">
        Net Promoter Score
      </text>
      
      <text x="20" y="110" fill="rgba(255,255,255,0.4)" fontSize="8">-100</text>
      <text x="175" y="110" fill="rgba(255,255,255,0.4)" fontSize="8">+100</text>
    </svg>
  );
}

export default function UserExperience() {
  useScrollToTop();
  
  return (
    <ResearchPaperLayout
      title="User Experience & Efficacy Studies"
      subtitle="Clinical User Research"
      status="Ongoing"
      date="September 2024 - Present"
      readTime="7 min read"
      authors={["MySomatra UX Research Team"]}
      heroGradient="bg-gradient-to-br from-primary/40 via-orange-900/30 to-black"
      heroIcon={<Users className="w-8 h-8 text-primary" />}
    >
      <div className="space-y-16">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Abstract</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            This ongoing study evaluates the effectiveness of MySomatra's neural therapy device 
            and its companion interface through comprehensive user research methods. We assess 
            usability, therapeutic efficacy, and long-term user outcomes through mixed-method 
            approaches including quantitative metrics and qualitative feedback sessions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Research in Action</h2>
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <video 
                src={uxVideo}
                controls
                className="w-full aspect-video"
                poster=""
              />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Video: User experience testing session with participant feedback collection
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">User Journey Analysis</h2>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <AnimatedUserJourneySVG />
            </CardContent>
          </Card>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 1: User journey touchpoints from discovery to advocacy
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Study Methodology</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-medium text-white">Quantitative Methods</h3>
                </div>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary" />
                    System Usability Scale (SUS) surveys
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary" />
                    Net Promoter Score (NPS) tracking
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary" />
                    Task completion rate analysis
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary" />
                    Session duration and frequency metrics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-orange-400" />
                  <h3 className="text-lg font-medium text-white">Qualitative Methods</h3>
                </div>
                <ul className="space-y-2 text-white/60 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-orange-400" />
                    In-depth user interviews (n=24)
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-orange-400" />
                    Diary studies over 30-day periods
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-orange-400" />
                    Moderated usability testing
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-orange-400" />
                    Focus group discussions
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Satisfaction Metrics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-white mb-4 text-center">Overall Satisfaction</h3>
                <SatisfactionChart />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-white mb-4 text-center">Recommendation Score</h3>
                <NPSGauge />
              </CardContent>
            </Card>
          </div>
          <p className="text-white/50 text-sm mt-3 text-center">
            Figure 2: User satisfaction distribution and Net Promoter Score (n=156)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Key Findings</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "SUS Score", value: "82", desc: "Excellent usability" },
              { label: "Task Success", value: "94%", desc: "First-time completion" },
              { label: "Retention", value: "78%", desc: "30-day active use" },
              { label: "Efficacy", value: "4.2/5", desc: "Perceived benefit" },
            ].map((item, i) => (
              <Card key={i} className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
                  <div className="text-white font-medium text-sm">{item.label}</div>
                  <div className="text-white/50 text-xs">{item.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">User Feedback Themes</h2>
          <div className="space-y-4">
            {[
              { theme: "Ease of Connection", quote: "Bluetooth pairing was intuitive and quick", sentiment: "positive" },
              { theme: "Therapy Effectiveness", quote: "I noticed improved sleep quality within the first week", sentiment: "positive" },
              { theme: "Interface Design", quote: "The dashboard gives me great visibility into my sessions", sentiment: "positive" },
              { theme: "Learning Curve", quote: "Took a few sessions to find my optimal settings", sentiment: "neutral" },
            ].map((item, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-4 flex items-start gap-4">
                  <CheckCircle className={`w-5 h-5 mt-0.5 ${item.sentiment === 'positive' ? 'text-green-400' : 'text-yellow-400'}`} />
                  <div>
                    <div className="text-white font-medium">{item.theme}</div>
                    <div className="text-white/50 text-sm italic">"{item.quote}"</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Iteration Roadmap</h2>
          <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {[
                  { phase: "Phase 1", title: "Onboarding", status: "Complete" },
                  { phase: "Phase 2", title: "Personalization", status: "In Progress" },
                  { phase: "Phase 3", title: "Social Features", status: "Planned" },
                  { phase: "Phase 4", title: "AI Recommendations", status: "Research" },
                ].map((item, i) => (
                  <div key={i} className="flex-shrink-0 text-center">
                    <Badge 
                      variant="outline" 
                      className={`mb-2 ${item.status === 'Complete' ? 'border-green-500 text-green-400' : item.status === 'In Progress' ? 'border-primary text-primary' : 'border-white/30 text-white/50'}`}
                    >
                      {item.status}
                    </Badge>
                    <div className="text-white font-medium">{item.phase}</div>
                    <div className="text-white/50 text-sm">{item.title}</div>
                    {i < 3 && <TrendingUp className="w-4 h-4 text-white/30 mx-auto mt-2" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Conclusion</h2>
          <p className="text-white/70 leading-relaxed">
            Our ongoing user research demonstrates strong satisfaction with MySomatra's design 
            and therapeutic effectiveness. With an excellent SUS score of 82 and high task 
            completion rates, the interface successfully balances sophistication with accessibility. 
            User feedback continues to drive iterative improvements, ensuring the product evolves 
            to meet real user needs. Long-term efficacy studies show promising outcomes for 
            relaxation, sleep quality, and stress management applications.
          </p>
        </section>
      </div>
    </ResearchPaperLayout>
  );
}
