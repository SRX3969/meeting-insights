import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useEffect } from "react";

export interface DbMeeting {
  id: string;
  user_id: string;
  title: string;
  transcript: string;
  summary: string | null;
  action_items: string[] | null;
  decisions: string[] | null;
  key_points: string[] | null;
  tasks: { task: string; owner: string; priority: string }[] | null;
  status: string;
  sentiment: string | null;
  productivity_score: number | null;
  participation_insights: { mostActive: string; engagementLevel: string; speakerCount: number } | null;
  created_at: string;
  updated_at: string;
}

export function useMeetings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const topic = `realtime:meetings-realtime-${user.id}`;
    supabase
      .getChannels()
      .filter((channel) => channel.topic === topic)
      .forEach((channel) => {
        void supabase.removeChannel(channel);
      });

    const channel = supabase
      .channel(`meetings-realtime-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["meetings", user.id] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ["meetings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as DbMeeting[];
    },
    enabled: !!user,
  });
}

export function useMeeting(id: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !id) return;

    const topic = `realtime:meeting-detail-${id}`;
    supabase
      .getChannels()
      .filter((channel) => channel.topic === topic)
      .forEach((channel) => {
        void supabase.removeChannel(channel);
      });

    const channel = supabase
      .channel(`meeting-detail-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meetings", filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["meeting", id] });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, id, queryClient]);

  return useQuery({
    queryKey: ["meeting", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as DbMeeting;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ title, transcript }: { title: string; transcript: string }) => {
      const { data: meeting, error: insertError } = await supabase
        .from("meetings")
        .insert({ user_id: user!.id, title, transcript, status: "processing" })
        .select()
        .single();
      if (insertError) throw insertError;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Your session has expired. Please log in again.");
        throw new Error("No session");
      }
      
      console.log("Starting AI generation for meeting:", meeting.id);
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ meetingId: meeting.id, transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || `Error ${response.status}`;
        console.error("AI Generation Failed:", msg);
        toast.error(`AI Processing Failed: ${msg}`);
        throw new Error(msg);
      }

      return meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted");
    },
  });
}
