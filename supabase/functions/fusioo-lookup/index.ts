// Supabase Edge Function — Fusioo direct lookup (fallback for un-synced bookings)
//
// Called when a GDX lookup fails in Supabase (booking exists in Fusioo but not yet
// synced). Scans Fusioo pages for the booking, upserts it + all linked detail records
// into Supabase (so the next lookup hits cache), then returns the raw data for
// client-side normalization via normalizeBooking().
//
// Deploy (--no-verify-jwt — GDX code is the only access control needed):
//   supabase functions deploy fusioo-lookup --no-verify-jwt
//
// Secrets required (same set as sync-fusioo / fusioo-webhook):
//   FUSIOO_TOKEN
//   FUSIOO_BOOKING_APP_ID   (= if7fc4b38878b4c2db947d582004ce3b7)
//   SUPABASE_URL            (auto-injected by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUSIOO_BASE    = "https://api.fusioo.com";
const FUSIOO_TOKEN   = Deno.env.get("FUSIOO_TOKEN") ?? "";
const BOOKING_APP_ID = "if7fc4b38878b4c2db947d582004ce3b7";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const fusiooHeaders = {
  Authorization: `Bearer ${FUSIOO_TOKEN}`,
  "Content-Type": "application/json",
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Same table map as sync-fusioo / fusioo-webhook
const DETAIL_FIELD_TABLE: Record<string, string> = {
  hotel_booking_details: "fusioo_hotel_details",
  tour_details:          "fusioo_tour_details",
  airline_details_1:     "fusioo_ticket_details",
  transfer_details:      "fusioo_transfer_details",
};

const isFusiooId = (v: unknown): v is string =>
  typeof v === "string" && /^i[a-f0-9]{30,}$/i.test(v);

function gdxCandidates(input: string): string[] {
  const core = input.trim().replace(/^gdx[-\s]*/i, "").trim();
  if (!core) return [];
  return Array.from(new Set([`GDX-${core}`, `gdx-${core}`, `GDX${core}`, core]));
}

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function fetchRecord(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${FUSIOO_BASE}/v1/records/${id}`, { headers: fusiooHeaders });
  if (!res.ok) return null;
  const body = await res.json() as { data?: Record<string, unknown> };
  return body.data ?? null;
}

// Scan Fusioo pages (newest-to-oldest assumption: page 1 first) for a matching GDX.
// Falls back to scanning every page up to MAX_PAGES if not found early.
async function findInFusioo(
  candidates: string[]
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  const MAX_PAGES = 20; // 2,000 records max scan — more than enough for Gladex volume
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${FUSIOO_BASE}/v1/apps/${BOOKING_APP_ID}/records/search`, {
      method: "POST",
      headers: fusiooHeaders,
      body: JSON.stringify({ paging: { page, per_page: 100 } }),
    });
    if (!res.ok) throw new Error(`Fusioo search failed: ${res.status}`);
    const body = await res.json() as { data?: { records?: Record<string, unknown>[] } };
    const records = body.data?.records ?? [];

    const match = records.find((r) => candidates.includes((r.gdx ?? "") as string));
    if (match) return { id: match.id as string, data: match };
    if (records.length < 100) break; // reached last page
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const body = await req.json().catch(() => ({})) as { gdx?: string };
    const gdxRaw = body.gdx || new URL(req.url).searchParams.get("gdx") || "";
    if (!gdxRaw) return respond({ error: "gdx required" }, 400);

    const candidates = gdxCandidates(gdxRaw);
    const found = await findInFusioo(candidates);
    if (!found) return respond({ error: "not_found" }, 404);

    const d = found.data;
    const now = new Date().toISOString();

    // Collect all unique detail record IDs across all linked fields
    const allDetailIds = new Map<string, { table: string; field: string }>();
    for (const [field, table] of Object.entries(DETAIL_FIELD_TABLE)) {
      const raw = d[field];
      const ids = (Array.isArray(raw) ? raw : raw ? [raw] : []).filter(isFusiooId) as string[];
      for (const id of ids) {
        if (!allDetailIds.has(id)) allDetailIds.set(id, { table, field });
      }
    }

    // Fetch all detail records from Fusioo in parallel
    const detailRecords = new Map<string, Record<string, unknown>>();
    await Promise.all(
      Array.from(allDetailIds.keys()).map(async (id) => {
        const record = await fetchRecord(id);
        if (record) detailRecords.set(id, record);
      })
    );

    // Upsert main booking to Supabase (caches for future lookups)
    await supabase
      .from("fusioo_booking_transactions")
      .upsert([{ id: found.id, data: d, synced_at: now }], { onConflict: "id" });

    // Upsert all linked detail records
    await Promise.all(
      Array.from(allDetailIds.entries()).map(([id, { table }]) => {
        const data = detailRecords.get(id);
        if (!data) return;
        return supabase.from(table).upsert([{ id, data, synced_at: now }], { onConflict: "id" });
      })
    );

    // Group fetched records by field (preserving array order from booking data)
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
      // First record + full array for each detail type (client picks "best" for hotels/tours)
      tourData:     byField.tour_details?.[0]           ?? null,
      allTourData:  byField.tour_details               ?? [],
      ticketData:   byField.airline_details_1?.[0]      ?? null,
      hotelData:    byField.hotel_booking_details?.[0]  ?? null,
      allHotelData: byField.hotel_booking_details       ?? [],
      transferData: byField.transfer_details?.[0]       ?? null,
    });

  } catch (err: unknown) {
    return respond({ error: (err as Error).message }, 500);
  }
});
