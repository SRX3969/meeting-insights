import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meetingId, transcript } = await req.json();
    if (!transcript || !meetingId) {
      return new Response(JSON.stringify({ error: "meetingId and transcript are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !anonKey || !OPENAI_API_KEY || !supabaseKey) {
      console.error("Missing Env variables");
      return new Response(
        JSON.stringify({ error: "Server configuration missing API credentials." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader! } },
    });

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a meeting notes assistant. Analyze the meeting transcript and extract structured notes. Return a JSON object with these fields:
- summary: A concise 3-5 sentence summary of the meeting
- actionItems: An array of action item strings
- decisions: An array of key decisions made
- keyPoints: An array of important points discussed
- tasks: An array of objects with { task: string, owner: string, priority: "high" | "medium" | "low" }
- suggestedTitle: A short descriptive title for this meeting
- sentiment: One of "positive", "neutral", or "negative" based on the overall meeting tone
- productivityScore: An integer from 0-100 indicating how productive the meeting was (100 = very productive, clear outcomes; 0 = unproductive, no decisions)
- participationInsights: An object with { mostActive: string (name of most active participant or "Unknown"), engagementLevel: "high" | "medium" | "low", speakerCount: number (estimated number of distinct speakers) }

Be thorough but concise. If owners aren't clear, use "Unassigned".`,
          },
          {
            role: "user",
            content: `Here is the meeting transcript:\n\n${transcript}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_meeting_notes",
              description: "Extract structured meeting notes with insights from a transcript",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string" },
                  suggestedTitle: { type: "string" },
                  actionItems: { type: "array", items: { type: "string" } },
                  decisions: { type: "array", items: { type: "string" } },
                  keyPoints: { type: "array", items: { type: "string" } },
                  tasks: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task: { type: "string" },
                        owner: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["task", "owner", "priority"],
                    },
                  },
                  sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                  productivityScore: { type: "integer", minimum: 0, maximum: 100 },
                  participationInsights: {
                    type: "object",
                    properties: {
                      mostActive: { type: "string" },
                      engagementLevel: { type: "string", enum: ["high", "medium", "low"] },
                      speakerCount: { type: "integer" },
                    },
                    required: ["mostActive", "engagementLevel", "speakerCount"],
                  },
                },
                required: [
                  "summary",
                  "suggestedTitle",
                  "actionItems",
                  "decisions",
                  "keyPoints",
                  "tasks",
                  "sentiment",
                  "productivityScore",
                  "participationInsights",
                ],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_meeting_notes" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", aiResponse.status, errText);
      await supabase.from("meetings").update({ status: "error" }).eq("id", meetingId);
      return new Response(JSON.stringify({ error: `AI error: ${aiResponse.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No structured output from AI");
    }

    const notes = JSON.parse(toolCall.function.arguments);

    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        title: notes.suggestedTitle || "Untitled Meeting",
        summary: notes.summary,
        action_items: notes.actionItems,
        decisions: notes.decisions,
        key_points: notes.keyPoints,
        tasks: notes.tasks,
        sentiment: notes.sentiment,
        productivity_score: notes.productivityScore,
        participation_insights: notes.participationInsights,
        status: "completed",
      })
      .eq("id", meetingId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("DB update error:", updateError);
      throw new Error("Failed to save notes");
    }

    return new Response(JSON.stringify({ success: true, notes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-notes Vercel Edge API error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
