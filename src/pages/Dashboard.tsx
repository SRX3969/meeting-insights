import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Plus, 
  FileText, 
  ChevronRight, 
  Trash2, 
  CalendarDays, 
  ListChecks, 
  BarChart3, 
  Brain, 
  Sparkles, 
  Mic, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { InputCard } from "@/components/InputCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useCreateMeeting, useMeetings, useDeleteMeeting } from "@/hooks/useMeetings";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";

function getGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name} ☀️`;
  if (hour < 17) return `Good Afternoon, ${name} 🌤️`;
  return `Good Evening, ${name} 🌙`;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: meetings, isLoading: loadingMeetings } = useMeetings();
  const createMeeting = useCreateMeeting();
  const deleteMeeting = useDeleteMeeting();
  const navigate = useNavigate();
  const { transcribeAudio, isTranscribing, progress: transcriptionProgress } = useAudioTranscription();

  const [transcript, setTranscript] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!transcript.trim()) return;
    try {
      const meeting = await createMeeting.mutateAsync({
        title: `Meeting ${new Date().toLocaleDateString()}`,
        transcript,
      });
      setTranscript("");
      setShowInput(false);
      // Faster navigation for better UX
      navigate(`/dashboard/meeting/${meeting.id}`);
    } catch (err) {
      console.error(err);
    }
  }, [transcript, createMeeting, navigate]);

  const firstName = profile?.username || profile?.full_name?.trim().split(/\s+/)[0] || user?.email?.split("@")[0] || "there";
  const greeting = getGreeting(firstName);

  // Stats
  const totalMeetings = meetings?.length || 0;
  const thisWeek = meetings?.filter((m) => {
    const d = new Date(m.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length || 0;
  const actionItemsCount = meetings?.reduce((acc, m) => {
    const items = (m.action_items as string[]) || [];
    return acc + items.length;
  }, 0) || 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-[#0A0A0A]">
            Hi, {firstName} 👋
          </h1>
          <p className="text-muted-foreground font-semibold text-sm">
            Here's your meeting overview <span className="text-green-500 ml-1">• Live</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)} 
            className="h-10 px-6 rounded-xl bg-white border-black/10 shadow-sm font-bold text-xs hover:bg-black/5"
          >
            <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
            Analytics
          </Button>
          <Button 
            onClick={() => setShowInput(!showInput)} 
            className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/10 transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showInput ? "Cancel" : "New Meeting"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 slide-up">
        {[
          { label: "Total Meetings", value: totalMeetings, icon: BarChart3, color: "text-primary bg-primary/10" },
          { label: "This Week", value: thisWeek, icon: CalendarDays, color: "text-purple-600 bg-purple-50" },
          { label: "Action Items", value: actionItemsCount, icon: ListChecks, color: "text-blue-600 bg-blue-50" }
        ].map((stat, i) => (
          <div key={i} className="group p-6 rounded-2xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color} shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-[#0A0A0A] tracking-tighter">{stat.value}</h3>
                   <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
             </div>
          </div>
        ))}
      </div>



      <div className="grid lg:grid-cols-3 gap-10 items-start">
         <div className="lg:col-span-2 space-y-10">
            {/* Analytics Dashboard */}
            {showAnalytics && meetings && (
              <div className="slide-up">
                <AnalyticsDashboard meetings={meetings} />
              </div>
            )}

            {/* Input Feature - Always visible as per original design */}
            <div className="relative bg-white rounded-[2rem] p-1 shadow-xl overflow-hidden border border-black/5">
              <InputCard
                transcript={transcript}
                onTranscriptChange={setTranscript}
                onGenerate={handleGenerate}
                onAudioFile={async (file) => {
                  const res = await transcribeAudio(file);
                  if (res) setTranscript(prev => prev ? prev + "\n\n" + res : res);
                }}
                onRecordingComplete={async (blob) => {
                  const res = await transcribeAudio(blob);
                  if (res) setTranscript(prev => prev ? prev + "\n\n" + res : res);
                }}
                isGenerating={createMeeting.isPending || isTranscribing}
              />
              {isTranscribing && (
                <div className="px-8 pb-6 text-xs font-black text-primary animate-pulse tracking-widest uppercase italic">
                  {transcriptionProgress || "Syncing Audio Intelligence..."}
                </div>
              )}
            </div>

            {/* Meetings Table */}
            <div className="space-y-6 slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black tracking-tight text-[#0A0A0A]">Workspace Sync Live</h2>
                <Link to="/dashboard/meetings" className="text-xs font-bold text-primary hover:underline">View All</Link>
              </div>

              {loadingMeetings ? (
                <div className="flex items-center justify-center py-24 bg-white rounded-[2rem] border border-black/5 shadow-sm">
                  <Loader2 className="h-8 w-8 text-muted-foreground/20 animate-spin" />
                </div>
              ) : !meetings?.length ? (
                <div className="py-20 text-center rounded-[3rem] bg-black/5 border border-dashed border-black/10">
                   <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <FileText className="h-6 w-6 text-muted-foreground/40" />
                   </div>
                   <p className="text-muted-foreground font-bold">No data found in this sync.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting, i) => (
                    <div
                      key={meeting.id}
                      className="group flex items-center justify-between rounded-[2rem] border border-black/5 bg-white px-6 py-5 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
                    >
                      <Link to={`/dashboard/meeting/${meeting.id}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                           <h4 className="text-sm font-black text-[#0A0A0A] truncate">{meeting.title}</h4>
                           <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${
                              meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                           }`}>
                             {meeting.status}
                           </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60">
                           <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(meeting.created_at).toLocaleDateString()}</span>
                           {meeting.productivity_score && (
                             <span className="flex items-center gap-1 text-primary"><TrendingUp className="h-3 w-3" /> {meeting.productivity_score}% Efficiency</span>
                           )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm("Delete this sync?")) deleteMeeting.mutate(meeting.id);
                            }}
                         >
                            <Trash2 className="h-4 w-4" />
                         </Button>
                         <Link to={`/dashboard/meeting/${meeting.id}`} className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary transition-colors hover:text-white">
                            <ChevronRight className="h-4 w-4" />
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
         </div>

         {/* Right Sidebar - Active Context */}
         <div className="space-y-8 slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white space-y-4 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16" />
               <Zap className="h-8 w-8 text-primary" />
               <h4 className="text-xl font-black tracking-tight leading-none italic uppercase">Intelligence Mode</h4>
               <p className="text-sm font-bold text-white/50 leading-relaxed italic">
                 "Paste raw Zoom or Slack transcripts. Our engine extracts the hidden structure for you."
               </p>
               <Button className="w-full bg-white/10 hover:bg-white/20 border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest py-6">
                 Learn Syntax
               </Button>
            </div>

            <div className="rounded-[2.5rem] border border-black/5 p-8 bg-white/40 backdrop-blur-sm space-y-6">
               <h4 className="text-sm font-black text-[#0A0A0A] uppercase tracking-widest">Active Syncs</h4>
               <div className="space-y-4">
                  {[
                    { name: 'Product Growth', time: '2m ago' },
                    { name: 'Architecture Review', time: '1h ago' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-black/[0.03] shadow-sm">
                       <span className="text-xs font-bold text-[#0A0A0A]">{item.name}</span>
                       <span className="text-[10px] font-bold text-muted-foreground/50">{item.time}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
