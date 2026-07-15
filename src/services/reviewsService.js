// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

const supabase =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    : null;

// All reviews — admin use
export const getReviews = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .in("destination", DOMESTIC_DESTINATIONS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

// Public 4–5 star reviews, optionally filtered by destination
export const getPublicReviews = async (destinationName) => {
  if (!supabase) return [];
  let q = supabase
    .from("reviews")
    .select("id, lead_name, destination, rating, comment, photos, created_at")
    .gte("rating", 4)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });
  if (destinationName) q = q.ilike("destination", `%${destinationName}%`);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data || [];
};

// Stats grouped by agent — admin use
const DOMESTIC_DESTINATIONS = ["Boracay", "Cebu", "El Nido", "Puerto Princesa", "Siargao", "Bohol"];

export const getReviewStats = async () => {
  if (!supabase) return { total: 0, byAgent: [] };
  const { data, error } = await supabase.from("reviews").select("*").in("destination", DOMESTIC_DESTINATIONS);
  if (error) throw new Error(error.message);
  const rows = data || [];
  const map = {};
  for (const r of rows) {
    const key = r.agent_name || "__unassigned__";
    if (!map[key]) map[key] = { name: r.agent_name || null, reviews: [] };
    map[key].reviews.push(r);
  }
  const byAgent = Object.values(map).map((a) => ({
    name: a.name,
    total: a.reviews.length,
    avgRating: a.reviews.length
      ? +(a.reviews.reduce((s, r) => s + (r.rating || 0), 0) / a.reviews.length).toFixed(1)
      : 0,
    reviews: a.reviews,
  }));
  return { total: rows.length, byAgent };
};

// ── Profanity filter ─────────────────────────────────────────────────────────
const BAD_WORDS = [
  // English
  "fuck","shit","bitch","asshole","bastard","dick","pussy","cock","cunt","whore",
  "slut","nigger","faggot","retard","dumbass","jackass","piss","wank","twat",
  // Filipino
  "puta","putang","punyeta","gago","gaga","bobo","tanga","ulol","tangina",
  "tarantado","leche","lintik","hinayupak","pakyu","bwisit","hayop","engot",
  "inutil","buang","yawa","pakshet","pucha","burat","kantot","jakol","bilat","puke",
  // Bisaya / Cebuano
  "atay","bogo","kayat","bigtason","takaron","amaw","pisti","lawon","bugo",
  "yutang","ungaw","animal ka","hudas","pating","ukininam","iyot",
];

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[.\-_*\s]+(?=[a-z0-9])/g, "")   // f.u.c.k → fuck
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/6/g, "g")
    .replace(/7/g, "t").replace(/8/g, "b").replace(/9/g, "g")
    .replace(/@/g, "a").replace(/\$/g, "s").replace(/!/g, "i")
    .replace(/(.)\1{2,}/g, "$1$1")              // fuuuck → fuuck
    .replace(/[^a-z]/g, "");                    // strip remaining non-letters

const stripVowels = (s) => s.replace(/[aeiou]/g, "");

const hasBadWords = (text) => {
  if (!text) return false;
  const norm = normalize(text);
  const normNoVowels = stripVowels(norm);
  return BAD_WORDS.some(w => {
    const wn = normalize(w);
    return norm.includes(wn) || normNoVowels.includes(stripVowels(wn));
  });
};

// Insert a new review.
// Auto-approves if rating >= 4 AND no bad/offensive words detected.
// Otherwise goes to admin pending queue for manual review.
export const addReview = async ({
  gdx,
  lead_name,
  agent_name,
  destination,
  rating,
  review_text,
  photo_url,
  package_name,
  preApproved = false,
}) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const flagged = !preApproved && (rating <= 3 || hasBadWords(review_text));
  const is_hidden = preApproved ? false : flagged;

  const { error } = await supabase.from("reviews").insert({
    gdx_reference: gdx || null,
    lead_name,
    agent_name: agent_name || null,
    destination: destination || null,
    rating,
    comment: review_text || null,
    photos: photo_url ? [photo_url] : null,
    package_name: package_name || null,
    is_hidden,
  });
  if (error) throw new Error(error.message);

  if (flagged) {
    supabase.functions.invoke("notify-review", {
      body: { gdx_reference: gdx, lead_name, agent_name, destination, rating, comment: review_text },
    }).catch(() => {});
  }
};

// Admin: hide/unhide a review (keeps data, just removes from public)
export const hideReview = async (id) => {
  if (!supabase) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("reviews").update({ is_hidden: true }).eq("id", id);
  if (error) throw new Error(error.message);
};

export const unhideReview = async (id) => {
  if (!supabase) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("reviews").update({ is_hidden: false }).eq("id", id);
  if (error) throw new Error(error.message);
};

// Check if a review by GDX still exists (used to sync client localStorage)
export const checkReviewByGdx = async (gdx) => {
  if (!supabase || !gdx) return false;
  const { data } = await supabase.from("reviews").select("id").eq("gdx_reference", String(gdx)).maybeSingle();
  return !!data;
};

// Admin: delete by UUID id
export const deleteReview = async (id) => {
  if (!supabase) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// Client: delete own review by GDX number
export const deleteReviewByGdx = async (gdx) => {
  if (!supabase) throw new Error("Supabase not configured.");
  const { error } = await supabase.from("reviews").delete().eq("gdx_reference", gdx);
  if (error) throw new Error(error.message);
};

// Count reviews pending admin approval (is_hidden = true) — used for sidebar badge
export const getPendingReviewsCount = async () => {
  if (!supabase) return 0;
  const { data } = await supabase.from("reviews").select("id").eq("is_hidden", true);
  return data?.length || 0;
};

// Look up a lead name from the bookings table via GDX
export const lookupLeadNameByGdx = async (gdx) => {
  if (!supabase) return null;
  const clean = String(gdx).replace(/^gdx[-\s]*/i, "").trim();
  const { data } = await supabase
    .from("fusioo_booking_transactions")
    .select("data->>lead_name")
    .eq("data->>gdx", clean)
    .maybeSingle();
  return data?.lead_name || null;
};
