import { useState } from "react";
import { MeetingNotes } from "@/lib/types";
import { TaskCards } from "./TaskCards";
import { Copy, Check } from "lucide-react";

interface OutputTabsProps {
  notes: MeetingNotes;
}

const tabs = [
  { key: "summary", label: "Summary" },
  { key: "actionItems", label: "Action Items" },
  { key: "decisions", label: "Decisions" },
  { key: "tasks", label: "Tasks" },
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
          {tabs.map((tab) => (
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
          ))}
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
      </div>
    </div>
  );
}
