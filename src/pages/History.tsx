import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMeetings } from "@/lib/meetings-store";
import { Meeting } from "@/lib/types";
import { FileText, ChevronRight } from "lucide-react";

const History = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    setMeetings(getMeetings());
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="space-y-2 fade-in">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">History</h1>
        <p className="text-muted-foreground text-base">Your past meeting notes</p>
      </div>

      {meetings.length === 0 ? (
        <div className="notion-card text-center py-16 fade-in">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No meetings yet. Generate your first notes!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting, i) => (
            <Link
              key={meeting.id}
              to={`/meeting/${meeting.id}`}
              className="flex items-center justify-between rounded-xl border border-border px-5 py-4 transition-all duration-150 hover:bg-accent hover-lift fade-slide-in"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{meeting.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
