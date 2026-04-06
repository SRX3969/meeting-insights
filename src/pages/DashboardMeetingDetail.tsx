import { useParams, Link, useNavigate } from "react-router-dom";
import { useMeeting, useDeleteMeeting } from "@/hooks/useMeetings";
import { OutputTabs } from "@/components/OutputTabs";
import { ArrowLeft, Trash2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeetingNotes } from "@/lib/types";

const DashboardMeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: meeting, isLoading, refetch } = useMeeting(id);
  const deleteMeeting = useDeleteMeeting();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!id) return;
    await deleteMeeting.mutateAsync(id);
    navigate("/dashboard");
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
    ].join("\n");

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title || "meeting-notes"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-pulse h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 fade-in">
        <p className="text-muted-foreground">Meeting not found.</p>
        <Link to="/dashboard" className="notion-btn-ghost mt-4 inline-flex text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    );
  }

  // Convert to MeetingNotes format for OutputTabs
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
        }
      : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="fade-in">
        <Link to="/dashboard" className="notion-btn-ghost text-sm text-muted-foreground mb-4 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">{meeting.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date(meeting.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {meeting.status === "processing" && (
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            )}
            {notes && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Export
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      {meeting.status === "processing" && (
        <div className="notion-card text-center py-12 fade-in">
          <div className="animate-pulse text-muted-foreground">AI is generating your notes...</div>
        </div>
      )}

      {meeting.status === "error" && (
        <div className="notion-card text-center py-12 fade-in">
          <p className="text-destructive">An error occurred while generating notes.</p>
        </div>
      )}

      {notes && <OutputTabs notes={notes} />}

      <details className="notion-card">
        <summary className="text-sm font-medium text-foreground cursor-pointer">Original Transcript</summary>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {meeting.transcript}
        </p>
      </details>
    </div>
  );
};

export default DashboardMeetingDetail;
