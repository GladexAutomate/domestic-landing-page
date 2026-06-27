// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, LogOut, Database, Star, Info, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminCache from "./AdminCache";
import AdminReviews from "./AdminReviews";
import AdminAbout from "./AdminAbout";
import { getPendingReviewsCount } from "@/services/reviewsService";

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

function parseAdminUsers() {
  const raw = import.meta.env.VITE_ADMIN_USERS || "";
  const map = new Map();
  for (const entry of raw.split(",")) {
    const [user, pass] = entry.trim().split(":");
    if (user && pass) map.set(user.toLowerCase(), { display: user, pass });
  }
  return map;
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const users = parseAdminUsers();
    const found = users.get(username.toLowerCase());
    if (!found) { setError("Username not found."); setLoading(false); return; }
    if (found.pass !== password) { setError("Incorrect password."); setLoading(false); return; }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: found.display }));
    onLogin(found.display);
    setLoading(false);
  };

  const ready = username.trim() && password;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px 36px", width: "100%", maxWidth: "360px", boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <img src={GLADEX_LOGO} alt="Gladex Tours" style={{ height: "48px", objectFit: "contain", marginBottom: "16px" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111", letterSpacing: "-0.02em", margin: 0 }}>Admin</h1>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ fontSize: "10.5px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e5e5e5", fontSize: "0.875rem", color: "#111", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: "10.5px", fontWeight: 700, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ width: "100%", padding: "10px 40px 10px 14px", borderRadius: "10px", border: "1.5px solid #e5e5e5", fontSize: "0.875rem", color: "#111", outline: "none", boxSizing: "border-box" }}
              />
              <button type="button" onClick={() => setShowPass((s) => !s)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bbb", display: "flex", padding: 0 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600, margin: 0 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={!ready || loading}
            style={{ marginTop: "4px", padding: "12px", borderRadius: "10px", background: !ready ? "#f0f0f0" : ORANGE, color: !ready ? "#bbb" : "#fff", fontWeight: 800, fontSize: "0.875rem", border: "none", cursor: !ready ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}
          >
            {loading ? (
              <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
            ) : "Sign In"}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const NAV = [
  { path: "/admin/cache",   icon: Database, label: "GDX Cache"      },
  { path: "/admin/reviews", icon: Star,     label: "Client Reviews" },
  { path: "/admin/about",   icon: Info,     label: "About"          },
];

export default function Admin() {
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")?.user || null; } catch { return null; }
  });
  const [navOpen, setNavOpen] = useState(false);
  const [newReviewCount, setNewReviewCount] = useState(0);
  const isMobile = useMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (adminUser && location.pathname === "/admin") navigate("/admin/cache", { replace: true });
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

  if (!adminUser) return <LoginScreen onLogin={setAdminUser} />;

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
        <div style={{ paddingLeft: "10px", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <img src={GLADEX_LOGO} alt="Gladex Tours" style={{ height: "28px", objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", fontWeight: 900, color: "#111", letterSpacing: "0.05em" }}>ADMIN</span>
          </div>
          <p style={{ fontSize: "11.5px", color: "#aaa", margin: 0, fontWeight: 600 }}>👤 {adminUser}</p>
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
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "10px", background: "none", border: "none", cursor: "pointer", color: "#bbb", fontWeight: 600, fontSize: "0.85rem", width: "100%", textAlign: "left" }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <div style={{ padding: isMobile ? "12px 16px" : "14px 32px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "10px", background: "#fff" }}>
          {isMobile && (
            <button onClick={() => setNavOpen((o) => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexShrink: 0, marginRight: "2px" }}>
              <Menu size={20} color="#666" />
            </button>
          )}
          <img src={GLADEX_LOGO} alt="Gladex Tours" style={{ height: "26px", objectFit: "contain" }} />
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#ccc", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin Panel</span>
        </div>
        <Routes>
          <Route path="cache"   element={<AdminCache />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="about"   element={<AdminAbout />} />
        </Routes>
      </main>
    </div>
  );
}
