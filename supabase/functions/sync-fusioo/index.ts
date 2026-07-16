// Supabase Edge Function — Fusioo → Supabase sync
// Fetches the latest booking records from Fusioo and upserts them into
// fusioo_booking_transactions + all linked detail tables.
//
// Deploy:
//   supabase functions deploy sync-fusioo
//
// Secrets required (supabase secrets set KEY=value):
//   FUSIOO_TOKEN          — the Bearer JWT from .env.local (VITE_FUSIOO_TOKEN)
//   FUSIOO_BOOKING_APP_ID — the Fusioo App ID for Booking Transactions
//                           Find it in: gladex.fusioo.com → Booking Transactions → App Settings → App ID
//
// Schedule via pg_cron (run once in Supabase SQL editor):
//   select cron.schedule(
//     'sync-fusioo-every-30min',
//     '*/30 * * * *',
//     $$
//       select net.http_post(
//         url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/sync-fusioo',
//         headers := '{"Content-Type":"application/json","Authorization":"Bearer <SUPABASE_ANON_KEY>"}'::jsonb,
//         body    := '{}'::jsonb
//       );
//     $$
//   );

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUSIOO_BASE      = "https://api.fusioo.com";
const FUSIOO_TOKEN     = Deno.env.get("FUSIOO_TOKEN") ?? "";
const BOOKING_APP_ID   = Deno.env.get("FUSIOO_BOOKING_APP_ID") ?? "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const fusiooHeaders = {
  Authorization: `Bearer ${FUSIOO_TOKEN}`,
  "Content-Type": "application/json",
};

// Maps a booking field name → its Supabase detail table
const DETAIL_FIELD_TABLE: Record<string, string> = {
  hotel_booking_details: "fusioo_hotel_details",
  tour_details:          "fusioo_tour_details",
  airline_details_1:     "fusioo_ticket_details",
  transfer_details:      "fusioo_transfer_details",
};

const isFusiooId = (v: unknown): v is string =>
  typeof v === "string" && /^i[a-f0-9]{30,}$/i.test(v);

// Fetch one page of booking records from Fusioo
async function fetchBookingsPage(page: number): Promise<unknown[]> {
  const res = await fetch(`${FUSIOO_BASE}/v1/apps/${BOOKING_APP_ID}/records/search`, {
    method: "POST",
    headers: fusiooHeaders,
    body: JSON.stringify({ paging: { page, per_page: 100 } }),
  });
  if (!res.ok) throw new Error(`Fusioo search failed: ${res.status} ${await res.text()}`);
  const json = await res.json() as { data?: { records?: unknown[] } };
  return json.data?.records ?? [];
}

// Fetch a single Fusioo record by ID
async function fetchRecord(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${FUSIOO_BASE}/v1/records/${id}`, { headers: fusiooHeaders });
  if (!res.ok) return null;
  const json = await res.json() as { data?: Record<string, unknown> };
  return json.data ?? null;
}

serve(async () => {
  const now = new Date().toISOString();
  const log: string[] = [];

  if (!FUSIOO_TOKEN || !BOOKING_APP_ID) {
    return new Response(
      JSON.stringify({ ok: false, error: "FUSIOO_TOKEN or FUSIOO_BOOKING_APP_ID secret not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. Fetch ALL bookings from Fusioo (paginate until last page)
    const records: Record<string, unknown>[] = [];
    let page = 1;
    while (true) {
      const batch = await fetchBookingsPage(page) as Record<string, unknown>[];
      records.push(...batch);
      if (batch.length < 100) break;
      page++;
    }
    log.push(`Fusioo returned ${records.length} booking records (${page} page${page > 1 ? "s" : ""})`);

    if (records.length === 0) {
      return new Response(JSON.stringify({ ok: true, log }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Upsert booking records into fusioo_booking_transactions
    const bookingRows = records.map(r => ({
      id:        r.id as string,
      data:      r,
      synced_at: now,
    }));

    const { error: bookingErr } = await supabase
      .from("fusioo_booking_transactions")
      .upsert(bookingRows, { onConflict: "id" });

    if (bookingErr) throw new Error(`Booking upsert failed: ${bookingErr.message}`);
    log.push(`Upserted ${bookingRows.length} bookings into fusioo_booking_transactions`);

    // 3. Collect all unique detail record IDs from the synced bookings
    const detailJobs: Array<{ table: string; id: string }> = [];
    const seenKeys = new Set<string>();

    for (const record of records) {
      for (const [field, table] of Object.entries(DETAIL_FIELD_TABLE)) {
        const raw = record[field];
        const ids: string[] = Array.isArray(raw) ? raw : isFusiooId(raw) ? [raw as string] : [];
        for (const id of ids) {
          if (!isFusiooId(id)) continue;
          const key = `${table}:${id}`;
          if (seenKeys.has(key)) continue;
          seenKeys.add(key);
          detailJobs.push({ table, id });
        }
      }
    }

    log.push(`Found ${detailJobs.length} unique detail records to sync`);

    // 4. Batch-fetch detail records from Fusioo (20 at a time) and upsert
    const BATCH = 20;
    let synced = 0;

    for (let i = 0; i < detailJobs.length; i += BATCH) {
      const batch = detailJobs.slice(i, i + BATCH);
      const fetched = await Promise.all(batch.map(j => fetchRecord(j.id)));

      // Group by table
      const byTable: Record<string, Array<{ id: string; data: unknown }>> = {};
      for (let k = 0; k < batch.length; k++) {
        const rec = fetched[k];
        if (!rec) continue;
        const { table, id } = batch[k];
        if (!byTable[table]) byTable[table] = [];
        byTable[table].push({ id, data: rec });
      }

      for (const [table, rows] of Object.entries(byTable)) {
        const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
        if (error) log.push(`Warning: ${table} upsert error — ${error.message}`);
        else synced += rows.length;
      }
    }

    log.push(`Upserted ${synced} detail records`);
    log.push("Sync complete");

    return new Response(JSON.stringify({ ok: true, log }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: msg, log }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
