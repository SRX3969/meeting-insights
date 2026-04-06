import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InputCard } from "@/components/InputCard";
import { OutputTabs } from "@/components/OutputTabs";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useCreateMeeting, useMeetings, DbMeeting } from "@/hooks/useMeetings";
import { useAuth } from "@/hooks/useAuth";
import { Download, Plus, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { data: meetings, isLoading: loadingMeetings } = useMeetings();
  const createMeeting = useCreateMeeting();
  const navigate = useNavigate();

  const [transcript, setTranscript] = useState("");
  const [showInput, setShowInput] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!transcript.trim()) return;
    try {
      const meeting = await createMeeting.mutateAsync({
        title: `Meeting ${new Date().toLocaleDateString()}`,
        transcript,
      });
      setTranscript("");
      setShowInput(false);
      // Navigate to the meeting after a moment for AI to process
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {user?.email?.split("@")[0]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowInput(!showInput)} size="sm">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>

      {/* Input (toggle) */}
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
        <h2 className="text-lg font-semibold text-foreground">Your Meetings</h2>

        {loadingMeetings ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-pulse h-16 rounded-xl" />
            ))}
          </div>
        ) : !meetings?.length ? (
          <div className="notion-card text-center py-16 fade-in">
            <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No meetings yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.map((meeting, i) => (
              <Link
                key={meeting.id}
                to={`/dashboard/meeting/${meeting.id}`}
                className="flex items-center justify-between rounded-xl border border-border px-5 py-4 transition-all duration-150 hover:bg-accent hover-lift fade-slide-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        meeting.status === "completed"
                          ? "bg-secondary text-foreground"
                          : meeting.status === "processing"
                          ? "bg-secondary text-muted-foreground"
                          : meeting.status === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(meeting.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
