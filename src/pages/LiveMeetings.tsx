import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoRoom } from "@/components/meeting/VideoRoom";
import { ConvexProvider, ConvexReactClient, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

function LiveMeetingsInner() {
  const [session, setSession] = useState<{ token: string; userName: string } | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateToken = useAction(api.hundredMs.generate100msToken);

  const handleJoin = async () => {
    setJoining(true);
    setError(null);
    try {
      const roomId = import.meta.env.VITE_100MS_ROOM_ID;
      if (!roomId) {
        throw new Error("Missing VITE_100MS_ROOM_ID");
      }
      console.log("Live Meetings roomId:", roomId);

      const userName = `user-${randomId()}`;
      const token = await generateToken({ roomId, userName });
      console.log("Live Meetings token length:", token.length);
      setSession({ token, userName });
    } catch {
      setError("Failed to join meeting");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-6 py-8">
      <div className="w-full max-w-5xl">
        {!session ? (
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Live Meetings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a live video session.
            </p>

            <div className="mt-6">
              <Button onClick={handleJoin} disabled={joining}>
                {joining ? "Joining..." : "Join Meeting"}
              </Button>
            </div>

            {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
          </div>
        ) : (
          <VideoRoom token={session.token} userName={session.userName} />
        )}
      </div>
    </div>
  );
}

export default function LiveMeetings() {
  const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
  const client = useMemo(() => (convexUrl ? new ConvexReactClient(convexUrl) : null), [convexUrl]);

  if (!client) {
    // Keep UI unchanged in normal operation; this only appears if Convex isn't configured.
    return (
      <div className="flex min-h-[calc(100svh-7rem)] items-center justify-center px-6 py-8">
        <div className="w-full max-w-5xl">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Live Meetings</h1>
            <p className="mt-4 text-sm text-destructive">Missing VITE_CONVEX_URL</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConvexProvider client={client}>
      <LiveMeetingsInner />
    </ConvexProvider>
  );
}
