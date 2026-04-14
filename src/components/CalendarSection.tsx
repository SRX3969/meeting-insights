import { CalendarEvent } from "@/hooks/useGoogleCalendar";
import { Calendar, Video, MapPin, Clock, ExternalLink, Link2Off, Loader2, FileText, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface CalendarSectionProps {
  events: CalendarEvent[];
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh?: () => void;
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

function getTimeUntil(dateStr: string) {
  const now = new Date();
  const start = new Date(dateStr);
  const diff = start.getTime() - now.getTime();
  if (diff < 0) return "In progress";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `in ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return `in ${days}d`;
}

function isHappeningSoon(dateStr: string) {
  const now = new Date();
  const start = new Date(dateStr);
  const diff = start.getTime() - now.getTime();
  return diff >= 0 && diff < 30 * 60000; // within 30 minutes
}

function isHappeningNow(startStr: string, endStr: string) {
  const now = new Date();
  return now >= new Date(startStr) && now <= new Date(endStr);
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

export function CalendarSection({ events, isConnected, isLoading, onConnect, onDisconnect, onRefresh }: CalendarSectionProps) {
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 500);
  };

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
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto">
          <Calendar className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Connect Google Calendar</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            See upcoming meetings, join calls, and create notes — all from your dashboard
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
          {events.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {events.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              className="rounded-lg text-xs text-muted-foreground h-7 w-7 p-0"
              title="Refresh events"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onDisconnect} className="rounded-lg text-xs text-muted-foreground">
            <Link2Off className="h-3 w-3" />
            Disconnect
          </Button>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <div className="text-3xl">🎉</div>
          <p className="text-sm text-muted-foreground">No upcoming events this week</p>
          <p className="text-xs text-muted-foreground/70">Enjoy your free time!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateKey, dayEvents]) => (
            <div key={dateKey} className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {formatDate(dayEvents[0].start)}
              </p>
              <div className="space-y-2">
                {dayEvents.map((event) => {
                  const happeningNow = isHappeningNow(event.start, event.end);
                  const soon = isHappeningSoon(event.start);
                  
                  return (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-200 hover:shadow-sm ${
                        happeningNow
                          ? "border-primary/30 bg-primary/5 shadow-sm"
                          : soon
                          ? "border-amber-500/20 bg-amber-500/5"
                          : "border-border hover:bg-accent/50"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        happeningNow
                          ? "bg-primary/20"
                          : "bg-primary/10"
                      }`}>
                        {event.meetLink ? (
                          <Video className={`h-4 w-4 ${happeningNow ? "text-primary animate-pulse" : "text-primary"}`} />
                        ) : (
                          <Calendar className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{event.title}</p>
                          {happeningNow && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium shrink-0 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              LIVE
                            </span>
                          )}
                          {soon && !happeningNow && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium shrink-0">
                              {getTimeUntil(event.start)}
                            </span>
                          )}
                        </div>
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
                        {event.description && (
                          <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {event.meetLink && (
                          <a
                            href={event.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors ${
                              happeningNow
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "text-primary hover:bg-primary/10"
                            }`}
                          >
                            Join
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                          title="Create meeting notes for this event"
                          onClick={() => {
                            navigate("/dashboard/meetings/new", {
                              state: {
                                calendarEvent: {
                                  title: event.title,
                                  start: event.start,
                                  end: event.end,
                                  description: event.description,
                                },
                              },
                            });
                          }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
