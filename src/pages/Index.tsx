import { useState, useCallback, useRef, useEffect } from "react";
import { InputCard } from "@/components/InputCard";
import { OutputTabs } from "@/components/OutputTabs";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MeetingNotes } from "@/lib/types";
import { createMeeting, saveMeeting, generateMockNotes } from "@/lib/meetings-store";
import { Download } from "lucide-react";

const Index = () => {
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState<MeetingNotes | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!transcript.trim()) return;
    setIsGenerating(true);
    setNotes(null);

    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 2000));
    const generated = generateMockNotes(transcript);
    setNotes(generated);
    setIsGenerating(false);

    // Save to local storage
    const meeting = createMeeting(transcript);
    meeting.notes = generated;
    saveMeeting(meeting);
  }, [transcript]);

  useEffect(() => {
    if (notes && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [notes]);

  const handleAudioFile = useCallback((file: File) => {
    // Mock: in real app, this would send to transcription API
    setTranscript(`[Audio file uploaded: ${file.name}]\n\nTranscription would appear here after processing with AI. For now, paste your transcript above to generate notes.`);
  }, []);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setTranscript(`[Audio recorded: ${(blob.size / 1024).toFixed(1)}KB]\n\nTranscription would appear here after processing with AI. For now, paste your transcript above to generate notes.`);
  }, []);

  const handleDownload = () => {
    if (!notes) return;
    const content = [
      "# Meeting Notes",
      "",
      "## Summary",
      notes.summary,
      "",
      "## Action Items",
      ...notes.actionItems.map((i) => `- ${i}`),
      "",
      "## Decisions",
      ...notes.decisions.map((d) => `- ${d}`),
      "",
      "## Tasks",
      ...notes.tasks.map((t) => `- [${t.priority}] ${t.task} — ${t.owner}`),
    ].join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting-notes.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2 fade-in">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">AI Meeting Notes</h1>
        <p className="text-muted-foreground text-base">Turn conversations into structured insights</p>
      </div>

      {/* Input */}
      <InputCard
        transcript={transcript}
        onTranscriptChange={setTranscript}
        onGenerate={handleGenerate}
        onAudioFile={handleAudioFile}
        onRecordingComplete={handleRecordingComplete}
        isGenerating={isGenerating}
      />

      {/* Loading */}
      {isGenerating && (
        <div className="notion-card">
          <LoadingSkeleton />
        </div>
      )}

      {/* Results */}
      {notes && (
        <div ref={resultsRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground fade-in">Generated Notes</h2>
            <button onClick={handleDownload} className="notion-btn-ghost text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
          <OutputTabs notes={notes} />
        </div>
      )}
    </div>
  );
};

export default Index;
