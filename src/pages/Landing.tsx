import { Link } from "react-router-dom";
import { Brain, Mic, ListChecks, Zap, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Mic,
    title: "Record or Upload",
    description: "Record audio directly in-browser or upload meeting recordings for instant transcription.",
  },
  {
    icon: Zap,
    title: "AI-Powered Notes",
    description: "Advanced AI analyzes your transcript and generates structured summaries, decisions, and tasks.",
  },
  {
    icon: ListChecks,
    title: "Action Items & Tasks",
    description: "Automatically extract action items with owners and priority levels from your meetings.",
  },
  {
    icon: FileText,
    title: "Export & Share",
    description: "Download notes as markdown, copy to clipboard, or share with your team instantly.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground tracking-tight">Notemind</span>
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
          <Brain className="h-3.5 w-3.5" /> AI-Powered Meeting Intelligence
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1]">
          Turn every meeting into
          <br />
          <span className="text-primary">actionable notes</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Paste a transcript, upload audio, or record live — Notemind generates structured summaries, action items, and tasks in seconds.
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

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Notemind</span>
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
