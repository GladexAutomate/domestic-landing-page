// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Plus, ChevronDown, ChevronRight, RefreshCw, Eye, EyeOff, CheckCircle2, Search, X } from "lucide-react";

function useMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}
import { motion, AnimatePresence } from "framer-motion";
import { getReviewStats, addReview, deleteReview, hideReview, unhideReview, lookupLeadNameByGdx } from "@/services/reviewsService";
import { toast } from "@/components/ui/use-toast";

const ORANGE = "#FF9913";

function PhotoThumb({ src }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <img
        src={src} alt="review photo"
        onClick={() => setOpen(true)}
        style={{ marginTop: 7, width: 90, height: 70, borderRadius: 8, objectFit: "cover", border: "1px solid #f0f0f0", cursor: "zoom-in", display: "block" }}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, cursor: "zoom-out", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              style={{ position: "relative" }}
            >
              <img src={src} alt="review photo" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 12, objectFit: "contain", display: "block" }} />
              <button
                onClick={() => setOpen(false)}
                style={{ position: "absolute", top: -14, right: -14, width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
              >
                <X size={14} color="#333" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
const PALETTE = ["#FF9913", "#3B82F6", "#10B981", "#8B5CF6", "#F43F5E", "#F59E0B", "#06B6D4", "#EC4899"];
const DEST_OPTIONS = ["Boracay", "Cebu", "El Nido", "Puerto Princesa", "Siargao", "Bohol"];
const DEST_SLUGS = { "Boracay": "boracay", "Cebu": "cebu", "El Nido": "elnido", "Puerto Princesa": "puertoprincesa", "Siargao": "siargao", "Bohol": "bohol" };
// Reverse map: slug → display name, for old reviews stored with slug as destination
const SLUG_TO_DEST = Object.fromEntries(Object.entries(DEST_SLUGS).map(([k, v]) => [v, k]));
const DEST_COLORS = { "Boracay": "#3B82F6", "Cebu": "#F59E0B", "El Nido": "#10B981", "Puerto Princesa": "#06B6D4", "Siargao": "#F43F5E", "Bohol": "#8B5CF6" };
const PKG_OPTIONS = ["All-In Package", "Land Arrangement", "Tour Only", "Hotel Only"];

function hashStr(s) {
  let h = 0;
  for (const c of s || "") h = (h << 5) - h + c.charCodeAt(0);
  return Math.abs(h);
}

function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0].toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function lastFirst(name) {
  if (!name) return "—";
  const p = name.trim().split(/\s+/);
  return p.length < 2 ? name : `${p[p.length - 1]}, ${p.slice(0, -1).join(" ")}`;
}

function shortPkg(pkg) {
  if (!pkg) return "—";
  const l = pkg.toLowerCase();
  if (l.includes("land")) return "Land Arr.";
  if (l.includes("all")) return "All-In";
  if (l.includes("tour")) return "Tour Only";
  if (l.includes("hotel")) return "Hotel Only";
  return pkg;
}

function StarDisplay({ rating, size = 13 }) {
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= rating ? "#F59E0B" : "none"} color={i <= rating ? "#F59E0B" : "#e0e0e0"} />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={26} fill={(hover || value) >= i ? "#F59E0B" : "none"} color={(hover || value) >= i ? "#F59E0B" : "#e0e0e0"} style={{ cursor: "pointer", transition: "all 0.1s" }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)} />
      ))}
    </div>
  );
}

// ── Inline delete button used in both card and table ──────────
function DeleteBtn({ id, onDelete, size = "card" }) {
  const [conf, setConf] = useState(false);
  if (!conf) return (
    <button onClick={() => setConf(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "4px", display: "flex", borderRadius: "6px", transition: "color 0.15s" }}
      onMouseEnter={(e) => e.currentTarget.style.color = "#dc2626"}
      onMouseLeave={(e) => e.currentTarget.style.color = "#d1d5db"}
    >
      <Trash2 size={size === "table" ? 13 : 14} />
    </button>
  );
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: -4 }}
        transition={{ duration: 0.15 }}
        style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#fff", border: "1.5px solid rgba(220,38,38,0.2)", borderRadius: "12px", padding: "10px 12px", boxShadow: "0 4px 16px rgba(220,38,38,0.1)", minWidth: "150px", position: "relative", zIndex: 10 }}
      >
        <p style={{ fontSize: "11.5px", fontWeight: 700, color: "#dc2626", margin: 0, textAlign: "center" }}>Delete this review?</p>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={() => { onDelete(id); setConf(false); }}
            style={{ flex: 1, fontSize: "11.5px", padding: "6px 0", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 800 }}
          >Delete</button>
          <button
            onClick={() => setConf(false)}
            style={{ flex: 1, fontSize: "11.5px", padding: "6px 0", background: "#f5f5f5", color: "#666", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}
          >Cancel</button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Approve / Hide toggle ─────────────────────────────────────
function HideBtn({ review, onToggle }) {
  const [loading, setLoading] = useState(false);
  const hidden = review.is_hidden;
  const handle = async () => {
    setLoading(true);
    try {
      await (hidden ? unhideReview(review.id) : hideReview(review.id));
      window.dispatchEvent(new CustomEvent("gdx_review_updated"));
      onToggle();
    }
    catch { /* silent */ } finally { setLoading(false); }
  };
  if (hidden) {
    return (
      <button
        onClick={handle}
        disabled={loading}
        title="Approve — make visible to other clients"
        style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", cursor: loading ? "wait" : "pointer", padding: "3px 8px", display: "flex", alignItems: "center", gap: "4px", borderRadius: "7px", color: "#16a34a", fontSize: "10.5px", fontWeight: 800, transition: "all 0.15s" }}
        onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "rgba(22,163,74,0.15)")}
        onMouseLeave={(e) => !loading && (e.currentTarget.style.background = "rgba(22,163,74,0.08)")}
      >
        <CheckCircle2 size={12} /> Approve
      </button>
    );
  }
  return (
    <button
      onClick={handle}
      disabled={loading}
      title="Hide from public"
      style={{ background: "none", border: "none", cursor: loading ? "wait" : "pointer", padding: "4px", display: "flex", borderRadius: "6px", color: "#d1d5db", transition: "color 0.15s" }}
      onMouseEnter={(e) => !loading && (e.currentTarget.style.color = "#6b7280")}
      onMouseLeave={(e) => !loading && (e.currentTarget.style.color = "#d1d5db")}
    >
      <EyeOff size={14} />
    </button>
  );
}

// ── Review card ───────────────────────────────────────────────
function ReviewCard({ review, onDelete, onToggleHide }) {
  const isAdminOnly = review.rating <= 3;
  const isHidden = review.is_hidden;
  const color = PALETTE[hashStr(review.lead_name) % PALETTE.length];
  return (
    <div style={{ padding: "13px 14px", background: isHidden ? "#fafafa" : "#fff", borderRadius: "11px", border: `1px solid ${isHidden ? "#f0f0f0" : "#efefef"}`, opacity: isHidden ? 0.65 : 1, transition: "opacity 0.2s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 800, color: "#fff" }}>
          {initials(review.lead_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
            <span style={{ fontWeight: 800, fontSize: "0.83rem", color: "#111" }}>{review.lead_name || "—"}</span>
            {(review.gdx_reference || review.gdx) && <span style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: 700, background: `${ORANGE}18`, color: ORANGE, padding: "1px 7px", borderRadius: "999px" }}>{review.gdx_reference || review.gdx}</span>}
            {review.destination && <span style={{ fontSize: "10px", fontWeight: 700, background: "#f0f0f0", color: "#666", padding: "1px 7px", borderRadius: "999px" }}>{review.destination}</span>}
            {review.package_name && <span style={{ fontSize: "10px", fontWeight: 700, background: "rgba(59,130,246,0.08)", color: "#2563eb", padding: "1px 7px", borderRadius: "999px" }}>{shortPkg(review.package_name)}</span>}
            {isAdminOnly && <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(239,68,68,0.08)", color: "#dc2626", padding: "1px 7px", borderRadius: "999px" }}>Admin only</span>}
            {isHidden && <span style={{ fontSize: "10px", fontWeight: 800, background: "rgba(234,179,8,0.1)", color: "#a16207", padding: "1px 7px", borderRadius: "999px" }}>Pending Approval</span>}
          </div>
          <StarDisplay rating={review.rating} />
          {(review.comment || review.review_text) && <p style={{ fontSize: "0.8rem", color: "#666", margin: "5px 0 0", lineHeight: 1.5 }}>"{review.comment || review.review_text}"</p>}
          {review.photos?.[0] && (
            <PhotoThumb src={review.photos[0]} />
          )}
          <p style={{ fontSize: "10.5px", color: "#ccc", marginTop: "4px" }}>
            {review.created_at ? new Date(review.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          <HideBtn review={review} onToggle={onToggleHide} />
          <DeleteBtn id={review.id} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
}

// ── Flat table for "All Reviews" tab ─────────────────────────
function ReviewTable({ reviews, onDelete }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const sorted = [...reviews]
    .filter((r) => !q || String(r.gdx_reference || r.gdx || "").toLowerCase().includes(q) || (r.lead_name || "").toLowerCase().includes(q))
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  const TH = ({ children }) => (
    <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 800, color: "#bbb", fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap", background: "#fafafa" }}>
      {children}
    </th>
  );
  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "12px", maxWidth: "320px" }}>
        <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GDX or name…"
          style={{ width: "100%", padding: "8px 32px 8px 32px", borderRadius: "9px", border: "1.5px solid #e5e5e5", fontSize: "0.8rem", color: "#111", outline: "none", boxSizing: "border-box", background: "#fff" }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: "#bbb" }}>
            <X size={13} />
          </button>
        )}
      </div>
    <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
            <TH>GDX</TH>
            <TH>Last, First</TH>
            <TH>Destination</TH>
            <TH>Package</TH>
            <TH>Rating</TH>
            <TH>Date</TH>
            <TH></TH>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={7} style={{ padding: "20px 14px", color: "#ccc", textAlign: "center" }}>No reviews yet.</td></tr>
          ) : sorted.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid #f5f5f5" }}>
              <td style={{ padding: "9px 14px", fontFamily: "monospace", fontWeight: 700, color: ORANGE, whiteSpace: "nowrap" }}>{r.gdx_reference || r.gdx || "—"}</td>
              <td style={{ padding: "9px 14px", fontWeight: 700, color: "#222", whiteSpace: "nowrap" }}>{lastFirst(r.lead_name)}</td>
              <td style={{ padding: "9px 14px", color: "#555", whiteSpace: "nowrap" }}>{r.destination || "—"}</td>
              <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                {r.package_name ? (
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "rgba(59,130,246,0.08)", color: "#2563eb" }}>
                    {shortPkg(r.package_name)}
                  </span>
                ) : <span style={{ color: "#ccc" }}>—</span>}
              </td>
              <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}><StarDisplay rating={r.rating} size={11} /></td>
              <td style={{ padding: "9px 14px", color: "#bbb", whiteSpace: "nowrap" }}>
                {r.created_at ? new Date(r.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </td>
              <td style={{ padding: "9px 14px" }}><DeleteBtn id={r.id} onDelete={onDelete} size="table" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

// ── Agent accordion card ──────────────────────────────────────
function AgentCard({ agent, onDelete, onDeleteAll, onToggleHide }) {
  const [open, setOpen] = useState(!agent.name);
  const [confirmAll, setConfirmAll] = useState(false);
  const isUnassigned = !agent.name;
  const color = isUnassigned ? "#d1d5db" : PALETTE[hashStr(agent.name) % PALETTE.length];

  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${isUnassigned ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.07)"}`, overflow: "hidden", borderLeft: `4px solid ${isUnassigned ? "#ef4444" : color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px", cursor: "pointer" }} onClick={() => setOpen((o) => !o)}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isUnassigned ? "#f3f4f6" : color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "12px", fontWeight: 900, color: isUnassigned ? "#d1d5db" : "#fff" }}>
          {isUnassigned ? "—" : initials(agent.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 900, fontSize: "0.88rem", color: isUnassigned ? "#aaa" : "#111", margin: 0 }}>{agent.name || "Unassigned"}</p>
          <p style={{ fontSize: "11px", color: "#bbb", margin: "2px 0 0", fontWeight: 600 }}>{agent.total} review{agent.total !== 1 ? "s" : ""} · avg {agent.avgRating.toFixed(1)}★</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} onClick={(e) => e.stopPropagation()}>
          <StarDisplay rating={Math.round(agent.avgRating)} size={12} />
          {isUnassigned && (
            !confirmAll ? (
              <button onClick={() => setConfirmAll(true)} style={{ fontSize: "10.5px", padding: "3px 10px", background: "rgba(239,68,68,0.08)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.18)", borderRadius: "7px", cursor: "pointer", fontWeight: 700 }}>Delete All</button>
            ) : (
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => { onDeleteAll(agent.reviews); setConfirmAll(false); }} style={{ fontSize: "10.5px", padding: "3px 10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: 700 }}>Confirm</button>
                <button onClick={() => setConfirmAll(false)} style={{ fontSize: "10.5px", padding: "3px 10px", background: "#f0f0f0", color: "#666", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
              </div>
            )
          )}
          <div onClick={() => setOpen((o) => !o)} style={{ cursor: "pointer", display: "flex" }}>
            {open ? <ChevronDown size={15} color="#ccc" /> : <ChevronRight size={15} color="#ccc" />}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: "7px" }}>
              {agent.reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.18 }}>
                  <ReviewCard review={r} onDelete={onDelete} onToggleHide={onToggleHide} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Destination accordion card ────────────────────────────────
function DestinationCard({ dest, reviews, onDelete, onToggleHide }) {
  const [open, setOpen] = useState(false);
  const hasReviews = reviews.length > 0;
  const color = DEST_COLORS[dest] || "#aaa";
  const avgRating = hasReviews
    ? +(reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${hasReviews ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.04)"}`, overflow: "hidden", borderLeft: `4px solid ${hasReviews ? color : "#e5e5e5"}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 18px", cursor: hasReviews ? "pointer" : "default", opacity: hasReviews ? 1 : 0.55 }} onClick={() => hasReviews && setOpen((o) => !o)}>
        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: hasReviews ? color : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 900, color: hasReviews ? "#fff" : "#ccc" }}>
          {dest.slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 900, fontSize: "0.88rem", color: hasReviews ? "#111" : "#aaa", margin: 0 }}>{dest}</p>
          <p style={{ fontSize: "11px", color: "#bbb", margin: "2px 0 0", fontWeight: 600 }}>
            {hasReviews ? `${reviews.length} review${reviews.length !== 1 ? "s" : ""} · avg ${avgRating.toFixed(1)}★` : "No reviews yet"}
          </p>
        </div>
        {hasReviews && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <StarDisplay rating={Math.round(avgRating)} size={12} />
            <div style={{ display: "flex" }}>
              {open ? <ChevronDown size={15} color="#ccc" /> : <ChevronRight size={15} color="#ccc" />}
            </div>
          </div>
        )}
      </div>
      <AnimatePresence>
        {open && hasReviews && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            <div style={{ padding: "0 18px 14px", display: "flex", flexDirection: "column", gap: "7px" }}>
              {reviews.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.18 }}>
                  <ReviewCard review={r} onDelete={onDelete} onToggleHide={onToggleHide} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Add review form ───────────────────────────────────────────
function AddReviewForm({ onAdded, isMobile }) {
  const [form, setForm] = useState({ gdx: "", lead_name: "", agent_name: "", destination: "", package_name: "", rating: 0, review_text: "" });
  const [looking, setLooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleGdxBlur = async () => {
    if (!form.gdx.trim() || form.lead_name.trim()) return;
    setLooking(true);
    try { const name = await lookupLeadNameByGdx(form.gdx); if (name) set("lead_name", name); } catch { /* silent */ } finally { setLooking(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lead_name.trim()) return setError("Client name is required.");
    if (!form.review_text.trim()) return setError("Review text is required.");
    if (!form.rating) return setError("Please select a star rating.");
    setError("");
    setSubmitting(true);
    try {
      await addReview({ ...form, gdx: form.gdx.replace(/^gdx[-\s]*/i, "").trim() || null, preApproved: true });
      setSuccess(true);
      setForm({ gdx: "", lead_name: "", agent_name: "", destination: "", package_name: "", rating: 0, review_text: "" });
      setTimeout(() => { setSuccess(false); onAdded(); }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const inputSt = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e8e8e8", fontSize: "0.875rem", color: "#111", outline: "none", boxSizing: "border-box", background: "#fff" };
  const labelSt = { fontSize: "10.5px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "580px", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ padding: "11px 15px", background: "rgba(245,158,11,0.07)", borderRadius: "10px", border: "1px solid rgba(245,158,11,0.18)", fontSize: "12px", color: "#92400e", fontWeight: 600, lineHeight: 1.5 }}>
        ⭐ Ratings 4–5 display publicly on the booking page. Ratings 1–3 are admin-only.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={labelSt}>GDX Number <span style={{ fontWeight: 400, textTransform: "none", color: "#bbb" }}>(optional)</span></label>
          <input style={inputSt} value={form.gdx} onChange={(e) => set("gdx", e.target.value)} onBlur={handleGdxBlur} placeholder="e.g. 12345" />
          {looking && <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Looking up client…</p>}
        </div>
        <div>
          <label style={labelSt}>Client Name *</label>
          <input style={inputSt} value={form.lead_name} onChange={(e) => set("lead_name", e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label style={labelSt}>Agent Name</label>
          <input style={inputSt} value={form.agent_name} onChange={(e) => set("agent_name", e.target.value)} placeholder="Agent (optional)" />
        </div>
        <div>
          <label style={labelSt}>Destination</label>
          <select style={{ ...inputSt, appearance: "none", WebkitAppearance: "none" }} value={form.destination} onChange={(e) => set("destination", e.target.value)}>
            <option value="">— Select —</option>
            {DEST_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={labelSt}>Package Type</label>
          <select style={{ ...inputSt, appearance: "none", WebkitAppearance: "none" }} value={form.package_name} onChange={(e) => set("package_name", e.target.value)}>
            <option value="">— Select —</option>
            {PKG_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label style={labelSt}>Star Rating *</label>
          <StarPicker value={form.rating} onChange={(v) => set("rating", v)} />
        </div>
      </div>
      <div>
        <label style={labelSt}>Review Text *</label>
        <textarea style={{ ...inputSt, minHeight: "96px", resize: "vertical" }} value={form.review_text} onChange={(e) => set("review_text", e.target.value)} placeholder="Client's review or feedback…" />
      </div>
      {error && <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600, margin: 0 }}>{error}</p>}
      <AnimatePresence>
        {success && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: "13px", color: "#16a34a", fontWeight: 700, margin: 0 }}>✓ Review added!</motion.p>}
      </AnimatePresence>
      <button type="submit" disabled={submitting} style={{ padding: "11px", borderRadius: "10px", background: ORANGE, color: "#fff", fontWeight: 800, border: "none", cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: submitting ? 0.7 : 1 }}>
        {submitting ? "Adding…" : <><Plus size={14} /> Add Review</>}
      </button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminReviews() {
  const [tab, setTab] = useState("pending");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMobile();

  const load = useCallback(async () => {
    setLoading(true);
    try { setStats(await getReviewStats()); } catch { setStats(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = useCallback(async (id) => {
    await deleteReview(id).catch(() => {});
    window.dispatchEvent(new CustomEvent("gdx_review_updated"));
    toast({ title: "Review deleted", description: "The review has been removed." });
    await load();
  }, [load]);

  const handleToggleHide = useCallback(async () => {
    await load();
  }, [load]);


  const allReviews = stats?.byAgent?.flatMap((a) => a.reviews) || [];

  // Build per-destination buckets: match by proper name OR slug (backward compat)
  const byDestMap = {};
  for (const r of allReviews) {
    const raw = (r.destination || "").toLowerCase();
    const key = DEST_OPTIONS.find((d) => d.toLowerCase() === raw)
      || SLUG_TO_DEST[raw]
      || null;
    if (!key) continue;
    if (!byDestMap[key]) byDestMap[key] = [];
    byDestMap[key].push(r);
  }
  // All 7 destinations — ones with reviews first (by count desc), then empty ones
  const allDestinations = [
    ...DEST_OPTIONS.filter((d) => byDestMap[d]?.length).sort((a, b) => (byDestMap[b]?.length || 0) - (byDestMap[a]?.length || 0)),
    ...DEST_OPTIONS.filter((d) => !byDestMap[d]?.length),
  ].map((d) => ({ name: d, reviews: byDestMap[d] || [] }));

  const pendingReviews = allReviews.filter((r) => r.is_hidden);

  const TABS = [
    { key: "pending", label: `Pending${pendingReviews.length ? ` (${pendingReviews.length})` : ""}` },
    { key: "table",   label: "All Reviews"    },
    { key: "dest",    label: "By Destination" },
  ];

  return (
    <div style={{ padding: isMobile ? "20px 16px" : "32px", maxWidth: "1000px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>Client Reviews</h1>
          <p style={{ fontSize: "13px", color: "#999", margin: "4px 0 0" }}>{stats?.total ?? "—"} total review{stats?.total !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "1.5px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "#666", flexShrink: 0 }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: "3px", background: "#f0f0f0", padding: "4px", borderRadius: "12px", marginBottom: "24px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: isMobile ? "8px 12px" : "8px 18px", borderRadius: "9px", border: "none", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#111" : "#999", fontWeight: tab === t.key ? 800 : 600, fontSize: "0.8rem", cursor: "pointer", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.12s", whiteSpace: "nowrap", flexShrink: 0 }}>
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {loading
              ? <p style={{ color: "#ccc", fontSize: "14px" }}>Loading…</p>
              : pendingReviews.length === 0
                ? (
                  <div style={{ textAlign: "center", padding: "48px 24px", color: "#ccc" }}>
                    <CheckCircle2 size={36} style={{ margin: "0 auto 12px", color: "#d1d5db" }} />
                    <p style={{ fontWeight: 700, fontSize: "14px", color: "#aaa", margin: 0 }}>All caught up!</p>
                    <p style={{ fontSize: "12px", margin: "4px 0 0" }}>No reviews pending approval.</p>
                  </div>
                )
                : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <p style={{ fontSize: "12px", color: "#aaa", margin: "0 0 8px", fontWeight: 600 }}>
                      {pendingReviews.length} review{pendingReviews.length !== 1 ? "s" : ""} waiting for your approval before they show publicly.
                    </p>
                    {pendingReviews.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.18 }}>
                        <ReviewCard review={r} onDelete={handleDelete} onToggleHide={handleToggleHide} />
                      </motion.div>
                    ))}
                  </div>
                )}
          </motion.div>
        )}

        {tab === "table" && (
          <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {loading
              ? <p style={{ color: "#ccc", fontSize: "14px" }}>Loading reviews…</p>
              : <ReviewTable reviews={allReviews} onDelete={handleDelete} />}
          </motion.div>
        )}

        {tab === "dest" && (
          <motion.div key="dest" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {loading
              ? <p style={{ color: "#ccc", fontSize: "14px" }}>Loading…</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {allDestinations.map((d, i) => (
                    <motion.div key={d.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
                      <DestinationCard dest={d.name} reviews={d.reviews} onDelete={handleDelete} onToggleHide={handleToggleHide} />
                    </motion.div>
                  ))}
                </div>}
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
