import { CalendarEvent } from "@/hooks/useGoogleCalendar";
import { Calendar, Video, MapPin, Clock, ExternalLink, Link2Off, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarSectionProps {
  events: CalendarEvent[];
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function groupEventsByDate(events: CalendarEvent[]) {
  const groups: Record<string, CalendarEvent[]> = {};
  events.forEach((e) => {
    const key = new Date(e.start).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups);
}

export function CalendarSection({ events, isConnected, isLoading, onConnect, onDisconnect }: CalendarSectionProps) {
  if (isLoading) {
    return (
      <div className="notion-card flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="notion-card text-center py-10 space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center mx-auto">
          <Calendar className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Connect Google Calendar</h3>
          <p className="text-xs text-muted-foreground mt-1">
            See your upcoming meetings right on your dashboard
          </p>
        </div>
        <Button onClick={onConnect} className="rounded-xl">
          <Calendar className="h-4 w-4" />
          Connect Calendar
        </Button>
      </div>
    );
  }

  const grouped = groupEventsByDate(events);

  return (
    <div className="notion-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
          <span className="text-xs text-muted-foreground">· Next 7 days</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDisconnect} className="rounded-lg text-xs text-muted-foreground">
          <Link2Off className="h-3 w-3" />
          Disconnect
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No upcoming events this week 🎉</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {formatDate(dayEvents[0].start)}
              </p>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      {event.meetLink ? (
                        <Video className="h-4 w-4 text-primary" />
                      ) : (
                        <Calendar className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(event.start)} – {formatTime(event.end)}
                        </span>
                        {event.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    {event.meetLink && (
                      <a
                        href={event.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Join
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
