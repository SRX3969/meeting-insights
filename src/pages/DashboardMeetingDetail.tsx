import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useMeeting, useDeleteMeeting, useGenerateNotes } from "@/hooks/useMeetings";
import { OutputTabs } from "@/components/OutputTabs";
import { MeetingChat } from "@/components/MeetingChat";
import { ArrowLeft, Trash2, Download, RefreshCw, Copy, Share2, TrendingUp, SmilePlus, Users, Sparkles, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingNotes } from "@/lib/types";
import { toast } from "sonner";

const DashboardMeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: meeting, isLoading, refetch } = useMeeting(id);
  const deleteMeeting = useDeleteMeeting();
  const generateNotes = useGenerateNotes();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this meeting?")) return;
    await deleteMeeting.mutateAsync(id);
    navigate("/dashboard");
  };

  const handleRegenerate = () => {
    if (!meeting) return;
    generateNotes.mutate({ meetingId: meeting.id, transcript: meeting.transcript });
  };

  const handleCopyNotes = () => {
    if (!meeting) return;
    const items = (meeting.action_items as string[]) || [];
    const decisions = (meeting.decisions as string[]) || [];
    const content = [
      `# ${meeting.title}`,
      "",
      "## Summary",
      meeting.summary || "N/A",
      "",
      "## Action Items",
      ...items.map((i) => `- ${i}`),
      "",
      "## Decisions",
      ...decisions.map((d) => `- ${d}`),
    ].join("\n");
    navigator.clipboard.writeText(content);
    toast.success("Notes copied to clipboard");
  };

  const handleDownload = () => {
    if (!meeting) return;
    const items = (meeting.action_items as string[]) || [];
    const decisions = (meeting.decisions as string[]) || [];
    const tasks = (meeting.tasks as { task: string; owner: string; priority: string }[]) || [];

    const content = [
      `# ${meeting.title}`,
      "",
      "## Summary",
      meeting.summary || "No summary available.",
      "",
      "## Action Items",
      ...items.map((i) => `- ${i}`),
      "",
      "## Decisions",
      ...decisions.map((d) => `- ${d}`),
      "",
      "## Tasks",
      ...tasks.map((t) => `- [${t.priority}] ${t.task} — ${t.owner}`),
      "",
      "## Insights",
      `- Sentiment: ${meeting.sentiment || "N/A"}`,
      `- Productivity Score: ${meeting.productivity_score != null ? meeting.productivity_score + "%" : "N/A"}`,
      ...(meeting.participation_insights
        ? [
            `- Most Active: ${(meeting.participation_insights as any).mostActive}`,
            `- Engagement: ${(meeting.participation_insights as any).engagementLevel}`,
            `- Speakers: ${(meeting.participation_insights as any).speakerCount}`,
          ]
        : []),
    ].join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title || "meeting-notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-pulse h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 fade-in">
        <p className="text-muted-foreground">Meeting not found.</p>
        <Link to="/dashboard" className="notion-btn-ghost mt-4 inline-flex text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    );
  }

  const notes: MeetingNotes | null =
    meeting.status === "completed" && meeting.summary
      ? {
          summary: meeting.summary,
          actionItems: (meeting.action_items as string[]) || [],
          decisions: (meeting.decisions as string[]) || [],
          tasks: ((meeting.tasks as any[]) || []).map((t) => ({
            task: t.task,
            owner: t.owner,
            priority: t.priority as "high" | "medium" | "low",
          })),
          speakers: (meeting.participation_insights as any)?.speakers || [],
        }
      : null;

  const insights = meeting.participation_insights as { mostActive: string; engagementLevel: string; speakerCount: number } | null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div className="fade-in">
        <Link to="/dashboard" className="notion-btn-ghost text-sm text-muted-foreground mb-4 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{meeting.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date(meeting.created_at).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {meeting.status === "processing" && (
              <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            )}
            {notes && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRegenerate} 
                  disabled={generateNotes.isPending}
                  className="rounded-xl gap-2 text-indigo-600 border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <Sparkles className={`h-4 w-4 ${generateNotes.isPending ? 'animate-pulse' : ''}`} />
                  {generateNotes.isPending ? "Syncing..." : "Regenerate AI"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyNotes} className="rounded-xl">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="rounded-xl">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="rounded-xl">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => setIsChatOpen(true)} 
                  className="rounded-xl gap-2 bg-[#0A0A0A] text-white hover:bg-black/80 shadow-xl"
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleDelete} className="rounded-xl">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {meeting.status === "processing" && (
        <div className="notion-card text-center py-14 fade-in">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            AI is generating your notes...
          </div>
        </div>
      )}

      {meeting.status === "error" && (
        <div className="notion-card text-center py-14 fade-in border-destructive/20 space-y-3">
          <p className="text-destructive">An error occurred while generating notes.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      )}

      {/* AI Insights Cards */}
      {notes && (meeting.sentiment || meeting.productivity_score != null || insights) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 fade-in">
          {meeting.sentiment && (
            <div className="notion-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <SmilePlus className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground capitalize">
                  {meeting.sentiment === "positive" ? "😊 Positive" : meeting.sentiment === "negative" ? "😟 Negative" : "😐 Neutral"}
                </p>
                <p className="text-xs text-muted-foreground">Sentiment</p>
              </div>
            </div>
          )}
          {meeting.productivity_score != null && (
            <div className="notion-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{meeting.productivity_score}%</p>
                <p className="text-xs text-muted-foreground">Productivity</p>
              </div>
            </div>
          )}
          {insights && (
            <div className="notion-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{insights.mostActive}</p>
                <p className="text-xs text-muted-foreground">
                  {insights.speakerCount} speakers · {insights.engagementLevel} engagement
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {notes && (
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="rounded-2xl bg-accent/50 border border-border p-6 mb-6">
            <h3 className="text-sm font-semibold text-accent-foreground uppercase tracking-wider mb-2">AI Summary</h3>
            <p className="text-sm text-foreground leading-relaxed">{notes.summary}</p>
          </div>

          <OutputTabs notes={notes} />
        </div>
      )}

      <details className="notion-card">
        <summary className="text-sm font-semibold text-foreground cursor-pointer">Original Transcript</summary>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {meeting.transcript}
        </p>
      </details>

      <MeetingChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        meetingTitle={meeting.title || "Meeting"} 
        transcript={meeting.transcript || ""}
      />
    </div>
  );
};

export default DashboardMeetingDetail;
