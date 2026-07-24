// @ts-nocheck
import { createClient } from "@supabase/supabase-js";

// Vouchers live in the dedicated reviews/vouchers database (flight-emails Supabase project)
const supabase = createClient(
  "https://bhgmghwhwoltbbzbooxg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZ21naHdod29sdGJiemJvb3hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDAzMjgsImV4cCI6MjA5ODkxNjMyOH0.Zctvjd3d4MzdlkROKvxseIVnIUm1nj_6fPkm94GipTk"
);

export const uploadVoucher = async ({ gdx, file, uploadedBy }) => {
  if (!supabase) throw new Error("Supabase not configured.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${gdx}/${Date.now()}-${safeName}`;

  const { error: storageErr } = await supabase.storage
    .from("vouchers")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (storageErr) throw new Error(storageErr.message);

  const { data: { publicUrl } } = supabase.storage.from("vouchers").getPublicUrl(path);

  const { error: dbErr } = await supabase.from("vouchers").insert({
    gdx:         String(gdx),
    file_name:   file.name,
    file_url:    publicUrl,
    storage_path: path,
    file_type:   file.type || null,
    file_size:   file.size || null,
    uploaded_by: uploadedBy || null,
  });
  if (dbErr) throw new Error(dbErr.message);

  return { publicUrl, path };
};

export const getVouchers = async (gdx) => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("gdx", String(gdx))
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const deleteVoucher = async (id, storagePath) => {
  if (!supabase) throw new Error("Supabase not configured.");
  // Delete DB row first — if this fails, storage is untouched and the user can retry safely
  const { error } = await supabase.from("vouchers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  // Then remove from storage — a storage failure here leaves an orphaned file but the UI stays consistent
  if (storagePath) {
    await supabase.storage.from("vouchers").remove([storagePath]);
  }
};

export const hasVoucher = async (gdx) => {
  if (!supabase || !gdx) return false;
  const { data } = await supabase
    .from("vouchers")
    .select("id")
    .eq("gdx", String(gdx))
    .limit(1)
    .maybeSingle();
  return !!data;
};
