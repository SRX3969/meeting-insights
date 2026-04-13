import { useEffect, useMemo, useState } from "react";
import {
  HMSRoomProvider,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectPeers,
  useHMSActions,
  useHMSStore,
  useVideo,
} from "@100mslive/react-sdk";
import { Button } from "@/components/ui/button";

type VideoRoomProps = {
  token: string;
  userName: string;
};

function PeerTile({
  trackId,
  name,
  isLocal,
}: {
  trackId?: string;
  name: string;
  isLocal?: boolean;
}) {
  const { videoRef } = useVideo({ trackId: trackId as never });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="aspect-video bg-black/40">
        <video
          ref={videoRef}
          autoPlay
          muted={Boolean(isLocal)}
          playsInline
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-2 text-sm text-foreground">
        {name}
        {isLocal ? " (You)" : ""}
      </div>
    </div>
  );
}

function VideoRoomInner({ token, userName }: VideoRoomProps) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const joinRoom = async () => {
      try {
        await hmsActions.join({
          authToken: token,
          userName,
        });
        await hmsActions.setLocalVideoEnabled(true);
      } catch (error) {
        if (mounted) {
          setJoinError(error instanceof Error ? error.message : "Failed to join room");
        }
      }
    };

    void joinRoom();

    return () => {
      mounted = false;
      void hmsActions.leave();
    };
  }, [hmsActions, token, userName]);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-lg font-semibold text-foreground">Live Meetings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Connected peers</p>

      {joinError ? <p className="mt-3 text-sm text-destructive">{joinError}</p> : null}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {peers.map((peer) => (
          <PeerTile
            key={peer.id}
            trackId={peer.videoTrack}
            name={peer.name || "Guest"}
            isLocal={peer.isLocal}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => void hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled)}
        >
          {isLocalAudioEnabled ? "Mute" : "Unmute"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => void hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled)}
        >
          {isLocalVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
        </Button>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-foreground">Peer Names</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {peers.map((peer) => (
            <li key={`name-${peer.id}`}>
              {peer.name || "Guest"}
              {peer.isLocal ? " (You)" : ""}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <Button variant="secondary" onClick={() => void hmsActions.leave()}>
          Leave Meeting
        </Button>
      </div>
    </div>
  );
}

export function VideoRoom({ token, userName }: VideoRoomProps) {
  return (
    <HMSRoomProvider>
      <VideoRoomInner token={token} userName={userName} />
    </HMSRoomProvider>
  );
}
