import { Link } from "react-router-dom";
import { Mic, ListChecks, Zap, FileText, ArrowRight, Search, Brain, Sparkles, Shield, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import notemindLogo from "@/assets/notemind-logo.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-x-hidden">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-purple-500/10 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Notemind</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#process" className="hover:text-primary transition-colors">Process</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/5 rounded-full px-6">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-7 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 xl:py-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur-md animate-fade-in">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Enhanced with Gemini 1.5 & Mistral</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Turn your messy meetings into <br />
                <span className="text-primary italic font-serif">pure intelligence.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/50 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
                Notemind uses enterprise-grade AI to extract summaries, key decisions, and prioritized tasks from your transcripts in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="h-14 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg group shadow-xl shadow-primary/20">
                    Get Started Free 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-lg backdrop-blur-sm">
                    Live Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-40 grayscale group">
                <div className="flex flex-col items-center">
                   <div className="text-2xl font-bold">10k+</div>
                   <div className="text-[10px] uppercase tracking-widest font-bold">Meetings Sync'd</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex flex-col items-center">
                   <div className="text-2xl font-bold">99.9%</div>
                   <div className="text-[10px] uppercase tracking-widest font-bold">AI Accuracy</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex flex-col items-center">
                   <div className="text-2xl font-bold">0.1s</div>
                   <div className="text-[10px] uppercase tracking-widest font-bold">Response Time</div>
                </div>
              </div>
            </div>

            <div className="relative group perspective-1000 hidden lg:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative notion-card p-2 bg-black/40 border-white/10 animate-float">
                <div className="rounded-[2.5rem] overflow-hidden border border-white/5">
                  <div className="bg-[#0A0A0A] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 bg-white/5 rounded-full" />
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-red-500/50" />
                        <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                        <div className="h-2 w-2 rounded-full bg-green-500/50" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse" />
                      <div className="grid grid-cols-2 gap-4">
                         <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-2">
                            <div className="h-2 w-1/2 bg-primary/40 rounded-full" />
                            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                            <div className="h-2 w-full bg-white/10 rounded-full" />
                         </div>
                         <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-4 space-y-2">
                           <div className="h-2 w-1/2 bg-green-500/40 rounded-full" />
                            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                            <div className="h-2 w-full bg-white/10 rounded-full" />
                         </div>
                      </div>
                      <div className="h-40 bg-white/5 rounded-2xl border border-white/5 p-6 space-y-3">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                               <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div className="h-3 w-32 bg-white/20 rounded-full" />
                         </div>
                         <div className="space-y-2 pt-2">
                            <div className="h-2 w-full bg-white/10 rounded-full" />
                            <div className="h-2 w-[90%] bg-white/10 rounded-full" />
                            <div className="h-2 w-1/2 bg-white/10 rounded-full" />
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
        <section className="py-20 border-y border-white/5 bg-white/[0.02]">
           <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/20 mb-12">Trusted by engineering teams worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 hover:opacity-60 transition-opacity">
                 <div className="flex items-center gap-2 text-2xl font-bold"><Shield className="h-6 w-6" /> SECURE AI</div>
                 <div className="flex items-center gap-2 text-2xl font-bold"><Cpu className="h-6 w-6" /> GPU ACCELERATED</div>
                 <div className="flex items-center gap-2 text-2xl font-bold"><Globe className="h-6 w-6" /> GLOBAL EDGE</div>
              </div>
           </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 space-y-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-primary font-bold text-sm tracking-[0.2em] uppercase">The Platform</h2>
            <h3 className="text-4xl md:text-5xl font-bold">Unleash the full potential of your meetings.</h3>
            <p className="text-white/40 text-lg">Stop worrying about notes and start focusing on the conversation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="notion-card group">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-bold mb-3">AI Engine 2.0</h4>
              <p className="text-white/40 leading-relaxed">Context-aware summaries that understand nuance, technical debt, and business logic.</p>
            </div>
            
            <div className="notion-card group">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ListChecks className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="text-xl font-bold mb-3">Priority Tasks</h4>
              <p className="text-white/40 leading-relaxed">Automatically assigns owners and due dates based on the flow of the meeting.</p>
            </div>

            <div className="notion-card group">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <h4 className="text-xl font-bold mb-3">Smart Search</h4>
              <p className="text-white/40 leading-relaxed">Instantly find that "one thing" someone said three months ago about the project.</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary to-purple-600 p-12 md:p-24 text-center space-y-8">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
             <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">Revolutionize your <br/> workflow today.</h2>
             <p className="text-white/80 text-lg md:text-xl max-w-xl mx-auto font-medium">Join 500+ companies already using Notemind to ship faster.</p>
             <Link to="/auth/signup" className="inline-block pt-4">
                <Button size="lg" className="h-16 px-12 rounded-full bg-white text-black hover:bg-white/90 font-black text-xl shadow-2xl shadow-black/20 group">
                   Build My Brain <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <Brain className="h-7 w-7 text-primary" />
              <span className="text-xl font-black">Notemind</span>
           </div>
           <div className="flex gap-8 text-white/40 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Github</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
           </div>
           <div className="text-white/20 text-[10px] uppercase tracking-[0.2em] font-bold">
              Designed by Antigravity in San Francisco
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
