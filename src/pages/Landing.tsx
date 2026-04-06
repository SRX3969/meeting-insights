import { Link } from "react-router-dom";
import { FileText, Mic, ListChecks, Zap } from "lucide-react";
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
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-base font-semibold text-foreground tracking-tight">MeetNotes AI</span>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center fade-in">
        <h1 className="text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
          Turn every meeting into
          <br />
          actionable notes
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Paste a transcript, upload audio, or record live — our AI generates structured summaries, action items, and tasks in seconds.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/auth/signup">
            <Button size="lg" className="px-8">Start Free</Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="lg">Log in</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="notion-card space-y-3 slide-up">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
                <f.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© 2026 MeetNotes AI. All rights reserved.</span>
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
