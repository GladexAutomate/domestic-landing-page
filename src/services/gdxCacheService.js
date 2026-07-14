// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { FUSIOO_DEST_MAP } from "./supabaseService";

const supabase =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    : null;

const BOOKING_TABLE   = "fusioo_booking_transactions";
const TOUR_TABLE      = "fusioo_tour_details";
const TRANSFER_TABLE  = "fusioo_transfer_details";
const unwrap = v => Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
const PAGE = 1000; // Supabase default max per request

// ── Paginated fetch — gets ALL rows regardless of table size ──
async function fetchAllRows(table, columns) {
  const rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

function resolveSlug(rawDest) {
  if (!rawDest) return "unresolved";
  if (FUSIOO_DEST_MAP[rawDest]) return FUSIOO_DEST_MAP[rawDest];
  const lower = rawDest.toLowerCase();
  // ── Active landing-page destinations ──
  if (lower.includes("boracay") || lower.includes("caticlan") || lower.includes("kalibo")) return "boracay";
  if (lower.includes("cebu") || lower.includes("mactan")) return "cebu";
  if (lower.includes("el nido") || lower.includes("elnido")) return "elnido";
  if (lower.includes("puerto princesa") || lower.includes("pps")) return "puertoprincesa";
  if (lower.includes("siargao")) return "siargao";
  if (lower.includes("bohol") || lower.includes("panglao") || lower.includes("tagbilaran")) return "bohol";
  // ── Other known PH destinations (not on landing page) ──
  if (lower.includes("coron")) return "coron";
  if (lower.includes("davao") || lower.includes("francisco bangoy")) return "davao";
  if (lower.includes("bantayan")) return "bantayan";
  if (lower.includes("batanes") || lower.includes("basco")) return "batanes";
  if (lower.includes("bacolod")) return "bacolod";
  if (lower.includes("camiguin")) return "camiguin";
  if (lower.includes("cagayan") || lower.includes("cdo")) return "cagayan-de-oro";
  if (lower.includes("dinagat")) return "dinagat";
  if (lower.includes("catanduanes")) return "catanduanes";
  if (lower.includes("bukidnon")) return "bukidnon";
  if (lower.includes("leyte") || lower.includes("kalanggaman") || lower.includes("tacloban") || lower.includes("ormoc")) return "leyte";
  if (lower.includes("port barton")) return "port-barton";
  if (lower.includes("legazpi") || lower.includes("bicol") || lower.includes("mayon")) return "legazpi";
  if (lower.includes("manila") || lower.includes("makati") || lower.includes("pasay") || lower.includes("naia")) return "manila";
  if (lower.includes("iloilo")) return "iloilo";
  if (lower.includes("dumaguete")) return "dumaguete";
  if (lower.includes("zamboanga")) return "zamboanga";
  if (lower.includes("gensan") || lower.includes("general santos") || lower.includes("general_santos")) return "general-santos";
  if (lower.includes("butuan")) return "butuan";
  if (lower.includes("baguio")) return "baguio";
  if (lower.includes("tagaytay")) return "tagaytay";
  if (lower.includes("subic") || lower.includes("olongapo")) return "subic";
  if (lower.includes("ilocos") || lower.includes("vigan") || lower.includes("laoag")) return "ilocos";
  if (lower.includes("palawan") && !lower.includes("puerto") && !lower.includes("coron") && !lower.includes("el nido") && !lower.includes("port barton")) return "puertoprincesa";
  return "unresolved";
}

// Try destination field first; fall back to tour name and transfer description.
// Fusioo stores destination as a hash ID for many bookings — the tour/transfer
// text is the reliable fallback ("Coron Island Hopping Tour A", "PPS AIRPORT", etc.)
function resolveSlugFromBooking(destination, tourName, transferDesc) {
  const byDest = resolveSlug(destination);
  if (byDest !== "unresolved") return byDest;
  const byTour = resolveSlug(tourName);
  if (byTour !== "unresolved") return byTour;
  return resolveSlug(transferDesc);
}

export const getCacheStats = async () => {
  if (!supabase) return { totalCached: 0, slugResolved: 0, slugUnresolved: 0, bySlug: {}, oldestCachedAt: null };
  const rows = await fetchAllRows("gdx_cache", "slug, cached_at");
  const bySlug = {};
  for (const r of rows) {
    const s = r.slug || "unresolved";
    bySlug[s] = (bySlug[s] || 0) + 1;
  }
  const slugResolved = rows.filter((r) => r.slug && r.slug !== "unresolved").length;
  const oldest = rows.length
    ? rows.reduce((min, r) => (!min || r.cached_at < min ? r.cached_at : min), null)
    : null;
  return {
    totalCached: rows.length,
    slugResolved,
    slugUnresolved: rows.length - slugResolved,
    bySlug,
    oldestCachedAt: oldest,
  };
};

export const getAllCachedEntries = async () => {
  if (!supabase) return [];

  // 1. Fetch all cache entries (paginated)
  const cacheData = await fetchAllRows("gdx_cache", "*");
  if (cacheData.length === 0) return [];

  // 2. Batch-fetch matching bookings by GDX via JSONB (500 per request)
  const BATCH_IN = 500;
  const allGdxs = cacheData.map((e) => e.gdx);
  let allBookings = [];
  for (let i = 0; i < allGdxs.length; i += BATCH_IN) {
    const batch = allGdxs.slice(i, i + BATCH_IN);
    const { data } = await supabase
      .from(BOOKING_TABLE)
      .select("data->>gdx, data->>lead_name, data->>type_of_package, data->>transaction_type, data->>date_created, data->destination")
      .in("data->>gdx", batch.map(String));
    if (data) allBookings = allBookings.concat(data);
  }

  // 3. Build GDX → booking map (string-keyed)
  const bkMap = {};
  for (const b of allBookings) bkMap[String(b.gdx)] = b;

  return cacheData.map((e) => {
    const bk = bkMap[String(e.gdx)];
    const rawPkg = bk?.transaction_type || bk?.type_of_package || null;
    const rawDest = bk?.destination;
    return {
      ...e,
      lead_name:       bk?.lead_name    || null,
      package_name:    rawPkg,
      booked_at:       bk?.date_created || null,
      raw_destination: unwrap(rawDest),
    };
  });
};

export const bulkCacheAllBookings = async (onProgress) => {
  if (!supabase) throw new Error("Supabase not configured.");

  // 1. Fetch ALL bookings + tour/transfer join fields (for multi-field slug resolution)
  const rawBookings = await fetchAllRows(BOOKING_TABLE, "data->>gdx, data->destination, data->tour_details, data->transfer_details");
  const allBookings = rawBookings.map(r => ({
    gdx:              r.gdx,
    destination:      unwrap(r.destination),
    tour_details:     unwrap(r.tour_details),
    transfer_details: unwrap(r.transfer_details),
  }));

  // 2. Fetch tour names and transfer descriptions from new detail tables
  const allTourRows      = await fetchAllRows(TOUR_TABLE,     "id, data->>tour_name");
  const allTransferRows  = await fetchAllRows(TRANSFER_TABLE, "id, data->>description");
  const tourNameMap     = {};
  const transferDescMap = {};
  for (const t of allTourRows)     if (t.id) tourNameMap[t.id]     = t.tour_name   || "";
  for (const t of allTransferRows) if (t.id) transferDescMap[t.id] = t.description || "";

  // 3. Deduplicate bookings by GDX (prevents "ON CONFLICT DO UPDATE affects row twice" error)
  const seen = new Set();
  const rows = allBookings.filter((b) => {
    if (!b.gdx || seen.has(String(b.gdx))) return false;
    seen.add(String(b.gdx));
    return true;
  });

  const total = rows.length;
  const BATCH = 50;
  let done = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const enriched = slice.map((bk) => {
      const tourName    = tourNameMap[bk.tour_details]         || "";
      const transferTxt = transferDescMap[bk.transfer_details] || "";
      return { ...bk, slug: resolveSlugFromBooking(bk.destination, tourName, transferTxt) };
    });

    // PH domestic → UPSERT (handles both new rows and existing rows in one shot).
    // enriched_data: {} satisfies the NOT NULL constraint; we never read that column —
    // all booking details are fetched live from the bookings table.
    const toPH = enriched.filter((e) => e.slug !== "unresolved");

    // International / unresolved → DELETE from cache (domestic-only policy)
    const toDeleteGdxs = enriched
      .filter((e) => e.slug === "unresolved")
      .map((e) => e.gdx);

    const ops = [];

    if (toPH.length > 0) {
      ops.push(
        supabase.from("gdx_cache").upsert(
          toPH.map((bk) => ({ gdx: bk.gdx, slug: bk.slug, cached_at: now, enriched_data: {} })),
          { onConflict: "gdx" }
        )
      );
    }

    if (toDeleteGdxs.length > 0) {
      ops.push(supabase.from("gdx_cache").delete().in("gdx", toDeleteGdxs));
    }

    const results = await Promise.all(ops);
    const firstErr = results.find((r) => r.error);
    if (firstErr) throw new Error(firstErr.error.message);

    done = Math.min(i + BATCH, total);
    if (onProgress) onProgress(done, total);
  }
  return { done: total, total };
};

export const deleteOrphanedEntries = async (onProgress) => {
  if (!supabase) throw new Error("Supabase not configured.");

  // Both tables fetched fully (paginated) so we don't miss rows
  const [cacheRows, bookingRows] = await Promise.all([
    fetchAllRows("gdx_cache", "gdx"),
    fetchAllRows(BOOKING_TABLE, "data->>gdx"),
  ]);

  const bookingSet = new Set(bookingRows.map((b) => String(b.gdx)));
  const orphanedGdxs = cacheRows
    .filter((e) => !bookingSet.has(String(e.gdx)))
    .map((e) => e.gdx);

  if (orphanedGdxs.length === 0) return { deleted: 0 };

  const BATCH = 100;
  let deleted = 0;
  for (let i = 0; i < orphanedGdxs.length; i += BATCH) {
    const slice = orphanedGdxs.slice(i, i + BATCH);
    const { error } = await supabase.from("gdx_cache").delete().in("gdx", slice);
    if (error) throw new Error(error.message);
    deleted += slice.length;
    if (onProgress) onProgress(Math.min(deleted, orphanedGdxs.length), orphanedGdxs.length);
  }
  return { deleted };
};
