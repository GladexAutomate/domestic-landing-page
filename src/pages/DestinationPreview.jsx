import { useState, useRef, useEffect } from "react";

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

const TOURS = [
  {
    id: 1,
    name: "Island Hopping Adventure",
    duration: "4 hours",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80",
    includes: ["Boat Tour", "Snorkeling", "Local Guide", "Life Vest"],
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Sunset Sailing",
    duration: "2 hours",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80",
    includes: ["Sail Boat", "Drinks", "Photo Ops"],
    tag: "Romantic",
  },
  {
    id: 3,
    name: "Helmet Diving",
    duration: "1 hour",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    includes: ["Equipment", "Guide", "Photos"],
    tag: "Adventure",
  },
  {
    id: 4,
    name: "ATV Beach Ride",
    duration: "1.5 hours",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    includes: ["ATV", "Helmet", "Guide", "Scenic Route"],
    tag: "Thrilling",
  },
];

const INSURANCE = [
  { id: "basic", label: "Basic", features: ["Medical Emergency", "Trip Cancellation"], recommended: false },
  { id: "standard", label: "Standard", features: ["Medical Emergency", "Trip Cancellation", "Lost Baggage", "Flight Delay"], recommended: true },
  { id: "premium", label: "Premium", features: ["All Standard Benefits", "24/7 Assistance", "Evacuation Cover", "Adventure Sports"], recommended: false },
];

const FAQS = [
  { q: "What if my flight is delayed?", a: "Contact our Gladex Hotline immediately. Our ground team will coordinate your updated arrival and adjust transfer arrangements accordingly." },
  { q: "What time is hotel check-in?", a: `Standard check-in is at 2:00 PM. Early check-in is subject to availability — you may request upon arrival. Check-out is at 12:00 NN.` },
  { q: "What if it rains?", a: "Some outdoor tours may be rescheduled or modified for safety. Our coordinator will advise you on alternatives. Always bring a light raincoat." },
  { q: "Can I add optional tours on-site?", a: "Yes, you may add tours through this portal before departure. On-site availability cannot be guaranteed, and rates may differ." },
  { q: "Who do I contact during emergencies?", a: "Use the Emergency Assistance button in the Emergency Contacts section. Our Gladex Hotline is available 24/7 during your travel dates." },
];

const CHECKLIST_ITEMS = [
  { id: "id", label: "Valid ID / Passport" },
  { id: "voucher", label: "Travel Voucher" },
  { id: "flight", label: "Flight Ticket" },
  { id: "hotel", label: "Hotel Voucher" },
  { id: "cash", label: "Cash & Credit Card" },
  { id: "power", label: "Powerbank & Charger" },
  { id: "data", label: "Mobile Data / SIM" },
  { id: "meds", label: "Medicines" },
  { id: "sun", label: "Sunscreen" },
  { id: "clothes", label: "Appropriate Clothing" },
];

const OUTFITS = [
  { label: "Airport Outfit", desc: "Comfortable, breathable — joggers, sneakers, light jacket", icon: "✈️" },
  { label: "Tour Outfit", desc: "Athletic shorts, rash guard, aqua shoes, hat", icon: "🚤" },
  { label: "Beach Outfit", desc: "Swimwear, cover-up, slippers, sunglasses", icon: "🏖️" },
  { label: "Dinner Outfit", desc: "Smart casual — linen tops, sandals, light dress", icon: "🍽️" },
  { label: "Photo Spot", desc: "Bright colors pop — sundresses, linen sets work great", icon: "📸" },
];

const DEST_GUIDE = [
  { icon: "📍", title: "Best Places to Visit", items: ["White Beach Station 1-3", "Puka Shell Beach", "Crystal Cove Island", "Diniwid Beach"] },
  { icon: "🍜", title: "Must-Try Food", items: ["Halo-halo at D'Talipapa", "Fresh seafood BBQ", "Mango shake", "Batchoy noodles"] },
  { icon: "📸", title: "Best Photo Spots", items: ["Station 1 at sunrise", "Willy's Rock at low tide", "Ilig-Iligan viewpoint", "Crystal Cove cliffs"] },
  { icon: "💡", title: "Local Tips", items: ["Haggle at D'Talipapa market", "Cash is king at beach vendors", "Avoid midday sun 11am–2pm", "White Beach faces the sunset"] },
];

function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ height: 1, width: 36, background: `linear-gradient(90deg, transparent, ${BRAND.orange})` }} />
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.4em", color: BRAND.orange, textTransform: "uppercase" }}>{text}</span>
      <div style={{ height: 1, width: 36, background: `linear-gradient(90deg, ${BRAND.orange}, transparent)` }} />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${BRAND.line}` }}>
      <span style={{ fontSize: 12, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 13, color: BRAND.text, fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{value}</span>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: BRAND.card, border: `1px solid ${BRAND.cardBorder}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

function OrangeDivider() {
  return <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${BRAND.orange}, transparent)`, margin: "40px 0" }} />;
}

function StatusBadge({ label, color = BRAND.orange }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${color}18`, color, border: `1px solid ${color}30`, borderRadius: 99, fontSize: 11, fontWeight: 700, padding: "4px 12px", letterSpacing: "0.06em" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

export default function GladexBriefing() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("gladex_authenticated") === "true";
  });
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("gladex_user_name") || "";
  });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Existing Component States
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
    { id: "tours", label: "Optional Tours" },
    { id: "insurance", label: "Insurance" },
    { id: "faq", label: "FAQs" },
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  // DEMO LOGIN CHECKER
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Tinitingnan kung may 'gdx' sa password kahit magkakaiba ang casing
    const containsGDX = password.toLowerCase().includes("gdx");

    if (username.trim() !== "" && containsGDX) {
      setIsAuthenticated(true);
      localStorage.setItem("gladex_authenticated", "true");
      localStorage.setItem("gladex_user_name", username.trim());
      setError("");
    } else {
      setError("Mali ang Code! Siguraduhing may text na 'GDX' (e.g., GDX2026)");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("gladex_authenticated");
    localStorage.removeItem("gladex_user_name");
    setUsername("");
    setPassword("");
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalAdded = Object.keys(addedTours).length;
  
  // Dynamic replacement para magamit ang pinasok na demo name
  const displayName = username || SAMPLE.clientName;

  // 🛡️ SECURITY WALL: KUNG HINDI PARIN AUTHENTICATED, LOGIN FORM LANG ANG IPAPAKITA NG RETURN NA ITO.
  // MAPIPIGILAN DITO ANG PAGBASA AT PAG-LOAD NG BUONG MAIN CODE DETAILS SA IBABA.
  if (!isAuthenticated) {
    return (
      <div style={{ background: BRAND.dark, minHeight: "100vh", fontFamily: "'Poppins', 'Segoe UI', sans-serif", color: BRAND.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
        `}</style>
        <div style={{ width: "100%", maxWidth: 400, background: BRAND.card, border: `1px solid ${BRAND.cardBorder}`, borderRadius: 20, padding: 32, boxShadow: `0 0 60px ${BRAND.orangeGlow}` }}>
          
          {/* Logo Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>G</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: BRAND.text }}>GLADEX <span style={{ color: BRAND.orange }}>TRAVEL</span></span>
          </div>
          
          <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Client Portal Login</h2>
          <p style={{ fontSize: 12, color: BRAND.muted, textAlign: "center", marginBottom: 24 }}>Mangyaring mag-login muna para makita ang iyong travel details</p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Full Name</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Kahit anong pangalan (e.g. Juan)" required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: BRAND.dark2, border: `1px solid ${BRAND.line}`, color: BRAND.text, fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = BRAND.orange}
                onBlur={(e) => e.target.style.borderColor = BRAND.line}
              />
            </div>
            
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>GDX Booking Code</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Kahit anong code na may 'GDX' (e.g. GDX111)" required
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, background: BRAND.dark2, border: `1px solid ${BRAND.line}`, color: BRAND.text, fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => e.target.style.borderColor = BRAND.orange}
                onBlur={(e) => e.target.style.borderColor = BRAND.line}
              />
            </div>

            {error && (
              <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center", margin: "4px 0 0" }}>⚠️ {error}</p>
            )}

            <button type="submit"
              style={{ width: "100%", marginTop: 8, padding: "12px 16px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDeep})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}>
              Access Dashboard
            </button>
          </form>
          
          {/* Instructions Box */}
          <div style={{ marginTop: 24, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${BRAND.line}` }}>
            <p style={{ fontSize: 10, color: BRAND.muted, textAlign: "center", marginBottom: 4 }}>💡 Paano pumasok sa Demo:</p>
            <p style={{ fontSize: 11, color: BRAND.text, textAlign: "center", fontWeight: 500, lineHeight: 1.4 }}>
              Ilagay ang iyong pangalan at mag-imbento ng code na may salitang <span style={{ color: BRAND.orange }}>GDX</span> (Halimbawa: <span style={{ color: BRAND.orange }}>GDX-DEMO</span>) para ma-redirect ka sa main page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 🔓 MAIN UI SECTION: Eto naman ang maglo-load kapag tapos na at tama ang pag-login.
  return (
    <div style={{ background: BRAND.dark, minHeight: "100vh", fontFamily: "'Poppins', 'Segoe UI', sans-serif", color: BRAND.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .tour-card:hover .tour-img { transform: scale(1.05); }
        .tour-card:hover { border-color: rgba(255,140,0,0.3) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .nav-btn.active { color: ${BRAND.orange} !important; border-bottom-color: ${BRAND.orange} !important; }
        .faq-item:hover { border-color: rgba(255,140,0,0.2) !important; }
        .check-item:hover { background: rgba(255,255,255,0.04) !important; }
        .ins-card:hover { border-color: rgba(255,140,0,0.25) !important; }
        .add-btn:hover { background: rgba(255,140,0,0.15) !important; }
      `}</style>

      {/* TOP NAV WITH LOGOUT */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between", height: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDeep})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>G</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.03em", color: BRAND.text }}>GLADEX <span style={{ color: BRAND.orange }}>TRAVEL</span></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, overflowX: "auto" }}>
              {sections.map(s => (
                <button key={s.id} className={`nav-btn ${activeSection === s.id ? "active" : ""}`} onClick={() => scrollTo(s.id)}
                  style={{ background: "none", border: "none", borderBottom: "2px solid transparent", padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: BRAND.muted, letterSpacing: "0.04em", textTransform: "uppercase", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  {s.label}
                </button>
              ))}
              <button onClick={handleLogout}
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BRAND.line}`, borderRadius: 6, padding: "4px 10px", marginLeft: 8, cursor: "pointer", fontSize: 10, fontWeight: 700, color: "#ef4444", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.dark2} 0%, #0d0800 100%)`, borderBottom: `1px solid ${BRAND.line}`, padding: "36px 16px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionLabel text="Your Trip is Confirmed" />
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 12 }}>
            Welcome back, <span style={{ color: BRAND.orange }}>{displayName}!</span>
          </h1>
          <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 520 }}>
            Your <strong style={{ color: BRAND.text }}>{SAMPLE.destination}</strong> travel briefing is ready. Watch the destination video, review your travel details, and explore optional add-ons below.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <StatusBadge label="✓ Booking Confirmed" color="#22c55e" />
            <StatusBadge label={`✈ ${SAMPLE.travelDate}`} />
            <StatusBadge label={`🏨 ${SAMPLE.hotel}`} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px 80px" }}>

        {/* SECTION: DASHBOARD DETAILS */}
        <div id="dashboard" style={{ animation: "fadeUp 0.6s ease both" }}>
          <SectionLabel text="Personalized Travel Dashboard" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Hi {displayName}! Your {SAMPLE.destination} Trip Details
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            <Card>
              <p style={{ fontSize: 10, fontWeight: 700, color: BRAND.orange, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Booking Summary</p>
              <InfoRow label="Destination" value={SAMPLE.destination} />
              <InfoRow label="Travel Date" value={SAMPLE.travelDate} />
              <InfoRow label="Hotel" value={SAMPLE.hotel} />
              <InfoRow label="Guests" value={SAMPLE.guests} />
              <InfoRow label="Status" value={<StatusBadge label={SAMPLE.status} color="#22c55e" />} />
            </Card>
            <Card>
              <p style={{ fontSize: 10, fontWeight: 700, color: BRAND.orange, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Trip Actions</p>
              <p style={{ fontSize: 12, color: BRAND.muted, marginBottom: 20, lineHeight: 1.6 }}>
                Download your travel documents and get in touch with your assigned consultant.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "⬇ Download Voucher", primary: true },
                  { label: "⬇ Download Itinerary", primary: true },
                  { label: "📞 Contact Support", primary: false },
                ].map(btn => (
                  <button key={btn.label}
                    style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: `1px solid ${btn.primary ? BRAND.orange : BRAND.line}`, background: btn.primary ? `rgba(255,140,0,0.1)` : "transparent", color: btn.primary ? BRAND.orange : BRAND.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em", transition: "all 0.2s" }}>
                    {btn.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${BRAND.line}` }}>
                <p style={{ fontSize: 10, color: BRAND.muted, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Assigned Consultant</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{SAMPLE.consultant}</p>
              </div>
            </Card>
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: TRAVEL BRIEFING VIDEO */}
        <div id="video">
          <SectionLabel text="Destination Briefing" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            {SAMPLE.destination} Travel Briefing Video
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
            Watch your complete orientation before departure. Covers arrival, transfers, hotel check-in, tour reminders, and emergency contacts.
          </p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: "100%", maxWidth: 340, borderRadius: 20, overflow: "hidden", border: `1px solid ${BRAND.cardBorder}`, background: BRAND.card, boxShadow: `0 0 60px rgba(255,140,0,0.08)`, position: "relative" }}>
              <div style={{ paddingTop: "177.78%", position: "relative", background: `linear-gradient(180deg, #0d0d0d 0%, #1a0f00 100%)` }}>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: `rgba(255,140,0,0.15)`, border: `2px solid rgba(255,140,0,0.4)`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                    <span style={{ fontSize: 28, marginLeft: 4 }}>▶</span>
                  </div>
                  <div style={{ textAlign: "center", padding: "0 24px" }}>
                    <p style={{ fontSize: 16, fontWeight: 800, fontStyle: "italic", marginBottom: 6 }}>Boracay Briefing</p>
                    <p style={{ fontSize: 11, color: BRAND.muted }}>Destination orientation video</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: TRAVEL INFORMATION CENTER */}
        <div id="info">
          <SectionLabel text="Travel Information Center" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Everything You Need to Know
          </h2>
          <div style={{ display: "grid", gap: 16 }}>
            {/* Arrival */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈️</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Arrival Instructions</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Before Departure", items: ["Arrive at airport 2–3 hours early", "Prepare all travel documents", "Save digital copies of vouchers"] },
                  { label: "Upon Arrival", items: ["Follow airport arrival signs", "Collect baggage at carousel", "Proceed per transfer instructions"] },
                ].map(col => (
                  <div key={col.label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: BRAND.orange, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{col.label}</p>
                    {col.items.map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: BRAND.orange, fontSize: 12, flexShrink: 0 }}>→</span>
                        <p style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.5 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* Transfers */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚐</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Transfer Instructions</p>
              </div>
              <InfoRow label="Transfer Type" value={SAMPLE.transferType} />
              <InfoRow label="Vehicle Provider" value={SAMPLE.vehicleProvider} />
              <InfoRow label="Pick-up Location" value={SAMPLE.pickupLocation} />
              <InfoRow label="Contact Number" value={SAMPLE.transferContact} />
              <InfoRow label="Est. Travel Time" value={SAMPLE.estimatedTravelTime} />
            </Card>

            {/* Hotel */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏨</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Hotel Check-in Information</p>
              </div>
              <InfoRow label="Hotel" value={SAMPLE.hotel} />
              <InfoRow label="Address" value={SAMPLE.hotelAddress} />
              <InfoRow label="Check-in Time" value={SAMPLE.checkIn} />
              <InfoRow label="Check-out Time" value={SAMPLE.checkOut} />
            </Card>

            {/* Emergency Contacts */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(239,68,68,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🚨</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Emergency Contacts</p>
              </div>
              {[
                { label: "Gladex Hotline", value: SAMPLE.gladexHotline },
                { label: "Tour Coordinator", value: SAMPLE.tourCoordinator },
                { label: "Hotel Contact", value: SAMPLE.hotelContact },
              ].map(c => <InfoRow key={c.label} label={c.label} value={c.value} />)}
            </Card>
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: CHECKLIST */}
        <div id="checklist">
          <SectionLabel text="Travel Readiness Checklist" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>Are You Ready to Go?</h2>
          <p style={{ color: BRAND.muted, fontSize: 13, marginBottom: 24 }}><span style={{ color: BRAND.orange, fontWeight: 600 }}>{checkedCount}/{CHECKLIST_ITEMS.length} completed</span></p>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 4 }}>
              {CHECKLIST_ITEMS.map(item => (
                <div key={item.id} className="check-item" onClick={() => setChecklist(p => ({ ...p, [item.id]: !p[item.id] }))}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checklist[item.id] ? BRAND.orange : BRAND.line}`, background: checklist[item.id] ? BRAND.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {checklist[item.id] && <span style={{ fontSize: 10, color: "#000", fontWeight: 900 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: checklist[item.id] ? BRAND.text : BRAND.muted, textDecoration: checklist[item.id] ? "line-through opacity(0.5)" : "none" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <OrangeDivider />

        {/* SECTION: TOURS */}
        <div id="tours">
          <SectionLabel text="Optional Add-ons" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>Explore Optional Tours</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {TOURS.map((tour) => {
              const isAdded = !!addedTours[tour.id];
              return (
                <div key={tour.id} className="tour-card" style={{ background: BRAND.card, border: `1px solid ${isAdded ? BRAND.orange + "40" : BRAND.cardBorder}`, borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 160, position: "relative" }}>
                    <img src={tour.image} alt={tour.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: 20, flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{tour.name}</h4>
                    <button onClick={() => setAddedTours(p => ({ ...p, [tour.id]: !p[tour.id] }))}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${isAdded ? BRAND.orange : BRAND.line}`, background: isAdded ? BRAND.orangeGlow : "transparent", color: isAdded ? BRAND.orange : BRAND.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {isAdded ? "✓ Added to Inquiry" : "+ Add to Trip Inquiry"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: FAQS */}
        <div id="faq">
          <SectionLabel text="FAQ Center" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="faq-item" style={{ background: BRAND.card, border: `1px solid ${isOpen ? "rgba(255,140,0,0.15)" : BRAND.cardBorder}`, borderRadius: 12, overflow: "hidden" }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{ width: "100%", padding: "16px 20px", background: "transparent", border: "none", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: BRAND.text }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{faq.q}</span>
                    <span>▼</span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BRAND.line}`, background: "rgba(255,255,255,0.01)" }}>
                      <p style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.6, paddingTop: 12 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}