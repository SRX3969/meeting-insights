import { Link } from "react-router-dom";
import { Mic, ListChecks, Zap, FileText, ArrowRight, Search, Brain, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import notemindLogo from "@/assets/notemind-logo.png";

const features = [
  {
    icon: Sparkles,
    title: "AI Summaries",
    description: "Get clean, structured summaries from messy meeting transcripts in seconds.",
  },
  {
    icon: ListChecks,
    title: "Action Items Extraction",
    description: "Automatically extract action items with owners and priority levels.",
  },
  {
    icon: Brain,
    title: "Smart Insights",
    description: "Surface key decisions, risks, and follow-ups you might have missed.",
  },
  {
    icon: Search,
    title: "Searchable Notes",
    description: "Find any meeting, decision, or action item instantly with full-text search.",
  },
];

const steps = [
  {
    number: "01",
    title: "Paste or Upload",
    description: "Paste your meeting transcript or upload an audio file. That's all you need.",
  },
  {
    number: "02",
    title: "AI Analyzes",
    description: "Our AI reads through your transcript and extracts summaries, tasks, and decisions.",
  },
  {
    number: "03",
    title: "Review & Act",
    description: "Get structured notes you can export, share, or act on immediately.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={notemindLogo} alt="Notemind" className="h-11 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="rounded-xl">Start Free <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-28 text-center fade-in">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/50 px-4 py-1.5 text-xs font-medium text-accent-foreground mb-6">
          <img src={notemindLogo} alt="" className="h-5 w-auto" /> AI-Powered Meeting Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
          Turn messy meetings into
          <br />
          <span className="text-primary">clear action items</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          AI-powered summaries, decisions, and tasks in seconds. Stop losing track of what matters.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link to="/auth/signup">
            <Button size="lg" className="px-8 rounded-xl text-base h-12">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg" className="rounded-xl text-base h-12">Log in</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground">Everything you need</h2>
          <p className="mt-2 text-muted-foreground">From transcript to tasks in one click</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div key={f.title} className="notion-card space-y-3 slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 bg-accent/20">
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="text-2xl font-bold text-foreground">How it works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to structured meeting notes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.number} className="text-center space-y-4 slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground text-lg font-bold mx-auto">
                  {s.number}
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to transform your meetings?</h2>
        <p className="text-muted-foreground mb-8">Join teams who never miss an action item again.</p>
        <Link to="/auth/signup">
          <Button size="lg" className="px-10 rounded-xl text-base h-12">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={notemindLogo} alt="Notemind" className="h-8 w-auto" />
          </div>
          <span className="text-sm text-muted-foreground">© 2026 Notemind. All rights reserved.</span>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors">About</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Features</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
