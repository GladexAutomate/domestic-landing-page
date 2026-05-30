import { useState, useRef, useEffect } from "react";

/**
 * FOR TESTING ONLY – REFERENCE UI LANG TO
 * This is not production-ready routing.
 */

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

const SAMPLE = {
  clientName: "Maria",
  destination: "Boracay",
  travelDate: "June 15–18, 2026",
  hotel: "Henann Lagoon Resort",
  guests: "4 Adults",
  status: "Confirmed",
  consultant: "Jessa Reyes",
  transferType: "Private Van",
  vehicleProvider: "GDX Transport",
  pickupLocation: "NAIA Terminal 3 — Arrival Hall Exit B",
  transferContact: "+63 917 XXX XXXX",
  estimatedTravelTime: "15 minutes",
  hotelAddress: "Station 1, Balabag, Boracay Island",
  checkIn: "2:00 PM",
  checkOut: "12:00 NN",
  gladexHotline: "+63 917 XXX XXXX",
  tourCoordinator: "+63 918 XXX XXXX",
  hotelContact: "+63 36 XXX XXXX",
};

export default function GladexBriefing() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  const goBackDomestic = () => {
    // CHANGE THIS IF YOU USE REACT ROUTER
    window.location.href = "/domestic";
  };

  const sections = [
    { id: "dashboard", label: "My Trip" },
    { id: "video", label: "Briefing" },
    { id: "info", label: "Travel Info" },
  ];

  return (
    <div style={{ background: BRAND.dark, minHeight: "100vh", color: BRAND.text }}>

      {/* TOP NAV */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.95)",
        borderBottom: `1px solid ${BRAND.line}`,
        backdropFilter: "blur(20px)"
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56
          }}>

            {/* LEFT SIDE: BACK BUTTON */}
            <button
              onClick={goBackDomestic}
              style={{
                background: "transparent",
                border: `1px solid ${BRAND.line}`,
                color: BRAND.text,
                padding: "6px 12px",
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700
              }}
            >
              ← Back (Domestic Page)
            </button>

            <div style={{ fontWeight: 800 }}>
              GLADEX <span style={{ color: BRAND.orange }}>TRAVEL</span>
            </div>

            {/* RIGHT NAV */}
            <div style={{ display: "flex", gap: 8 }}>
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: BRAND.muted,
                    fontSize: 11,
                    cursor: "pointer"
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: 30 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900 }}>
          Welcome, {SAMPLE.clientName}
        </h1>
        <p style={{ color: BRAND.muted }}>
          {SAMPLE.destination} Travel Briefing (TESTING UI ONLY)
        </p>
      </div>

      {/* SAMPLE SECTIONS */}
      <div id="dashboard" style={{ padding: 30 }}>
        <h2>Dashboard</h2>
        <p>Trip: {SAMPLE.destination}</p>
      </div>

      <div id="video" style={{ padding: 30 }}>
        <h2>Briefing Video</h2>
        <p>Placeholder video section</p>
      </div>

      <div id="info" style={{ padding: 30 }}>
        <h2>Travel Info</h2>
        <p>Hotel: {SAMPLE.hotel}</p>
      </div>

    </div>
  );
}