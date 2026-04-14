import { Upload, Sparkles, AlertCircle, Loader2, Mic } from "lucide-react";
import { useRef, useState } from "react";
import { RecordingControls } from "./RecordingControls";
import { transcriptSchema } from "@/lib/validation";

interface InputCardProps {
  transcript: string;
  onTranscriptChange: (value: string) => void;
  onGenerate: () => void;
  onAudioFile: (file: File) => void;
  onRecordingComplete: (blob: Blob) => void;
  isGenerating: boolean;
  isTranscribing?: boolean;
  transcriptionProgress?: string;
}

export function InputCard({
  transcript,
  onTranscriptChange,
  onGenerate,
  onAudioFile,
  onRecordingComplete,
  isGenerating,
  isTranscribing = false,
  transcriptionProgress = "",
}: InputCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleGenerate = () => {
    const result = transcriptSchema.safeParse(transcript);
    if (!result.success) {
      setValidationError(result.error.errors[0].message);
      return;
    }
    setValidationError(null);
    onGenerate();
  };

  const handleChange = (value: string) => {
    onTranscriptChange(value);
    if (validationError) {
      const result = transcriptSchema.safeParse(value);
      if (result.success) setValidationError(null);
    }
  };

  return (
    <div className="notion-card slide-up">
      <textarea
        value={transcript}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Paste your meeting transcript here (min 50 characters), or upload/record audio to auto-transcribe..."
        className={`notion-input min-h-[180px] resize-none text-sm leading-relaxed ${
          validationError ? "border-destructive ring-1 ring-destructive/30" : ""
        }`}
        disabled={isTranscribing}
      />

      {validationError && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {validationError}
        </div>
      )}

      {/* Transcription progress */}
      {isTranscribing && (
        <div className="flex items-center gap-3 mt-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {transcriptionProgress || "Processing audio..."}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This may take a moment depending on audio length
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || isTranscribing || !transcript.trim()}
          className="notion-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Notes"}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isTranscribing}
          className="notion-btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          {isTranscribing ? "Transcribing..." : "Upload Audio"}
        </button>

        <RecordingControls onRecordingComplete={onRecordingComplete} disabled={isTranscribing} />

        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.webm,.m4a,.ogg,.flac"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Validate file size (max 25MB)
              if (file.size > 25 * 1024 * 1024) {
                alert("File size must be under 25MB");
                return;
              }
              onAudioFile(file);
            }
            // Reset so same file can be re-selected
            e.target.value = "";
          }}
        />
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground mt-3">
        Supports MP3, WAV, WebM, M4A, OGG, FLAC · Max 25MB · Audio is transcribed via AI
      </p>
    </div>
  );
}
