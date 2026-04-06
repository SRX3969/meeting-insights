import { Mic, Square } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";

interface RecordingControlsProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function RecordingControls({ onRecordingComplete }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <>
          <button onClick={stopRecording} className="notion-btn-secondary gap-2">
            <Square className="h-3.5 w-3.5" />
            Stop Recording
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="recording-dot" />
            <span className="font-mono tabular-nums">{formatTime(seconds)}</span>
          </div>
        </>
      ) : (
        <button onClick={startRecording} className="notion-btn-secondary">
          <Mic className="h-4 w-4" />
          Record Audio
        </button>
      )}
    </div>
  );
}
