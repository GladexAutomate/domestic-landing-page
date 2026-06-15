// @ts-nocheck
/*
  supabaseService.js
  ──────────────────
  Primary table:  bookings_6fbdd6b2     (24,107 records, Fusioo → Supabase sync)
  Detail tables joined on record_id:
    hotel_details_a2f30717              (hotel stay info)
    tour_details_2bf757ca               (tour name, date, description)
    ticket_details_b1d64ca0             (airline, PNR, flight details)
    transfer_details_b9a92c90           (transfer type, description)

  Join fields in main booking:
    hotel_booking_details → hotel_details_a2f30717.record_id
    tour_details          → tour_details_2bf757ca.record_id
    airline_details_1     → ticket_details_b1d64ca0.record_id
    transfer_details      → transfer_details_b9a92c90.record_id
*/

import { createClient } from "@supabase/supabase-js";

const BOOKING_TABLE   = "bookings_6fbdd6b2";
const HOTEL_TABLE     = "hotel_details_a2f30717";
const TOUR_TABLE      = "tour_details_2bf757ca";
const TICKET_TABLE    = "ticket_details_b1d64ca0";
const TRANSFER_TABLE  = "transfer_details_b9a92c90";

// ── Fusioo destination ID → slug  (VERIFIED against real booking data)
const FUSIOO_DEST_MAP = {
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
  "i900e3e3215704c05b629832e1b624a2c": "elnido",

  // Removed incorrect mappings:
  // ie2040a0...  → Coron (not one of our 3 destinations)
  // ice6368b...  → Vietnam
  // i563dc5a...  → Unknown (Disney tour / HK)
  // i1b7250c...  → Unknown
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
export const submitReview = async ({ gdx_reference, rating, comment }) => {
  if (!supabase) throw new Error("Review submission is not configured on this deployment.");
  const { error } = await supabase.from("reviews").insert({
    gdx_reference,
    rating,
    comment: comment || null,
  });
  if (error) throw new Error(error.message);
};

// ═══════════════════════════════════════════════════════════════
// PRIMARY LOOKUP — GDX code → full booking with all details
// ═══════════════════════════════════════════════════════════════
export const lookupBooking = async (gdxCode) => {
  if (!supabase) throw new Error("Booking lookup is not configured on this deployment.");
  const clean = String(gdxCode).trim().replace(/^gdx[-\s]*/i, "");
  if (!clean) throw new Error("Please enter your GDX Confirmation Number.");

  // 1. Fetch main booking row
  const { data: row, error } = await supabase
    .from(BOOKING_TABLE)
    .select("*")
    .eq("gdx", clean)
    .order("received_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error(`No booking found for GDX ${clean}. Please check the number and try again.`);
    }
    throw new Error(error.message);
  }

  // 2. Fetch all detail tables in parallel
  const [tourData, ticketData, hotelData, transferData] = await Promise.all([
    fetchDetail(TOUR_TABLE,     row.tour_details),
    fetchDetail(TICKET_TABLE,   row.airline_details_1),
    fetchDetail(HOTEL_TABLE,    row.hotel_booking_details),
    fetchDetail(TRANSFER_TABLE, row.transfer_details),
  ]);

  return normalizeBooking(row, { tourData, ticketData, hotelData, transferData });
};

// ── Fetch a single detail record by Fusioo record_id ─────────────
async function fetchDetail(table, recordId) {
  if (!recordId) return null;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("record_id", recordId)
    .limit(1)
    .single();
  return error ? null : data;
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
    rawStr:       JSON.stringify(booking.rawData || {}).toLowerCase(),
  };
}

export const detectDestinationSlug = (booking) => {
  const { dest, tourName, tourDesc, transferDesc, rawStr } = _bookingTexts(booking);

  // 1. Destination field text — most reliable when it's human-readable
  if (dest.includes("boracay"))                          return "boracay";
  if (dest.includes("cebu"))                             return "cebu";
  if (dest.includes("nido") || dest.includes("palawan")) return "elnido";
  if (dest.includes("bohol"))                            return "bohol";

  // 2. Check ALL text fields for bohol BEFORE FUSIOO_DEST_MAP
  //    (i63798db52a7f44f187ef6f9828c3a57a is shared between Boracay & Bohol rows —
  //     text signals must take priority over the ambiguous map entry)
  if (tourName.includes("bohol") || tourName.includes("chocolate") || tourName.includes("panglao") || tourName.includes("tarsier")) return "bohol";
  if (tourDesc.includes("bohol") || tourDesc.includes("panglao"))   return "bohol";
  if (transferDesc.includes("bohol") || transferDesc.includes("tagbilaran") || transferDesc.includes("panglao")) return "bohol";
  if (rawStr.includes("bohol"))                                      return "bohol";

  // 3. Fusioo ID map (after bohol text checks — ambiguous IDs handled above)
  if (FUSIOO_DEST_MAP[booking.destination]) return FUSIOO_DEST_MAP[booking.destination];

  // 4. Transfer description for other destinations
  if (transferDesc.includes("caticlan") || transferDesc.includes("boracay")) return "boracay";
  if (transferDesc.includes("cebu") || transferDesc.includes("mactan"))      return "cebu";
  if (transferDesc.includes("pps") || transferDesc.includes("el nido") || transferDesc.includes("puerto princesa")) return "elnido";

  // 5. Tour name for other destinations
  if (tourName.includes("island hop"))                                        return "boracay";
  if (tourName.includes("kawasan") || tourName.includes("oslob") || tourName.includes("cebu")) return "cebu";
  if (tourName.includes("el nido") || tourName.includes("lagoon"))           return "elnido";

  // 6. Tour description for other destinations
  if (tourDesc.includes("henann") || tourDesc.includes("boracay")) return "boracay";
  if (tourDesc.includes("cebu"))                                    return "cebu";
  if (tourDesc.includes("el nido"))                                 return "elnido";

  // 7. Raw data fallback for other destinations
  if (rawStr.includes("boracay"))    return "boracay";
  if (rawStr.includes("\"cebu\""))   return "cebu";
  if (rawStr.includes("el nido"))    return "elnido";

  return "boracay";
};

// ── Domestic-only slug detection — returns null if destination is not one of
// our supported domestic packages. Used to reject international GDX entries.
export const detectDomesticSlug = (booking) => {
  const { dest, tourName, tourDesc, transferDesc, rawStr } = _bookingTexts(booking);

  if (dest.includes("boracay"))                          return "boracay";
  if (dest.includes("cebu"))                             return "cebu";
  if (dest.includes("nido") || dest.includes("palawan")) return "elnido";
  if (dest.includes("bohol"))                            return "bohol";

  if (tourName.includes("bohol") || tourName.includes("chocolate") || tourName.includes("panglao") || tourName.includes("tarsier")) return "bohol";
  if (tourDesc.includes("bohol") || tourDesc.includes("panglao"))   return "bohol";
  if (transferDesc.includes("bohol") || transferDesc.includes("tagbilaran") || transferDesc.includes("panglao")) return "bohol";
  if (rawStr.includes("bohol"))                                      return "bohol";

  if (FUSIOO_DEST_MAP[booking.destination]) return FUSIOO_DEST_MAP[booking.destination];

  if (transferDesc.includes("caticlan") || transferDesc.includes("boracay")) return "boracay";
  if (transferDesc.includes("cebu") || transferDesc.includes("mactan"))      return "cebu";
  if (transferDesc.includes("pps") || transferDesc.includes("el nido") || transferDesc.includes("puerto princesa")) return "elnido";

  if (tourName.includes("island hop"))                                        return "boracay";
  if (tourName.includes("kawasan") || tourName.includes("oslob") || tourName.includes("cebu")) return "cebu";
  if (tourName.includes("el nido") || tourName.includes("lagoon"))           return "elnido";

  if (tourDesc.includes("henann") || tourDesc.includes("boracay")) return "boracay";
  if (tourDesc.includes("cebu"))                                    return "cebu";
  if (tourDesc.includes("el nido"))                                 return "elnido";

  if (rawStr.includes("boracay"))    return "boracay";
  if (rawStr.includes("\"cebu\""))   return "cebu";
  if (rawStr.includes("el nido"))    return "elnido";
  if (rawStr.includes("bohol"))      return "bohol";

  return null;
};

// ═══════════════════════════════════════════════════════════════
// NORMALIZE — raw rows → clean booking object
// ═══════════════════════════════════════════════════════════════
function normalizeBooking(raw, { tourData, ticketData, hotelData, transferData } = {}) {
  const tour     = normalizeTour(tourData);
  const ticket   = normalizeTicket(ticketData);
  const hotel    = normalizeHotel(hotelData, raw);
  const transfer = normalizeTransfer(transferData);

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
    totalGuests:      raw.no_of_person || "1",
    guestList:        parseGuestHtml(raw.name_of_guests),

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

    // Agent — raw.agent_name = "Commission Accomplished" (Fusioo commission status, NOT a name)
    // raw.name_of_agent = "Kams Valenzuela" (actual coordinator's name — verified against live data)
    agentName:        raw.name_of_agent || null,
    salesAgent:       raw.name_of_agent || null,
    consultantName:   raw.consultant_name || raw.name_of_agent || null,
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

function normalizeTicket(d) {
  if (!d) return null;
  return {
    airline:       d.airline || null,
    pnr:           d.booking_reference_number_pnr || null,
    ticketType:    d.type_of_ticket || null,
    arrivalDate:   d.arrival_date || null,
    departureDate: d.departure_date || null,
    departingFlight:  d.departing_flight_details || null,
    returningFlight:  d.returning_flight_details || null,
    totalCost:     d.total_of_airline_insurance || null,
  };
}

function normalizeHotel(d, raw) {
  if (!d) return null;
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
    // Hotel name — Fusioo may store it under several field names; stripHtml cleans &nbsp; and other entities
    hotelName:          stripHtml(d.hotel_name || d.hotel_property_name || d.property_name || d.accommodation_name || d.hotel_property || "") || null,
  };
}

function normalizeTransfer(d) {
  if (!d) return null;
  return {
    transferType:         d.transfer_type || null,
    description:          stripHtml(d.description || ""),
    arrivalDate:          d.transfer_date_arrival || null,
    departureDate:        d.transfer_date_departure || null,
    quantity:             d.quantity || null,
    supplier:             d.supplier_name || null,
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
// Fusioo may store duration as "3 Days & 2" (truncated) — append "Nights" if missing
function normalizeDuration(dur) {
  if (!dur) return null;
  const s = String(dur).trim();
  if (/&\s*\d+\s*$/i.test(s) && !/nights?/i.test(s)) return s + " Nights";
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
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "")
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
