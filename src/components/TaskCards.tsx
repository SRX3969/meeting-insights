import { MeetingTask } from "@/lib/types";
import { toast } from "sonner";

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
          className="group/task flex items-start justify-between rounded-xl border border-border p-4 hover-lift"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="space-y-1 flex-1 mr-4">
            <p className="text-sm font-medium text-foreground">{task.task}</p>
            <p className="text-xs text-muted-foreground">{task.owner}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}>
              {task.priority}
            </span>
            <div className="flex items-center gap-1.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
               <button 
                  onClick={() => syncTask(task, 'notion')} 
                  title="Sync to Notion"
                  className="p-1.5 rounded-lg hover:bg-black/5 text-[#0A0A0A] border border-black/5"
               >
                  <div className="h-3 w-3 bg-black flex items-center justify-center rounded-[2px]" />
               </button>
               <button 
                  onClick={() => syncTask(task, 'linear')} 
                  title="Sync to Linear"
                  className="p-1.5 rounded-lg hover:bg-[#5E6AD2]/10 text-[#5E6AD2] border border-[#5E6AD2]/10"
               >
                  <div className="h-3 w-3 text-[#5E6AD2] font-black italic text-[8px] flex items-center justify-center border border-[#5E6AD2] rounded-[2px]">L</div>
               </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const syncTask = async (task: MeetingTask, platform: 'notion' | 'linear') => {
  const configStr = localStorage.getItem(`notemind_${platform}_config`);
  if (!configStr) {
    toast.error(`Please connect ${platform} in Settings first`);
    return;
  }
  
  const config = JSON.parse(configStr);
  if (!config.token) {
    toast.error(`Please connect ${platform} in Settings first`);
    return;
  }

  const tid = toast.loading(`Syncing to ${platform}...`);
  try {
    const response = await fetch('/api/pm-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        task,
        token: config.token,
        config: platform === 'notion' ? { databaseId: config.dbId } : { teamId: config.teamId }
      })
    });
    
    if (!response.ok) throw new Error(await response.text());
    
    toast.dismiss(tid);
    toast.success(`Synced to ${platform}!`);
  } catch (err: any) {
    toast.dismiss(tid);
    toast.error(`Sync failed: ${err.message}`);
  }
};

