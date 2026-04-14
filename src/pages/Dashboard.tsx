import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Sparkles, Wand2, Upload, Mic, LayoutDashboard, History, CheckCircle2, TrendingUp, Users, ArrowRight } from "lucide-react";
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
      {/* Subtle Mesh Glow */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            Active Session
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0A0A0A]">
            Good morning, {firstName} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-muted-foreground font-semibold text-lg max-w-md">
            Your intelligence engine is ready. What are we analyzing today?
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-black/5 shadow-sm font-bold text-sm">
             <TrendingUp className="h-4 w-4 mr-2 text-primary" />
             View Analytics
           </Button>
           <Button size="lg" className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:scale-105">
             <Wand2 className="h-4 w-4 mr-2" />
             Quick Sync
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        {[
          { label: "Total Intelligence", value: "156", sub: "Meetings analyzed", icon: Brain, color: "text-primary bg-primary/10" },
          { label: "Tasks Unlocked", value: "42", sub: "Action items found", icon: CheckCircle2, color: "text-green-600 bg-green-50" },
          { label: "Collaboration", value: "8", sub: "Active contributors", icon: Users, color: "text-blue-600 bg-blue-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-sm border border-black/5 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-start justify-between">
               <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#0A0A0A] tracking-tighter">{stat.value}</h3>
                  <p className="text-xs font-bold text-muted-foreground opacity-60 tracking-tight italic">{stat.sub}</p>
               </div>
               <div className={`h-12 w-12 rounded-[1.2rem] flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Intelligence Input */}
      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-black/5 shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl group">
               <CardHeader className="p-8 pb-4">
                  <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter">
                     <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                        <Mic className="h-5 w-5 text-white" />
                     </div>
                     Intelligence Input
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                  <div className="relative group/input">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-[2rem] blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                    <Textarea
                      placeholder="Paste your meeting transcript here (min 5 characters)..."
                      className="min-h-[280px] rounded-[1.8rem] bg-white border-black/5 p-8 text-lg font-medium resize-none focus-visible:ring-primary shadow-inner relative z-10"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isCreating}
                      className="h-14 px-10 rounded-2xl bg-[#0A0A0A] hover:bg-black text-white font-black text-lg flex-1 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Analyzing Knowledge...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-3 text-primary" />
                          Generate Insights
                        </>
                      )}
                    </Button>
                    <div className="flex gap-2">
                       <Button variant="outline" className="h-14 w-14 rounded-2xl border-black/5 bg-white shadow-sm hover:bg-black/5 transition-all">
                          <Upload className="h-6 w-6 text-muted-foreground" />
                       </Button>
                       <Button variant="outline" className="h-14 w-14 rounded-2xl border-black/5 bg-white shadow-sm hover:bg-black/5 transition-all">
                          <Mic className="h-6 w-6 text-muted-foreground" />
                       </Button>
                    </div>
                  </div>
                  <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    Supports Audio, PDF, and Text • encrypted end-to-end
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Side Activity Panel */}
         <div className="space-y-6">
            <Card className="rounded-[2.5rem] border-black/5 shadow-xl bg-white/60 backdrop-blur-md">
               <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-black tracking-tight text-[#0A0A0A]">Recent Brain Syncs</CardTitle>
                  <History className="h-4 w-4 text-muted-foreground/50" />
               </CardHeader>
               <CardContent className="p-8 pt-2 space-y-6">
                  {[
                    { title: "Product Roadmap Sync", time: "2h ago", initials: "PR", color: "bg-blue-100 text-blue-700" },
                    { title: "Weekly Growth Pulse", time: "5h ago", initials: "GP", color: "bg-primary/10 text-primary" },
                    { title: "Backend Architecture", time: "Yesterday", initials: "BA", color: "bg-green-100 text-green-700" }
                  ].map((sync, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                       <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                             <AvatarFallback className={`font-black text-[10px] ${sync.color}`}>{sync.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="text-sm font-black text-[#0A0A0A] leading-none mb-1">{sync.title}</p>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{sync.time}</p>
                          </div>
                       </div>
                       <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                     View All History
                  </Button>
               </CardContent>
            </Card>

            {/* Smart Tip Card */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-purple-600 text-white space-y-4 shadow-2xl shadow-primary/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -mr-10 -mt-10" />
               <Zap className="h-8 w-8 text-white relative z-10 group-hover:rotate-12 transition-transform" />
               <h4 className="text-lg font-black tracking-tight relative z-10">Pro Tip</h4>
               <p className="text-sm font-bold opacity-80 leading-relaxed relative z-10 italic font-serif">
                 "Try uploading an audio recording. Our v2 engine now recognizes different speakers automatically."
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
