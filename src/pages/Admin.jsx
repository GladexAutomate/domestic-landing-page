// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, LogOut, Users, Star, Info, Menu, AlertCircle, FileText, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminReviews from "./AdminReviews";
import AdminAbout from "./AdminAbout";
import AdminVouchers from "./AdminVouchers";
import { getPendingReviewsCount } from "@/services/reviewsService";

const ACCOUNTS_URL = import.meta.env.VITE_ACCOUNTS_URL;
const ACCOUNTS_KEY = import.meta.env.VITE_ACCOUNTS_SVC_KEY;

function toTitleCase(str) {
  if (!str) return "Admin";
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).trim();
}

function resolveRole(account) {
  if (account.role_override) return account.role_override;
  const t = (account.job_title || "").toUpperCase();
  if (["CEO","COO","CTO","CHIEF","PRESIDENT","OWNER","FOUNDER","GENERAL MANAGER","CORPORATE MANAGER","OPERATIONS MANAGER"].some(x => t.includes(x))) return "super_admin";
  if (["MANAGER","SUPERVISOR","DIRECTOR","OFFICER","AUDITOR","EXECUTIVE ASSISTANT","EXECUTIVE SECRETARY","CORPORATE TRAINOR","SUBJECT MATTER EXPERT","PARTNER ONBOARDING COACH","BUSINESS DEVELOPMENT COACH","BUSINESS DEVELOPMENT ACQUISITION","PARTNER SUCCESS ENABLEMENT","SALES HEAD","SALES SKILLS","ONBOARDING COACH"].some(x => t.includes(x))) return "admin";
  if (t === "HR" || t.startsWith("HR ") || t.includes("HUMAN RESOURCE") || ["RECRUITER","RECRUITMENT","TALENT ACQUISITION","TALENT MANAGEMENT","PAYROLL","COMPENSATION AND BENEFITS","LEARNING AND DEVELOPMENT","TRAINING AND DEVELOPMENT"].some(x => t.includes(x))) return "admin";
  if (["TEAM LEADER","TEAM LEAD","TL DOMESTIC","TL INTERNATIONAL","CHAT SUPPORT TEAM LEAD","CUSTOMER RESPONSE LEADER","PARTNER SUCCESS LEAD","ROB TEAM LEADER","ADMIN TEAM LEADER"].some(x => t.includes(x)) || t === "TL" || t.startsWith("TL ")) return "team_leader";
  return "agent";
}

async function verifyLogin(code, password) {
  if (!ACCOUNTS_URL || !ACCOUNTS_KEY) throw new Error("Accounts API not configured.");
  const r = await fetch(
    `${ACCOUNTS_URL}/rest/v1/employeeaccount?select=id,data&data->>employee_code=eq.${encodeURIComponent(code.trim())}&data->>status=eq.active&limit=1`,
    {
      headers: {
        "apikey": ACCOUNTS_KEY,
        "Authorization": `Bearer ${ACCOUNTS_KEY}`,
        "Accept-Profile": "public",
      },
      signal: AbortSignal.timeout(12000),
    }
  );
  if (!r.ok) throw new Error(`Accounts service error (${r.status})`);
  const rows = await r.json();
  if (!rows?.length) return null;
  const acct = rows[0].data;
  if (acct.generated_password !== password.trim()) return "wrong_password";
  return {
    user:     toTitleCase(acct.full_name),
    code:     acct.employee_code,
    role:     resolveRole(acct),
    jobTitle: acct.job_title,
  };
}

function useMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

const ORANGE = "#FF9913";
const SESSION_KEY = "gdx_admin_auth";
const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

function LoginScreen({ onLogin }) {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await verifyLogin(code, password);
      if (!result) {
        setError("Login code not found or account is inactive.");
        setLoading(false);
        return;
      }
      if (result === "wrong_password") {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
      onLogin(result);
    } catch (err) {
      setError(err.message || "Connection error. Please try again.");
    }
    setLoading(false);
  };

  const ready = code.trim() && password;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#F2F2F2" }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: "#fff", borderRadius: "24px", padding: "40px 36px", width: "100%", maxWidth: "380px", boxShadow: "0 8px 40px rgba(255,153,19,0.13), 0 2px 8px rgba(0,0,0,0.06)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ padding: "12px", background: `${ORANGE}15`, borderRadius: "16px", marginBottom: "16px" }}>
            <img src={GLADEX_LOGO} alt="Gladex Tours" style={{ height: "44px", objectFit: "contain", display: "block" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#111", letterSpacing: "-0.025em", margin: "0 0 4px" }}>Welcome back</h1>
          <p style={{ fontSize: "12.5px", color: "#aaa", margin: 0, fontWeight: 500 }}>Sign in to your admin panel</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "10.5px", fontWeight: 800, color: "#888", letterSpacing: "0.09em", textTransform: "uppercase", display: "block", marginBottom: "7px" }}>Login Code</label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" }} />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); }}
                autoComplete="username"
                placeholder="e.g. GDX2024-0001"
                style={{ width: "100%", padding: "11px 14px 11px 36px", borderRadius: "11px", border: `1.5px solid ${error ? "rgba(220,38,38,0.4)" : "#ebebeb"}`, fontSize: "0.875rem", color: "#111", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s", background: "#fafafa" }}
                onFocus={(e) => e.target.style.borderColor = ORANGE}
                onBlur={(e) => e.target.style.borderColor = error ? "rgba(220,38,38,0.4)" : "#ebebeb"}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "10.5px", fontWeight: 800, color: "#888", letterSpacing: "0.09em", textTransform: "uppercase", display: "block", marginBottom: "7px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" }} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                autoComplete="current-password"
                placeholder="Enter password"
                style={{ width: "100%", padding: "11px 40px 11px 36px", borderRadius: "11px", border: `1.5px solid ${error ? "rgba(220,38,38,0.4)" : "#ebebeb"}`, fontSize: "0.875rem", color: "#111", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s", background: "#fafafa" }}
                onFocus={(e) => e.target.style.borderColor = ORANGE}
                onBlur={(e) => e.target.style.borderColor = error ? "rgba(220,38,38,0.4)" : "#ebebeb"}
              />
              <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", display: "flex", padding: 0 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 12px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: "9px" }}
              >
                <AlertCircle size={13} color="#dc2626" />
                <p style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600, margin: 0 }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={!ready || loading}
            whileHover={ready && !loading ? { scale: 1.02 } : {}}
            whileTap={ready && !loading ? { scale: 0.98 } : {}}
            style={{ marginTop: "4px", padding: "13px", borderRadius: "12px", background: !ready ? "#f0f0f0" : `linear-gradient(135deg, ${ORANGE}, #e07c00)`, color: !ready ? "#bbb" : "#fff", fontWeight: 800, fontSize: "0.9rem", border: "none", cursor: !ready ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: ready ? `0 4px 14px ${ORANGE}40` : "none", transition: "background 0.2s, box-shadow 0.2s" }}
          >
            {loading
              ? <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              : "Sign In"
            }
          </motion.button>
        </form>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const ALL_NAV = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard",      roles: null },
  { path: "/admin/vouchers",  icon: FileText,         label: "Vouchers",       roles: ["super_admin", "developer", "admin"] },
  { path: "/admin/reviews",   icon: Star,             label: "Client Reviews", roles: null },
  { path: "/admin/users",     icon: Users,            label: "Users",          roles: ["super_admin", "developer", "admin"] },
  { path: "/admin/about",     icon: Info,             label: "About",          roles: null },
];

export default function Admin() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      // support old string-only sessions from before role system
      if (typeof s === "string") return { user: s, role: "admin" };
      return s?.user ? s : null;
    } catch { return null; }
  });
  const [navOpen, setNavOpen]         = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newReviewCount, setNewReviewCount] = useState(0);
  const NAV = ALL_NAV.filter(n => !n.roles || n.roles.includes(adminUser?.role));
  const isMobile = useMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (adminUser && location.pathname === "/admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [adminUser, location.pathname, navigate]);

  // Close drawer on route change (mobile)
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  // Fetch pending count on login and whenever a review action fires
  const refreshPending = React.useCallback(() => {
    getPendingReviewsCount().then(setNewReviewCount).catch(() => {});
  }, []);

  useEffect(() => {
    if (!adminUser) return;
    refreshPending();
    window.addEventListener("gdx_review_updated", refreshPending);
    return () => window.removeEventListener("gdx_review_updated", refreshPending);
  }, [adminUser, refreshPending]);

  if (!adminUser) return <LoginScreen onLogin={(result) => setAdminUser(result)} />;

  const sidebarStyle = isMobile
    ? { position: "fixed", top: 0, bottom: 0, left: navOpen ? 0 : "-240px", width: "220px", zIndex: 50, transition: "left 0.25s ease", boxShadow: navOpen ? "4px 0 24px rgba(0,0,0,0.14)" : "none", background: "#fff", borderRight: "1px solid rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", padding: "24px 14px" }
    : { width: "220px", flexShrink: 0, background: "#fff", borderRight: "1px solid rgba(0,0,0,0.07)", display: "flex", flexDirection: "column", padding: "24px 14px" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F5F5F5" }}>
      {/* Mobile backdrop */}
      {isMobile && navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ paddingLeft: "10px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img src={GLADEX_LOGO} alt="Gladex Tours" style={{ height: "28px", objectFit: "contain", flexShrink: 0 }} />
          </div>
        </div>
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname.startsWith(path);
            const isReviews = path === "/admin/reviews";
            const showBadge = isReviews && newReviewCount > 0;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => isMobile && setNavOpen(false)}
                style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px", padding: "9px 12px", borderRadius: "10px", background: active ? `${ORANGE}1a` : "transparent", color: active ? ORANGE : "#666", fontWeight: active ? 800 : 600, fontSize: "0.85rem", transition: "all 0.12s" }}
              >
                <Icon size={15} />
                {label}
                {showBadge && (
                  <span style={{ marginLeft: "auto", background: "#dc2626", color: "#fff", fontSize: "10px", fontWeight: 800, borderRadius: "999px", padding: "1px 7px", minWidth: "18px", textAlign: "center", lineHeight: "16px" }}>
                    {newReviewCount > 99 ? "99+" : newReviewCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAdminUser(null); }}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", background: "none", border: "1.5px solid #e5e5e5", cursor: "pointer", color: "#888", fontWeight: 700, fontSize: "0.82rem", width: "100%", textAlign: "left" }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: isMobile ? "12px 16px" : "10px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "10px", background: "#fff" }}>
          {isMobile && (
            <button onClick={() => setNavOpen((o) => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexShrink: 0, marginRight: "2px" }}>
              <Menu size={20} color="#666" />
            </button>
          )}
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#111" }}>
            {NAV.find((n) => location.pathname.startsWith(n.path))?.label ?? "Admin"}
          </span>
          {/* Profile dropdown — upper right */}
          <div style={{ marginLeft: "auto", position: "relative" }}>
            {/* Trigger: avatar + role only */}
            <button
              onClick={() => setProfileOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 10 }}
            >
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${ORANGE}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "10.5px", fontWeight: 900, color: ORANGE }}>
                  {(adminUser.user || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 800, color: ORANGE, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {(adminUser.role || "").replace(/_/g, " ")}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Dropdown card */}
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div onClick={() => setProfileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
                      background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 220, overflow: "hidden",
                    }}
                  >
                    {/* User info */}
                    <div style={{ padding: "16px 18px", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${ORANGE}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: "12px", fontWeight: 900, color: ORANGE }}>
                            {(adminUser.user || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 800, color: "#111", margin: 0, lineHeight: 1.3 }}>{adminUser.user}</p>
                          <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>{adminUser.code || "—"}</p>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: `${ORANGE}18`, color: ORANGE, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                          {(adminUser.role || "").replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    {/* Sign out */}
                    <button
                      onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAdminUser(null); setProfileOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "12px 18px", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700, fontSize: "13px", textAlign: "left" }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users"     element={["super_admin","developer","admin"].includes(adminUser?.role) ? <AdminUsers />    : <Navigate to="/admin/dashboard" replace />} />
          <Route path="vouchers"  element={["super_admin","developer","admin"].includes(adminUser?.role) ? <AdminVouchers /> : <Navigate to="/admin/dashboard" replace />} />
          <Route path="reviews"   element={<AdminReviews />} />
          <Route path="about"     element={<AdminAbout />} />
        </Routes>
      </main>
    </div>
  );
}
