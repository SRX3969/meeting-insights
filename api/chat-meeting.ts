import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const config = {
  maxDuration: 60,
  runtime: 'edge',
};

export default async function POST(req: Request) {
  try {
    const { messages, transcript, meetingTitle } = await req.json();
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

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


