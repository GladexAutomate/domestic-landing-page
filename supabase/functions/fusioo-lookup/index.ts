// Supabase Edge Function — Booking lookup by GDX number
//
// Searches fusioo_booking_transactions by the 'gdx' field in the JSONB data,
// then assembles and returns full booking + detail records.
//
// This is the fallback called when the client can't find the booking itself.
// It does NOT call the Fusioo API — all data must already be in Supabase
// (synced by fusioo-webhook on every save event in Fusioo).
//
// Deploy (--no-verify-jwt — GDX code is the only access control needed):
//   supabase functions deploy fusioo-lookup --no-verify-jwt
//
// Secrets required:
//   SUPABASE_URL              (auto-injected by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DETAIL_FIELD_TABLE: Record<string, string> = {
  hotel_booking_details: "fusioo_hotel_details",
  tour_details:          "fusioo_tour_details",
  airline_details_1:     "fusioo_ticket_details",
  transfer_details:      "fusioo_transfer_details",
};

const isFusiooId = (v: unknown): v is string =>
  typeof v === "string" && /^i[a-f0-9]{30,}$/i.test(v);

function normalizeGdx(input: string): string {
  // Strip "GDX-" / "GDX " prefix — the `gdx` field in Fusioo stores just the number
  return input.trim().replace(/^gdx[-\s]*/i, "").trim();
}

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json().catch(() => ({})) as { gdx?: string };
    const gdxRaw = body.gdx || new URL(req.url).searchParams.get("gdx") || "";
    if (!gdxRaw) return respond({ error: "gdx required" }, 400);

    const gdxNum = normalizeGdx(gdxRaw);
    if (!gdxNum) return respond({ error: "invalid gdx" }, 400);

    // Search Supabase for the booking by numeric GDX stored in JSONB data
    const { data: rows, error } = await supabase
      .from("fusioo_booking_transactions")
      .select("id, data")
      .eq("data->>gdx", gdxNum)
      .limit(1);

    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) {
      return respond({ error: "not_found" }, 404);
    }

    const found = rows[0] as { id: string; data: Record<string, unknown> };
    const d = found.data;

    // Collect all unique detail record IDs from the booking
    const allDetailIds = new Map<string, { table: string; field: string }>();
    for (const [field, table] of Object.entries(DETAIL_FIELD_TABLE)) {
      const raw = d[field];
      const ids = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(isFusiooId) as string[];
      for (const id of ids) {
        if (!allDetailIds.has(id)) allDetailIds.set(id, { table, field });
      }
    }

    // Fetch all detail records from Supabase in parallel
    const detailRecords = new Map<string, Record<string, unknown>>();
    await Promise.all(
      Array.from(allDetailIds.entries()).map(async ([id, { table }]) => {
        const { data: detail } = await supabase
          .from(table)
          .select("id, data")
          .eq("id", id)
          .single();
        if (detail) detailRecords.set(id, (detail as { data: Record<string, unknown> }).data);
      })
    );

    // Group by field (preserving array order from booking data)
    const byField: Record<string, Record<string, unknown>[]> = {};
    for (const [id, { field }] of allDetailIds.entries()) {
      const record = detailRecords.get(id);
      if (record) {
        if (!byField[field]) byField[field] = [];
        byField[field].push(record);
      }
    }

    return respond({
      bookingId:    found.id,
      booking:      d,
      tourData:     byField.tour_details?.[0]          ?? null,
      allTourData:  byField.tour_details               ?? [],
      ticketData:   byField.airline_details_1?.[0]     ?? null,
      hotelData:    byField.hotel_booking_details?.[0] ?? null,
      allHotelData: byField.hotel_booking_details      ?? [],
      transferData: byField.transfer_details?.[0]      ?? null,
    });

  } catch (err: unknown) {
    return respond({ error: (err as Error).message }, 500);
  }
});
