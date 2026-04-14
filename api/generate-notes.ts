import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Standard Vercel Serverless Function (Node.js) instead of Edge
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
    
    if (!transcript || !meetingId) {
      return res.status(400).json({ error: "meetingId and transcript are required" });
    }

    const authHeader = req.headers.authorization;
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !anonKey || !OPENAI_API_KEY || !supabaseKey) {
      console.error("Missing Env variables:", { 
        url: !!supabaseUrl, 
        anon: !!anonKey, 
        openai: !!OPENAI_API_KEY, 
        service: !!supabaseKey 
      });
      return res.status(500).json({ error: "Backend configuration missing. Ensure SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY are in Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify User
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    // Call OpenAI
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a meeting notes assistant. Extract structured insights from the transcript. 
            Return JSON with: summary, suggestedTitle, actionItems (array), decisions (array), keyPoints (array), 
            tasks (array of {task, owner, priority}), sentiment, productivityScore (0-100), participationInsights ({mostActive, engagementLevel, speakerCount}).`
          },
          { role: "user", content: transcript }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenAI error:", aiResponse.status, errText);
      return res.status(500).json({ error: `OpenAI Error: ${aiResponse.status} - ${errText}` });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    // Fallback if it's not JSON
    let notes;
    try {
      // Handle potential markdown wrapping
      const jsonStr = content.includes('```json') 
        ? content.split('```json')[1].split('```')[0] 
        : content;
      notes = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      return res.status(500).json({ error: "AI returned invalid format. Try a longer transcript." });
    }

    // Update DB
    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        title: notes.suggestedTitle || "Untitled Meeting",
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

    if (updateError) {
      console.error("DB Update Error:", updateError);
      return res.status(500).json({ error: `Failed to save to database: ${updateError.message}` });
    }

    return res.status(200).json({ success: true, notes });
  } catch (error: any) {
    console.error("Global Catch:", error);
    return res.status(500).json({ error: error.message || "Unknown server error" });
  }
}
