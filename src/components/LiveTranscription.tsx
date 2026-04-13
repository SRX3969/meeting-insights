import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LiveTranscriptionProps {
  onTranscriptReady: (transcript: string) => void;
}

export function LiveTranscription({ onTranscriptReady }: LiveTranscriptionProps) {
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setLiveText((prev) => prev + final);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Restart if still listening (browser may auto-stop)
      if (recognitionRef.current && isListening) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
    const finalTranscript = liveText.trim();
    if (finalTranscript) {
      onTranscriptReady(finalTranscript);
    }
  }, [liveText, onTranscriptReady]);

  const clearTranscript = () => {
    setLiveText("");
    setInterimText("");
  };

  if (!supported) {
    return (
      <div className="notion-card text-center py-6">
        <p className="text-sm text-muted-foreground">
          Voice transcription is not supported in this browser. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="notion-card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">🎙️ Live Voice Transcription</h3>
        <div className="flex items-center gap-2">
          {liveText && !isListening && (
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={clearTranscript}>
              Clear
            </Button>
          )}
          {isListening ? (
            <Button variant="destructive" size="sm" className="rounded-xl" onClick={stopListening}>
              <Square className="h-3.5 w-3.5 mr-1" /> Stop Recording
            </Button>
          ) : (
            <Button size="sm" className="rounded-xl" onClick={startListening}>
              <Mic className="h-3.5 w-3.5 mr-1" /> Start Recording
            </Button>
          )}
        </div>
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-xs text-destructive">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
          </span>
          Recording...
        </div>
      )}

      {(liveText || interimText) && (
        <div className="rounded-xl bg-secondary/50 border border-border p-4 max-h-48 overflow-y-auto">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {liveText}
            {interimText && <span className="text-muted-foreground italic">{interimText}</span>}
          </p>
        </div>
      )}

      {!isListening && !liveText && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Click "Start Recording" to begin live transcription. Speak clearly into your microphone.
        </p>
      )}
    </div>
  );
}
