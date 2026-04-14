import { Link } from "react-router-dom";
import { Mic, ListChecks, Zap, FileText, ArrowRight, Search, Brain, Sparkles, Shield, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import notemindLogo from "@/assets/notemind-logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFF] text-foreground selection:bg-primary/10 overflow-x-hidden">
      {/* Animated Light Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-glow" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-300/20 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-300/20 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Notemind</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#process" className="hover:text-primary transition-colors">Process</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-black/5 rounded-full px-5 h-9">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 h-9 font-semibold shadow-lg shadow-primary/10">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* Hero Section - Optimized for Above the Fold */}
        <section className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1 text-xs font-bold text-primary animate-fade-in shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Gemini 1.5 & Mistral Powered</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-[#1A1A1A]">
                Turn messy meetings into 
                <span className="block bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent italic font-serif">pure intelligence.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Notemind extracts summaries, key decisions, and prioritized tasks from your transcripts in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <Link to="/auth/signup">
                  <Button size="lg" className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-base group shadow-xl shadow-primary/20">
                    Get Started Free 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-black/5 bg-white hover:bg-black/5 text-foreground font-semibold text-base shadow-sm">
                    Live Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-60">
                <div className="flex flex-col items-center">
                   <div className="text-xl font-bold text-foreground">10k+</div>
                   <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Sync'd</div>
                </div>
                <div className="w-px h-6 bg-black/10" />
                <div className="flex flex-col items-center">
                   <div className="text-xl font-bold text-foreground">99.9%</div>
                   <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Accuracy</div>
                </div>
                <div className="w-px h-6 bg-black/10" />
                <div className="flex flex-col items-center">
                   <div className="text-xl font-bold text-foreground">0.1s</div>
                   <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Speed</div>
                </div>
              </div>
            </div>

            <div className="relative group perspective-1000 hidden lg:block transform -translate-y-4">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000" />
              <div className="relative rounded-[2.5rem] bg-white border border-black/5 shadow-2xl animate-float p-2">
                <div className="rounded-[2rem] overflow-hidden border border-black/5 bg-[#F9FAFB]">
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-black/5 rounded-full" />
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-400" />
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                      </div>
                    </div>
                    <div className="space-y-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                       <ctrl94> AI ANALYSIS COMPLETE
                    </div>
                    <div className="space-y-4">
                      <div className="h-7 w-3/4 bg-primary/10 rounded-lg" />
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-20 bg-white rounded-2xl border border-black/5 p-4 space-y-2 shadow-sm">
                            <div className="h-2 w-1/2 bg-primary/40 rounded-full" />
                            <div className="h-1.5 w-full bg-black/5 rounded-full" />
                         </div>
                         <div className="h-20 bg-white rounded-2xl border border-black/5 p-4 space-y-2 shadow-sm">
                           <div className="h-2 w-1/2 bg-green-500/40 rounded-full" />
                            <div className="h-1.5 w-full bg-black/5 rounded-full" />
                         </div>
                      </div>
                      <div className="h-32 bg-white rounded-2xl border border-black/5 p-6 space-y-3 shadow-md">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                               <Zap className="h-4 w-4 text-white" />
                            </div>
                            <div className="h-2.5 w-32 bg-black/10 rounded-full" />
                         </div>
                         <div className="space-y-2 pt-2">
                            <div className="h-1.5 w-full bg-black/5 rounded-full" />
                            <div className="h-1.5 w-full bg-black/5 rounded-full" />
                            <div className="h-1.5 w-1/2 bg-black/5 rounded-full" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Bar */}
        <section className="py-12 border-y border-black/5 bg-black/[0.01]">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 mb-10">Trusted by modern engineering teams</p>
              <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Shield className="h-5 w-5 text-primary" /> SECURE AI
                 </div>
                 <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Cpu className="h-5 w-5 text-primary" /> GPU POWERED
                 </div>
                 <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Globe className="h-5 w-5 text-primary" /> GLOBAL EDGE
                 </div>
              </div>
           </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 space-y-20">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-primary font-bold text-xs tracking-[0.2em] uppercase">The Platform</h2>
            <h3 className="text-4xl font-bold text-foreground tracking-tight">Focus on the conversation. <br/> We'll handle the notes.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">AI Intelligence</h4>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">Context-aware summaries that understand nuance and business logic.</p>
            </div>
            
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-blue-500">
                <ListChecks className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Priority Tasks</h4>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">Automatically assigns owners and due dates based on meeting flow.</p>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-500">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-foreground">Smart Global Search</h4>
              <p className="text-muted-foreground leading-relaxed text-sm font-medium">Instantly find any decision or action item from months ago.</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 py-12 pb-24">
          <div className="relative overflow-hidden rounded-[3rem] bg-foreground p-12 md:p-20 text-center space-y-6">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4 italic font-serif">Ready to ship faster?</h2>
             <p className="text-white/60 text-lg max-w-xl mx-auto font-medium">Join 500+ modern teams using Notemind every day.</p>
             <Link to="/auth/signup" className="inline-block pt-4">
                <Button size="lg" className="h-14 px-10 rounded-full bg-white text-black hover:bg-white/90 font-bold text-lg group">
                   Start Free Trial <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                 <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Notemind</span>
           </div>
           <div className="flex gap-8 text-muted-foreground text-sm font-bold">
              <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest text-[10px]">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest text-[10px]">Github</a>
              <a href="#" className="hover:text-primary transition-colors uppercase tracking-widest text-[10px]">Privacy</a>
           </div>
           <div className="text-muted-foreground/30 text-[9px] uppercase tracking-[0.3em] font-black">
              Handcrafted in San Francisco
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
