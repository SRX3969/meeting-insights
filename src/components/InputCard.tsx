import { Upload, Sparkles, AlertCircle, Loader2 } from "lucide-react";
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
}

export function InputCard({
  transcript,
  onTranscriptChange,
  onGenerate,
  onAudioFile,
  onRecordingComplete,
  isGenerating,
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
        placeholder="Paste your meeting transcript here (min 50 characters)..."
        className={`notion-input min-h-[180px] resize-none text-sm leading-relaxed ${
          validationError ? "border-destructive ring-1 ring-destructive/30" : ""
        }`}
      />

      {validationError && (
        <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {validationError}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !transcript.trim()}
          className="notion-btn-primary disabled:opacity-40 disabled:cursor-not-allowed min-w-[140px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Notes
            </>
          )}
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="notion-btn-secondary">
          <Upload className="h-4 w-4" />
          Upload Audio
        </button>

        <RecordingControls onRecordingComplete={onRecordingComplete} />

        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,.webm,.m4a"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAudioFile(file);
          }}
        />
      </div>
    </div>
  );
}
