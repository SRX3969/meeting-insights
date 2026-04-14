import { useState } from "react";
import { Brain, Sparkles, Mic, History, CheckCircle2, TrendingUp, Users, ArrowRight, Zap, Shield } from "lucide-react";
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
      // Error handled in hook
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 relative">
      {/* Mesh background effect */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 fade-in">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Intelligence Sync Live
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0A0A0A]">
            Good morning, {firstName} <span className="inline-block animate-pulse">👋</span>
          </h1>
          <p className="text-muted-foreground font-semibold text-lg max-w-md leading-relaxed">
            Your intelligence engine is synchronized. Ready for a new analysis?
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-black/5 shadow-sm font-bold text-sm hover:bg-black/5 transition-all">
             <TrendingUp className="h-4 w-4 mr-2 text-primary" />
             Insights
           </Button>
           <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
             <Zap className="h-4 w-4 mr-2" />
             New Meeting
           </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 slide-up">
        {[
          { label: "Intelligence", value: "156", sub: "Analyses", icon: Brain, color: "text-primary bg-primary/10" },
          { label: "Action items", value: "42", sub: "Pending", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Active Contributors", value: "8", sub: "Team", icon: Users, color: "text-blue-600 bg-blue-50" }
        ].map((stat, i) => (
          <Card key={i} className="rounded-[2.5rem] border-black/5 shadow-xl hover:shadow-2xl transition-all group overflow-hidden bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
               <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">{stat.value}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground/40 italic">{stat.sub}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-start">
         {/* Input Panel */}
         <div className="lg:col-span-2 space-y-6 slide-up" style={{ animationDelay: '0.1s' }}>
            <Card className="rounded-[3rem] border-black/5 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl transition-all duration-500 hover:shadow-primary/5">
               <CardHeader className="px-10 pt-8 pb-4">
                  <CardTitle className="flex items-center gap-4 text-2xl font-black tracking-tighter">
                     <div className="h-12 w-12 rounded-2xl bg-[#0A0A0A] flex items-center justify-center shadow-lg">
                        <Mic className="h-6 w-6 text-white" />
                     </div>
                     New Transformation
                  </CardTitle>
               </CardHeader>
               <CardContent className="px-10 pb-10 pt-4 space-y-6">
                  <div className="group/input relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-[2.2rem] blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700" />
                    <Textarea
                      placeholder="Paste your meeting transcript here... (min 5 characters)"
                      className="min-h-[280px] rounded-[2rem] bg-white border-black/5 p-8 text-lg font-medium resize-none focus-visible:ring-primary shadow-inner relative z-10"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isCreating}
                      className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xl flex-1 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-4" />
                          Analyzing Knowledge...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6 mr-4" />
                          Transform Transcript
                        </>
                      )}
                    </Button>
                    <div className="flex gap-4 w-full sm:w-auto">
                       <Button variant="outline" className="h-16 w-16 rounded-2xl border-black/5 bg-white shadow-sm hover:bg-accent transition-all">
                          <Brain className="h-7 w-7 text-muted-foreground" />
                       </Button>
                    </div>
                  </div>
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center justify-center gap-3">
                    <Shield className="h-3 w-3" /> Encrypted Session • Powered by Mistral v2
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Sidebar History Panel */}
         <div className="space-y-6 slide-up" style={{ animationDelay: '0.2s' }}>
            <Card className="rounded-[2.5rem] border-black/5 shadow-xl bg-white/60 backdrop-blur-md">
               <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black tracking-tight text-[#0A0A0A]">Recent Brain Syncs</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground/40" />
               </CardHeader>
               <CardContent className="p-8 pt-2 space-y-6">
                  {[
                    { title: "Product Roadmap Sync", time: "2h ago", initials: "PR", color: "bg-indigo-100 text-indigo-700" },
                    { title: "Weekly Growth Pulse", time: "5h ago", initials: "GP", color: "bg-primary/10 text-primary" },
                    { title: "Backend Architecture", time: "Yesterday", initials: "BA", color: "bg-emerald-100 text-emerald-700" }
                  ].map((sync, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-11 w-11 rounded-2xl">
                             <AvatarFallback className={`font-black text-[10px] rounded-2xl ${sync.color}`}>{sync.initials}</AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                             <p className="text-sm font-black text-[#0A0A0A] leading-none mb-1">{sync.title}</p>
                             <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{sync.time}</p>
                          </div>
                       </div>
                       <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
                     Explore History
                  </Button>
               </CardContent>
            </Card>

            <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white space-y-4 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
               <Zap className="h-8 w-8 text-primary relative z-10 group-hover:rotate-12 transition-transform" />
               <h4 className="text-xl font-black tracking-tight relative z-10 leading-none">Pro Insight</h4>
               <p className="text-sm font-bold text-white/50 leading-relaxed relative z-10 italic">
                 "Paste the raw notes from your Slack or Zoom. Our AI handles the cleaning automatically."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
