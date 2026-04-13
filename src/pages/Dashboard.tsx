import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { InputCard } from "@/components/InputCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { useCreateMeeting, useMeetings, useDeleteMeeting } from "@/hooks/useMeetings";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Plus, FileText, ChevronRight, Trash2, CalendarDays, ListChecks, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarSection } from "@/components/CalendarSection";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";

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
  const calendar = useGoogleCalendar();

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
      setTimeout(() => navigate(`/dashboard/meeting/${meeting.id}`), 1000);
    } catch (err) {
      console.error(err);
    }
  }, [transcript, createMeeting, navigate]);

  const handleAudioFile = useCallback((file: File) => {
    setTranscript(
      `[Audio file uploaded: ${file.name}]\n\nAudio transcription will be available in a future update. For now, paste your transcript to generate notes.`
    );
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setTranscript(
      `[Audio recorded: ${(blob.size / 1024).toFixed(1)}KB]\n\nAudio transcription will be available in a future update. For now, paste your transcript to generate notes.`
    );
  }, []);

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

  const firstName = profile?.full_name?.trim().split(/\s+/)[0];
  const displayName = firstName || user?.email?.split("@")[0] || "there";
  const greeting = firstName ? getGreeting(firstName) : "Hi, there 👋";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {greeting}
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Here's your meeting overview
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)} className="rounded-xl">
            <BarChart3 className="h-4 w-4" />
            {showAnalytics ? "Hide" : "Analytics"}
          </Button>
          <Button onClick={() => setShowInput(!showInput)} className="rounded-xl">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalMeetings}</p>
              <p className="text-xs text-muted-foreground">Total Meetings</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{thisWeek}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
              <ListChecks className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{actionItemsCount}</p>
              <p className="text-xs text-muted-foreground">Action Items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Google Calendar */}
      <div className="fade-in">
        <CalendarSection
          events={calendar.events}
          isConnected={calendar.isConnected}
          isLoading={calendar.isLoading}
          onConnect={calendar.connect}
          onDisconnect={calendar.disconnect}
        />
      </div>

      {/* Analytics */}
      {showAnalytics && meetings && (
        <div className="fade-in">
          <AnalyticsDashboard meetings={meetings} />
        </div>
      )}

      {/* Input */}
      {showInput && (
        <div className="fade-in">
          <InputCard
            transcript={transcript}
            onTranscriptChange={setTranscript}
            onGenerate={handleGenerate}
            onAudioFile={handleAudioFile}
            onRecordingComplete={handleRecordingComplete}
            isGenerating={createMeeting.isPending}
          />
        </div>
      )}

      {createMeeting.isPending && (
        <div className="notion-card">
          <LoadingSkeleton />
        </div>
      )}

      {/* Meetings list */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Recent Meetings</h2>

        {loadingMeetings ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-pulse h-20 rounded-2xl" />
            ))}
          </div>
        ) : !meetings?.length ? (
          <div className="notion-card text-center py-16 fade-in">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No meetings yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((meeting, i) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 fade-slide-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <Link
                  to={`/dashboard/meeting/${meeting.id}`}
                  className="flex-1 min-w-0 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        meeting.status === "completed"
                          ? "bg-accent text-accent-foreground"
                          : meeting.status === "processing"
                          ? "bg-secondary text-muted-foreground"
                          : meeting.status === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {meeting.status}
                    </span>
                    {meeting.sentiment && (
                      <span className="text-xs">
                        {meeting.sentiment === "positive" ? "😊" : meeting.sentiment === "negative" ? "😟" : "😐"}
                      </span>
                    )}
                    {meeting.productivity_score != null && (
                      <span className="text-xs text-muted-foreground">⚡{meeting.productivity_score}%</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(meeting.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {meeting.summary && (
                      <span className="ml-2">· {meeting.summary.slice(0, 60)}...</span>
                    )}
                  </p>
                </Link>
                <div className="flex items-center gap-1 ml-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm("Delete this meeting?")) {
                        deleteMeeting.mutate(meeting.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                  <Link to={`/dashboard/meeting/${meeting.id}`}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
