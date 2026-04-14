import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { meetingId, transcript } = req.body;
    const authHeader = req.headers.authorization;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // The Vercel AI SDK looks for GOOGLE_GENERATIVE_AI_API_KEY
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !apiKey || !supabaseKey) {
      return res.status(500).json({ error: "Backend config missing (GOOGLE_GENERATIVE_AI_API_KEY)." });
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
      baseURL: "https://generativelanguage.googleapis.com/v1", // Use stable v1
    });

    const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    const { data: { user }, error: authError } = await createClient(supabaseUrl as string, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader || "" } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    // Use generateText (NOT generateObject) to avoid unsupported schema fields on v1
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: `Analyze this transcript and return ONLY a JSON object (no markdown, no extra text):
      
      Transcript:
      ${transcript}
      
      JSON Structure:
      {
        "summary": "...",
        "suggestedTitle": "...",
        "actionItems": [],
        "decisions": [],
        "keyPoints": [],
        "tasks": [{"task": "", "owner": "", "priority": ""}],
        "sentiment": "positive|neutral|negative",
        "productivityScore": 0-100,
        "participationInsights": {"mostActive": "", "engagementLevel": "high|medium|low", "speakerCount": 0}
      }`,
    });

    let content = text.trim();
    
    // Safety check for JSON wrapping
    if (content.includes("```json")) {
      content = content.split("```json")[1].split("```")[0];
    } else if (content.includes("```")) {
      content = content.split("```")[1].split("```")[0];
    }
    
    const notes = JSON.parse(content.trim());

    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        title: notes.suggestedTitle,
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
      .eq("id", meetingId);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, notes });
  } catch (error: any) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
