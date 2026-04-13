import { useEffect, useMemo, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";
import { Check, Copy, Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";

type VideoRoomProps = {
  token: string;
  userName: string;
  onLeave?: () => void;
};

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/g).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function VideoTileWithTrack({
  trackId,
  displayName,
  muted,
}: {
  trackId: string;
  displayName: string;
  muted: boolean;
}) {
  const { videoRef } = useVideo({ trackId: trackId as never });

  return (
    <div className="relative overflow-hidden rounded-xl bg-black shadow-sm ring-1 ring-white/10">
      <div className="aspect-video bg-black/60">
        <video ref={videoRef} autoPlay muted={muted} playsInline className="h-full w-full object-cover" />
      </div>

      <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
        {displayName}
      </div>
    </div>
  );
}

function VideoTilePlaceholder({
  displayName,
  initials,
}: {
  displayName: string;
  initials: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-black/70 shadow-sm ring-1 ring-white/10">
      <div className="aspect-video bg-black/50">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-xl font-semibold text-white ring-1 ring-white/10">
            {initials}
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
        {displayName}
      </div>
    </div>
  );
}

function VideoRoomInner({ token, userName, onLeave }: VideoRoomProps) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const copyResetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const joinRoom = async () => {
      try {
        if (mounted) {
          setIsConnecting(true);
          setJoinError(null);
        }
        await hmsActions.join({
          authToken: token,
          userName,
        });
        await hmsActions.setLocalVideoEnabled(true);
        if (mounted) setIsConnecting(false);
      } catch (error) {
        if (mounted) {
          setJoinError(error instanceof Error ? error.message : "Failed to join room");
          setIsConnecting(false);
        }
      }
    };

    void joinRoom();

    return () => {
      mounted = false;
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = null;
      }
      void hmsActions.leave();
    };
  }, [hmsActions, token, userName]);

  const count = peers.length;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    } finally {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopyState("idle");
        copyResetTimerRef.current = null;
      }, 1500);
    }
  };

  const handleLeave = async () => {
    try {
      await hmsActions.leave();
    } finally {
      onLeave?.();
    }
  };

  return (
    <div className="relative min-h-[calc(100svh-7rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6">
        <div className="relative">
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3">
            <div className="inline-flex items-center rounded-full bg-black/50 px-3 py-1 text-xs text-white ring-1 ring-white/10 backdrop-blur">
              Participants: {count}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => void handleCopyLink()}
            >
              {copyState === "copied" ? <Check /> : <Copy />}
              <span className="hidden sm:inline">
                {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Copy failed" : "Copy link"}
              </span>
            </Button>
          </div>

          {joinError ? <p className="pt-14 text-sm text-destructive">{joinError}</p> : <div className="pt-14" />}

          {count === 1 ? (
            <div className="w-full max-w-4xl mx-auto aspect-video">
              {(() => {
                const peer = peers[0]!;
                const name = peer.name || "Guest";
                const displayName = peer.isLocal ? `${name} (You)` : name;
                const hasVideo = Boolean(peer.videoTrack);

                return hasVideo ? (
                  <VideoTileWithTrack
                    trackId={peer.videoTrack as string}
                    displayName={displayName}
                    muted={Boolean(peer.isLocal)}
                  />
                ) : (
                  <VideoTilePlaceholder displayName={displayName} initials={getInitials(name)} />
                );
              })()}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {peers.map((peer) => {
                const name = peer.name || "Guest";
                const displayName = peer.isLocal ? `${name} (You)` : name;
                const hasVideo = Boolean(peer.videoTrack);

                if (!hasVideo) {
                  return (
                    <VideoTilePlaceholder
                      key={peer.id}
                      displayName={displayName}
                      initials={getInitials(name)}
                    />
                  );
                }

                return (
                  <VideoTileWithTrack
                    key={peer.id}
                    trackId={peer.videoTrack as string}
                    displayName={displayName}
                    muted={Boolean(peer.isLocal)}
                  />
                );
              })}
            </div>
          )}

          {isConnecting ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-foreground shadow-sm backdrop-blur">
                <Loader2 className="animate-spin" />
                Joining…
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Floating control bar */}
      <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className={cn(
              "h-12 w-12 rounded-full transition-transform hover:scale-[1.03]",
              !isLocalAudioEnabled && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
            onClick={() => void hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled)}
            aria-label={isLocalAudioEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {isLocalAudioEnabled ? <Mic /> : <MicOff />}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="secondary"
            className={cn(
              "h-12 w-12 rounded-full transition-transform hover:scale-[1.03]",
              !isLocalVideoEnabled && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
            onClick={() => void hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled)}
            aria-label={isLocalVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {isLocalVideoEnabled ? <Video /> : <VideoOff />}
          </Button>

          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-12 w-12 rounded-full transition-transform hover:scale-[1.03]"
            onClick={() => void handleLeave()}
            aria-label="Leave meeting"
          >
            <PhoneOff />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function VideoRoom({ token, userName, onLeave }: VideoRoomProps) {
  return (
    <HMSRoomProvider>
      <VideoRoomInner token={token} userName={userName} onLeave={onLeave} />
    </HMSRoomProvider>
  );
}
