import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Users, FileText, Download } from "lucide-react";
import { useLocation } from "wouter";
import { ReactNode } from "react";

interface ResearchPaperLayoutProps {
  title: string;
  subtitle: string;
  status: string;
  date: string;
  readTime: string;
  authors: string[];
  heroGradient: string;
  heroIcon: ReactNode;
  children: ReactNode;
}

export default function ResearchPaperLayout({
  title,
  subtitle,
  status,
  date,
  readTime,
  authors,
  heroGradient,
  heroIcon,
  children,
}: ResearchPaperLayoutProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="gap-2 text-white/70 hover:text-white"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Badge variant="outline" className="border-primary/50 text-primary">
            {status}
          </Badge>
        </div>
      </header>

      <main className="pt-20">
        <section className={`relative py-24 px-6 overflow-hidden ${heroGradient}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                {heroIcon}
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-white/50 mb-1">
                  <FileText className="w-4 h-4" />
                  <span>White Paper</span>
                </div>
                <p className="text-primary font-medium">{subtitle}</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-8 leading-tight max-w-4xl">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{authors.join(", ")}</span>
              </div>
            </div>
          </div>
        </section>

        <article className="max-w-5xl mx-auto px-6 py-16">
          {children}
        </article>

        <section className="border-t border-white/10 py-12 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Interested in our research?
              </h3>
              <p className="text-white/50">
                Contact us for collaboration opportunities or full methodology details.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button className="gap-2" onClick={() => setLocation("/connect")}>
                Try MySomatra
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
