import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    return new Response(
      JSON.stringify({ error: "Google Calendar credentials not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader! } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ACTION: Get OAuth URL
    if (action === "auth-url") {
      const { redirectUri } = await req.json();
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        access_type: "offline",
        prompt: "consent",
        state: user.id,
      });
      return new Response(
        JSON.stringify({ url: `${GOOGLE_AUTH_URL}?${params.toString()}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Exchange code for tokens
    if (action === "callback") {
      const { code, redirectUri } = await req.json();
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Authorization code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        console.error("Token exchange error:", tokenData);
        return new Response(
          JSON.stringify({ error: "Failed to exchange authorization code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Upsert tokens
      const { error: upsertError } = await supabase
        .from("google_calendar_tokens")
        .upsert(
          {
            user_id: user.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: expiresAt,
          },
          { onConflict: "user_id" }
        );

      if (upsertError) {
        console.error("Upsert error:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to save tokens" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Fetch events
    if (action === "events") {
      // Get stored tokens
      const { data: tokenRow, error: fetchErr } = await supabase
        .from("google_calendar_tokens")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchErr || !tokenRow) {
        return new Response(
          JSON.stringify({ error: "not_connected" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let accessToken = tokenRow.access_token;

      // Refresh token if expired
      if (new Date(tokenRow.expires_at) <= new Date()) {
        const refreshRes = await fetch(GOOGLE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokenRow.refresh_token,
            grant_type: "refresh_token",
          }),
        });

        const refreshData = await refreshRes.json();
        if (!refreshRes.ok) {
          // Token invalid, delete it
          await supabase.from("google_calendar_tokens").delete().eq("user_id", user.id);
          return new Response(
            JSON.stringify({ error: "not_connected" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        accessToken = refreshData.access_token;
        const newExpiry = new Date(Date.now() + refreshData.expires_in * 1000).toISOString();

        await supabase
          .from("google_calendar_tokens")
          .update({ access_token: accessToken, expires_at: newExpiry })
          .eq("user_id", user.id);
      }

      // Fetch upcoming events
      const now = new Date().toISOString();
      const maxTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const calRes = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/primary/events?timeMin=${encodeURIComponent(now)}&timeMax=${encodeURIComponent(maxTime)}&maxResults=10&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!calRes.ok) {
        const errText = await calRes.text();
        console.error("Calendar API error:", calRes.status, errText);
        if (calRes.status === 401) {
          await supabase.from("google_calendar_tokens").delete().eq("user_id", user.id);
          return new Response(
            JSON.stringify({ error: "not_connected" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: "Failed to fetch calendar events" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const calData = await calRes.json();
      const events = (calData.items || []).map((e: {
        id: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        hangoutLink?: string;
        location?: string;
        description?: string;
      }) => ({
        id: e.id,
        title: e.summary || "Untitled Event",
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        meetLink: e.hangoutLink || null,
        location: e.location || null,
        description: e.description?.slice(0, 200) || null,
      }));

      return new Response(
        JSON.stringify({ events }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: Disconnect
    if (action === "disconnect") {
      await supabase.from("google_calendar_tokens").delete().eq("user_id", user.id);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("google-calendar error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
