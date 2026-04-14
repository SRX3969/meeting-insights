import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // Use official SDK for maximum reliability
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this meeting transcript and return a JSON object (strictly pure JSON, no markdown):
    
    Transcript:
    ${transcript}
    
    JSON Format:
    {
      "summary": "...",
      "suggestedTitle": "...",
      "actionItems": [],
      "decisions": [],
      "keyPoints": [],
      "tasks": [{"task": "", "owner": "", "priority": ""}],
      "sentiment": "positive|neutral|negative",
      "productivityScore": 0-100,
      "participationInsights": {"mostActive": "", "engagementLevel": "", "speakerCount": 0}
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let content = response.text();
    
    // Safety check for JSON
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
    console.error("Gemini SDK Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
