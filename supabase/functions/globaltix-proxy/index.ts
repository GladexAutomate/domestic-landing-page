// Supabase Edge Function — GlobalTix Proxy
// Runs server-side. GlobalTix API key + username NEVER reaches the browser.
//
// Deploy:
//   supabase functions deploy globaltix-proxy
//
// Set secrets:
//   supabase secrets set GLOBALTIX_BASE_URL=https://stg-api.globaltix.com
//   supabase secrets set GLOBALTIX_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   supabase secrets set GLOBALTIX_X_API_AGENT=xxxxxxxxxxxx
//   supabase secrets set GLOBALTIX_USERNAME=xxxxxxxxxxxx@globaltix.com

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(baseUrl: string, apiKey: string, agent: string, username: string): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const res = await fetch(`${baseUrl}/api/auth/authorize`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "x-api-key":     `${agent}/${apiKey}`,
      "x-api-agent":   agent,
    },
    body: JSON.stringify({ username }),
  });

  const json = await res.json();
  _token      = json.data?.accessToken;
  _tokenExpiry = Date.now() + 22 * 60 * 60 * 1000;
  return _token!;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const BASE_URL  = Deno.env.get("GLOBALTIX_BASE_URL") || "https://stg-api.globaltix.com";
    const API_KEY   = Deno.env.get("GLOBALTIX_API_KEY")!;
    const AGENT     = Deno.env.get("GLOBALTIX_X_API_AGENT")!;
    const USERNAME  = Deno.env.get("GLOBALTIX_USERNAME")!;

    if (!API_KEY || !AGENT || !USERNAME) {
      return new Response(
        JSON.stringify({ error: "GlobalTix credentials not configured in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { path, method = "GET", body } = await req.json();
    const token = await getToken(BASE_URL, API_KEY, AGENT, USERNAME);

    const gtixRes = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type":  "application/json",
        "x-api-key":     `${AGENT}/${API_KEY}`,
        "x-api-agent":   AGENT,
        "Authorization": `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await gtixRes.json();

    return new Response(JSON.stringify(data), {
      status: gtixRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
