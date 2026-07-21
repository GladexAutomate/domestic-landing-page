// Supabase Edge Function — Fusioo real-time webhook receiver
//
// Fires every time a booking is CREATED or UPDATED in Fusioo.
// Verifies the Fusioo secret, fetches the full record, then upserts
// into fusioo_booking_transactions + all linked detail tables.
//
// Deploy (--no-verify-jwt so Fusioo can POST without a Supabase token):
//   supabase functions deploy fusioo-webhook --no-verify-jwt
//
// Secrets required (supabase secrets set KEY=value):
//   FUSIOO_WEBHOOK_SECRET — the secret shown in Fusioo's "Send Webhook" dialog
//   FUSIOO_TOKEN          — Bearer JWT (same as VITE_FUSIOO_TOKEN in .env.local)
//
// Fusioo webhook URL to paste:
//   https://snploarndnyuxapqpegi.supabase.co/functions/v1/fusioo-webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUSIOO_BASE    = "https://api.fusioo.com";
const FUSIOO_TOKEN   = Deno.env.get("FUSIOO_TOKEN") ?? "";
const WEBHOOK_SECRET = Deno.env.get("FUSIOO_WEBHOOK_SECRET") ?? "";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const fusiooHeaders = {
  Authorization: `Bearer ${FUSIOO_TOKEN}`,
  "Content-Type": "application/json",
};

// Same table map as sync-fusioo — keep these in sync if new detail tables are added
const DETAIL_FIELD_TABLE: Record<string, string> = {
  hotel_booking_details: "fusioo_hotel_details",
  tour_details:          "fusioo_tour_details",
  airline_details_1:     "fusioo_ticket_details",
  transfer_details:      "fusioo_transfer_details",
};

const isFusiooId = (v: unknown): v is string =>
  typeof v === "string" && /^i[a-f0-9]{30,}$/i.test(v);

async function fetchRecord(id: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${FUSIOO_BASE}/v1/records/${id}`, { headers: fusiooHeaders });
  if (!res.ok) return null;
  const json = await res.json() as { data?: Record<string, unknown> };
  return json.data ?? null;
}

serve(async (req: Request) => {
  // Fusioo sends the secret in the X-Fusioo-Secret header
  const incoming = req.headers.get("x-fusioo-secret");
  if (!WEBHOOK_SECRET || incoming !== WEBHOOK_SECRET) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const recordId = payload.id as string | undefined;
  if (!recordId) {
    return json({ ok: false, error: "Payload missing 'id' field" }, 400);
  }

  const now = new Date().toISOString();
  const log: string[] = [`Webhook received for record ${recordId}`];

  try {
    // 1. Fetch the full booking record from Fusioo
    const record = await fetchRecord(recordId);
    if (!record) {
      return json({ ok: false, error: `Record ${recordId} not found in Fusioo` }, 404);
    }
    log.push(`Fetched full record from Fusioo`);

    // 2. Upsert into fusioo_booking_transactions
    const { error: bookingErr } = await supabase
      .from("fusioo_booking_transactions")
      .upsert({ id: recordId, data: record, synced_at: now }, { onConflict: "id" });

    if (bookingErr) throw new Error(`Booking upsert failed: ${bookingErr.message}`);
    log.push(`Upserted booking into fusioo_booking_transactions`);

    // 3. Fetch and upsert all linked detail records (tour, hotel, ticket, transfer)
    const detailJobs: Array<{ table: string; id: string }> = [];
    for (const [field, table] of Object.entries(DETAIL_FIELD_TABLE)) {
      const raw = record[field];
      const ids: string[] = Array.isArray(raw) ? raw : isFusiooId(raw) ? [raw] : [];
      for (const id of ids) {
        if (isFusiooId(id)) detailJobs.push({ table, id });
      }
    }

    let synced = 0;
    for (const { table, id } of detailJobs) {
      const detail = await fetchRecord(id);
      if (!detail) { log.push(`Warning: detail record ${id} not found`); continue; }
      const { error } = await supabase
        .from(table)
        .upsert({ id, data: detail }, { onConflict: "id" });
      if (error) log.push(`Warning: ${table} upsert error — ${error.message}`);
      else synced++;
    }

    log.push(`Upserted ${synced} of ${detailJobs.length} detail record(s)`);

    return json({ ok: true, recordId, log });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return json({ ok: false, error: msg, log }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
