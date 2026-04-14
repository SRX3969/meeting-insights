import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputCard } from "@/components/InputCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LiveTranscription } from "@/components/LiveTranscription";
import { useCreateMeeting } from "@/hooks/useMeetings";
import { useAudioTranscription } from "@/hooks/useAudioTranscription";
import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface CalendarEventState {
  title: string;
  start: string;
  end: string;
  description: string | null;
}

const NewMeeting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const createMeeting = useCreateMeeting();
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const { transcribeAudio, isTranscribing, progress: transcriptionProgress } = useAudioTranscription();

  // Pre-fill from calendar event if navigated from CalendarSection
  const calendarEvent = (location.state as { calendarEvent?: CalendarEventState } | null)?.calendarEvent;

  useEffect(() => {
    if (calendarEvent) {
      setMeetingTitle(calendarEvent.title);
      if (calendarEvent.description) {
        setTranscript((prev) =>
          prev ? prev : `Meeting: ${calendarEvent.title}\nScheduled: ${new Date(calendarEvent.start).toLocaleString()} - ${new Date(calendarEvent.end).toLocaleString()}\n\nContext: ${calendarEvent.description}\n\n--- Paste or record your meeting transcript below ---\n`
        );
      }
    }
  }, [calendarEvent]);

  const handleGenerate = useCallback(async () => {
    if (!transcript.trim()) return;
    try {
      const meeting = await createMeeting.mutateAsync({
        title: meetingTitle || `Meeting ${new Date().toLocaleDateString()}`,
        transcript,
      });
      setTranscript("");
      setMeetingTitle("");
      setTimeout(() => navigate(`/dashboard/meeting/${meeting.id}`), 1000);
    } catch (err) {
      console.error(err);
    }
  }, [transcript, meetingTitle, createMeeting, navigate]);

  const handleAudioFile = useCallback(async (file: File) => {
    const result = await transcribeAudio(file, file.name);
    if (result) {
      setTranscript((prev) => (prev ? prev + "\n\n" + result : result));
    }
  }, [transcribeAudio]);

  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    const result = await transcribeAudio(blob, "recording.webm");
    if (result) {
      setTranscript((prev) => (prev ? prev + "\n\n" + result : result));
    }
  }, [transcribeAudio]);

  const handleLiveTranscript = useCallback((text: string) => {
    setTranscript((prev) => (prev ? prev + "\n\n" + text : text));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8 fade-in">
      <div>
        <Link to="/dashboard/meetings" className="notion-btn-ghost text-sm text-muted-foreground mb-4 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Meetings
        </Link>
        <h1 className="text-3xl font-bold text-foreground tracking-tight mt-3">New Meeting</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paste a transcript, record live, or upload audio to generate AI notes.
        </p>
      </div>

      {/* Calendar event context banner */}
      {calendarEvent && (
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 px-4 py-3">
          <Calendar className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{calendarEvent.title}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(calendarEvent.start).toLocaleString()} — {new Date(calendarEvent.end).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Meeting title input */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meeting Title</label>
        <input
          type="text"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
          placeholder="Auto-generated from transcript if left empty"
          className="notion-input text-sm py-2.5"
        />
      </div>

      {/* Live transcription */}
      <LiveTranscription onTranscriptReady={handleLiveTranscript} />

      <InputCard
        transcript={transcript}
        onTranscriptChange={setTranscript}
        onGenerate={handleGenerate}
        onAudioFile={handleAudioFile}
        onRecordingComplete={handleRecordingComplete}
        isGenerating={createMeeting.isPending}
        isTranscribing={isTranscribing}
        transcriptionProgress={transcriptionProgress}
      />

      {createMeeting.isPending && (
        <div className="notion-card">
          <LoadingSkeleton />
        </div>
      )}
    </div>
  );
};

export default NewMeeting;
