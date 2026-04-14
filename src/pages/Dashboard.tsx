import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Sparkles, 
  Upload, 
  Mic, 
  History, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMeetings } from "@/hooks/useMeetings";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { createMeeting, isCreating } = useMeetings();
  const [transcript, setTranscript] = useState("");

  const handleGenerate = async () => {
    if (!transcript.trim() || transcript.length < 5) {
      toast.error("Please provide a valid transcript (min 5 characters).");
      return;
    }

    try {
      await createMeeting.mutateAsync({
        transcript,
        title: "New Meeting Analysis",
        date: new Date().toISOString(),
      });
      setTranscript("");
    } catch (error: any) {
      // Error handled in hook console
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 relative">
      {/* Subtle Mesh Glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 slide-up">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Vercel AI Node v2
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#0A0A0A]">
            Hi, {firstName} <span className="inline-block animate-pulse origin-bottom">👋</span>
          </h1>
          <p className="text-muted-foreground font-semibold text-lg max-w-lg leading-relaxed">
            Welcome back to Notemind. Your intelligence engine is synchronized and ready for analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-black/5 shadow-sm font-bold text-sm hover:bg-accent transition-all">
             <TrendingUp className="h-4 w-4 mr-2 text-primary" />
             Analytics
           </Button>
           <Button size="lg" className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
             <Zap className="h-4 w-4 mr-2" />
             New Sync
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
        {[
          { label: "Intelligence", value: "156", sub: "Meetings analyzed", icon: Brain, color: "text-primary bg-primary/10" },
          { label: "Action items", value: "42", sub: "Tasks unlocked", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
          { label: "Active Team", value: "8", sub: "Contributors", icon: Users, color: "text-blue-600 bg-blue-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-md border border-black/5 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 flex items-start justify-between">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">{stat.value}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground/40 italic">{stat.sub}</p>
               </div>
               <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-10 items-start">
         {/* Input Box */}
         <div className="lg:col-span-2 space-y-6 slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="rounded-[3rem] border-black/5 shadow-2xl overflow-hidden bg-white/90 backdrop-blur-xl group transition-all duration-500 hover:shadow-primary/5">
               <CardHeader className="px-10 py-8 pb-4">
                  <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tighter">
                     <div className="h-12 w-12 rounded-2xl bg-[#0A0A0A] flex items-center justify-center shadow-lg">
                        <Mic className="h-6 w-6 text-white" />
                     </div>
                     Knowledge Processing
                  </CardTitle>
               </CardHeader>
               <CardContent className="px-10 py-8 pt-0 space-y-6">
                  <div className="relative group/input">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-purple-500/30 to-blue-500/30 rounded-[2.2rem] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700" />
                    <Textarea
                      placeholder="Paste your meeting transcript here... (min 5 chars)"
                      className="min-h-[300px] rounded-[2rem] bg-white/50 border-black/5 p-8 text-lg font-medium resize-none focus-visible:ring-primary shadow-inner relative z-10 backdrop-blur-sm"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isCreating}
                      className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl flex-1 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-4" />
                          Analyzing Context...
                        </>
                      ) : (
                        <>
                          <Brain className="h-6 w-6 mr-4" />
                          Generate Insights
                        </>
                      )}
                    </Button>
                    <div className="flex gap-4 w-full sm:w-auto">
                       <Button variant="outline" className="h-16 w-16 rounded-2xl border-black/5 bg-white shadow-sm hover:bg-accent transition-all">
                          <Upload className="h-7 w-7 text-muted-foreground" />
                       </Button>
                       <Button variant="outline" className="h-16 w-16 rounded-2xl border-black/5 bg-white shadow-sm hover:bg-accent transition-all">
                          <Mic className="h-7 w-7 text-muted-foreground" />
                       </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                    <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> AES-256</div>
                    <div className="h-1 w-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">MISTRAL AI NODES</div>
                    <div className="h-1 w-1 rounded-full bg-border" />
                    <div className="flex items-center gap-1.5">REALTIME SYNC</div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Side Section */}
         <div className="space-y-8 slide-up" style={{ animationDelay: '0.3s' }}>
            <Card className="rounded-[2.5rem] border-black/5 shadow-xl bg-white/80 backdrop-blur-md overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
               <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between relative z-10">
                  <CardTitle className="text-lg font-black tracking-tight text-[#0A0A0A]">Recent History</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground/40" />
               </CardHeader>
               <CardContent className="p-8 pt-2 space-y-6 relative z-10">
                  {[
                    { title: "Product Sync", time: "2h ago", initials: "PS", color: "bg-indigo-100 text-indigo-700" },
                    { title: "Growth Sprint", time: "5h ago", initials: "GS", color: "bg-primary/10 text-primary" },
                    { title: "Architecture", time: "1d ago", initials: "AR", color: "bg-emerald-100 text-emerald-700" }
                  ].map((sync, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-11 w-11 rounded-2xl">
                             <AvatarFallback className={`font-black text-[10px] rounded-2xl ${sync.color}`}>{sync.initials}</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                             <p className="text-sm font-black text-[#0A0A0A] leading-none mb-1">{sync.title}</p>
                             <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">{sync.time}</p>
                          </div>
                       </div>
                       <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 hover:text-primary hover:bg-primary/5 transition-colors">
                     Explore History
                  </Button>
               </CardContent>
            </Card>

            {/* Smart Card CTA */}
            <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white space-y-4 shadow-2xl relative overflow-hidden group">
               <div className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[80px]" />
               <Zap className="h-8 w-8 text-primary relative z-10 group-hover:rotate-12 transition-transform" />
               <h4 className="text-xl font-black tracking-tight relative z-10">Intelligence Pro</h4>
               <p className="text-sm font-bold text-white/60 leading-relaxed relative z-10 italic">
                 Try uploading an audio recording. Our new engine isolates speakers automatically.
               </p>
               <Button variant="link" className="p-0 h-auto text-primary font-black text-[10px] uppercase tracking-widest relative z-10 hover:no-underline hover:text-white transition-colors">
                 Learn more <ArrowRight className="ml-1 h-3 w-3" />
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
