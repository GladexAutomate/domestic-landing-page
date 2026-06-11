// Supabase Edge Function — Starr Insurance Proxy
// Runs server-side. Starr API key + MD5 signing NEVER reaches the browser.
//
// Deploy:
//   supabase functions deploy starr-proxy
//
// Set secrets:
//   supabase secrets set STARR_ENV=uat
//   supabase secrets set STARR_UAT_BASE_URL=http://xxxx.phbeta.51zxtx.com
//   supabase secrets set STARR_UAT_USER_ID=xxxxxxxxxxxx
//   supabase secrets set STARR_UAT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   supabase secrets set STARR_PROD_BASE_URL=https://xxxxx.starrinsurance.com.ph
//   supabase secrets set STARR_PROD_USER_ID=xxxxxxxxxxxx
//   supabase secrets set STARR_PROD_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// MD5 using Deno standard library
async function md5Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  // Use SubtleCrypto MD5 via a pure-JS implementation since Web Crypto doesn't support MD5
  // Import SparkMD5 via CDN
  const { default: SparkMD5 } = await import("https://esm.sh/spark-md5@3.0.2");
  return SparkMD5.hash(message).toUpperCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const STARR_ENV     = Deno.env.get("STARR_ENV") || "uat";
    const BASE_URL      = STARR_ENV === "prod"
      ? Deno.env.get("STARR_PROD_BASE_URL")
      : Deno.env.get("STARR_UAT_BASE_URL");
    const USER_ID       = STARR_ENV === "prod"
      ? Deno.env.get("STARR_PROD_USER_ID")
      : Deno.env.get("STARR_UAT_USER_ID");
    const KEY           = STARR_ENV === "prod"
      ? Deno.env.get("STARR_PROD_KEY")
      : Deno.env.get("STARR_UAT_KEY");

    if (!BASE_URL || !USER_ID || !KEY) {
      return new Response(
        JSON.stringify({ error: "Starr credentials not configured in Supabase secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { endpoint, body } = await req.json(); // endpoint = "quotations" | "policies"
    const url     = `${BASE_URL}/${USER_ID}/${endpoint}`;
    const bodyStr = JSON.stringify(body);
    const sign    = await md5Hex(url + bodyStr + KEY);

    const starrRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type":   "application/json",
        "Content-Encoding": "UTF-8",
        "Accept-Language": "en",
        "X-Zxtx-Sign":   sign,
      },
      body: bodyStr,
    });

    const data = await starrRes.json();

    return new Response(JSON.stringify(data), {
      status: starrRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
