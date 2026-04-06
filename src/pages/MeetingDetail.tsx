import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMeeting } from "@/lib/meetings-store";
import { Meeting } from "@/lib/types";
import { OutputTabs } from "@/components/OutputTabs";
import { ArrowLeft } from "lucide-react";

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    if (id) {
      const m = getMeeting(id);
      setMeeting(m || null);
    }
  }, [id]);

  if (!meeting) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 fade-in">
        <p className="text-muted-foreground">Meeting not found.</p>
        <Link to="/history" className="notion-btn-ghost mt-4 inline-flex text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="fade-in">
        <Link to="/history" className="notion-btn-ghost text-sm text-muted-foreground mb-4 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mt-2">{meeting.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date(meeting.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {meeting.notes && <OutputTabs notes={meeting.notes} />}

      <details className="notion-card">
        <summary className="text-sm font-medium text-foreground cursor-pointer">Original Transcript</summary>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{meeting.transcript}</p>
      </details>
    </div>
  );
};

export default MeetingDetail;
