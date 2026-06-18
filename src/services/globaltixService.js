// @ts-nocheck
/*
  globaltixService.js
  ────────────────────
  GlobalTix B2B API integration (Philippines reseller account)

  ✅ Verified working (2026-06-04):
    Base URL : https://stg-api.globaltix.com
    Auth     : POST /api/auth/authorize
               Headers: x-api-key: {agent}/{apiKey}, x-api-agent: {agent}
               Body:    { "username": "..." }
               Returns: data.accessToken (Bearer JWT)

  Known PH Products (from /api/product/list?countryCode=PH):
    BORACAY:
      41478 — Island Hopping Joiner with BBQ Lunch
      41482 — Island Hopping Joiner with BBQ Lunch & Crab
      41487 — Helmet Diving
      41486 — Discover Scuba Diving
      42130 — ATV Boracay
      41507 — Banana Boat
      41505 — JetSki (Good for 2)
      42135 — Helicopter Beach Tour
    EL NIDO / PALAWAN:
      49272 — 3-in-1 Adventure Day Tour in Sabang Puerto Princesa
*/

const BASE_URL  = import.meta.env.VITE_GLOBALTIX_BASE_URL || "https://stg-api.globaltix.com";
const API_KEY   = import.meta.env.VITE_GLOBALTIX_API_KEY;
const API_AGENT = import.meta.env.VITE_GLOBALTIX_X_API_AGENT;
const USERNAME  = import.meta.env.VITE_GLOBALTIX_USERNAME; // moved from hardcoded — set in .env.local

// ── Token cache (in-memory, ~24h validity) ───────────────────────
let _token = null;
let _tokenExpiry = 0;

const baseHeaders = () => ({
  "Content-Type": "application/json",
  "x-api-key":   `${API_AGENT}/${API_KEY}`,
  "x-api-agent": API_AGENT,
});

const authHeaders = (token) => ({
  ...baseHeaders(),
  Authorization: `Bearer ${token}`,
});

// ── Authentication ────────────────────────────────────────────────
export const authenticate = async () => {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const res = await fetch(`${BASE_URL}/api/auth/authorize`, {
    method: "POST",
    headers: baseHeaders(),
    body: JSON.stringify({ username: USERNAME }),
  });

  const json = await res.json();
  if (!res.ok || !json.data?.accessToken) {
    throw new Error(`GlobalTix auth failed [${res.status}]: ${json.message || JSON.stringify(json)}`);
  }

  _token = json.data.accessToken;
  _tokenExpiry = Date.now() + 22 * 60 * 60 * 1000; // 22h
  return _token;
};

// ── Edge function flag
const USE_EDGE = import.meta.env.VITE_USE_EDGE_FUNCTIONS === "true";

// ── Base request helper ───────────────────────────────────────────
async function gRequest(path, options = {}) {
  // Production path: API key + username stay server-side in Supabase Edge Function
  if (USE_EDGE) {
    const { supabase } = await import("@/services/supabaseService");
    const body = options.body ? JSON.parse(options.body) : undefined;
    const { data, error } = await supabase.functions.invoke("globaltix-proxy", {
      body: { path, method: options.method || "GET", body },
    });
    if (error) throw new Error(error.message);
    return data;
  }

  // Dev/UAT path: direct API call (credentials in .env.local, not committed)
  const token = await authenticate();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(token), ...(options.headers || {}) },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`GlobalTix [${res.status}] ${path}: ${json.message || res.statusText}`);
  return json;
}

// ── Products ──────────────────────────────────────────────────────

// List all available products for a country
export const listProducts = async (countryCode = "PH") => {
  return gRequest(`/api/product/list?countryCode=${countryCode}`);
};

// Get product detail by ID
export const getProduct = async (productId) => {
  return gRequest(`/api/product/info?id=${productId}`);
};

// Get product ticket types / options
export const getProductOptions = async (productId, isDynamicPrice = false) => {
  return gRequest(`/api/product/options?id=${productId}&isDynamicPrice=${isDynamicPrice}`);
};

// ── Availability ──────────────────────────────────────────────────
export const checkAvailability = async (ticketTypeId, dateFrom, dateTo) => {
  return gRequest(`/api/ticketType/checkEventAvailability?dateFrom=${dateFrom}&dateTo=${dateTo}&ticketTypeID=${ticketTypeId}`);
};

// ── Booking ───────────────────────────────────────────────────────
export const reserveBooking = async (payload) => {
  return gRequest("/api/booking/reserve", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const confirmBooking = async (payload) => {
  return gRequest("/api/booking/confirm", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const releaseBooking = async (referenceNumber) => {
  return gRequest(`/api/booking/release`, {
    method: "POST",
    body: JSON.stringify({ referenceNumber }),
  });
};

export const getBookingDetails = async (referenceNumber) => {
  return gRequest(`/api/booking/details?referenceNumber=${referenceNumber}`);
};

// ── Resend voucher email ──────────────────────────────────────────
export const resendVoucherEmail = async (referenceNumber) => {
  return gRequest(`/api/transaction/resendTransactionEmail?reference_number=${referenceNumber}`);
};

// ── Gladex destination → GlobalTix product IDs ───────────────────
// Verified from /api/product/list?countryCode=PH (2026-06-04)
// fallbackPrice / fallbackSchedule / fallbackHighlights are used when
// the GlobalTix API is unreachable so the UI always shows real values.
export const GLADEX_TOUR_PRODUCTS = {
  boracay: [
    {
      id: 41478, name: "Island Hopping with BBQ Lunch", badge: "Most Popular",
      applicableDays: [2],
      fallbackPrice:      999,
      fallbackDuration:   "Full Day · 8 AM – 3 PM",
      fallbackSchedule:   "Daily · 8:00 AM – 3:00 PM",
      fallbackHighlights: ["BBQ Lunch on the beach", "Multiple island stops", "Snorkeling gear included"],
    },
    {
      id: 41482, name: "Island Hopping + BBQ Lunch & Crab", badge: null,
      applicableDays: [2],
      fallbackPrice:      1200,
      fallbackDuration:   "Full Day · 8 AM – 3 PM",
      fallbackSchedule:   "Daily · 8:00 AM – 3:00 PM",
      fallbackHighlights: ["Crab & BBQ Lunch included", "Multiple island stops", "Snorkeling gear included"],
    },
    {
      id: 41487, name: "Helmet Diving", badge: null,
      applicableDays: [2, 3],
      fallbackPrice:      1200,
      fallbackDuration:   "15–20 minutes",
      fallbackSchedule:   "Daily · Morning slots",
      fallbackHighlights: ["No swimming skills needed", "Walk on the ocean floor", "Feed reef fish underwater"],
    },
    {
      id: 41486, name: "Discover Scuba Diving", badge: null,
      applicableDays: [2, 3],
      fallbackPrice:      2500,
      fallbackDuration:   "30–45 minutes",
      fallbackSchedule:   "Daily · Morning slots",
      fallbackHighlights: ["Certified instructor included", "No prior experience needed", "Dive up to 5 meters deep"],
    },
    {
      id: 42130, name: "ATV Adventure", badge: null,
      applicableDays: [2, 3],
      fallbackPrice:      800,
      fallbackDuration:   "30–60 minutes",
      fallbackSchedule:   "Daily",
      fallbackHighlights: ["Off-road island trails", "Panoramic island views", "Suitable for beginners"],
    },
    {
      id: 41507, name: "Banana Boat", badge: null,
      applicableDays: [2, 3],
      fallbackPrice:      600,
      fallbackDuration:   "15–20 minutes",
      fallbackSchedule:   "Daily",
      fallbackHighlights: ["Group thrill activity", "Beachfront launch & landing", "Fun for all ages"],
    },
    {
      id: 41505, name: "JetSki (Good for 2)", badge: null,
      applicableDays: [2, 3],
      fallbackPrice:      1500,
      fallbackDuration:   "15–30 minutes",
      fallbackSchedule:   "Daily",
      fallbackHighlights: ["Solo or tandem ride", "Beachfront start & finish", "Thrill seeker activity"],
    },
    {
      id: 42135, name: "Helicopter Beach Tour", badge: "Premium",
      applicableDays: [2, 3],
      fallbackPrice:      8500,
      fallbackDuration:   "10–15 minutes",
      fallbackSchedule:   "Daily · Weather permitting",
      fallbackHighlights: ["Aerial island panorama", "Private helicopter", "Unforgettable bird's-eye views"],
    },
    {
      id: 42134, name: "Buggy Car Adventure", badge: null,
      applicableDays: [2, 3],
      fallbackPrice:      2500,
      fallbackDuration:   "1–2 hours",
      fallbackSchedule:   "Daily",
      fallbackHighlights: ["Off-road dune buggy", "Island terrain trails", "Fun for groups"],
    },
    {
      id: 42138, name: "Helicopter Island Tour", badge: "Premium",
      applicableDays: [2, 3],
      fallbackPrice:      9550,
      fallbackDuration:   "15–20 minutes",
      fallbackSchedule:   "Daily · Weather permitting",
      fallbackHighlights: ["Extended island flyover", "360° aerial panorama", "Private helicopter cabin"],
    },
    {
      id: 42140, name: "Helicopter VIP Tour", badge: "VIP",
      applicableDays: [2, 3],
      fallbackPrice:      11350,
      fallbackDuration:   "20–30 minutes",
      fallbackSchedule:   "Daily · Weather permitting",
      fallbackHighlights: ["VIP exclusive experience", "Longest aerial route", "Premium helicopter service"],
    },
  ],
  cebu: [],   // No Cebu products in account yet — contact GlobalTix to add
  bohol: [],  // No Bohol products in account yet — contact GlobalTix to add
  elnido: [
    {
      id: 49272, name: "3-in-1 Adventure in Sabang Puerto Princesa", badge: null,
      applicableDays: [2],
      fallbackPrice:      1500,
      fallbackDuration:   "Full Day",
      fallbackSchedule:   "Daily · Pick-up 6:00 AM",
      fallbackHighlights: ["Underground River visit", "Island hopping included", "Lunch included"],
    },
  ],
};

// ── Image URL builder for GlobalTix media paths ──────────────────
const IMG_CDN = "https://product-image.globaltix.com/stg-gtImage";
const buildImageUrl = (product) => {
  const path = product?.media?.[0]?.path || product?.image;
  if (!path) return null;
  // If it looks like a UUID path (no slashes), use CDN; otherwise return as-is
  return path.includes("http") ? path : `${IMG_CDN}/${path}`;
};

// ── Normalize GlobalTix product → TBOptionalTours-compatible shape ─
const normalizeGloabalTixProduct = (raw, def) => {
  const p = raw?.data || raw || {};
  return {
    id:          String(def.id),
    name:        p.name || def.name,
    description: p.description || "",
    image:       buildImageUrl(p),
    icon:        def.icon,
    badge:       def.badge,
    duration:    p.duration || def.fallbackDuration || null,
    schedule:    def.fallbackSchedule || null,
    price:       p.originalPrice || p.fromPrice || def.fallbackPrice || null,
    currency:    p.currency || "PHP",
    highlights:  Array.isArray(p.highlights) && p.highlights.length
                   ? p.highlights
                   : (def.fallbackHighlights || []),
    stops:       Array.isArray(p.inclusions)
                   ? p.inclusions
                       .sort((a, b) => (a.placementOrder || 0) - (b.placementOrder || 0))
                       .map((inc) => inc.value)
                       .filter(Boolean)
                   : [],
    sourceId:       def.id,
    liveData:       true,
    applicableDays: def.applicableDays || null,
  };
};

// ── Load live tours for a destination ────────────────────────────
export const loadDestinationTours = async (destinationSlug) => {
  const productDefs = GLADEX_TOUR_PRODUCTS[destinationSlug] || [];
  if (productDefs.length === 0) {
    console.info(`[GlobalTix] No products configured for destination: ${destinationSlug}`);
    return [];
  }

  console.info(`[GlobalTix] Loading ${productDefs.length} products for: ${destinationSlug}`);

  const results = await Promise.all(
    productDefs.map(async (def) => {
      const startTime = Date.now();
      try {
        console.info(`[GlobalTix] Fetching product ${def.id} (${def.name}) — ${BASE_URL}/api/product/info?id=${def.id}`);
        const res = await getProduct(def.id);
        const elapsed = Date.now() - startTime;
        console.info(`[GlobalTix] Product ${def.id} loaded in ${elapsed}ms`);
        return normalizeGloabalTixProduct(res, def);
      } catch (err) {
        const elapsed = Date.now() - startTime;
        console.warn(`[GlobalTix] Product ${def.id} (${def.name}) failed after ${elapsed}ms:`, err?.message || err);
        // Return a fully usable static card — price/schedule/highlights always present
        return {
          id:          String(def.id),
          name:        def.name,
          icon:        def.icon,
          badge:       def.badge,
          description: "",
          image:       null,
          duration:    def.fallbackDuration   || null,
          schedule:    def.fallbackSchedule   || null,
          price:       def.fallbackPrice      || null,
          highlights:  def.fallbackHighlights || [],
          stops:          [],
          liveData:       false,
          apiError:       err?.message || "API unavailable",
          applicableDays: def.applicableDays || null,
        };
      }
    })
  );

  const live = results.filter((r) => r.liveData).length;
  console.info(`[GlobalTix] ${live}/${results.length} products loaded live for: ${destinationSlug}`);
  return results;
};
