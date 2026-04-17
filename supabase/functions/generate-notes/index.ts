import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.10.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { meetingId, transcript } = await req.json();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const GOOGLE_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // AI Logic with Quota Safety
    const models = ["gemini-1.5-flash-8b", "gemini-1.5-flash", "gemini-pro"];
    let finalNotes = null;
    let lastError = "";

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are NoteMind AI. Transform this transcript into a JSON report.
                
CRITICAL: Map every task to its speaker in the 'speakers' section.
SCHEMA:
{
  "title": "string",
  "sentiment": "Positive|Negative|Neutral|Mixed",
  "productivity": number,
  "summary": "A narrative roadmap that EXPLICITLY details what every single person is doing by name (e.g. 'Rohit will do X, while Ananya focuses on Y').",
  "action_items": ["string"],
  "decisions": ["string"],
  "tasks": [{"task":"string", "assignee":"string", "priority":"high|medium|low"}],
  "speakers": [{"name":"string", "tasks_assigned":["string"], "sentiment":"Positive|Negative|Neutral"}]
}

Transcript: ${transcript}`
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: "application/json",
            }
          })
        });

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        finalNotes = JSON.parse(data.candidates[0].content.parts[0].text);
        break;
      } catch (e: any) {
        lastError = e.message;
        if (e.message.includes("429") || e.message.includes("503")) continue;
      }
    }

    if (!finalNotes) throw new Error(`AI Exhausted: ${lastError}`);

    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        title: finalNotes.title,
        summary: finalNotes.summary,
        action_items: finalNotes.action_items,
        decisions: finalNotes.decisions,
        tasks: finalNotes.tasks.map((t: any) => ({ task: t.task, owner: t.assignee, priority: t.priority })),
        sentiment: finalNotes.sentiment.toLowerCase(),
        productivity_score: finalNotes.productivity,
        participation_insights: {
          mostActive: finalNotes.speakers?.[0]?.name || "Unknown",
          speakerCount: finalNotes.speakers?.length || 1,
          engagementLevel: "high",
          speakers: finalNotes.speakers
        },
        status: "completed",
      })
      .eq("id", meetingId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
