// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, ChevronUp, ChevronDown, UserCheck, UserX, Eye, EyeOff, Copy, Check } from "lucide-react";

const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL;
const ACCOUNTS_KEY = import.meta.env.VITE_ACCOUNTS_SVC_KEY;
const SESSION_KEY  = "gdx_admin_auth";
const ORANGE = "#FF9913";
const ASHLEY = "POTB2026-0364";

// Role rank — higher = more authority
const RANK = { agent: 0, team_leader: 1, admin: 2, super_admin: 3, developer: 3 };

function canManageTarget(session, emp) {
  if (!session) return false;
  // Ashley (main developer) manages everyone
  if (session.code === ASHLEY) return true;
  // agent / team_leader manage nobody
  if (!["super_admin", "developer", "admin"].includes(session.role)) return false;
  // Nobody else can touch Ashley
  if (emp.employee_code === ASHLEY) return false;
  const targetRank = RANK[emp.role] ?? 0;
  // admin can manage same level (admin) and below
  if (session.role === "admin") return targetRank <= 2;
  // super_admin / developer can only manage strictly below (not peers, not developers)
  return targetRank < 3;
}

function getAssignableRoles(session) {
  if (!session) return [];
  if (session.code === ASHLEY) return ["super_admin", "developer", "admin", "team_leader", "agent"];
  if (["super_admin", "developer", "admin"].includes(session.role)) return ["admin", "team_leader", "agent"];
  return [];
}

function toTitleCase(str) {
  if (!str) return "—";
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function resolveRole(account) {
  // Manual override wins first
  if (account.role_override) return account.role_override;
  // Hardcoded named overrides
  if (account.employee_code === "POTB2026-0364") return "developer";   // Ashley
  if (account.employee_code === "GDX2022-0004")  return "super_admin"; // Kevin
  if (account.employee_code === "POTB2026-0365") return "developer";   // Jferson
  const t = (account.job_title || "").toUpperCase();
  if (["CEO","COO","CTO","CHIEF","PRESIDENT","OWNER","FOUNDER","GENERAL MANAGER","CORPORATE MANAGER"].some(x => t.includes(x))) return "super_admin";
  if (["MANAGER","SUPERVISOR","DIRECTOR","OFFICER","AUDITOR","EXECUTIVE ASSISTANT","EXECUTIVE SECRETARY","CORPORATE TRAINOR","SUBJECT MATTER EXPERT","PARTNER ONBOARDING COACH","BUSINESS DEVELOPMENT COACH","BUSINESS DEVELOPMENT ACQUISITION","PARTNER SUCCESS ENABLEMENT","SALES HEAD","SALES SKILLS","ONBOARDING COACH"].some(x => t.includes(x))) return "admin";
  if (t === "HR" || t.startsWith("HR ") || t.includes("HUMAN RESOURCE") || ["RECRUITER","RECRUITMENT","TALENT ACQUISITION","TALENT MANAGEMENT","PAYROLL","COMPENSATION AND BENEFITS","LEARNING AND DEVELOPMENT","TRAINING AND DEVELOPMENT"].some(x => t.includes(x))) return "admin";
  if (["TEAM LEADER","TEAM LEAD","TL ","TL DOMESTIC","TL INTERNATIONAL","CHAT SUPPORT TEAM LEAD","CUSTOMER RESPONSE LEADER","PARTNER SUCCESS LEAD","ROB TEAM LEADER","ADMIN TEAM LEADER"].some(x => t.includes(x)) || t.startsWith("TL ") || t === "TL DOMESTIC" || t === "TL INTERNATIONAL") return "team_leader";
  return "agent";
}

const ROLE_STYLE = {
  super_admin: { bg: "#FFF3E0", color: "#E65100", label: "Super Admin" },
  developer:   { bg: "#EDE7F6", color: "#4527A0", label: "Developer"   },
  admin:       { bg: "#E3F2FD", color: "#0D47A1", label: "Admin"       },
  team_leader: { bg: "#F1F8E9", color: "#33691E", label: "Team Leader" },
  agent:       { bg: "#F5F5F5", color: "#616161", label: "Agent"       },
};

const STATUS_STYLE = {
  active:   { bg: "#E8F5E9", color: "#2E7D32" },
  inactive: { bg: "#FAFAFA", color: "#9E9E9E" },
};

async function fetchAllEmployees() {
  const PAGE = 100;
  let all = [];
  let from = 0;
  while (true) {
    const r = await fetch(
      `${ACCOUNTS_URL}/rest/v1/employeeaccount?select=id,data&limit=${PAGE}&offset=${from}`,
      {
        headers: {
          "apikey": ACCOUNTS_KEY,
          "Authorization": `Bearer ${ACCOUNTS_KEY}`,
          "Accept-Profile": "public",
        },
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!r.ok) throw new Error(`Fetch error ${r.status}`);
    const rows = await r.json();
    all = all.concat(rows.map(r => ({ ...r.data, _id: r.id, role: resolveRole(r.data) })));
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function patchData(rowId, fullData, patch) {
  const { _id, role, ...cleanData } = fullData;
  const r = await fetch(
    `${ACCOUNTS_URL}/rest/v1/employeeaccount?id=eq.${rowId}`,
    {
      method: "PATCH",
      headers: {
        "apikey": ACCOUNTS_KEY,
        "Authorization": `Bearer ${ACCOUNTS_KEY}`,
        "Content-Profile": "public",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({ data: { ...cleanData, ...patch } }),
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!r.ok) throw new Error(`Update failed (${r.status})`);
  return patch;
}

function Initials({ name }) {
  const parts = (name || "?").trim().split(/\s+/);
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (parts[0] || "?")[0];
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: `${ORANGE}22`, color: ORANGE,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "11px", fontWeight: 800, flexShrink: 0, letterSpacing: "0.04em",
    }}>
      {letters.toUpperCase()}
    </div>
  );
}

export default function AdminUsers() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [roleFilter, setRole]     = useState("all");
  const [sortKey, setSortKey]     = useState("full_name");
  const [sortDir, setSortDir]     = useState("asc");
  const [updating, setUpdating]     = useState(new Set());
  const [revealed, setRevealed]     = useState(new Set()); // employee _ids with password shown
  const [copied,   setCopied]       = useState(null);      // _id of last copied row

  const session          = (() => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } })();
  const canSeeCredentials = ["super_admin", "developer"].includes(session?.role);
  const canManageAnyone   = session?.code === ASHLEY || ["super_admin", "developer", "admin"].includes(session?.role);
  const assignableRoles   = getAssignableRoles(session);

  const toggleReveal = (id) => setRevealed(prev => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const copyCredentials = (emp) => {
    const text = `Login Code: ${emp.employee_code}\nPassword: ${emp.generated_password}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(emp._id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const load = async () => {
    setLoading(true); setError(null);
    try { setEmployees(await fetchAllEmployees()); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleToggle = async (emp) => {
    const newStatus = emp.status === "active" ? "inactive" : "active";
    setUpdating(prev => new Set(prev).add(emp._id));
    try {
      await patchData(emp._id, emp, { status: newStatus });
      setEmployees(prev => prev.map(e =>
        e._id === emp._id ? { ...e, status: newStatus } : e
      ));
    } catch (e) {
      alert(`Failed to update: ${e.message}`);
    }
    setUpdating(prev => { const s = new Set(prev); s.delete(emp._id); return s; });
  };

  const handleRoleChange = async (emp, newRole) => {
    setUpdating(prev => new Set(prev).add(emp._id));
    try {
      await patchData(emp._id, emp, { role_override: newRole });
      setEmployees(prev => prev.map(e =>
        e._id === emp._id ? { ...e, role_override: newRole, role: newRole } : e
      ));
    } catch (e) {
      alert(`Failed to update role: ${e.message}`);
    }
    setUpdating(prev => { const s = new Set(prev); s.delete(emp._id); return s; });
  };

  const filtered = useMemo(() => {
    let rows = employees;
    if (statusFilter !== "all") rows = rows.filter(e => (e.status || "inactive") === statusFilter);
    if (roleFilter   !== "all") rows = rows.filter(e => e.role === roleFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(e =>
        (e.full_name     || "").toLowerCase().includes(q) ||
        (e.employee_code || "").toLowerCase().includes(q) ||
        (e.job_title     || "").toLowerCase().includes(q) ||
        (e.email         || "").toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const va = (a[sortKey] || "").toLowerCase();
      const vb = (b[sortKey] || "").toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [employees, search, statusFilter, roleFilter, sortKey, sortDir]);

  const total  = employees.length;
  const active = employees.filter(e => e.status === "active").length;
  const byRole = employees.reduce((acc, e) => { acc[e.role] = (acc[e.role] || 0) + 1; return acc; }, {});

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
    : null;

  const FilterChip = ({ label, value, current, onClick }) => (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      style={{
        padding: "4px 11px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 700,
        border: `1.5px solid ${current === value ? ORANGE : "#e5e5e5"}`,
        background: current === value ? `${ORANGE}15` : "#fff",
        color: current === value ? ORANGE : "#666",
        cursor: "pointer", transition: "border-color 0.12s, background 0.12s, color 0.12s",
      }}
    >
      {label}
    </motion.button>
  );

  const COLS = [
    { key: "full_name",     label: "Name"        },
    { key: "employee_code", label: "Code"        },
    { key: "job_title",     label: "Job Title"   },
    { key: "role",          label: "Role"        },
    { key: "status",        label: "Status"      },
    ...(canSeeCredentials ? [{ key: null, label: "Credentials" }] : []),
    ...(canManageAnyone   ? [{ key: null, label: "Action"      }] : []),
  ];

  return (
    <motion.div
      style={{ padding: "24px 28px" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#111", margin: "0 0 2px" }}>User Management</h2>
          <p style={{ fontSize: "12px", color: "#aaa", margin: 0, fontWeight: 500 }}>
            {loading ? "Loading…" : `${total} accounts · ${active} active`}
          </p>
        </div>
        <motion.button
          onClick={load} disabled={loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1.5px solid #e5e5e5", background: "#fff", fontSize: "12.5px", fontWeight: 700, color: "#666", cursor: "pointer" }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 0.8s linear infinite" : "none" }} />
          Refresh
        </motion.button>
      </div>

      {/* Stats */}
      {!loading && !error && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          {Object.entries(ROLE_STYLE).map(([role, style], i) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ padding: "8px 14px", borderRadius: 10, background: style.bg, display: "flex", flexDirection: "column", gap: 1, minWidth: 90 }}
            >
              <span style={{ fontSize: "18px", fontWeight: 900, color: style.color }}>{byRole[role] || 0}</span>
              <span style={{ fontSize: "10px", fontWeight: 800, color: style.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{style.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, code, job title…"
            style={{ width: "100%", padding: "8px 12px 8px 32px", borderRadius: 10, border: "1.5px solid #e5e5e5", fontSize: "12.5px", color: "#111", outline: "none", boxSizing: "border-box", background: "#fff" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <FilterChip label="All"      value="all"      current={statusFilter} onClick={() => setStatus("all")} />
          <FilterChip label="Active"   value="active"   current={statusFilter} onClick={() => setStatus("active")} />
          <FilterChip label="Inactive" value="inactive" current={statusFilter} onClick={() => setStatus("inactive")} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <FilterChip label="All Roles"   value="all"         current={roleFilter} onClick={() => setRole("all")} />
          <FilterChip label="Super Admin" value="super_admin" current={roleFilter} onClick={() => setRole("super_admin")} />
          <FilterChip label="Developer"   value="developer"   current={roleFilter} onClick={() => setRole("developer")} />
          <FilterChip label="Admin"       value="admin"       current={roleFilter} onClick={() => setRole("admin")} />
          <FilterChip label="Team Leader" value="team_leader" current={roleFilter} onClick={() => setRole("team_leader")} />
          <FilterChip label="Agent"       value="agent"       current={roleFilter} onClick={() => setRole("agent")} />
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div style={{ padding: 16, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: 10, fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
          ✕ {error}
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb", fontSize: 13 }}>
          <div style={{ width: 20, height: 20, border: "2px solid #f0f0f0", borderTopColor: ORANGE, borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 10px" }} />
          Loading accounts…
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #f0f0f0" }}>
                  {COLS.map(col => (
                    <th
                      key={col.label}
                      onClick={() => col.key && toggleSort(col.key)}
                      style={{ padding: "10px 14px", textAlign: "left", fontWeight: 800, color: "#888", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: col.key ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}
                    >
                      {col.label} {col.key && <SortIcon k={col.key} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={COLS.length} style={{ padding: 40, textAlign: "center", color: "#bbb", fontWeight: 600 }}>
                      No employees match your filters.
                    </td>
                  </tr>
                ) : filtered.map((emp, i) => {
                  const roleStyle   = ROLE_STYLE[emp.role]    || ROLE_STYLE.team_leader;
                  const statusStyle = STATUS_STYLE[emp.status] || STATUS_STYLE.inactive;
                  const isActive    = emp.status === "active";
                  const isBusy      = updating.has(emp._id);

                  return (
                    <motion.tr
                      key={emp._id || i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: isBusy ? 0.6 : 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.018, 0.28), duration: 0.25, ease: "easeOut" }}
                      style={{ borderBottom: "1px solid #f8f8f8", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {/* Name */}
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Initials name={emp.full_name} />
                          <div>
                            <div style={{ fontWeight: 700, color: "#111" }}>{toTitleCase(emp.full_name)}</div>
                            <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>{emp.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      {/* Code */}
                      <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#555", fontWeight: 600 }}>
                        {emp.employee_code || "—"}
                      </td>
                      {/* Job Title */}
                      <td style={{ padding: "10px 14px", color: "#666" }}>
                        {toTitleCase(emp.job_title) || "—"}
                      </td>
                      {/* Role */}
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 999, background: roleStyle.bg, color: roleStyle.color, fontWeight: 800, fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {roleStyle.label}
                        </span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ padding: "3px 9px", borderRadius: 999, background: statusStyle.bg, color: statusStyle.color, fontWeight: 700, fontSize: "10.5px", textTransform: "capitalize" }}>
                          {emp.status || "inactive"}
                        </span>
                      </td>
                      {/* Credentials — super_admin / developer only */}
                      {canSeeCredentials && (
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: "11.5px", fontFamily: "monospace", color: "#333", fontWeight: 600, letterSpacing: revealed.has(emp._id) ? 0 : "0.12em", minWidth: 80 }}>
                              {revealed.has(emp._id) ? (emp.generated_password || "—") : "••••••••"}
                            </span>
                            <button
                              onClick={() => toggleReveal(emp._id)}
                              title={revealed.has(emp._id) ? "Hide" : "Show"}
                              style={{ background: "none", border: "none", cursor: "pointer", color: revealed.has(emp._id) ? ORANGE : "#ccc", padding: 2, display: "flex", flexShrink: 0 }}
                            >
                              {revealed.has(emp._id) ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={() => copyCredentials(emp)}
                              title="Copy code + password"
                              style={{ background: "none", border: "none", cursor: "pointer", color: copied === emp._id ? "#2E7D32" : "#ccc", padding: 2, display: "flex", flexShrink: 0, transition: "color 0.2s" }}
                            >
                              {copied === emp._id ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Action — based on hierarchy */}
                      {canManageAnyone && (
                        <td style={{ padding: "10px 14px" }}>
                          {canManageTarget(session, emp) ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 110 }}>
                              <select
                                disabled={isBusy}
                                value={emp.role}
                                onChange={e => handleRoleChange(emp, e.target.value)}
                                style={{
                                  padding: "4px 6px", borderRadius: 7, fontSize: "11px", fontWeight: 700,
                                  border: "1.5px solid #e5e5e5", background: "#fafafa", color: "#555",
                                  cursor: isBusy ? "not-allowed" : "pointer", outline: "none", width: "100%",
                                }}
                              >
                                {assignableRoles.map(r => (
                                  <option key={r} value={r}>{ROLE_STYLE[r]?.label || r}</option>
                                ))}
                              </select>
                              <button
                                disabled={isBusy}
                                onClick={() => handleToggle(emp)}
                                style={{
                                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                                  width: "100%", padding: "4px 8px", borderRadius: 7, flexShrink: 0,
                                  border: `1.5px solid ${isActive ? "rgba(220,38,38,0.25)" : "rgba(46,125,50,0.3)"}`,
                                  background: isActive ? "rgba(220,38,38,0.05)" : "rgba(46,125,50,0.06)",
                                  color: isActive ? "#dc2626" : "#2E7D32",
                                  cursor: isBusy ? "not-allowed" : "pointer",
                                  fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
                                }}
                              >
                                {isBusy
                                  ? <div style={{ width: 11, height: 11, border: "1.5px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                  : <>{isActive ? <UserX size={11} /> : <UserCheck size={11} />} {isActive ? "Deactivate" : "Activate"}</>
                                }
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#ddd", fontWeight: 600 }}>—</span>
                          )}
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid #f0f0f0", fontSize: "11.5px", color: "#bbb", fontWeight: 600 }}>
              Showing {filtered.length} of {total} accounts
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
