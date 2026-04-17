import { useState } from "react";
import { MeetingNotes } from "@/lib/types";
import { TaskCards } from "./TaskCards";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface OutputTabsProps {
  notes: MeetingNotes;
}

const tabs = [
  { key: "summary", label: "Summary" },
  { key: "actionItems", label: "Action Items" },
  { key: "decisions", label: "Decisions" },
  { key: "tasks", label: "Tasks" },
  { key: "speakers", label: "Speakers" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export function OutputTabs({ notes }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  const [copied, setCopied] = useState(false);

  const getContent = () => {
    switch (activeTab) {
      case "summary":
        return notes.summary;
      case "actionItems":
        return notes.actionItems.map((item) => `• ${item}`).join("\n");
      case "decisions":
        return notes.decisions.map((d) => `• ${d}`).join("\n");
      case "tasks":
        return notes.tasks.map((t) => `• [${t.priority}] ${t.task} — ${t.owner}`).join("\n");
      case "speakers":
        return (notes.speakers || []).map(s => `• ${s.name} (${s.sentiment}): ${s.tasks_assigned.join(", ") || "No tasks"}`).join("\n");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="notion-card slide-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 border-b border-border">
          {tabs.map((tab) => {
            if (tab.key === "speakers" && (!notes.speakers || notes.speakers.length === 0)) return null;
            return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          )})}
        </div>
        <button onClick={handleCopy} className="notion-btn-ghost text-muted-foreground" title="Copy to clipboard">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <div className="fade-slide-in" key={activeTab}>
        {activeTab === "summary" && (
          <p className="text-sm leading-relaxed text-foreground/85">{notes.summary}</p>
        )}

        {activeTab === "actionItems" && (
          <ul className="space-y-2.5">
            {notes.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {activeTab === "decisions" && (
          <ul className="space-y-2.5">
            {notes.decisions.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                {d}
              </li>
            ))}
          </ul>
        )}

        {activeTab === "tasks" && <TaskCards tasks={notes.tasks} />}

        {activeTab === "speakers" && notes.speakers && (
          <div className="space-y-4">
            {notes.speakers.map((speaker, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-accent/30 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{speaker.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    speaker.sentiment === "Positive" ? "bg-green-500/10 text-green-600" :
                    speaker.sentiment === "Negative" ? "bg-red-500/10 text-red-600" :
                    "bg-blue-500/10 text-blue-600"
                  }`}>
                    {speaker.sentiment}
                  </span>
                </div>
                {speaker.tasks_assigned && speaker.tasks_assigned.length > 0 ? (
                  <ul className="space-y-1">
                    {speaker.tasks_assigned.map((t, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50" />
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic">No specific tasks assigned</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
