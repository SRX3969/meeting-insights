import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TranscriptionResult {
  transcript: string;
  method: string;
}

export function useAudioTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const transcribeAudio = useCallback(
    async (audioData: File | Blob, fileName?: string): Promise<string | null> => {
      setIsTranscribing(true);
      setProgress("Preparing audio...");

      try {
        const session = (await supabase.auth.getSession()).data.session;
        if (!session) {
          toast.error("Please sign in to transcribe audio");
          return null;
        }

        setProgress("Uploading & transcribing...");

        // Build form data
        const formData = new FormData();
        const file =
          audioData instanceof File
            ? audioData
            : new File([audioData], fileName || "recording.webm", {
                type: audioData.type || "audio/webm",
              });
        formData.append("audio", file);

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: formData,
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(errData.error || `Server error ${res.status}`);
        }

        const data: TranscriptionResult | { error: string; message?: string } =
          await res.json();

        if ("error" in data) {
          if (data.error === "transcription_unavailable") {
            toast.error(data.message || "Transcription is not available");
            return null;
          }
          throw new Error(data.error);
        }

        if (data.transcript) {
          setProgress("Transcription complete!");
          toast.success("Audio transcribed successfully!");
          return data.transcript;
        }

        toast.error("No transcription returned");
        return null;
      } catch (err) {
        console.error("Transcription error:", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to transcribe audio"
        );
        return null;
      } finally {
        setIsTranscribing(false);
        setTimeout(() => setProgress(""), 2000);
      }
    },
    []
  );

  return { transcribeAudio, isTranscribing, progress };
}
