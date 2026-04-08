import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Shield, Palette, AlertTriangle, Sun, Moon, Monitor } from "lucide-react";

const EMOJI_OPTIONS = ["🧠", "😊", "🚀", "💜", "🎯", "⚡", "🌟", "🎨", "📝", "💡", "🔥", "🌈"];

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarEmoji, setAvatarEmoji] = useState("🧠");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username || "");
      setAvatarEmoji(profile.avatar_emoji || "🧠");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate({
      full_name: fullName,
      username: username || null,
      avatar_emoji: avatarEmoji,
    });
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    await signOut();
    toast.success("Signed out. Contact support to fully delete your account.");
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="skeleton-pulse h-8 w-40 rounded-xl mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton-pulse h-16 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="rounded-xl">
          <TabsTrigger value="profile" className="gap-1.5 rounded-lg">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 rounded-lg">
            <Shield className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 rounded-lg">
            <Palette className="h-3.5 w-3.5" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1.5 rounded-lg">
            <AlertTriangle className="h-3.5 w-3.5" /> Account
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <div className="notion-card space-y-5">
            <h3 className="text-base font-semibold text-foreground">Avatar</h3>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    avatarEmoji === emoji
                      ? "bg-primary/10 ring-2 ring-primary scale-110"
                      : "bg-secondary hover:bg-accent"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="notion-card space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="rounded-xl opacity-60" />
            </div>
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="rounded-xl">
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="notion-card space-y-4">
            <h3 className="text-base font-semibold text-foreground">Change Password</h3>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl"
              />
            </div>
            <Button onClick={handleChangePassword} className="rounded-xl">Update Password</Button>
          </div>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <div className="notion-card space-y-4">
            <h3 className="text-base font-semibold text-foreground">Theme</h3>
            <p className="text-sm text-muted-foreground">
              Theme customization coming soon. Currently using system default.
            </p>
          </div>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account">
          <div className="notion-card space-y-4 border-destructive/20">
            <h3 className="text-base font-semibold text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Deleting your account will permanently remove all your data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount} className="rounded-xl">
              Delete Account
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
