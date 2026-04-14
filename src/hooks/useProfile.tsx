import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string | null;
  date_of_birth: string | null;
  heard_from: string | null;
  avatar_url: string | null;
  theme: string;
  accent_color: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data as unknown as Profile;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, "id" | "user_id" | "created_at">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      // Delete profile (cascade will handle from auth.users if admin deletes)
      // For now, sign the user out
      await supabase.auth.signOut();
    },
  });
}
