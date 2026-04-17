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

    // Filter and sort by quality/stability
    const candidates = [
      ...validModels.filter(m => m.includes("1.5-flash")),
      ...validModels.filter(m => m.includes("1.5-pro")),
      ...validModels.filter(m => m.includes("gemini-pro")),
      ...validModels.filter(m => !m.includes("1.5") && !m.includes("pro")), // others (like 2.0-flash)
    ];

    // Remove duplicates
    const processQueue = [...new Set(candidates)];
    if (processQueue.length === 0) processQueue.push("gemini-1.5-flash"); // Disaster fallback

    console.log(`[API] Processing queue: ${processQueue.join(" -> ")}`);

    let lastError = "";
    let finalNotes = null;

    // Loop through candidates until one succeeds or we run out
    for (const currentModel of processQueue) {
      try {
        console.log(`[AI] Attempting generation with: ${currentModel}`);
        const { object } = await generateObject({
          model: google(currentModel),
          schema: z.object({
            title: z.string(),
            sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
            productivity: z.number().int(),
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
          prompt: `You are an ELITE Senior Project Manager. Transform this transcript into a JSON report.
          Transcript: ${transcript}`,
        });

        finalNotes = object;
        console.log(`[AI] SUCCESS with ${currentModel}`);
        break; // Exit loop on success
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[AI] FAILED with ${currentModel}: ${err.message}`);
        
        // If it's a "High Demand" error, we immediately try the next model in the queue
        if (err.message.includes("demand") || err.message.includes("503") || err.message.includes("429")) {
          continue;
        }
        
        // For other fatal errors (like invalid prompt), we might want to stop, 
        // but for now, we'll try everything in the queue.
        continue;
      }
    }

    if (!finalNotes) {
      return res.status(500).json({ 
        error: `All AI models exhausted. Last error: ${lastError}`,
        queue: processQueue
      });
    }

    try {
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
    } catch (dbErr: any) {
      return res.status(500).json({ error: `Database Update Failed: ${dbErr.message}` });
    }
  } catch (error: any) {
    console.error("Critical Failure:", error);
    return res.status(500).json({ error: `System Error: ${error.message}` });
  }
}
