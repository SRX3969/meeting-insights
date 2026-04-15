import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateObject } from "ai";
import { createMistral } from "@ai-sdk/mistral";
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
    
    // Final solution for regional stability: Mistral (Standard global provider)
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

    if (!supabaseUrl || !MISTRAL_API_KEY || !supabaseKey) {
      return res.status(500).json({ error: "Backend config missing (MISTRAL_API_KEY)." });
    }

    const supabase = createClient(supabaseUrl as string, supabaseKey as string);
    const { data: { user }, error: authError } = await createClient(supabaseUrl as string, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader || "" } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    // Create Mistral provider explicitly
    const mistral = createMistral({
      apiKey: MISTRAL_API_KEY,
    });

    // Mistral is highly stable in India and worldwide
    const { object: notes } = await generateObject({
      model: mistral("mistral-small-latest"),
      schema: z.object({
        title: z.string(),
        sentiment: z.enum(["Positive", "Negative", "Neutral", "Mixed"]),
        productivity: z.number().int().describe("Calculate based on rules: Start at 50, +10 for clear decisions, +10 if tasks assigned, +10 for deadlines, +10 for clear agenda"),
        summary: z.string().describe("2-3 sentence summary based on ACTUAL conversation. No generic templates."),
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
      prompt: `You are an intelligent meeting analysis assistant. Analyze the meeting transcript provided and extract structured highlights.

Rules:
1. SENTIMENT must reflect actual tone: Positive (collaborative/productive), Negative (conflict/blame), Neutral (factual), Mixed.
2. PRODUCTIVITY dynamically starts at 50, +10 if decisions made, +10 if tasks assigned, +10 if deadlines mentioned, +10 if clear agenda.

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
