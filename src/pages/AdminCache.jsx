// @ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Database, Zap, AlertCircle, Clock, ChevronDown, ChevronRight, Trash2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCacheStats, getAllCachedEntries, bulkCacheAllBookings, deleteOrphanedEntries } from "@/services/gdxCacheService";

const ORANGE = "#FF9913";

const SLUG_LABEL = {
  boracay:        "Boracay",
  cebu:           "Cebu",
  elnido:         "El Nido",
  puertoprincesa: "Puerto Princesa",
  siargao:        "Siargao",
  bohol:          "Bohol",
};

const DOMESTIC_SLUGS = new Set(Object.keys(SLUG_LABEL));

// ALL known Philippine destination slugs — used to filter out international entries (Bali, Bangkok, etc.)
// "unresolved" is intentionally kept so any stale entries still show until bulk cache cleans them up
const ALL_PH_SLUGS = new Set([
  ...DOMESTIC_SLUGS,
  "coron", "davao", "bantayan", "batanes", "bacolod", "camiguin",
  "northern-mindanao", "cagayan-de-oro", "dinagat", "catanduanes",
  "bukidnon", "leyte", "port-barton", "legazpi", "manila",
  "iloilo", "dumaguete", "zamboanga", "general-santos", "butuan",
  "baguio", "tagaytay", "subic", "ilocos",
  "unresolved",
]);

const PH_SLUG_LABEL = {
  ...SLUG_LABEL,
  coron:              "Coron",
  davao:              "Davao",
  bantayan:           "Bantayan",
  batanes:            "Batanes",
  bacolod:            "Bacolod",
  camiguin:           "Camiguin",
  "northern-mindanao":"Northern Mindanao",
  "cagayan-de-oro":   "Cagayan de Oro",
  dinagat:            "Dinagat",
  catanduanes:        "Catanduanes",
  bukidnon:           "Bukidnon",
  leyte:              "Leyte",
  "port-barton":      "Port Barton",
  legazpi:            "Legazpi",
  manila:             "Manila",
  iloilo:             "Iloilo",
  dumaguete:          "Dumaguete",
  zamboanga:          "Zamboanga",
  "general-santos":   "General Santos",
  butuan:             "Butuan",
  baguio:             "Baguio",
  tagaytay:           "Tagaytay",
  subic:              "Subic",
  ilocos:             "Ilocos",
};

function slugLabel(s) {
  return PH_SLUG_LABEL[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
}

function shortPkg(pkg) {
  if (!pkg) return "—";
  const l = pkg.toLowerCase();
  if (l.includes("land"))  return "Land Arr.";
  if (l.includes("all"))   return "All-In";
  if (l.includes("tour"))  return "Tour Only";
  if (l.includes("hotel")) return "Hotel Only";
  // show raw value truncated so we can see what Fusioo actually stores
  return pkg.length > 16 ? pkg.slice(0, 15) + "…" : pkg;
}

function lastFirst(name) {
  if (!name) return "—";
  const p = name.trim().split(/\s+/);
  return p.length < 2 ? name : `${p[p.length - 1]}, ${p.slice(0, -1).join(" ")}`;
}

function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", padding: "18px 20px", border: "1px solid rgba(0,0,0,0.07)", flex: "1 1 130px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
        <Icon size={13} color={color || ORANGE} />
        <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", margin: 0 }}>{label}</p>
      </div>
      <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.03em" }}>{value ?? "—"}</p>
    </div>
  );
}

const LIMIT_OPTIONS = [20, 30, 40, 50, 100];

// ── Flat table: GDX | Last, First | Destination | Package | Cached ──
function EntriesTable({ entries }) {
  const [limit, setLimit] = useState(20);
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  // Default: newest booking first; entries with no booked_at (orphaned cache rows) sink to the bottom
  const sorted = [...entries]
    .filter((e) => !q || String(e.gdx).toLowerCase().includes(q) || (e.lead_name || "").toLowerCase().includes(q))
    .sort((a, b) => {
      if (!a.booked_at && !b.booked_at) return 0;
      if (!a.booked_at) return 1;
      if (!b.booked_at) return -1;
      return b.booked_at.localeCompare(a.booked_at);
    });
  const totalPages = Math.ceil(sorted.length / limit) || 1;
  const safePage   = Math.min(page, totalPages);
  const visible    = sorted.slice((safePage - 1) * limit, safePage * limit);

  const changeLimit = (n) => { setLimit(n); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  const btnSt = (active) => ({ padding: "5px 11px", borderRadius: "7px", border: "1.5px solid", borderColor: active ? ORANGE : "#e5e5e5", background: active ? `${ORANGE}12` : "#fff", color: active ? ORANGE : "#888", fontSize: "11px", fontWeight: 800, cursor: "pointer" });

  const TH = ({ children }) => (
    <th style={{ padding: "9px 14px", textAlign: "left", fontWeight: 800, color: "#bbb", fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap", background: "#fafafa" }}>
      {children}
    </th>
  );
  if (entries.length === 0) return <p style={{ color: "#ccc", fontSize: "14px" }}>No cached entries. Run Bulk Cache All to populate.</p>;
  return (
    <div>
      {/* Search */}
      <div style={{ position: "relative", marginBottom: "12px", maxWidth: "320px" }}>
        <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#bbb", pointerEvents: "none" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search GDX or name…"
          style={{ width: "100%", padding: "8px 32px 8px 32px", borderRadius: "9px", border: "1.5px solid #e5e5e5", fontSize: "0.8rem", color: "#111", outline: "none", boxSizing: "border-box", background: "#fff" }}
        />
        {search && (
          <button onClick={() => handleSearch("")} style={{ position: "absolute", right: "9px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", color: "#bbb" }}>
            <X size={13} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
        <p style={{ fontSize: "12px", color: "#aaa", margin: 0, fontWeight: 600 }}>
          Showing <span style={{ color: "#555", fontWeight: 800 }}>{sorted.length === 0 ? 0 : (safePage - 1) * limit + 1}–{Math.min(safePage * limit, sorted.length)}</span> of <span style={{ color: "#555", fontWeight: 800 }}>{sorted.length}</span> entries{q && <span style={{ color: ORANGE }}> matching "{search}"</span>}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 700 }}>Rows</span>
          {LIMIT_OPTIONS.map((n) => (
            <button key={n} onClick={() => changeLimit(n)} style={btnSt(limit === n)}>{n}</button>
          ))}
          <span style={{ width: "1px", height: "18px", background: "#e5e5e5", margin: "0 4px" }} />
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} style={{ ...btnSt(false), opacity: safePage === 1 ? 0.35 : 1 }}>‹ Prev</button>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#555", minWidth: "60px", textAlign: "center" }}>
            {safePage} / {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ ...btnSt(false), opacity: safePage === totalPages ? 0.35 : 1 }}>Next ›</button>
        </div>
      </div>
    <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.07)", background: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
            <TH>GDX</TH>
            <TH>Last, First</TH>
            <TH>Destination</TH>
            <TH>Package</TH>
            <TH>Booked</TH>
            <TH>Cached</TH>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => {
            const isUnresolved = !r.slug || r.slug === "unresolved";
            return (
              <tr key={r.gdx} style={{ borderTop: "1px solid #f5f5f5" }}>
                <td style={{ padding: "9px 14px", fontFamily: "monospace", fontWeight: 700, color: ORANGE, whiteSpace: "nowrap" }}>{r.gdx}</td>
                <td style={{ padding: "9px 14px", fontWeight: 700, color: "#222", whiteSpace: "nowrap" }}>{lastFirst(r.lead_name)}</td>
                <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                  {isUnresolved
                    ? <span style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626" }}>⚠ unresolved</span>
                    : DOMESTIC_SLUGS.has(r.slug)
                      ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: `${ORANGE}18`, color: ORANGE }}>{slugLabel(r.slug)}</span>
                      : <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "#f3f4f6", color: "#9ca3af" }}>{slugLabel(r.slug)}</span>
                  }
                </td>
                <td style={{ padding: "9px 14px", whiteSpace: "nowrap" }}>
                  {r.package_name
                    ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "rgba(59,130,246,0.08)", color: "#2563eb" }}>{shortPkg(r.package_name)}</span>
                    : <span style={{ color: "#ccc" }}>—</span>
                  }
                </td>
                <td style={{ padding: "9px 14px", color: "#888", whiteSpace: "nowrap" }}>{fmtDate(r.booked_at)}</td>
                <td style={{ padding: "9px 14px", color: "#bbb", whiteSpace: "nowrap" }}>{fmtDate(r.cached_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
}

const ACCORDION_LIMIT_OPTIONS = [50, 100, 200, 500];

// Each destination section manages its own page so opening Boracay (10k rows)
// only renders one page at a time instead of the whole list.
function AccordionSection({ dest, rows, isUnresolved, isActive, open, onToggle }) {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(50);
  const accent = isUnresolved ? "#dc2626" : isActive ? ORANGE : "#9ca3af";
  const totalPages = Math.ceil(rows.length / limit) || 1;
  const safePage = Math.min(page, totalPages);
  const visible = rows.slice((safePage - 1) * limit, safePage * limit);

  const changeLimit = (n) => { setLimit(n); setPage(1); };

  const btnSt = (active) => ({
    padding: "4px 10px", borderRadius: "6px", border: "1.5px solid",
    borderColor: active ? ORANGE : "#e5e5e5",
    background: active ? `${ORANGE}12` : "#fff",
    color: active ? ORANGE : "#888",
    fontSize: "11px", fontWeight: 800, cursor: "pointer",
  });

  const TH = ({ children }) => (
    <th style={{ padding: "7px 14px", textAlign: "left", fontWeight: 800, color: "#bbb", fontSize: "10px", letterSpacing: "0.07em", textTransform: "uppercase", background: "#fafafa" }}>{children}</th>
  );

  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: `1px solid ${isUnresolved ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.07)"}`, overflow: "hidden", borderLeft: `4px solid ${accent}`, opacity: isActive ? 1 : 0.75 }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "13px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        {open ? <ChevronDown size={14} color="#bbb" /> : <ChevronRight size={14} color="#bbb" />}
        <span style={{ fontWeight: 900, fontSize: "0.9rem", color: isUnresolved ? "#dc2626" : isActive ? "#111" : "#888", flex: 1 }}>
          {isUnresolved ? "⚠ Unresolved" : slugLabel(dest)}
        </span>
        {!isActive && !isUnresolved && (
          <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "999px", background: "#f3f4f6", color: "#9ca3af", marginRight: "4px" }}>not on landing page</span>
        )}
        <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "999px", background: isUnresolved ? "rgba(239,68,68,0.08)" : isActive ? `${ORANGE}18` : "#f3f4f6", color: accent }}>
          {rows.length} GDX
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
            {/* Pagination bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid #f5f5f5", background: "#fafafa", flexWrap: "wrap", gap: "6px" }}>
              <p style={{ fontSize: "11px", color: "#aaa", margin: 0, fontWeight: 600 }}>
                Showing <span style={{ color: "#555", fontWeight: 800 }}>{(safePage - 1) * limit + 1}–{Math.min(safePage * limit, rows.length)}</span> of <span style={{ color: "#555", fontWeight: 800 }}>{rows.length}</span>
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: "#aaa", fontWeight: 700 }}>Rows</span>
                {ACCORDION_LIMIT_OPTIONS.map((n) => (
                  <button key={n} onClick={() => changeLimit(n)} style={btnSt(limit === n)}>{n}</button>
                ))}
                <span style={{ width: "1px", height: "16px", background: "#e5e5e5", margin: "0 2px" }} />
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} style={{ ...btnSt(false), opacity: safePage === 1 ? 0.35 : 1 }}>‹ Prev</button>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#555", minWidth: "52px", textAlign: "center" }}>{safePage} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={{ ...btnSt(false), opacity: safePage === totalPages ? 0.35 : 1 }}>Next ›</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <TH>GDX</TH>
                    <TH>Last, First</TH>
                    {isUnresolved && <TH>Raw Destination</TH>}
                    <TH>Package</TH>
                    <TH>Booked</TH>
                    <TH>Cached</TH>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.gdx} style={{ borderTop: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "7px 14px", fontFamily: "monospace", fontWeight: 700, color: ORANGE, whiteSpace: "nowrap" }}>{r.gdx}</td>
                      <td style={{ padding: "7px 14px", fontWeight: 600, color: "#333", whiteSpace: "nowrap" }}>{lastFirst(r.lead_name)}</td>
                      {isUnresolved && (
                        <td style={{ padding: "7px 14px", fontSize: "11px", color: "#888", whiteSpace: "nowrap", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.raw_destination || <span style={{ color: "#ccc" }}>—</span>}
                        </td>
                      )}
                      <td style={{ padding: "7px 14px", whiteSpace: "nowrap" }}>
                        {r.package_name
                          ? <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "999px", background: "rgba(59,130,246,0.08)", color: "#2563eb" }}>{shortPkg(r.package_name)}</span>
                          : <span style={{ color: "#ccc" }}>—</span>
                        }
                      </td>
                      <td style={{ padding: "7px 14px", color: "#888", whiteSpace: "nowrap" }}>{fmtDate(r.booked_at)}</td>
                      <td style={{ padding: "7px 14px", color: "#bbb", whiteSpace: "nowrap" }}>{fmtDate(r.cached_at)}</td>
                    </tr>
                  ))}
                </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
}

// ── Accordion view: grouped by destination, each section paginated ──
function AccordionView({ entries, expanded, onToggle }) {
  const groups = {};
  for (const e of entries) {
    const dest = e.slug || "unresolved";
    if (!groups[dest]) groups[dest] = [];
    groups[dest].push(e);
  }
  for (const dest of Object.keys(groups))
    groups[dest].sort((a, b) => lastFirst(a.lead_name).localeCompare(lastFirst(b.lead_name)));

  const destKeys = Object.keys(groups).sort((a, b) => {
    if (a === "unresolved") return 1;
    if (b === "unresolved") return -1;
    const aActive = DOMESTIC_SLUGS.has(a), bActive = DOMESTIC_SLUGS.has(b);
    if (aActive !== bActive) return aActive ? -1 : 1;
    return groups[b].length - groups[a].length;
  });
  if (destKeys.length === 0) return <p style={{ color: "#ccc", fontSize: "14px" }}>No cached entries. Run Bulk Cache All to populate.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {destKeys.map((dest) => (
        <AccordionSection
          key={dest}
          dest={dest}
          rows={groups[dest]}
          isUnresolved={dest === "unresolved"}
          isActive={DOMESTIC_SLUGS.has(dest)}
          open={!!expanded[dest]}
          onToggle={() => onToggle(dest)}
        />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminCache() {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [bulking, setBulking] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [bulkDone, setBulkDone] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteDone, setDeleteDone] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [tab, setTab] = useState("list");

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try { setStats(await getCacheStats()); } catch { setStats(null); } finally { setLoadingStats(false); }
  }, []);

  const loadEntries = useCallback(async () => {
    setLoadingEntries(true);
    try { setEntries(await getAllCachedEntries()); } catch { setEntries([]); } finally { setLoadingEntries(false); }
  }, []);

  useEffect(() => { loadStats(); loadEntries(); }, [loadStats, loadEntries]);

  const handleBulkCache = async () => {
    setBulking(true);
    setBulkDone(null);
    setBulkProgress({ done: 0, total: 0 });
    try {
      const result = await bulkCacheAllBookings((done, total) => setBulkProgress({ done, total }));
      setBulkDone({ count: result.done });
      await loadStats();
      await loadEntries();
    } catch (err) {
      console.error("Bulk cache error:", err);
      setBulkDone({ count: 0, error: err.message });
    } finally {
      setBulking(false);
    }
  };

  const handleDeleteOrphaned = async () => {
    setDeleteConfirm(false);
    setDeleting(true);
    setDeleteDone(null);
    try {
      const result = await deleteOrphanedEntries();
      setDeleteDone({ count: result.deleted });
      await loadStats();
      await loadEntries();
    } catch (err) {
      setDeleteDone({ count: 0, error: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  const domesticEntries = entries.filter((e) => DOMESTIC_SLUGS.has(e.slug));
  // Philippine-only: exclude international slugs (Bali, Bangkok, etc.) while keeping other PH cities + unresolved
  const phEntries = entries.filter((e) => ALL_PH_SLUGS.has(e.slug || "unresolved"));
  // Orphaned: in cache but no matching booking (no lead_name AND no booked_at)
  const orphanedCount = entries.filter((e) => !e.lead_name && !e.booked_at).length;

  const TABS = [
    { key: "list",  label: "All Entries"    },
    { key: "group", label: "By Destination" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>GDX Cache</h1>
          <p style={{ fontSize: "13px", color: "#999", margin: "4px 0 0" }}>Cache all bookings for fast slug resolution</p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => { loadStats(); loadEntries(); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "1.5px solid #e5e5e5", background: "#fff", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "#666" }}>
            <RefreshCw size={13} /> Refresh
          </button>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              disabled={deleting || orphanedCount === 0}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "1.5px solid", borderColor: orphanedCount === 0 ? "#e5e5e5" : "rgba(220,38,38,0.3)", background: orphanedCount === 0 ? "#fafafa" : "rgba(220,38,38,0.05)", color: orphanedCount === 0 ? "#ccc" : "#dc2626", cursor: orphanedCount === 0 ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 700 }}
            >
              <Trash2 size={13} />
              {deleting ? "Deleting…" : `Clean Up${orphanedCount > 0 ? ` (${orphanedCount})` : ""}`}
            </button>
          ) : (
            <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "6px 10px", borderRadius: "10px", background: "rgba(220,38,38,0.06)", border: "1.5px solid rgba(220,38,38,0.25)" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#dc2626" }}>Remove {orphanedCount} orphaned entries?</span>
              <button onClick={handleDeleteOrphaned} style={{ padding: "4px 10px", borderRadius: "7px", border: "none", background: "#dc2626", color: "#fff", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>Yes, delete</button>
              <button onClick={() => setDeleteConfirm(false)} style={{ padding: "4px 10px", borderRadius: "7px", border: "1.5px solid #e5e5e5", background: "#fff", color: "#666", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
            </div>
          )}
          <button onClick={handleBulkCache} disabled={bulking} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "none", background: bulking ? "#e5e5e5" : ORANGE, color: bulking ? "#aaa" : "#fff", cursor: bulking ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: 800 }}>
            <Zap size={13} />
            {bulking ? `Caching ${bulkProgress.done}/${bulkProgress.total || "…"}` : "Bulk Cache All"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <AnimatePresence>
        {bulking && bulkProgress.total > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div style={{ height: "6px", background: "#f0f0f0", borderRadius: "999px", overflow: "hidden" }}>
                <motion.div animate={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }} style={{ height: "100%", background: ORANGE, borderRadius: "999px" }} transition={{ duration: 0.3 }} />
              </div>
              <p style={{ fontSize: "12px", color: "#aaa", marginTop: "8px", margin: "8px 0 0", textAlign: "right" }}>
                {bulkProgress.done} / {bulkProgress.total} bookings
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bulkDone !== null && !bulking && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: "20px", padding: "12px 16px", background: bulkDone.error ? "rgba(239,68,68,0.07)" : "rgba(22,163,74,0.07)", border: `1px solid ${bulkDone.error ? "rgba(239,68,68,0.2)" : "rgba(22,163,74,0.18)"}`, borderRadius: "12px", fontSize: "13px", fontWeight: 700, color: bulkDone.error ? "#dc2626" : "#16a34a" }}>
            {bulkDone.error
              ? `✗ Cache failed: ${bulkDone.error}`
              : `✓ Cached ${bulkDone.count} bookings successfully.`
            }
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteDone !== null && !deleting && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginBottom: "20px", padding: "12px 16px", background: deleteDone.error ? "rgba(239,68,68,0.07)" : "rgba(22,163,74,0.07)", border: `1px solid ${deleteDone.error ? "rgba(239,68,68,0.2)" : "rgba(22,163,74,0.18)"}`, borderRadius: "12px", fontSize: "13px", fontWeight: 700, color: deleteDone.error ? "#dc2626" : "#16a34a" }}>
            {deleteDone.error
              ? `✗ Delete failed: ${deleteDone.error}`
              : deleteDone.count === 0
                ? "✓ No orphaned entries found."
                : `✓ Deleted ${deleteDone.count} orphaned entries.`
            }
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
        <StatCard label="Domestic Cached" value={loadingEntries ? "…" : domesticEntries.length} icon={Database} color={ORANGE}  />
        <StatCard label="Slug Resolved"   value={loadingStats ? "…" : stats?.slugResolved}       icon={Zap}      color="#16a34a" />
        <StatCard label="Orphaned"        value={loadingEntries ? "…" : orphanedCount}            icon={Trash2}   color="#dc2626" />
        <StatCard
          label="Oldest Cache"
          value={loadingStats ? "…" : stats?.oldestCachedAt ? new Date(stats.oldestCachedAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : "—"}
          icon={Clock}
          color="#9ca3af"
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "inline-flex", gap: "3px", background: "#f0f0f0", padding: "4px", borderRadius: "12px", marginBottom: "20px" }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: "8px 18px", borderRadius: "9px", border: "none", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "#111" : "#999", fontWeight: tab === t.key ? 800 : 600, fontSize: "0.8rem", cursor: "pointer", boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.12s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loadingEntries ? (
        <p style={{ color: "#ccc", fontSize: "14px" }}>Loading entries…</p>
      ) : tab === "list" ? (
        <EntriesTable entries={phEntries} />
      ) : (
        <AccordionView entries={phEntries} expanded={expanded} onToggle={toggle} />
      )}
    </div>
  );
}
