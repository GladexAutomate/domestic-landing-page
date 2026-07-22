// @ts-nocheck
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Star, Clock, CheckCircle, Upload, AlertTriangle, FileWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { FUSIOO_DEST_MAP, normalizeGdx } from "@/services/supabaseService";

const supabase =
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
    : null;

const ORANGE = "#FF9913";
const SESSION_KEY = "gdx_admin_auth";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function StatCard({ icon: Icon, color, label, value, sub, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        flex: "1 1 140px", minWidth: 130,
        background: "#fff", borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.06)",
        padding: "18px 20px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 900, color: "#111", lineHeight: 1, marginBottom: 4 }}>
        {value ?? <span style={{ display: "inline-block", width: 48, height: 28, background: "#f0f0f0", borderRadius: 6, animation: "pulse 1.4s ease infinite" }} />}
      </div>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#555" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#bbb", marginTop: 2, fontWeight: 600 }}>{sub}</div>}
    </motion.div>
  );
}

function SectionHeader({ title }) {
  return (
    <p style={{ fontSize: "11px", fontWeight: 900, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
      {title}
    </p>
  );
}

const STARS = ["", "★", "★★", "★★★", "★★★★", "★★★★★"];

export default function AdminDashboard() {
  const [stats, setStats]               = useState(null);
  const [recentReviews, setRecentReviews]   = useState(null);
  const [recentVouchers, setRecentVouchers] = useState(null);
  const [needsVoucher, setNeedsVoucher]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const navigate = useNavigate();

  const session = (() => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } })();

  useEffect(() => {
    if (!supabase) return;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    Promise.all([
      supabase.from("vouchers").select("id, gdx, file_name, created_at, uploaded_by").order("created_at", { ascending: false }),
      supabase.from("reviews").select("id, lead_name, destination, rating, comment, is_hidden, created_at, agent_name").order("created_at", { ascending: false }),
      supabase.from("fusioo_booking_transactions").select("id, data->>gdx, data->>lead_name, data->destination, synced_at").gte("synced_at", thirtyDaysAgo).order("synced_at", { ascending: false }).limit(200),
    ]).then(([vRes, rRes, bRes]) => {
      const vouchers = vRes.data || [];
      const reviews  = rRes.data || [];
      const bookings = bRes.data || [];

      const voucherGdxSet  = new Set(vouchers.map(v => String(v.gdx)));
      const knownDestIds   = new Set(Object.keys(FUSIOO_DEST_MAP));
      const noVoucher = bookings.filter(b => {
        if (!b.gdx) return false;
        const dest = Array.isArray(b.destination) ? b.destination[0] : b.destination;
        if (!dest || !knownDestIds.has(dest)) return false;
        return !voucherGdxSet.has(String(b.gdx));
      });

      const uniqueGdx = new Set(vouchers.map(v => v.gdx)).size;
      const pending   = reviews.filter(r => r.is_hidden).length;
      const totalR    = reviews.length;
      const approved  = reviews.filter(r => !r.is_hidden).length;

      setStats({ totalVouchers: vouchers.length, uniqueGdx, totalReviews: totalR, pending, approved, noVoucher: noVoucher.length });
      setRecentVouchers(vouchers.slice(0, 6));
      setRecentReviews(reviews.slice(0, 6));
      setNeedsVoucher(noVoucher.slice(0, 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const name = session?.user?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      style={{ padding: "28px 32px", maxWidth: 900 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#111", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          {greeting}, {name}!
        </h1>
        <p style={{ fontSize: "13px", color: "#aaa", margin: 0 }}>Here's what's happening with your bookings today.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={Upload}        color={ORANGE}    label="Vouchers Uploaded"   value={stats?.totalVouchers} sub={`${stats?.uniqueGdx ?? "—"} bookings covered`} delay={0}    />
        <StatCard icon={FileWarning}   color="#F97316"   label="Need Voucher"         value={stats?.noVoucher}     sub="new bookings this month"                          delay={0.06} />
        <StatCard icon={Star}          color="#F59E0B"   label="Total Reviews"        value={stats?.totalReviews}  sub={`${stats?.approved ?? "—"} approved`}            delay={0.12} />
        <StatCard icon={Clock}         color="#EF4444"   label="Pending Approval"     value={stats?.pending}       sub="reviews waiting"                                  delay={0.18} />
        <StatCard icon={CheckCircle}   color="#10B981"   label="Approved Reviews"     value={stats?.approved}      sub="visible to clients"                               delay={0.24} />
      </div>

      {/* Needs voucher alert */}
      {stats?.noVoucher > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(249,115,22,0.06)", border: "1.5px solid rgba(249,115,22,0.2)", borderRadius: 12, marginBottom: 10, fontSize: "13px", fontWeight: 700, color: "#c2410c", cursor: "pointer" }}
          onClick={() => navigate("/admin/vouchers")}
        >
          <FileWarning size={15} />
          {stats.noVoucher} new booking{stats.noVoucher > 1 ? "s" : ""} this month without a voucher yet — upload now so clients get excited early.
        </motion.div>
      )}

      {/* Pending approval alert */}
      {stats?.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: 24, fontSize: "13px", fontWeight: 700, color: "#dc2626" }}
        >
          <AlertTriangle size={15} />
          {stats.pending} review{stats.pending > 1 ? "s" : ""} waiting for your approval — check Client Reviews.
        </motion.div>
      )}

      {/* Recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Recent vouchers */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.35 }}
          style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <SectionHeader title="Recent Voucher Uploads" />
          {!recentVouchers ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#ddd", fontSize: 12 }}>Loading…</div>
          ) : recentVouchers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#ddd", fontSize: 12 }}>No vouchers yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentVouchers.map((v, i) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 + i * 0.04 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: "#fafafa", borderRadius: 10 }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${ORANGE}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <FileText size={12} color={ORANGE} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.file_name}</p>
                    <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>{normalizeGdx(v.gdx)} · {formatDate(v.created_at)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent reviews */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.35 }}
          style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
        >
          <SectionHeader title="Recent Reviews" />
          {!recentReviews ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#ddd", fontSize: 12 }}>Loading…</div>
          ) : recentReviews.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#ddd", fontSize: 12 }}>No reviews yet</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentReviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.04 }}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", background: "#fafafa", borderRadius: 10 }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: r.is_hidden ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: 12 }}>
                    {r.is_hidden ? <Clock size={12} color="#ef4444" /> : <CheckCircle size={12} color="#10b981" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{r.lead_name || "Guest"}</p>
                      <span style={{ fontSize: "11px", color: "#F59E0B", flexShrink: 0 }}>{STARS[r.rating] || ""}</span>
                    </div>
                    <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>{r.destination || "—"} · {formatDate(r.created_at)} {r.is_hidden ? "· pending" : ""}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>

      {/* Needs Voucher list */}
      {needsVoucher !== null && needsVoucher.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }}
          style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(249,115,22,0.18)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", marginTop: 20 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: "11px", fontWeight: 900, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Bookings Without Voucher</p>
            <button
              onClick={() => navigate("/admin/vouchers")}
              style={{ fontSize: "11px", fontWeight: 700, color: ORANGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Upload →
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {needsVoucher.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 + i * 0.03 }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(249,115,22,0.035)", borderRadius: 10 }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileWarning size={12} color="#f97316" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.lead_name || "—"}</p>
                  <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>{normalizeGdx(b.gdx)} · booked {formatDate(b.synced_at)}</p>
                </div>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.1)", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>No voucher</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </motion.div>
  );
}
