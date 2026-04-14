import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { InputCard } from "@/components/InputCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { LiveTranscription } from "@/components/LiveTranscription";
import { useCreateMeeting } from "@/hooks/useMeetings";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const NewMeeting = () => {
  const navigate = useNavigate();
  const createMeeting = useCreateMeeting();
  const [transcript, setTranscript] = useState("");

  const handleGenerate = useCallback(async () => {
    if (!transcript.trim()) return;
    try {
      const meeting = await createMeeting.mutateAsync({
        title: `Meeting ${new Date().toLocaleDateString()}`,
        transcript,
      });
      setTranscript("");
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

      {/* Live transcription */}
      <LiveTranscription onTranscriptReady={handleLiveTranscript} />

      <InputCard
        transcript={transcript}
        onTranscriptChange={setTranscript}
        onGenerate={handleGenerate}
        onAudioFile={handleAudioFile}
        onRecordingComplete={handleRecordingComplete}
        isGenerating={createMeeting.isPending}
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
