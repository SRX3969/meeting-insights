import { Meeting, MeetingNotes } from "./types";

const STORAGE_KEY = "meetnotes-meetings";

export function getMeetings(): Meeting[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getMeeting(id: string): Meeting | undefined {
  return getMeetings().find((m) => m.id === id);
}

export function saveMeeting(meeting: Meeting): void {
  const meetings = getMeetings();
  const idx = meetings.findIndex((m) => m.id === meeting.id);
  if (idx >= 0) meetings[idx] = meeting;
  else meetings.unshift(meeting);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export function deleteMeeting(id: string): void {
  const meetings = getMeetings().filter((m) => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export function createMeeting(transcript: string, title?: string): Meeting {
  return {
    id: crypto.randomUUID(),
    title: title || `Meeting ${new Date().toLocaleDateString()}`,
    transcript,
    notes: null,
    createdAt: new Date().toISOString(),
  };
}

// Mock AI generation (will be replaced with real AI via Lovable Cloud)
export function generateMockNotes(transcript: string): MeetingNotes {
  const words = transcript.split(/\s+/).length;
  return {
    summary: `This meeting covered ${words} words of discussion. Key topics included project updates, timeline reviews, and team coordination. The team discussed priorities for the upcoming sprint and aligned on deliverables.`,
    actionItems: [
      "Review the project timeline and update milestones",
      "Schedule follow-up meeting with stakeholders",
      "Share meeting notes with the broader team",
      "Update the project documentation with new decisions",
    ],
    decisions: [
      "Agreed to move the deadline to next Friday",
      "Decided to use the new workflow for future projects",
      "Approved the budget allocation for Q2",
    ],
    tasks: [
      { task: "Update project roadmap", owner: "Team Lead", priority: "high" },
      { task: "Send stakeholder update email", owner: "Project Manager", priority: "medium" },
      { task: "Review and merge pending PRs", owner: "Engineering", priority: "high" },
      { task: "Prepare demo for next meeting", owner: "Design Team", priority: "low" },
    ],
  };
}
