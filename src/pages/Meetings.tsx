import { useState } from "react";
import { Link } from "react-router-dom";
import { useMeetings, useDeleteMeeting } from "@/hooks/useMeetings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Search, Trash2, ChevronRight } from "lucide-react";

const Meetings = () => {
  const { data: meetings, isLoading } = useMeetings();
  const deleteMeeting = useDeleteMeeting();
  const [search, setSearch] = useState("");

  const filtered = meetings?.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.summary || "").toLowerCase().includes(q) ||
      m.transcript.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Meetings</h1>
          <p className="text-muted-foreground text-sm mt-1">All your meeting notes in one place</p>
        </div>
        <Link to="/dashboard/meetings/new">
          <Button className="rounded-xl">
            <Plus className="h-4 w-4" /> New Meeting
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search meetings by title, summary, or transcript..."
          className="pl-10 rounded-xl"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-pulse h-24 rounded-2xl" />
          ))}
        </div>
      ) : !filtered?.length ? (
        <div className="notion-card text-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? "No meetings match your search." : "No meetings yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((meeting, i) => (
            <div
              key={meeting.id}
              className="notion-card flex items-center justify-between p-5 fade-slide-in"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <Link to={`/dashboard/meeting/${meeting.id}`} className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">{meeting.title}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      meeting.status === "completed"
                        ? "bg-accent text-accent-foreground"
                        : meeting.status === "processing"
                        ? "bg-secondary text-muted-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {meeting.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(meeting.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {meeting.summary && <span className="ml-2">· {meeting.summary.slice(0, 80)}...</span>}
                </p>
              </Link>
              <div className="flex items-center gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => {
                    if (confirm("Delete this meeting?")) deleteMeeting.mutate(meeting.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
                <Link to={`/dashboard/meeting/${meeting.id}`}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Meetings;
