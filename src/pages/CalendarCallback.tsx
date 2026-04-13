import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      toast.error("No authorization code received");
      navigate("/dashboard");
      return;
    }

    const exchange = async () => {
      try {
        const redirectUri = `${window.location.origin}/dashboard/calendar-callback`;
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar?action=callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ code, redirectUri }),
          }
        );

        const data = await res.json();
        if (data.success) {
          toast.success("Google Calendar connected!");
          navigate("/dashboard");
        } else {
          throw new Error(data.error || "Failed to connect");
        }
      } catch (err) {
        console.error("Calendar callback error:", err);
        toast.error("Failed to connect Google Calendar");
        setStatus("error");
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    };

    exchange();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        {status === "processing" ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Connecting Google Calendar...</p>
          </>
        ) : (
          <p className="text-sm text-destructive">Connection failed. Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default CalendarCallback;
