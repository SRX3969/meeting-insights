import { useState } from "react";
import { useMeetings } from "@/hooks/useMeetings";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { createMeeting, isCreating } = useMeetings();
  const [transcript, setTranscript] = useState("");

  const name = profile?.full_name || "User";

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "20px" }}>
        Welcome back, {name}
      </h1>
      <div style={{ background: "#f9f9f9", padding: "30px", borderRadius: "12px", border: "1px solid #ddd" }}>
        <h2 style={{ marginBottom: "10px" }}>New Meeting Analysis</h2>
        <textarea
          style={{ width: "100%", height: "200px", borderRadius: "8px", border: "1px solid #ccc", padding: "12px", marginBottom: "16px" }}
          placeholder="Paste transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
        <button
          style={{ width: "100%", padding: "12px", background: "#000", color: "#fff", borderRadius: "8px", cursor: "pointer", border: "none" }}
          disabled={isCreating}
          onClick={() => {
            if (transcript.length < 5) return;
            createMeeting.mutate({ transcript, title: "New Meeting", date: new Date().toISOString() });
            setTranscript("");
          }}
        >
          {isCreating ? "Analyzing..." : "Generate Insights"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
