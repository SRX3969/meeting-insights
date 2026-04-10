import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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

      const { data, error } = await supabase.functions.invoke("generate-notes", {
        body: { meetingId: meeting.id, transcript },
      });

      if (error) {
        toast.error("AI generation failed. You can retry from the meeting page.");
        throw error;
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
