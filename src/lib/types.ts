export interface MeetingTask {
  task: string;
  owner: string;
  priority: "high" | "medium" | "low";
}

export interface MeetingNotes {
  summary: string;
  actionItems: string[];
  decisions: string[];
  tasks: MeetingTask[];
  speakers?: Array<{
    name: string;
    tasks_assigned: string[];
    sentiment: string;
  }>;
}

export interface Meeting {
  id: string;
  title: string;
  transcript: string;
  notes: MeetingNotes | null;
  createdAt: string;
}
