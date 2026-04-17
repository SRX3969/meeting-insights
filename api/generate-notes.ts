import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { meetingId, transcript } = req.body;
    const authHeader = req.headers.authorization;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY || !supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Missing environment variables." });
    }

    const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    const { data: { user }, error: authError } = await createClient(supabaseUrl as string, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader || "" } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    const google = createGoogleGenerativeAI({ apiKey: GOOGLE_API_KEY });

    // Model Discovery for Quota Safety
    let validModels: string[] = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-pro"];
    try {
      const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`);
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        validModels = (modelsData.models || []).map((m: any) => m.name.replace("models/", ""));
      }
    } catch (e) {}

    const processQueue = [
      ...validModels.filter(m => m.includes("2.0-flash")),
      ...validModels.filter(m => m.includes("1.5-flash-8b")),
      ...validModels.filter(m => m.includes("1.5-flash") && !m.includes("8b")),
      ...validModels.filter(m => m.includes("1.5-pro")),
      ...validModels.filter(m => m.includes("gemini-pro"))
    ];

    let lastError = "";
    let finalNotes = null;

    for (const currentModel of processQueue) {
      try {
        console.log(`[AI] Attempting with ${currentModel}`);
        const { object } = await generateObject({
          model: google(currentModel),
          schema: z.object({
            title: z.string(),
            sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
            productivity: z.number().int().min(0).max(100),
            summary: z.string(),
            action_items: z.array(z.string()),
            decisions: z.array(z.string()),
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
          prompt: `You are NoteMind AI, an elite Senior Project Manager. Transform this transcript into a JSON report.
          
CRITICAL: Every task in the 'tasks' list MUST be attributed to a speaker. If Ananya, Rohit, or Isha agree to a task, list it under their 'tasks_assigned' in the speakers section.

Transcript: ${transcript}`,
        });

        finalNotes = object;
        break;
      } catch (err: any) {
        lastError = err.message;
        if (err.message.includes("quota") || err.message.includes("503") || err.message.includes("429")) continue;
        console.warn(`[AI] Error with ${currentModel}: ${err.message}`);
      }
    }

    if (!finalNotes) return res.status(500).json({ error: `AI Failed: ${lastError}` });

    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        title: finalNotes.title,
        summary: finalNotes.summary,
        action_items: finalNotes.action_items,
        decisions: finalNotes.decisions,
        key_points: [],
        tasks: finalNotes.tasks.map(t => ({ task: t.task, owner: t.assignee, priority: t.priority })),
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
    return res.status(200).json({ success: true, notes: finalNotes });

  } catch (error: any) {
    console.error("Critical Failure:", error);
    return res.status(500).json({ error: `System Error: ${error.message}` });
  }
}
