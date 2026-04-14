import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
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
    
    // We are switching to Groq (via Vercel AI SDK) for 100% regional stability
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!supabaseUrl || !GROQ_API_KEY || !supabaseKey) {
      return res.status(500).json({ error: "Backend config missing (GROQ_API_KEY)." });
    }

    const groq = createOpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: GROQ_API_KEY,
    });

    const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    const { data: { user }, error: authError } = await createClient(supabaseUrl as string, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader || "" } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    // Using Llama 3 on Groq - It's 10x faster and available everywhere
    const { object: notes } = await generateObject({
      model: groq("llama-3.3-70b-versatile"), // Powerful Llama 3 model
      schema: z.object({
        summary: z.string(),
        suggestedTitle: z.string(),
        actionItems: z.array(z.string()),
        decisions: z.array(z.string()),
        keyPoints: z.array(z.string()),
        tasks: z.array(z.object({
          task: z.string(),
          owner: z.string(),
          priority: z.enum(["high", "medium", "low"])
        })),
        sentiment: z.enum(["positive", "neutral", "negative"]),
        productivityScore: z.number(),
        participationInsights: z.object({
          mostActive: z.string(),
          engagementLevel: z.enum(["high", "medium", "low"]),
          speakerCount: z.number()
        })
      }),
      prompt: `Analyze this meeting transcript and return structured insights: ${transcript}`,
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
    console.error("AI Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
