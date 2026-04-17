import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

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
    
    // Support both standardized Google and explicit Gemini variable names
    const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

    console.log(`[API] Processing meeting: ${meetingId}`);
    console.log(`[API] Key detected: ${GOOGLE_API_KEY ? 'YES (truncated: ' + GOOGLE_API_KEY.slice(0, 5) + '...)' : 'NO'}`);

    // Strict validation with descriptive errors
    if (!GOOGLE_API_KEY) return res.status(500).json({ error: "AI Error: GOOGLE_GENERATIVE_AI_API_KEY is missing in Vercel settings." });
    if (!supabaseUrl) return res.status(500).json({ error: "DB Error: SUPABASE_URL is missing." });
    if (!supabaseKey) return res.status(500).json({ error: "DB Error: SUPABASE_SERVICE_ROLE_KEY is missing." });

  const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    const { data: { user }, error: authError } = await createClient(supabaseUrl as string, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader || "" } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized: Please log in again." });

    // Create Google provider explicitly
    const google = createGoogleGenerativeAI({
      apiKey: GOOGLE_API_KEY,
    });

    // --- Dynamic Model Discovery ---
    let validModels: string[] = [];
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`);
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        const availableModels = modelsData.models || [];
        
        validModels = availableModels
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name.replace("models/", ""));
          
        console.log(`[Discovery] Accessible models: ${validModels.join(", ")}`);
      }
    } catch (discoveryErr) {
      console.warn("[Discovery] API fetch failed:", discoveryErr);
    }
    // -------------------------------

    // --- Speed-Optimized Model Selection ---
    // We prioritize gemini-1.5-flash-latest for speed (usually <3-5s)
    // We only perform deep discovery if the preferred model is missing
    let bestModel = "gemini-1.5-flash-latest";
    if (!validModels.includes(bestModel)) {
      const preferred = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      bestModel = preferred.find(p => validModels.includes(p)) || validModels[0] || "gemini-1.5-flash";
    }

    try {
      console.log(`[AI] Strategic Sync: Attempting with ${bestModel}`);
      const { object: notes } = await generateObject({
        model: google(bestModel), 
        schema: z.object({
          title: z.string().describe("Concise, impactful meeting title"),
          sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
          productivity: z.number().int().min(0).max(100),
          summary: z.string().describe("A deep, multi-paragraph Markdown summary. Include sections for # Context, # Major Milestones, and # Strategic Roadmap."),
          action_items: z.array(z.string().describe("Format: [PERSON NAME]: [ULTRA-DETAILED TASK DESCRIPTION]")),
          decisions: z.array(z.string().describe("Core decisions made, including the rationale")),
          tasks: z.array(z.object({
            task: z.string(),
            assignee: z.string(),
            priority: z.enum(["high", "medium", "low"])
          })),
          speakers: z.array(z.object({
            name: z.string(),
            tasks_assigned: z.array(z.string()),
            sentiment: z.enum(["Positive", "Negative", "Neutral"])
          }))
        }),
        prompt: `You are an ELITE Senior Project Manager. Transform this transcript into a JSON report.
          Transcript: ${transcript}`,
      });

      console.log(`[AI] Generation Successful. Syncing to DB...`);

      const { error: updateError } = await supabase
        .from("meetings")
        .update({
          title: notes.title,
          summary: notes.summary,
          action_items: notes.action_items,
          decisions: notes.decisions,
          key_points: [],
          tasks: notes.tasks.map(t => ({ task: t.task, owner: t.assignee, priority: t.priority })),
          sentiment: notes.sentiment.toLowerCase(),
          productivity_score: notes.productivity,
          participation_insights: {
            mostActive: notes.speakers?.[0]?.name || "Unknown",
            speakerCount: notes.speakers?.length || 1,
            engagementLevel: "high",
            speakers: notes.speakers
          },
          status: "completed",
        })
        .eq("id", meetingId);

      if (updateError) throw updateError;

      return res.status(200).json({ success: true, notes });
    } catch (dbErr: any) {
      return res.status(500).json({ error: `AI/DB Sync Failed: ${dbErr.message}` });
    }
  } catch (error: any) {
    console.error("Critical Failure:", error);
    return res.status(500).json({ error: `System Error: ${error.message}` });
  }
}
