import { useState } from "react";
import { MeetingNotes } from "@/lib/types";
import { TaskCards } from "./TaskCards";
import { Copy, Check, Lightbulb, CheckSquare, GitBranch, ClipboardList, FileText } from "lucide-react";

interface OutputTabsProps {
  notes: MeetingNotes;
}

const tabs = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "actionItems", label: "Action Items", icon: CheckSquare },
  { key: "keyPoints", label: "Key Points", icon: Lightbulb },
  { key: "decisions", label: "Decisions", icon: GitBranch },
  { key: "tasks", label: "Tasks", icon: ClipboardList },
] as const;

export function OutputTabs({ notes }: OutputTabsProps) {
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    return [
      `# Summary\n${notes.summary}`,
      `# Action Items\n${notes.actionItems.map(item => `• ${item}`).join('\n')}`,
      `# Key Points\n${(notes.keyPoints || []).map(p => `• ${p}`).join('\n')}`,
      `# Decisions\n${notes.decisions.map(d => `• ${d}`).join('\n')}`,
      `# Tasks\n${notes.tasks.map(t => `• [${t.priority}] ${t.task} — ${t.owner}`).join('\n')}`
    ].join('\n\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 fade-in slide-up" style={{ animationDelay: "0.2s" }}>
      <div className="flex justify-end">
        <button onClick={handleCopy} className="notion-btn-ghost text-muted-foreground text-sm flex items-center gap-1.5" title="Copy to clipboard">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied All" : "Copy All"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Action Items */}
        <div className="notion-card h-full hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 font-semibold text-foreground border-b border-border pb-3">
            <CheckSquare className="h-5 w-5 text-primary" />
            Action Items
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{notes.actionItems.length}</span>
          </div>
          <ul className="space-y-3">
            {notes.actionItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 italic text-center">No action items</p>
            ) : (
              notes.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-1 h-4 w-4 shrink-0 rounded border border-border flex items-center justify-center bg-card">
                    <CheckSquare className="h-3 w-3 text-muted-foreground/50" />
                  </span>
                  <span>{item}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Key Points */}
        <div className="notion-card h-full hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 font-semibold text-foreground border-b border-border pb-3">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Key Points
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{(notes.keyPoints || []).length}</span>
          </div>
          <ul className="space-y-3">
            {(notes.keyPoints || []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 italic text-center">No key points</p>
            ) : (
              (notes.keyPoints || []).map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Lightbulb className="h-3 w-3 text-amber-500" />
                  </span>
                  <span>{point}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Decisions */}
        <div className="notion-card h-full hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 font-semibold text-foreground border-b border-border pb-3">
            <GitBranch className="h-5 w-5 text-green-500" />
            Decisions
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{notes.decisions.length}</span>
          </div>
          <ul className="space-y-3">
            {notes.decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 italic text-center">No decisions recorded</p>
            ) : (
              notes.decisions.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/85 leading-relaxed">
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-green-500/10 flex items-center justify-center">
                    <GitBranch className="h-3 w-3 text-green-500" />
                  </span>
                  <span>{d}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Tasks */}
        <div className="notion-card h-full md:col-span-2 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-4 font-semibold text-foreground border-b border-border pb-3">
            <ClipboardList className="h-5 w-5 text-indigo-500" />
            Tasks
            <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{notes.tasks.length}</span>
          </div>
          {notes.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 italic text-center">No tasks assigned</p>
          ) : (
            <TaskCards tasks={notes.tasks} />
          )}
        </div>
      </div>
    </div>
  );
}
