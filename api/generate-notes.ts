import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
      return res.status(500).json({ error: "Missing Gemini API Key in Vercel settings." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await createClient(supabaseUrl, process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "", {
      global: { headers: { Authorization: authHeader } },
    }).auth.getUser();

    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    // Try Gemini 1.5 Flash first (v1beta)
    let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `Analyze this meeting transcript and return a JSON object.
    
    Transcript:
    ${transcript}
    
    JSON Template:
    {
      "summary": "3-5 sentences",
      "suggestedTitle": "Short title",
      "actionItems": ["item1", "item2"],
      "decisions": ["dec1"],
      "keyPoints": ["point1"],
      "tasks": [{"task": "description", "owner": "name", "priority": "high|medium|low"}],
      "sentiment": "positive|neutral|negative",
      "productivityScore": 85,
      "participationInsights": {"mostActive": "name", "engagementLevel": "high|medium|low", "speakerCount": 3}
    }
    
    Return ONLY pure JSON. No markdown. No text before or after.`;

    let response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    // Fallback to gemini-pro if flash is not found
    if (response.status === 404) {
      console.log("Gemini Flash not found, falling back to gemini-pro...");
      geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
      response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
    }

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `Gemini Error: ${err}` });
    }

    const data = await response.json();
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Cleanup JSON if AI wrapped it in markdown
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
    return res.status(500).json({ error: error.message });
  }
}
