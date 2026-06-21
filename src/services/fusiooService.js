// @ts-nocheck
// Fusioo API — reads voucher records using the GLADEX FLIGHT BASE44 integration token.
// Token is a workspace-scoped user-context token (not a client_credentials token).
// When it expires, regenerate from: gladex.fusioo.com → Integrations → GLADEX FLIGHT BASE44

const FUSIOO_API = "https://api.fusioo.com";

function getToken() {
  return import.meta.env.VITE_FUSIOO_TOKEN || null;
}

// Returns the raw Fusioo record data for a given record ID, or null on failure.
export async function fetchVoucherRecord(recordId) {
  if (!recordId || !/^i[a-f0-9]{30,}$/i.test(recordId)) return null;

  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${FUSIOO_API}/v1/records/${recordId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.code === 10000) return json.data;
    return null;
  } catch {
    return null;
  }
}

// Normalizes the raw Fusioo voucher record into a clean object for the voucher UI.
export function normalizeVoucherRecord(raw) {
  if (!raw) return null;

  const gdx = raw.klk || raw.gdx || null;

  // Inclusions — present in destination-specific _in_ex fields as [{id, name, status}]
  const inclusions = [];
  const exclusions = [];
  const inExFields = [
    "el_nido_in_ex", "pps_in_ex", "boracay_in_ex", "cebu_in_ex",
    "bohol_in_ex", "siargao_in_ex", "coron_in_ex", "davao_in_ex",
    "iloilo_in_ex", "dumaguete_in_ex", "batanes_in_ex", "siquijor_in_ex",
    "tour_in_ex",
  ];
  for (const field of inExFields) {
    const list = raw[field];
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (typeof item === "string") {
        inclusions.push(item);
      } else if (item?.name) {
        if (item.status === "complete") inclusions.push(item.name);
        else exclusions.push(item.name);
      }
    }
  }

  // Destination label
  const dest =
    raw.select_destination?.[0] ||
    (Array.isArray(raw.destination) ? null : null) ||
    null;

  return {
    gdx,
    leadName: raw.lead_name || raw.title || null,
    destination: dest,
    arrivalDate: raw.arrival_date || null,
    departureDate: raw.departure_date || null,
    travelDate: raw.travel_date || null,
    duration: raw.duration || raw.formula_1 || null,
    totalPersons: raw.total_no_of_person || raw.no_of_persons || null,
    confirmationNumber: raw.booking_confirmation_number || null,
    inclusions,
    exclusions,
    rawRecord: raw,
  };
}
