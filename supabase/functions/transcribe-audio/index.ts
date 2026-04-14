import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the uploaded audio file from multipart form data
    const contentType = req.headers.get("content-type") || "";
    
    let audioBlob: Blob;
    let fileName = "audio.webm";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File | null;
      if (!audioFile) {
        return new Response(
          JSON.stringify({ error: "No audio file provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      audioBlob = audioFile;
      fileName = audioFile.name || "audio.webm";
    } else {
      // Raw binary body
      const arrayBuffer = await req.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return new Response(
          JSON.stringify({ error: "Empty audio data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      audioBlob = new Blob([arrayBuffer], { type: "audio/webm" });
    }

    // Use the Lovable AI Gateway for transcription via Whisper-compatible endpoint
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (LOVABLE_API_KEY) {
      // Try using Lovable AI Gateway with a speech-to-text prompt approach
      // Since the gateway provides chat completions, we describe the audio info
      // and use Gemini's multimodal capabilities
      
      // Convert audio to base64
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      const audioBase64 = btoa(
        String.fromCharCode(...new Uint8Array(audioArrayBuffer))
      );
      
      // Determine MIME type
      const ext = fileName.split(".").pop()?.toLowerCase() || "webm";
      const mimeMap: Record<string, string> = {
        mp3: "audio/mpeg",
        wav: "audio/wav",
        webm: "audio/webm",
        m4a: "audio/mp4",
        ogg: "audio/ogg",
      };
      const mimeType = mimeMap[ext] || "audio/webm";

      const aiResponse = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a precise audio transcription assistant. Your ONLY job is to transcribe the audio content into text. 
Output ONLY the transcription — no commentary, no headers, no formatting. 
If there are multiple speakers, format like:
Speaker 1: [what they said]
Speaker 2: [what they said]

If you cannot determine speakers, just output the text as a continuous transcript.
Do NOT add anything the speakers didn't say.`
              },
              {
                role: "user",
                content: [
                  {
                    type: "input_audio",
                    input_audio: {
                      data: audioBase64,
                      format: ext === "mp3" ? "mp3" : ext === "wav" ? "wav" : "mp3",
                    },
                  },
                  {
                    type: "text",
                    text: "Transcribe this audio recording accurately. Output only the transcription text.",
                  },
                ],
              },
            ],
          }),
        }
      );

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const transcript = aiData.choices?.[0]?.message?.content;
        
        if (transcript && transcript.trim()) {
          return new Response(
            JSON.stringify({ 
              transcript: transcript.trim(),
              method: "ai-multimodal"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        const errText = await aiResponse.text();
        console.error("AI transcription error:", aiResponse.status, errText);
      }
    }

    // Fallback: Return a helpful error message if transcription isn't available
    return new Response(
      JSON.stringify({ 
        error: "transcription_unavailable",
        message: "Audio transcription requires an AI API key to be configured. Please set up LOVABLE_API_KEY or OPENAI_API_KEY in your Supabase Edge Function secrets.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("transcribe-audio error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
