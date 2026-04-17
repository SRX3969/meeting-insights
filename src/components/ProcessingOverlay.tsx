import { Loader2, Sparkles, Brain, Zap } from "lucide-react";

export function ProcessingOverlay() {
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
          <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tight">NoteMind AI is thinking...</h2>
          <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">
            "We're analyzing the transcript, identifying speakers, and extracting actionable intelligence. Quality takes a moment."
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-primary w-1/3 rounded-full animate-progress" />
          </div>
          
          <div className="flex items-center gap-6 justify-center text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]/40">
             <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" /> Analyzing Context</span>
             <span className="flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Structuring Insights</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-primary font-black text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      </div>
    </div>
  );
}
