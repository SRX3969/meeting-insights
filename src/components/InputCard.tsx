import { Upload, Sparkles } from "lucide-react";
import { useRef } from "react";
import { RecordingControls } from "./RecordingControls";

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

  return (
    <div className="notion-card slide-up">
      <textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        placeholder="Paste your meeting transcript here..."
        className="notion-input min-h-[180px] resize-none text-sm leading-relaxed"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !transcript.trim()}
          className="notion-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Notes"}
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
