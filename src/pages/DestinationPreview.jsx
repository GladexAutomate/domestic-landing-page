import { useState } from "react";

/* =========================
   YOUR ORIGINAL BRIEFING UI
   ========================= */

function GladexBriefing({ onLogout }) {
  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff", fontFamily: "Poppins" }}>

      {/* TOP BAR */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        background: "#0a0a0a",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "linear-gradient(135deg,#FF8C00,#E07000)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900
          }}>
            G
          </div>
          <strong>GLADEX TRAVEL</strong>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 8,
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* HERO */}
      <div style={{ padding: 20 }}>
        <h1>Welcome, Maria 👋</h1>
        <p style={{ opacity: 0.7 }}>Boracay Travel Briefing is ready</p>

        {/* VIDEO SECTION */}
        <div style={{
          marginTop: 20,
          maxWidth: 320,
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,140,0,0.2)"
        }}>
          <div style={{
            paddingTop: "177%",
            position: "relative",
            background: "#111"
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 10
            }}>
              <div style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(255,140,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26
              }}>
                ▶
              </div>

              <p style={{ fontWeight: 700 }}>Boracay Briefing Video</p>
              <p style={{ fontSize: 12, opacity: 0.6 }}>
                Arrival • Transfer • Hotel • Tours
              </p>
            </div>
          </div>
        </div>

        {/* SIMPLE CONTENT PREVIEW */}
        <div style={{ marginTop: 30 }}>
          <h3>Travel Information</h3>

          <ul style={{ opacity: 0.8, fontSize: 14 }}>
            <li>Arrival Instructions</li>
            <li>Transfer Details</li>
            <li>Hotel Check-in</li>
            <li>Tour Reminders</li>
            <li>Emergency Contacts</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* =========================
        LOGIN SCREEN
   ========================= */

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [form, setForm] = useState({
    gdx: "",
    identity: "",
  });

  const handleLogin = () => {
    if (!form.gdx || !form.identity) {
      alert("Enter GDX + Email/Last Name");
      return;
    }

    // DEMO ONLY LOGIN (no backend)
    setLoggedIn(true);
  };

  if (loggedIn) {
    return <GladexBriefing onLogout={() => setLoggedIn(false)} />;
  }

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "Poppins"
    }}>
      <div style={{
        width: 340,
        padding: 20,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "#111"
      }}>

        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg,#FF8C00,#E07000)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900
          }}>
            G
          </div>
          <strong>GLADEX TRAVEL</strong>
        </div>

        <h3 style={{ marginBottom: 12 }}>Travel Briefing Portal</h3>

        <input
          placeholder="GDX Code"
          value={form.gdx}
          onChange={(e) => setForm({ ...form, gdx: e.target.value })}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "#fff"
          }}
        />

        <input
          placeholder="Email or Last Name"
          value={form.identity}
          onChange={(e) => setForm({ ...form, identity: e.target.value })}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#000",
            color: "#fff"
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#FF8C00,#E07000)",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          Access My Trip
        </button>
      </div>
    </div>
  );
}