import { Loader2, Sparkles, Brain, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export function ProcessingOverlay() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Initializing AI Context");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        const diff = Math.random() * 8;
        return Math.min(prev + diff, 98);
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 25) setStage("Contextualizing Meeting Data");
    else if (progress < 55) setStage("Analyzing Strategic Nuances");
    else if (progress < 85) setStage("Mapping Stakeholder Roadmap");
    else setStage("Finalizing Executive Narrative");
  }, [progress]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
      <div className="max-w-md w-full p-10 text-center space-y-8 slide-up">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative h-20 w-20 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mx-auto">
            <Brain className="h-10 w-10 text-white animate-float" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight">{Math.round(progress)}%</h2>
          <p className="text-sm font-bold text-muted-foreground leading-relaxed italic px-4">
            {stage}...
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden relative">
            <div 
              className="absolute inset-y-0 left-0 bg-primary transition-all duration-700 ease-out rounded-full shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center gap-6 justify-center text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
             <span className="flex items-center gap-1.5"><Zap className={`h-3 w-3 ${progress > 25 ? 'text-primary' : ''}`} /> Context</span>
             <span className="flex items-center gap-1.5"><Sparkles className={`h-3 w-3 ${progress > 55 ? 'text-primary' : ''}`} /> Analysis</span>
             <span className="flex items-center gap-1.5"><Brain className={`h-3 w-3 ${progress > 85 ? 'text-primary' : ''}`} /> Insight</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-primary font-black text-sm pt-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          NoteMind AI Processing
        </div>
      </div>
    </div>
  );
}

