import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  maxDuration: 60,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    res.status(200).end();
    return;
  }

  try {
    const { messages, transcript, meetingTitle } = req.body;
    const GOOGLE_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!GOOGLE_API_KEY) throw new Error("Missing Gemini API Key");

    const google = createGoogleGenerativeAI({ apiKey: GOOGLE_API_KEY });

    const result = await streamText({
      model: google("gemini-1.5-flash-latest"),
      system: `You are a World-Class Strategic Advisor for the meeting: "${meetingTitle}".
      
      CONTEXT TRANSCRIPT:
      ${transcript}
      
      YOUR MANDATE:
      Provide extreme clarity on the meeting's outcomes. Your goal is to ensure EVERY participant leaves with zero ambiguity about their role.
      
      BEHAVIOR:
      1. ANALYSIS: When asked a question, don't just answer—provide context from the transcript.
      2. ACCOUNTABILITY: Proactively highlight if someone agreed to something but a deadline was missed, or if a decision was made without a clear owner.
      3. SPECIFICITY: Always use names. Never say "they decided." Say "Rahul and Sarah reached a consensus on X."
      4. RISK IDENTIFICATION: If the user asks for a summary or status, highlight potential blockers or unresolved conflicts you noticed in the transcript.
      
      FORMATTING:
      - Use professional, structured Markdown.
      - Use headers (###) for distinct points.
      - Bold key decisions.`,
      messages,
    });

    return result.pipeDataStreamToResponse(res);
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    return res.status(500).json({ error: error.message });
  }
}
