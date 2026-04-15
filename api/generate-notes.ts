import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateObject } from "ai";
import { createGoogle } from "@ai-sdk/google";
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
    
    // Switch to Gemini 2.0 Flash as requested
    const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!supabaseUrl || !GOOGLE_API_KEY || !supabaseKey) {
      return res.status(500).json({ error: "Backend config missing (GOOGLE_GENERATIVE_AI_API_KEY)." });
    }

    const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    const { data: { user }, error: authError } = await createClient(supabaseUrl as string, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader || "" } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    // Create Google provider explicitly
    const google = createGoogle({
      apiKey: GOOGLE_API_KEY,
    });

    // Using Gemini 1.5 Pro for elite reasoning and ownership tracking
    const { object: notes } = await generateObject({
      model: google("gemini-1.5-pro"), 
      schema: z.object({
        title: z.string(),
        sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
        productivity: z.number().int().describe("Scoring: 50 base, +10 for decisions, +10 for tasks with owners, +10 for deadlines, +10 for clarity."),
        summary: z.string().describe("A 2-3 sentence executive-grade narrative focused on outcomes."),
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
      prompt: `You are an ELITE Senior Project Manager and AI Meeting Strategist. 
Your goal is to transform the provided transcript into a high-signal, executive-grade JSON report.

### 🎯 ANALYSIS PHILOSOPHY
- **Ownership over description:** Don't just list tasks; map them to people. 
- **Accountability:** Every action item MUST start with the assignee's name. (e.g. "Rahul to finalize the API docs").
- **Precision:** Use concrete metrics and deadlines if mentioned. Use "Unassigned" only as a last resort.

### ⚖️ PRODUCTIVITY SCORING RULES
- Base score: 50.
- +10: Clear consensus/decisions reached.
- +10: Every major task assigned to a specific owner.
- +10: Explicit deadlines or timelines mentioned.
- +10: Factual, no-fluff dialogue.
- +10: No open-ended loop left unaddressed.

Transcript: ${transcript}`,
    });

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
          speakers: notes.speakers // Store full data
        },
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
