import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  meetLink: string | null;
  location: string | null;
  description: string | null;
}

export function useGoogleCalendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) {
        setIsConnected(false);
        setEvents([]);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({}),
        }
      );

      if (!res.ok) {
        console.error("Calendar API returned", res.status);
        setIsConnected(false);
        setEvents([]);
        return;
      }

      const result = await res.json();
      if (result.error === "not_connected") {
        setIsConnected(false);
        setEvents([]);
      } else if (result.events) {
        setIsConnected(true);
        setEvents(result.events);
      }
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const connect = useCallback(async () => {
    if (!user) return;
    try {
      const redirectUri = `${window.location.origin}/dashboard/calendar-callback`;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=auth-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ redirectUri }),
        }
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to get authorization URL");
      }
    } catch (err) {
      toast.error("Failed to connect Google Calendar");
    }
  }, [user]);

  const disconnect = useCallback(async () => {
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=disconnect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({}),
        }
      );
      setIsConnected(false);
      setEvents([]);
      toast.success("Google Calendar disconnected");
    } catch (err) {
      toast.error("Failed to disconnect");
    }
  }, []);

  return { events, isConnected, isLoading, connect, disconnect, refetch: fetchEvents };
}
