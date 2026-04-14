import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!supabaseUrl || !GEMINI_API_KEY || !supabaseKey) {
      return res.status(500).json({ error: "Backend config missing (GEMINI_API_KEY)." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    // Use Vercel AI SDK with Google Gemini
    const { object: notes } = await generateObject({
      model: google("gemini-1.5-flash"),
      apiKey: GEMINI_API_KEY,
      schema: z.object({
        summary: z.string().describe("A 3-5 sentence summary of the meeting"),
        suggestedTitle: z.string().describe("A short, catchy title"),
        actionItems: z.array(z.string()).describe("List of action items"),
        decisions: z.array(z.string()).describe("List of key decisions made"),
        keyPoints: z.array(z.string()).describe("Main points discussed"),
        tasks: z.array(z.object({
          task: z.string(),
          owner: z.string(),
          priority: z.enum(["high", "medium", "low"])
        })),
        sentiment: z.enum(["positive", "neutral", "negative"]),
        productivityScore: z.number().min(0).max(100),
        participationInsights: z.object({
          mostActive: z.string(),
          engagementLevel: z.enum(["high", "medium", "low"]),
          speakerCount: z.number()
        })
      }),
      prompt: `Analyze this meeting transcript and extract structured notes: ${transcript}`,
    });

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
    console.error("Vercel AI SDK Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
