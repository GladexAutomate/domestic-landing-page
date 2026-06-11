// Supabase Edge Function — Xendit Invoice Creation
// Runs server-side. Xendit secret key is NEVER sent to the browser.
//
// Deploy:
//   supabase functions deploy xendit-invoice
//
// Set secrets:
//   supabase secrets set XENDIT_SECRET_KEY=xnd_production_xxxxxxxxxxxxxxxxxxxx
//   supabase secrets set XENDIT_BASE_URL=https://api.xendit.co

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const XENDIT_SECRET_KEY = Deno.env.get("XENDIT_SECRET_KEY");
    const XENDIT_BASE_URL   = Deno.env.get("XENDIT_BASE_URL") || "https://api.xendit.co";

    if (!XENDIT_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Xendit secret key not configured in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const xenditRes = await fetch(`${XENDIT_BASE_URL}/v2/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${btoa(XENDIT_SECRET_KEY + ":")}`,
      },
      body: JSON.stringify(body),
    });

    const data = await xenditRes.json();

    return new Response(JSON.stringify(data), {
      status: xenditRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
