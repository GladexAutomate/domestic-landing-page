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

// Insert a new review.
// agent_name and package_name are stored only if the columns exist in the table.
// If missing, those fields are quietly omitted so the core review still saves.
export const addReview = async ({
  gdx,
  lead_name,
  agent_name,
  destination,
  rating,
  review_text,
  photo_url,
  package_name,
  preApproved = false,   // admin-added reviews are pre-approved; client submissions start hidden
}) => {
  if (!supabase) throw new Error("Supabase not configured.");

  const { error } = await supabase.from("reviews").insert({
    gdx_reference: gdx || null,
    lead_name,
    agent_name: agent_name || null,
    destination: destination || null,
    rating,
    comment: review_text || null,
    photos: photo_url ? [photo_url] : null,
    package_name: package_name || null,
    is_hidden: !preApproved,
  });
  if (error) throw new Error(error.message);
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
    .from("bookings_6fbdd6b2")
    .select("lead_name")
    .eq("gdx", clean)
    .maybeSingle();
  return data?.lead_name || null;
};
