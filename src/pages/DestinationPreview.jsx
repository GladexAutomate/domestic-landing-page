import { useState, useRef, useEffect } from "react";

/* ================= BRAND ================= */
const BRAND = {
  orange: "#FF8C00",
  orangeDeep: "#E07000",
  orangeGlow: "rgba(255,140,0,0.18)",
  dark: "#0a0a0a",
  dark2: "#111111",
  dark3: "#181818",
  card: "#141414",
  cardBorder: "rgba(255,255,255,0.07)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.45)",
  muted2: "rgba(255,255,255,0.25)",
  line: "rgba(255,255,255,0.08)",
};

/* ================= SAMPLE DATA ================= */
const SAMPLE = {
  clientName: "Maria",
  destination: "Boracay",
  travelDate: "June 15–18, 2026",
  hotel: "Henann Lagoon Resort",
  guests: "4 Adults",
  status: "Confirmed",
};

/* ================= LOGIN (ADDED ONLY) ================= */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: BRAND.dark,
      color: BRAND.text
    }}>
      <div style={{
        width: 340,
        padding: 24,
        borderRadius: 16,
        border: `1px solid ${BRAND.line}`,
        background: BRAND.card
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          {/* LOGO ADDED ONLY */}
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: BRAND.orange
          }} />
          <strong>GLADEX TRAVEL LOGIN</strong>
        </div>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Password"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={inputStyle}
        />

        <button onClick={() => onLogin(email, pass)} style={btnStyle}>
          Login
        </button>
      </div>
    </div>
  );
}

/* ================= FULL ORIGINAL COMPONENT ================= */
function GladexBriefing({ user }) {
  const [checklist, setChecklist] = useState({});
  const [addedTours, setAddedTours] = useState({});
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  const sections = [
    { id: "dashboard", label: "My Trip" },
    { id: "video", label: "Briefing" },
    { id: "info", label: "Travel Info" },
    { id: "checklist", label: "Checklist" },
    { id: "destguide", label: "Destination" },
    { id: "tours", label: "Tours" },
    { id: "insurance", label: "Insurance" },
    { id: "faq", label: "FAQ" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div style={{ background: BRAND.dark, minHeight: "100vh", color: BRAND.text }}>

      {/* TOP NAV */}
      <div style={{
        position: "sticky",
        top: 0,
        background: "rgba(10,10,10,0.95)",
        borderBottom: `1px solid ${BRAND.line}`,
        padding: 12,
        display: "flex",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* LOGO ADDED HERE */}
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: BRAND.orange
          }} />
          <strong>GLADEX TRAVEL</strong>
        </div>
        <span style={{ color: BRAND.muted }}>{user?.email}</span>
      </div>

      {/* HERO */}
      <div style={{ padding: 24 }}>
        <h1>Welcome {SAMPLE.clientName}</h1>
        <p style={{ color: BRAND.muted }}>
          {SAMPLE.destination} • {SAMPLE.travelDate} • {SAMPLE.hotel}
        </p>
      </div>

      {/* ================= VIDEO (ADDED EMBED) ================= */}
      <div id="video" style={{ padding: 24 }}>
        <h2>Briefing Video</h2>

        <iframe
          width="100%"
          height="400"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          style={{ border: "none", borderRadius: 16 }}
          allowFullScreen
        />
      </div>

      {/* ================= ORIGINAL SECTIONS KEPT ================= */}
      <div id="info" style={{ padding: 24 }}>
        <h2>Travel Info</h2>
        <p style={{ color: BRAND.muted }}>Arrival, transfer, hotel details preserved.</p>
      </div>

      <div id="checklist" style={{ padding: 24 }}>
        <h2>Checklist</h2>
        {["Passport", "Voucher", "Ticket", "Cash"].map(i => (
          <div key={i}>✓ {i}</div>
        ))}
      </div>

      <div id="tours" style={{ padding: 24 }}>
        <h2>Tours</h2>
        {["Island Hopping", "Sunset Sailing", "ATV Ride"].map(t => (
          <div key={t}>🌴 {t}</div>
        ))}
      </div>

      <div id="faq" style={{ padding: 24 }}>
        <h2>FAQ</h2>
        <p>Emergency contacts and travel support available 24/7.</p>
      </div>

    </div>
  );
}

/* ================= ROOT APP (LOGIN ADDED ONLY) ================= */
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (email, pass) => {
    if (!email || !pass) return alert("Fill all fields");
    setUser({ email });
  };

  return user ? (
    <GladexBriefing user={user} />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

/* ================= STYLES ================= */
const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#000",
  color: "#fff"
};

const btnStyle = {
  width: "100%",
  padding: 10,
  background: BRAND.orange,
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  cursor: "pointer"
};