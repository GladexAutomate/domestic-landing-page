// @ts-nocheck
/*
  supabaseService.js
  ──────────────────
  Primary table:  fusioo_booking_transactions  (Fusioo → Supabase auto-sync)
  Detail tables joined on Fusioo record id (id column):
    fusioo_hotel_details    (hotel stay info)
    fusioo_tour_details     (tour name, date, description)
    fusioo_ticket_details   (airline, PNR, flight details)
    fusioo_transfer_details (transfer type, description)

  All tables: id (text, Fusioo record ID), data (jsonb), synced_at
  Array fields in data (unwrap first element): status, destination,
    hotel_booking_details, tour_details, airline_details_1, transfer_details,
    hotel_name, payment_type, transaction_type, type_of_package
*/

import { createClient } from "@supabase/supabase-js";

const BOOKING_TABLE   = "fusioo_booking_transactions";
const HOTEL_TABLE     = "fusioo_hotel_details";
const TOUR_TABLE      = "fusioo_tour_details";
const TICKET_TABLE    = "fusioo_ticket_details";
const TRANSFER_TABLE  = "fusioo_transfer_details";

// Unwrap Fusioo array field → first element (or value as-is if not array)
const unwrap = v => Array.isArray(v) ? (v[0] ?? null) : (v ?? null);

// Manual overrides — for bookings where auto-detection is impossible
// (flight-number-only tickets, NULL tour/transfer, unresolvable hotel IDs)
const DEST_OVERRIDES = {
  "21780": "boracay", // Flordeliza Caindoy — Boracay via Kalibo, Z2 711/716, no airport text in data
  "21954": "boracay", // Shirley Burlat — Boracay Tour Only; PPS keyword in transfer desc triggers false PPS detection
  "21851": "cebu",    // Marion Chua — Cebu All-In, no tour; ie9eb5... dest ID maps to boracay without text signals
};

// ── Fusioo destination ID → slug  (VERIFIED against real booking data)
export const FUSIOO_DEST_MAP = {
  // BORACAY ✅ confirmed: GDX 11056 = "Private Island Hopping", Henann Regency hotel
  "i4e87aba541a94b98b8fead98d0c809a8": "boracay",
  "ie9eb5d4727a44c3c939cd7077d7991f6": "boracay",
  "ib515f233f6d8407796c3e21c2557d5ae": "boracay",
  "i63798db52a7f44f187ef6f9828c3a57a": "boracay",
  "if4f72d7ffde3489c9174e3f64c16c694": "boracay",
  "ide1eb009d1d54d79a2353c9cf4f12841": "boracay",

  // CEBU ✅ confirmed: GDX 10483 = "Cebu City Tour", Savoy Hotel Mactan
  "ia234508bd6d24726adb9e82a1337c85e": "cebu",
  "ibb7bfb79ef3b432888a263c19fd33a15": "cebu",

  // EL NIDO ✅ confirmed: GDX 18229 = "El Nido Tour A"
  // NOTE: i900e3e3215704c05b629832e1b624a2c is also used by PPS bookings — text checks must run first
  "i900e3e3215704c05b629832e1b624a2c": "elnido",

  // SIARGAO ✅ confirmed: GDX 14937 = "SIARGAO LAND TOUR" (Crisaldo Corpus Bocobo)
  "i470eba5c36b64f3a93331134130bc5ae": "siargao",

  // EL NIDO (additional) ✅ confirmed by agent: tour desc "frendz hostel el nido"
  "i873d5ac486154db7a22dfb57775f7878": "elnido",

  // PUERTO PRINCESA (additional) ✅ confirmed by agent: transfer "PPS AIRPORT", tour "Honda Bay Island Hopping"
  "i5e2b9bbc0c7f48008ab3e94ccd9754c1": "puertoprincesa",
  // i67f5adf04bfc41d78c3102ed8226d317 — shared by Boracay-via-Kalibo, PPS, and Bohol bookings.
  // Safe to map to PPS because: Bohol bookings are caught by prior Bohol text checks, and Boracay-via-Kalibo
  // bookings are caught by the rawStr.includes("kalibo"/"caticlan") check before this map lookup fires.
  // QA-confirmed: all 7 PPS bookings (GDX 19384, 19395, 19481, 19817, 20146, 20985, 21285) use this ID.
  "i67f5adf04bfc41d78c3102ed8226d317": "puertoprincesa",

  // DAVAO ✅ confirmed by agent: transfer "FRANCISCO BANGOY INTL AIRPORT - GRAND REGAL HOTEL"
  "ib5ba0a50ceef472da434d0f73277a03d": "davao",

  // PUERTO PRINCESA — shares IDs with Boracay (ib515f...) and El Nido (i900e3...) — handled by text checks before FUSIOO_DEST_MAP

  // Removed incorrect mappings:
  // ie2040a0...  → Coron (not one of our 3 destinations)
  // ice6368b...  → Vietnam
  // i563dc5a...  → Unknown (Disney tour / HK)
  // i1b7250c...  → Unknown (Taiwan/Japan cruise)
  // i2275fb2...  → China (Shanghai Disneyland)
  // i3667a42...  → Japan (Fukuoka)
};

// ── Supabase client ───────────────────────────────────────────────
// Guard: env vars are injected at build time; missing = null client (page still renders)
const _supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const _supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = (_supabaseUrl && _supabaseKey)
  ? createClient(_supabaseUrl, _supabaseKey)
  : null;

// ═══════════════════════════════════════════════════════════════
// REVIEW SUBMISSION — saves to reviews table
// ═══════════════════════════════════════════════════════════════
export const uploadReviewPhoto = async ({ gdx, file }) => {
  if (!supabase) throw new Error("Not configured.");
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${gdx}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("review-photos").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("review-photos").getPublicUrl(path);
  return data.publicUrl;
};

// ═══════════════════════════════════════════════════════════════
// GDX NORMALIZATION
// ═══════════════════════════════════════════════════════════════
// Records are stored in canonical "GDX-<number>" form (e.g. "GDX-22437").
// Guests may type it any way — "22437", "gdx-22437", "GDX 22437", "GDX22437".
// Strip any leading prefix/separator to the core, then rebuild the canonical form.
export const normalizeGdx = (input) => {
  const core = String(input ?? "").trim().replace(/^gdx[-\s]*/i, "").trim();
  return core ? `GDX-${core}` : "";
};

// Every stored form a given GDX input could match, canonical first.
// Use with .in("data->>gdx", gdxCandidates(input)) so lookups resolve whether
// the row was synced as "GDX-22437" or as a legacy bare "22437".
export const gdxCandidates = (input) => {
  const canonical = normalizeGdx(input);
  if (!canonical) return [];
  const core = canonical.slice(4);   // digits after "GDX-"
  return Array.from(new Set([
    canonical,        // "GDX-22437"  (canonical stored form)
    `gdx-${core}`,    // lowercase prefix
    `GDX${core}`,     // no dash
    core,             // bare number (legacy rows)
  ]));
};

// Generic tour names that aren't the main activity (used in both lookup paths)
const GENERIC_TOUR = /^(pick.?up|drop.?off|transfer|ferry fee|service charge|transport fee)/i;

// ═══════════════════════════════════════════════════════════════
// PRIMARY LOOKUP — GDX code → full booking with all details
// ═══════════════════════════════════════════════════════════════
export const lookupBooking = async (gdxCode) => {
  if (!supabase) throw new Error("Booking lookup is not configured on this deployment.");

  const canonical = normalizeGdx(gdxCode);   // "22437" or "GDX-22437" → "GDX-22437"
  if (!canonical) throw new Error("Please enter your GDX Confirmation Number.");
  const candidates = gdxCandidates(gdxCode);

  // 1. Fetch main booking row (filter on JSONB field data->>gdx)
  const { data: result, error } = await supabase
    .from(BOOKING_TABLE)
    .select("id, data, synced_at")
    .in("data->>gdx", candidates)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!result) {
    // Supabase miss — try Fusioo API directly (catches bookings not yet synced)
    return await lookupFromFusioo(canonical);
  }

  // 2. Flatten JSONB, unwrap array fields, remap renamed fields to match normalizer
  const d = result.data;
  const row = {
    ...d,
    status:                unwrap(d.status),
    destination:           unwrap(d.destination),
    hotel_name:            unwrap(d.hotel_name),
    hotel_booking_details: unwrap(d.hotel_booking_details),
    tour_details:          unwrap(d.tour_details),
    airline_details_1:     unwrap(d.airline_details_1),
    transfer_details:      unwrap(d.transfer_details),
    payment_type:          unwrap(d.payment_type),
    transaction_type:      unwrap(d.transaction_type),
    type_of_package:       unwrap(d.type_of_package),
    agent_name:            unwrap(d.agent_name),
    name_of_agent_1:       unwrap(d.name_of_agent_1),
    name_of_agent:         unwrap(d.name_of_agent),
    domestic_voucher:      unwrap(d.domestic_voucher),
    arrival_date:          d.arrival || d.arrival_date,   // 'arrival' in new DB, 'arrival_date' in old
    record_id:             result.id,   // Fusioo record ID is now the `id` column
    data:                  d,           // preserve raw for destination detection
  };

  // 3. Fetch all detail tables in parallel
  const [mainTourData, ticketData, linkedHotelData, transferData, allHotelRows, allTourRows] = await Promise.all([
    fetchDetail(TOUR_TABLE,     row.tour_details),
    fetchDetail(TICKET_TABLE,   row.airline_details_1),
    fetchDetail(HOTEL_TABLE,    row.hotel_booking_details),
    fetchDetail(TRANSFER_TABLE, row.transfer_details),
    // Fetch ALL hotel_details using the full hotel_booking_details array from main booking
    (() => {
      const ids = Array.isArray(d.hotel_booking_details) ? d.hotel_booking_details.filter(Boolean) : [];
      return ids.length
        ? supabase.from(HOTEL_TABLE).select("id, data").in("id", ids)
            .then(({ data: rows, error: err }) => err ? [] : (rows || []).map(r => r.data))
        : Promise.resolve([]);
    })(),
    // Fetch ALL tour_details — some bookings have multiple (e.g. "PICK-UP & DROP-OFF" + "Cebu City Tour")
    (() => {
      const ids = Array.isArray(d.tour_details) ? d.tour_details.filter(Boolean) : [];
      return ids.length > 1
        ? supabase.from(TOUR_TABLE).select("id, data").in("id", ids)
            .then(({ data: rows, error: err }) => err ? [] : (rows || []).map(r => r.data))
        : Promise.resolve([]);
    })(),
  ]);

  // Pick the best hotel record: prefer records with a named hotel (other_hotel set)
  const namedHotels = allHotelRows.filter(h => h && h.other_hotel);
  const hotelData = namedHotels.length
    ? namedHotels.reduce((best, h) => ((h.number_of_nights || 0) > (best.number_of_nights || 0) ? h : best))
    : linkedHotelData;

  // Pick the best tour record: skip generic service names (pick-up/drop-off/transfer fees)
  // so the main tour activity shows instead (e.g. "Cebu City Tour" over "PICK-UP & DROP-OFF")
  // GENERIC_TOUR is module-level — also used by lookupFromFusioo fallback
  const meaningfulTours = allTourRows.filter(t => t?.tour_name && !GENERIC_TOUR.test(t.tour_name));
  const tourData = meaningfulTours.length ? meaningfulTours[0] : mainTourData;

  return normalizeBooking(row, { tourData, ticketData, hotelData, transferData });
};

// ── Fusioo API fallback — called when booking is not in Supabase yet ──────
// Calls the fusioo-lookup edge function which scans Fusioo, upserts to
// Supabase, and returns the raw booking + all linked detail data.
async function lookupFromFusioo(canonical) {
  const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fusioo-lookup`;
  let res;
  try {
    res = await fetch(edgeFnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gdx: canonical }),
    });
  } catch {
    // Network error — edge function unreachable, fall through to not-found
    const err = new Error(`No booking found for ${canonical}. Please check your GDX Confirmation Number and try again.`);
    err.code = "GDX_NOT_FOUND";
    err.gdx = canonical;
    throw err;
  }

  if (res.status === 404) {
    const err = new Error(`No booking found for ${canonical}. Please check your GDX Confirmation Number and try again.`);
    err.code = "GDX_NOT_FOUND";
    err.gdx = canonical;
    throw err;
  }
  if (!res.ok) throw new Error("Booking lookup service temporarily unavailable. Please try again.");

  const edge = await res.json();
  const d = edge.booking;

  // Build the same row structure as the Supabase-sourced path
  const row = {
    ...d,
    status:                unwrap(d.status),
    destination:           unwrap(d.destination),
    hotel_name:            unwrap(d.hotel_name),
    hotel_booking_details: unwrap(d.hotel_booking_details),
    tour_details:          unwrap(d.tour_details),
    airline_details_1:     unwrap(d.airline_details_1),
    transfer_details:      unwrap(d.transfer_details),
    payment_type:          unwrap(d.payment_type),
    transaction_type:      unwrap(d.transaction_type),
    type_of_package:       unwrap(d.type_of_package),
    agent_name:            unwrap(d.agent_name),
    name_of_agent_1:       unwrap(d.name_of_agent_1),
    name_of_agent:         unwrap(d.name_of_agent),
    domestic_voucher:      unwrap(d.domestic_voucher),
    arrival_date:          d.arrival || d.arrival_date,
    record_id:             edge.bookingId,
    data:                  d,
  };

  // Best-hotel selection (same logic as main path)
  const namedHotels = (edge.allHotelData || []).filter(h => h?.other_hotel);
  const hotelData = namedHotels.length
    ? namedHotels.reduce((best, h) => ((h.number_of_nights || 0) > (best.number_of_nights || 0) ? h : best))
    : edge.hotelData;

  // Best-tour selection (same logic as main path)
  const meaningfulTours = (edge.allTourData || []).filter(t => t?.tour_name && !GENERIC_TOUR.test(t.tour_name));
  const tourData = meaningfulTours.length ? meaningfulTours[0] : edge.tourData;

  return normalizeBooking(row, {
    tourData,
    ticketData:   edge.ticketData,
    hotelData,
    transferData: edge.transferData,
  });
}

// ── Fetch a single detail record by Fusioo id ─────────────
async function fetchDetail(table, recordId) {
  if (!recordId) return null;
  const { data, error } = await supabase
    .from(table)
    .select("id, data")
    .eq("id", recordId)
    .limit(1)
    .single();
  return error ? null : (data?.data || null);
}

// ═══════════════════════════════════════════════════════════════
// DESTINATION SLUG DETECTION
// ═══════════════════════════════════════════════════════════════

// Gather all text fields from a booking into one object for detection
function _bookingTexts(booking) {
  return {
    dest:         (booking.destination || "").toLowerCase(),
    tourName:     (booking.tour?.tourName || "").toLowerCase(),
    tourDesc:     stripHtml(booking.tour?.description || "").toLowerCase(),
    transferDesc: stripHtml(booking.transfer?.description || "").toLowerCase(),
    hotelName:    (booking.hotel?.hotelName || "").toLowerCase(),
    flightInfo:   ((booking.ticket?.departingFlight || "") + " " + (booking.ticket?.returningFlight || "")).toLowerCase(),
    rawStr:       JSON.stringify(booking.rawData || {}).toLowerCase(),
  };
}

export const detectDestinationSlug = (booking) => {
  if (booking.gdx && DEST_OVERRIDES[String(booking.gdx)]) return DEST_OVERRIDES[String(booking.gdx)];
  const { dest, tourName, tourDesc, transferDesc, hotelName, flightInfo, rawStr } = _bookingTexts(booking);

  // 1. Destination field text — most reliable when it's human-readable
  if (dest.includes("boracay"))                                              return "boracay";
  if (dest.includes("cebu"))                                                 return "cebu";
  if (dest.includes("nido"))                                                 return "elnido";
  if (dest.includes("bohol"))                                                return "bohol";
  if (dest.includes("siargao"))                                              return "siargao";
  if (dest.includes("puerto princesa") || dest.includes("pps") || (dest.includes("palawan") && !dest.includes("nido"))) return "puertoprincesa";

  // 2. Check ALL text fields for ambiguous destinations BEFORE FUSIOO_DEST_MAP
  //    (some Fusioo IDs are shared across destinations — text signals must take priority)
  if (tourName.includes("bohol") || tourName.includes("chocolate") || tourName.includes("panglao") || tourName.includes("tarsier")) return "bohol";
  if (tourDesc.includes("bohol") || tourDesc.includes("panglao"))   return "bohol";
  if (transferDesc.includes("bohol") || transferDesc.includes("tagbilaran") || transferDesc.includes("panglao")) return "bohol";

  // PPS & Siargao: their Fusioo IDs overlap with Boracay/El Nido — must detect via text first
  if (tourName.includes("siargao") || tourName.includes("cloud 9") || tourName.includes("sohoton") || tourName.includes("magpupungko") || tourName.includes("daku") || tourName.includes("naked island")) return "siargao";
  if (tourName.includes("puerto princesa") || tourName.includes("underground river") || tourName.includes("honda bay") || tourName.includes("firefly")) return "puertoprincesa";
  if (tourDesc.includes("siargao") || tourDesc.includes("cloud 9") || tourDesc.includes("daku island")) return "siargao";
  if (tourDesc.includes("puerto princesa") || tourDesc.includes("underground river") || tourDesc.includes("honda bay")) return "puertoprincesa";
  if (transferDesc.includes("siargao") || transferDesc.includes("general luna") || transferDesc.includes("cloud 9")) return "siargao";
  if (transferDesc.includes("pps") || transferDesc.includes("puerto princesa")) return "puertoprincesa";

  // 3. Hotel name + flight checks (for bookings with NULL tour/transfer text)
  if (hotelName.includes("boracay") || hotelName.includes("henann") || hotelName.includes("la carmela") ||
      hotelName.includes("crimson") || hotelName.includes("movenpick") || hotelName.includes("two seasons") ||
      hotelName.includes("bamboo beach") || hotelName.includes("shangri-la boracay")) return "boracay";
  if (hotelName.includes("panglao") || hotelName.includes("alona") || hotelName.includes("bohol beach")) return "bohol";
  if (hotelName.includes("villa simprosa") || hotelName.includes("puerto princesa")) return "puertoprincesa";
  if (hotelName.includes("cebu") || hotelName.includes("mactan") || hotelName.includes("parklane")) return "cebu";
  if (hotelName.includes("siargao") || hotelName.includes("cloud 9") || hotelName.includes("daku")) return "siargao";
  // Kalibo (KLO) and Caticlan (MPH) airports both serve Boracay
  if (flightInfo.includes("klo") || flightInfo.includes("kalibo") || flightInfo.includes("mph") || flightInfo.includes("caticlan")) return "boracay";
  // Fallback: scan full raw JSON for airport/place-specific keywords — safe because these are unique to Boracay routes
  if (rawStr.includes("kalibo") || rawStr.includes("caticlan")) return "boracay";

  // 4. Fusioo ID map (after all text/hotel checks)
  if (FUSIOO_DEST_MAP[(booking.destination || "").toLowerCase()]) return FUSIOO_DEST_MAP[(booking.destination || "").toLowerCase()];

  // 5. Transfer description for other destinations
  if (transferDesc.includes("caticlan") || transferDesc.includes("boracay"))       return "boracay";
  if (transferDesc.includes("cebu") || transferDesc.includes("mactan"))            return "cebu";
  if (transferDesc.includes("pps") || transferDesc.includes("puerto princesa"))    return "puertoprincesa";
  if (transferDesc.includes("el nido"))                                            return "elnido";
  if (transferDesc.includes("siargao") || transferDesc.includes("general luna") || transferDesc.includes("cloud 9")) return "siargao";

  // 5. Tour name for other destinations
  // NOTE: "island hop" removed — too broad (Cebu, PPS, El Nido all have island hopping tours)
  if (tourName.includes("kawasan") || tourName.includes("oslob") || tourName.includes("cebu")) return "cebu";
  if (tourName.includes("el nido") || tourName.includes("lagoon"))           return "elnido";
  if (tourName.includes("siargao") || tourName.includes("cloud 9") || tourName.includes("magpupungko") || tourName.includes("sohoton") || tourName.includes("daku") || tourName.includes("naked island")) return "siargao";
  if (tourName.includes("puerto princesa") || tourName.includes("underground river") || tourName.includes("honda bay") || tourName.includes("firefly")) return "puertoprincesa";

  // 6. Tour description for other destinations
  if (tourDesc.includes("henann") || tourDesc.includes("boracay")) return "boracay";
  if (tourDesc.includes("cebu"))                                    return "cebu";
  if (tourDesc.includes("el nido"))                                 return "elnido";
  if (tourDesc.includes("siargao") || tourDesc.includes("cloud 9") || tourDesc.includes("daku island")) return "siargao";
  if (tourDesc.includes("puerto princesa") || tourDesc.includes("underground river") || tourDesc.includes("honda bay")) return "puertoprincesa";

  return null;
};

// ── Domestic-only slug detection — returns null ONLY for known international
// bookings. Returns a slug string (including "other") for all Philippine bookings
// so they land on "Your briefing is on its way!" instead of the intl redirect.
export const detectDomesticSlug = (booking) => {
  if (booking.gdx && DEST_OVERRIDES[String(booking.gdx)]) return DEST_OVERRIDES[String(booking.gdx)];
  const { dest, tourName, tourDesc, transferDesc, hotelName, flightInfo, rawStr } = _bookingTexts(booking);

  // Check dest field only — rawStr is the full JSON and is too broad
  const INTL_DEST_KEYS = [
    "japan", "korea", "china", "taiwan", "singapore", "vietnam",
    "hongkong", "hong kong", "thailand", "malaysia", "cambodia",
    "dubai", "macau", "indonesia", "europe", "australia",
  ];
  if (INTL_DEST_KEYS.some((kw) => dest.includes(kw))) return null;

  if (dest.includes("boracay"))                                              return "boracay";
  if (dest.includes("cebu"))                                                 return "cebu";
  if (dest.includes("nido"))                                                 return "elnido";
  if (dest.includes("bohol"))                                                return "bohol";
  if (dest.includes("siargao"))                                              return "siargao";
  if (tourName.includes("el nido") || tourName.includes("nido") || tourDesc.includes("el nido") || transferDesc.includes("el nido")) return "elnido";
  if (dest.includes("puerto princesa") || dest.includes("pps") || (dest.includes("palawan") && !dest.includes("nido"))) return "puertoprincesa";

  if (tourName.includes("bohol") || tourName.includes("chocolate") || tourName.includes("panglao") || tourName.includes("tarsier")) return "bohol";
  if (tourDesc.includes("bohol") || tourDesc.includes("panglao"))   return "bohol";
  if (transferDesc.includes("bohol") || transferDesc.includes("tagbilaran") || transferDesc.includes("panglao")) return "bohol";

  if (tourName.includes("davao") || tourDesc.includes("davao") || transferDesc.includes("davao")) return "davao";
  if (tourName.includes("coron") || tourDesc.includes("coron") || transferDesc.includes("coron")) return "coron";

  if (tourName.includes("siargao") || tourName.includes("cloud 9") || tourName.includes("sohoton") || tourName.includes("magpupungko") || tourName.includes("daku") || tourName.includes("naked island")) return "siargao";
  if (tourName.includes("puerto princesa") || tourName.includes("underground river") || tourName.includes("honda bay") || tourName.includes("firefly")) return "puertoprincesa";
  if (tourDesc.includes("siargao") || tourDesc.includes("cloud 9") || tourDesc.includes("daku island")) return "siargao";
  if (tourDesc.includes("puerto princesa") || tourDesc.includes("underground river") || tourDesc.includes("honda bay")) return "puertoprincesa";
  if (transferDesc.includes("siargao") || transferDesc.includes("general luna") || transferDesc.includes("cloud 9")) return "siargao";
  if (transferDesc.includes("pps") || transferDesc.includes("puerto princesa")) return "puertoprincesa";

  // Hotel name + flight checks — for bookings with NULL tour/transfer (e.g. Boracay via Kalibo)
  if (hotelName.includes("boracay") || hotelName.includes("henann") || hotelName.includes("la carmela") ||
      hotelName.includes("crimson") || hotelName.includes("movenpick") || hotelName.includes("two seasons") ||
      hotelName.includes("bamboo beach") || hotelName.includes("shangri-la boracay")) return "boracay";
  if (hotelName.includes("panglao") || hotelName.includes("alona") || hotelName.includes("bohol beach")) return "bohol";
  if (hotelName.includes("villa simprosa") || hotelName.includes("puerto princesa")) return "puertoprincesa";
  if (hotelName.includes("cebu") || hotelName.includes("mactan") || hotelName.includes("parklane")) return "cebu";
  if (hotelName.includes("siargao") || hotelName.includes("cloud 9") || hotelName.includes("daku")) return "siargao";
  // Kalibo (KLO) and Caticlan (MPH) airports both serve Boracay
  if (flightInfo.includes("klo") || flightInfo.includes("kalibo") || flightInfo.includes("mph") || flightInfo.includes("caticlan")) return "boracay";
  // Fallback: scan full raw JSON for Boracay-specific airport keywords
  if (rawStr.includes("kalibo") || rawStr.includes("caticlan")) return "boracay";

  if (FUSIOO_DEST_MAP[(booking.destination || "").toLowerCase()]) return FUSIOO_DEST_MAP[(booking.destination || "").toLowerCase()];

  if (transferDesc.includes("caticlan") || transferDesc.includes("boracay"))       return "boracay";
  if (transferDesc.includes("cebu") || transferDesc.includes("mactan"))            return "cebu";
  if (transferDesc.includes("pps") || transferDesc.includes("puerto princesa"))    return "puertoprincesa";
  if (transferDesc.includes("el nido"))                                            return "elnido";
  if (transferDesc.includes("siargao") || transferDesc.includes("general luna") || transferDesc.includes("cloud 9")) return "siargao";

  // "island hop" removed — too broad (Cebu, PPS, El Nido all have island hopping tours)
  if (tourName.includes("kawasan") || tourName.includes("oslob") || tourName.includes("cebu")) return "cebu";
  if (tourName.includes("el nido") || tourName.includes("lagoon"))           return "elnido";
  if (tourName.includes("siargao") || tourName.includes("cloud 9") || tourName.includes("magpupungko") || tourName.includes("sohoton") || tourName.includes("daku") || tourName.includes("naked island")) return "siargao";
  if (tourName.includes("puerto princesa") || tourName.includes("underground river") || tourName.includes("honda bay") || tourName.includes("firefly")) return "puertoprincesa";

  if (tourDesc.includes("henann") || tourDesc.includes("boracay")) return "boracay";
  if (tourDesc.includes("cebu"))                                    return "cebu";
  if (tourDesc.includes("el nido"))                                 return "elnido";
  if (tourDesc.includes("siargao") || tourDesc.includes("cloud 9") || tourDesc.includes("daku island")) return "siargao";
  if (tourDesc.includes("puerto princesa") || tourDesc.includes("underground river") || tourDesc.includes("honda bay")) return "puertoprincesa";

  // Domestic booking but no page for this destination yet — show "Your briefing is on its way!"
  return "other";
};

// ═══════════════════════════════════════════════════════════════
// NORMALIZE — raw rows → clean booking object
// ═══════════════════════════════════════════════════════════════
function normalizeBooking(raw, { tourData, ticketData, hotelData, transferData } = {}) {
  const tour      = normalizeTour(tourData);
  const ticket    = normalizeTicket(ticketData);
  const hotel     = normalizeHotel(hotelData, raw);
  const transfer  = normalizeTransfer(transferData);
  const guestList = parseGuestHtml(raw.name_of_guests);

  return {
    // Identity
    id:               raw.id,
    recordId:         raw.record_id,
    gdx:              raw.gdx,

    // Guest
    leadName:         raw.lead_name || "—",
    facebookName:     raw.facebook_name || null,
    email:            raw.email_1 || null,
    phone:            raw.mobile_1 || null,
    totalGuests:      guestList.length || Number(raw.no_of_person) || 1,
    guestList,

    // Booking
    status:           raw.status || "—",
    transactionType:  raw.transaction_type || null,
    typeOfPackage:    raw.type_of_package || null,
    dateCreated:      raw.date_created || raw.created || null,
    bookingDate:      raw.date_created || raw.created || raw.received_at || null,
    lastModified:     raw.last_modified || raw.updated_at || raw.modified_at || null,

    // Travel (from main booking)
    destination:      raw.destination || null,
    travelDate:       raw.travel_date || null,
    arrivalDate:      raw.arrival_date || null,
    departureDate:    raw.departure_date || null,
    duration:         normalizeDuration(raw.duration),

    // Detail records
    tour,
    ticket,
    hotel,
    transfer,

    // Payment
    packagePrice:     raw.total_package_price_srp || null,
    amountPaid:       parseAmountString(raw.total_amount_paid),
    paymentStatus:    raw.formula_1 || null,
    paymentMethod:    raw.mop_used_by_customer || null,
    paymentType:      raw.payment_type || null,

    // Documents — extract URLs from Fusioo file attachment fields (array or string)
    voucherId:        raw.voucher || null,
    voucherUrl:       extractFusiooUrl(raw.voucher),
    automatedVoucher: raw.automated_voucher || null,
    automatedVoucherUrl: extractFusiooUrl(raw.automated_voucher),
    attachments:      normalizeAttachments(raw.attachments),
    tourVoucherUrl:   extractFusiooUrl(raw.tour_voucher),
    domesticVoucherId: (raw.domestic_voucher && /^i[a-f0-9]{30,}$/i.test(raw.domestic_voucher)) ? raw.domestic_voucher : null,

    // Agent — raw.agent_name = "Commission Accomplished" (Fusioo commission status, NOT a name)
    // raw.name_of_agent = "Kams Valenzuela" (actual coordinator's name — verified against live data)
    agentName:        raw.name_of_agent || raw.name_of_agent_1 || null,
    salesAgent:       raw.name_of_agent || raw.name_of_agent_1 || null,
    consultantName:   raw.consultant_name || raw.name_of_agent || raw.name_of_agent_1 || null,
    consultantPhone:  raw.consultant_phone || raw.consultant_mobile || null,

    // Raw data for destination detection
    rawData:          raw.data || {},
  };
}

function normalizeTour(d) {
  if (!d) return null;
  const hotelInDesc = extractHotelFromDescription(d.description);
  return {
    tourName:    stripHtml(d.tour_name || "") || null,
    tourDate:    d.tour_date || null,
    description: stripHtml(d.description || ""),
    hotelMention: hotelInDesc,
    quantity:    d.quantity || null,
  };
}

const IATA_AIRLINES = {
  "5J": "Cebu Pacific", "PR": "Philippine Airlines", "Z2": "AirAsia Philippines",
  "DG": "Cebgo", "2P": "PAL Express", "TR": "Scoot", "UO": "HK Express",
  "OZ": "Asiana Airlines", "KE": "Korean Air", "SQ": "Singapore Airlines",
  "CX": "Cathay Pacific", "JL": "Japan Airlines", "NH": "All Nippon Airways",
  "EK": "Emirates", "QR": "Qatar Airways", "TK": "Turkish Airlines",
  "MH": "Malaysia Airlines", "TG": "Thai Airways", "VJ": "VietJet Air",
};

const PLAIN_TEXT_AIRLINES = {
  "vietjet": "VietJet Air", "cebu pacific": "Cebu Pacific",
  "pal": "Philippine Airlines", "airasia": "AirAsia Philippines",
};

function detectAirlineFromFlight(flightStr) {
  if (!flightStr) return null;
  const s = flightStr.trim().toLowerCase();
  for (const [key, name] of Object.entries(PLAIN_TEXT_AIRLINES)) {
    if (s.includes(key)) return name;
  }
  // Match IATA code anywhere in the string: handles "NO. 5J 897", "FLIGHT NO. 5J 272", "5J-817", "5j 132"
  const match = flightStr.match(/\b([A-Z0-9]{2})\s*[-]?\s*\d+/i);
  if (!match) return null;
  return IATA_AIRLINES[match[1].toUpperCase()] || null;
}

function normalizeTicket(d) {
  if (!d) return null;
  const departingFlight = d.departing_flight_details || null;
  const returningFlight = d.returning_flight_details || null;
  const detectedAirline = detectAirlineFromFlight(departingFlight) || detectAirlineFromFlight(returningFlight);
  const ticketType = unwrap(d.type_of_ticket) || null;
  const isFerry = (ticketType || "").toLowerCase() === "ferry";
  return {
    airline:       isFerry ? null : (unwrap(d.airline) || detectedAirline || null),
    ferry:         isFerry ? (unwrap(d.ferry) || null) : null,
    pnr:           d.booking_reference_number_pnr || null,
    ticketType,
    arrivalDate:   d.arrival_date || null,
    departureDate: d.departure_date || null,
    departingFlight,
    returningFlight,
    totalCost:     d.total_of_airline_insurance || null,
  };
}

function normalizeHotel(d, raw) {
  const rawNameFromMain = (raw?.hotel_name && !/^i[a-f0-9]{30,}$/i.test(raw.hotel_name))
    ? stripHtml(raw.hotel_name) : null;

  if (!d) {
    // No hotel_details record — return a minimal object if we at least have a name from the main row
    return rawNameFromMain ? { hotelName: rawNameFromMain, stayDates: null, roomType: null, checkIn: null, checkOut: null, nights: null, requests: null, hotelConfirmation: null, hotelPhone: null } : null;
  }

  // hotel_number in Fusioo is an ordinal reference ("1st Hotel", "2nd Hotel") — not a confirmation number
  const rawHotelNum = d.hotel_number || "";
  const isOrdinalRef = /^\d+(st|nd|rd|th)\s+hotel/i.test(rawHotelNum);
  return {
    stayDates:          d.hotel_stay_dates || null,
    roomType:           d.room_type || null,
    checkIn:            d.stay_date_from || null,
    checkOut:           d.stay_date_to || null,
    nights:             d.number_of_nights || null,
    requests:           stripHtml(d.hotel_requests || ""),
    hotelConfirmation:  d.hotel_confirmation_number || d.confirmation_number || (!isOrdinalRef ? rawHotelNum : null) || null,
    hotelPhone:         d.hotel_phone || d.hotel_contact || d.contact_number || null,
    // other_hotel is the plain-text hotel name field used by recent bookings; fall back to legacy field names then main row
    hotelName:          stripHtml(d.other_hotel || d.hotel_name || d.hotel_property_name || d.property_name || d.accommodation_name || d.hotel_property || "")
                          || rawNameFromMain || null,
  };
}

function normalizeTransfer(d) {
  if (!d) return null;
  return {
    transferType:         unwrap(d.transfer_type) || null,
    description:          stripHtml(d.description || ""),
    arrivalDate:          d.transfer_date_arrival || null,
    departureDate:        d.transfer_date_departure || null,
    quantity:             d.quantity || null,
    supplier:             unwrap(d.supplier_name) || null,
    transferConfirmation: d.confirmation_number || d.transfer_confirmation_number || d.booking_reference || null,
    transferContact:      d.supplier_phone || d.supplier_contact || d.contact || d.supplier_mobile || null,
  };
}

// ── Fusioo file attachment helpers ───────────────────────────────
// Fusioo file fields can be: URL string, array of {id,name,url}, or null
function extractFusiooUrl(field) {
  if (!field) return null;
  // Plain URL string
  if (typeof field === "string" && (field.startsWith("http://") || field.startsWith("https://"))) return field;
  // Array of Fusioo file objects [{id, name, url, ...}]
  if (Array.isArray(field) && field.length > 0) {
    const first = field[0];
    if (typeof first === "string" && first.startsWith("http")) return first;
    if (first?.url) return first.url;
    if (first?.download_url) return first.download_url;
  }
  // Object with url property
  if (typeof field === "object" && field?.url) return field.url;
  return null;
}

function normalizeAttachments(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((att) => {
      if (typeof att === "string") return { name: "Attachment", url: att };
      return {
        name: att.name || att.filename || "Attachment",
        url:  att.url || att.download_url || null,
      };
    }).filter((a) => a.url);
  }
  return [];
}

// ── Duration normalizer ──────────────────────────────────────────
// Fusioo may store duration as "3 Days & 2" (truncated) — append "Nights" if missing.
// Also corrects pluralization: "1 Days & 0 Nights" → "1 Day & 0 Nights", etc.
function normalizeDuration(dur) {
  if (!dur) return null;
  let s = String(dur).trim();
  if (/&\s*\d+\s*$/i.test(s) && !/nights?/i.test(s)) s = s + " Nights";
  // Fix pluralization: "1 Days" → "1 Day", "1 Nights" → "1 Night"
  s = s.replace(/\b1\s+Days\b/i, "1 Day").replace(/\b1\s+Nights\b/i, "1 Night");
  return s;
}

// ── String helpers ────────────────────────────────────────────────
function parseAmountString(str) {
  if (!str) return null;
  const num = parseFloat(String(str).replace(/[^0-9.]/g, ""));
  return isNaN(num) ? str : num;
}

function parseGuestHtml(html) {
  if (!html) return [];
  return stripHtml(html)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripHtml(html) {
  if (!html) return "";
  const stripped = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "");
  // Use browser's native HTML entity decoder — handles &Ntilde; → Ñ, &amp; → &, etc.
  let decoded = stripped;
  try {
    const el = document.createElement("textarea");
    el.innerHTML = stripped;
    decoded = el.value;
  } catch {
    decoded = stripped
      .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  }
  return decoded
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

function extractHotelFromDescription(html) {
  if (!html) return null;
  const text = stripHtml(html);
  const match = text.match(/hotel[:\s]+([^\n<]+)/i);
  if (match) return match[1].trim();
  return null;
}

export { supabase };
