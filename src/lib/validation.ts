import { z } from "zod";

export const transcriptSchema = z
  .string()
  .trim()
  .min(50, "Transcript must be at least 50 characters")
  .max(50000, "Transcript must be under 50,000 characters");

export const actionItemSchema = z.object({
  task: z.string(),
  assignee: z.string(),
  dueDate: z.string(),
});

export const meetingInsightsSchema = z.object({
  summary: z.string(),
  suggestedTitle: z.string(),
  actionItems: z.array(z.string()),
  decisions: z.array(z.string()),
  keyPoints: z.array(z.string()),
  tasks: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  productivityScore: z.number().int().min(0).max(100),
  participationInsights: z.object({
    mostActive: z.string(),
    engagementLevel: z.enum(["high", "medium", "low"]),
    speakerCount: z.number().int(),
  }),
});
