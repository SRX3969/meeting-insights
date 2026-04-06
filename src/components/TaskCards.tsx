import { MeetingTask } from "@/lib/types";

interface TaskCardsProps {
  tasks: MeetingTask[];
}

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-foreground/5 text-foreground/70",
  low: "bg-foreground/5 text-muted-foreground",
};

export function TaskCards({ tasks }: TaskCardsProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task, i) => (
        <div
          key={i}
          className="flex items-start justify-between rounded-xl border border-border p-4 hover-lift"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="space-y-1 flex-1 mr-4">
            <p className="text-sm font-medium text-foreground">{task.task}</p>
            <p className="text-xs text-muted-foreground">{task.owner}</p>
          </div>
          <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      ))}
    </div>
  );
}
