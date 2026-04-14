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
  
  // Dynamic extraction of potential speakers
  const speakers = Array.from(new Set(transcript.match(/[A-Z][a-z]+(?=:)/g) || []));
  const mainSpeaker = speakers[0] || "The team";
  
  // Keyword detection for better context
  const topics = [];
  const text = transcript.toLowerCase();
  if (text.includes("security")) topics.push("Security infrastructure");
  if (text.includes("api") || text.includes("backend")) topics.push("Systems architecture");
  if (text.includes("ui") || text.includes("design") || text.includes("frontend")) topics.push("User experience");
  if (text.includes("timeline") || text.includes("roadmap") || text.includes("plan")) topics.push("Project timeline");
  if (topics.length === 0) topics.push("Strategic objectives");

  return {
    summary: `${mainSpeaker} led a discussion focusing on ${topics[0]}${topics[1] ? " and " + topics[1] : ""}. The team analyzed core dependencies across ${words} words of dialogue, ensuring all key stakeholders are aligned on the path forward.`,
    suggestedTitle: topics.length > 0 ? `${topics[0]} Alignment` : "Operational Sync",
    keyPoints: [
      `Deep dive into ${topics[0]} requirements`,
      `Consensus on ${topics[1] || "next steps and milestones"}`,
      "Resource allocation and team capacity verification",
    ],
    actionItems: [
      `Finalize technical draft for ${topics[0]}`,
      "Review cross-team dependencies and blockers",
      "Draft internal summary for stakeholder communication",
    ],
    decisions: [
      `Approved the initial approach for ${topics[0]}`,
      "Agreed on the updated delivery schedule",
      "Resource hiring plan confirmed for the next phase",
    ],
    tasks: [
      { task: `Update ${topics[0]} documentation`, owner: speakers[1] || mainSpeaker, priority: "high" },
      { task: "Prepare progress report", owner: "Project Management", priority: "medium" },
      { task: "Schedule follow-up review", owner: mainSpeaker, priority: "low" },
    ],
  };
}
