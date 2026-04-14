import { Link } from "react-router-dom";
import { ListChecks, Zap, ArrowRight, Brain, Sparkles, Shield, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import notemindMockup from "@/assets/notemind-mockup.png";
import ctaBg from "@/assets/cta-bg.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFF] text-foreground selection:bg-primary/10 overflow-x-hidden">
      {/* Animated Light Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px] animate-glow" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[140px] animate-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] bg-purple-200/20 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 bg-white/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0A0A0A]">Notemind</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-muted-foreground/80">
            <a href="#features" className="hover:text-primary transition-colors tracking-tight">Features</a>
            <a href="#process" className="hover:text-primary transition-colors tracking-tight">Process</a>
            <Link to="/dashboard" className="hover:text-primary transition-colors tracking-tight">Dashboard</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-bold rounded-full px-5 h-9 text-sm">Log in</Button>
            </Link>
            <Link to="/auth/signup">
              <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 h-10 font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left animate-fade-in relative z-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-black text-primary uppercase tracking-widest shadow-sm backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enterprise Grade AI Intelligence</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-[#0A0A0A] pb-4">
                Turn messy meetings into 
                <span className="block bg-gradient-to-r from-primary via-purple-600 to-indigo-600 bg-clip-text text-transparent italic font-serif py-3 pr-4">pure intelligence.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-semibold opacity-90">
                The world's first context-aware summary engine. Decisions, tasks, and insights extracted in 100ms.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start pt-4">
                <Link to="/auth/signup">
                  <Button size="lg" className="h-16 px-10 rounded-full bg-primary hover:bg-primary/90 text-white font-black text-xl group shadow-2xl shadow-primary/30 transition-all hover:scale-105">
                    Start My Brain 
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <div className="flex items-center gap-4 p-1 rounded-full bg-black/5 backdrop-blur-md">
                   <div className="flex -space-x-3 px-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                      ))}
                   </div>
                   <div className="pr-6 text-sm font-bold text-muted-foreground whitespace-nowrap">Trusted by 5,000+ founders</div>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-12 pt-12 opacity-80">
                <div className="text-center lg:text-left">
                   <div className="text-3xl font-black text-[#0A0A0A]">1s</div>
                   <div className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Insight Speed</div>
                </div>
                <div className="text-center lg:text-left">
                   <div className="text-3xl font-black text-[#0A0A0A]">94%</div>
                   <div className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Recall Rate</div>
                </div>
                <div className="text-center lg:text-left">
                   <div className="text-3xl font-black text-[#0A0A0A]">Auto</div>
                   <div className="text-[10px] uppercase tracking-[0.3em] font-black text-primary">Task Sync</div>
                </div>
              </div>
            </div>

            {/* Premium Mockup Section */}
            <div className="relative group hidden lg:block animate-float">
              <div className="absolute -inset-10 bg-gradient-to-r from-primary/30 to-purple-400/30 rounded-full blur-[100px] opacity-60 group-hover:opacity-100 transition duration-1000" />
              <div className="relative rounded-[3rem] p-3 bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-black/5 border-t-white transition-transform duration-700 hover:scale-[1.02]">
                 <div className="rounded-[2.2rem] overflow-hidden border border-black/10">
                    <img 
                      src={notemindMockup} 
                      alt="Notemind Dashboard Mockup" 
                      className="w-full h-auto object-cover shadow-2xl"
                    />
                 </div>
              </div>
              
              {/* Floating Smart Cards */}
              <div className="absolute -top-10 -right-10 bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-black/5 shadow-2xl space-y-3 slide-up" style={{ animationDelay: '0.4s' }}>
                 <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                 </div>
                 <div>
                    <div className="text-xs font-black text-[#0A0A0A] uppercase tracking-tighter">Action Created</div>
                    <div className="text-[10px] font-bold text-muted-foreground">Assigned to: Design Team</div>
                 </div>
              </div>

              <div className="absolute -bottom-6 -left-12 bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-black/5 shadow-2xl flex items-center gap-4 slide-up" style={{ animationDelay: '0.8s' }}>
                 <div className="h-12 w-12 rounded-full border-4 border-primary/20 p-1">
                    <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-xs">AI</div>
                 </div>
                 <div>
                    <div className="text-sm font-black text-[#0A0A0A]">Note Mind v2.4</div>
                    <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">Status: Optimized</div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brand/Trust Section */}
        <section className="py-20 border-y border-black/5 bg-white/50 relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/50">Modern companies shipping with Notemind Intelligence</p>
              <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-60">
                 <div className="flex items-center gap-3 text-2xl font-black text-[#0A0A0A]">
                    <Shield className="h-7 w-7 text-primary" /> SECURE
                 </div>
                 <div className="flex items-center gap-3 text-2xl font-black text-[#0A0A0A]">
                    <Cpu className="h-7 w-7 text-primary" /> NEURAL
                 </div>
                 <div className="flex items-center gap-3 text-2xl font-black text-[#0A0A0A]">
                    <Globe className="h-7 w-7 text-primary" /> GLOBAL
                 </div>
              </div>
           </div>
        </section>

        {/* Features Block */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 space-y-24">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <h2 className="text-primary font-black text-sm tracking-[0.3em] uppercase">The Platform</h2>
            <h3 className="text-5xl md:text-6xl font-black text-[#0A0A0A] tracking-tighter">Focus on the vision. <br/> We'll handle the clarity.</h3>
            <p className="text-muted-foreground text-xl font-semibold opacity-80">Stop scrolling through hour-long transcripts manually.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Brain, title: "Neural Sync", desc: "Context-aware processing that learns your team's specific jargon.", color: "primary" },
              { icon: ListChecks, title: "Smart Tasks", desc: "AI identifies tasks with owners and due dates automatically.", color: "blue-500" },
              { icon: Zap, title: "Real-time Processing", desc: "Notes are ready before the call even ends. Zero wait time.", color: "purple-500" }
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] border border-black/5 p-10 shadow-2xl hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 group">
                <div className={`h-16 w-16 rounded-[1.5rem] bg-${f.color}/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <f.icon className={`h-8 w-8 text-${f.color}`} />
                </div>
                <h4 className="text-2xl font-black mb-4 text-[#0A0A0A]">{f.title}</h4>
                <p className="text-muted-foreground leading-relaxed font-bold opacity-70 italic line-clamp-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced CTA Banner with Image Background */}
        <section className="max-w-7xl mx-auto px-6 py-12 pb-32">
          <div className="relative overflow-hidden rounded-[4rem] group shadow-2xl shadow-primary/20">
             {/* Blurred Image Background */}
             <div className="absolute inset-0 z-0">
                <img src={ctaBg} alt="" className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-[2000ms]" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-[#0A0A0A] opacity-90 backdrop-blur-sm" />
             </div>
             
             <div className="relative z-10 p-16 md:p-28 text-center space-y-10">
                <div className="h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-4 animate-float">
                   <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none">Revolutionize your <br/> workflow today.</h2>
                <p className="text-white/70 text-xl md:text-2xl max-w-2xl mx-auto font-bold tracking-tight px-4 leading-relaxed">
                   Join 500+ modern teams using Notemind every day to ship features 3x faster.
                </p>
                <Link to="/auth/signup" className="inline-block pt-6">
                   <Button size="lg" className="h-20 px-16 rounded-full bg-white text-[#0A0A0A] hover:bg-white/90 font-black text-2xl shadow-2xl shadow-black/30 group transition-all hover:scale-105 active:scale-95">
                      Start My Free Trial <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </Link>
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 py-14 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-4">
                 <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Brain className="h-6 w-6 text-white" />
                 </div>
                 <span className="text-2xl font-black text-[#0A0A0A] tracking-tighter">Notemind</span>
              </div>
              <p className="text-sm font-bold text-muted-foreground leading-relaxed max-w-xs uppercase tracking-tighter">The future of meeting intelligence is here.</p>
           </div>
           <div className="flex flex-wrap justify-center gap-10 text-muted-foreground text-sm font-black uppercase tracking-widest text-[11px]">
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 inline-block">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 inline-block">Github</a>
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 inline-block">Terms</a>
              <a href="#" className="hover:text-primary transition-colors hover:scale-105 inline-block">Privacy</a>
           </div>
           <div className="text-center md:text-right">
              <div className="text-muted-foreground/40 text-[10px] uppercase tracking-[0.4em] font-black leading-loose">
                 Crafted with passion in SF
              </div>
              <div className="text-[10px] font-bold text-muted-foreground/30">© 2026 Notemind AI Inc.</div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
