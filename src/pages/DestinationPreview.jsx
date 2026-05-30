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
  { q: "What time is hotel check-in?", a: `Standard check-in is at ${SAMPLE.checkIn}. Early check-in is subject to availability — you may request upon arrival. Check-out is at ${SAMPLE.checkOut}.` },
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

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  const totalAdded = Object.keys(addedTours).length;

  return (
    <div style={{ background: BRAND.dark, minHeight: "100vh", fontFamily: "'Poppins', 'Segoe UI', sans-serif", color: BRAND.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #111; } ::-webkit-scrollbar-thumb { background: #333; border-radius: 99px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .tour-card:hover .tour-img { transform: scale(1.05); }
        .tour-card:hover { border-color: rgba(255,140,0,0.3) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .nav-btn.active { color: ${BRAND.orange} !important; border-bottom-color: ${BRAND.orange} !important; }
        .faq-item:hover { border-color: rgba(255,140,0,0.2) !important; }
        .check-item:hover { background: rgba(255,255,255,0.04) !important; }
        .ins-card:hover { border-color: rgba(255,140,0,0.25) !important; }
        .add-btn:hover { background: rgba(255,140,0,0.15) !important; }
      `}</style>

      {/* TOP NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
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
            </div>
          </div>
        </div>
      </div>

      {/* HERO BANNER */}
      <div style={{ background: `linear-gradient(135deg, ${BRAND.dark2} 0%, #0d0800 100%)`, borderBottom: `1px solid ${BRAND.line}`, padding: "36px 16px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionLabel text="Your Trip is Confirmed" />
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 12 }}>
            Welcome back, <span style={{ color: BRAND.orange }}>{SAMPLE.clientName}!</span>
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

        {/* SECTION: PERSONALIZED DASHBOARD */}
        <div id="dashboard" style={{ animation: "fadeUp 0.6s ease both" }}>
          <SectionLabel text="Personalized Travel Dashboard" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Hi {SAMPLE.clientName}! Your {SAMPLE.destination} Trip Details
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

          {/* Portrait video player */}
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
                  <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
                    <p style={{ fontSize: 10, color: BRAND.muted2, textAlign: "center", letterSpacing: "0.06em", textTransform: "uppercase" }}>Paste your video embed URL here</p>
                    <div style={{ height: 1, background: BRAND.line, marginTop: 12 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                      {["Arrival", "Transfer", "Hotel", "Tours", "Emergency"].map(t => (
                        <span key={t} style={{ fontSize: 8, color: BRAND.muted2, textAlign: "center" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: BRAND.muted2 }}>Portrait orientation · Full briefing included</p>
        </div>

        <OrangeDivider />

        {/* SECTION: TRAVEL INFORMATION CENTER */}
        <div id="info">
          <SectionLabel text="Travel Information Center" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Everything You Need to Know
          </h2>
          <div style={{ display: "grid", gap: 16 }}>

            {/* Arrival Instructions */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✈️</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Arrival Instructions</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Before Departure", items: ["Arrive at airport 2–3 hours early", "Prepare all travel documents", "Save digital copies of vouchers"] },
                  { label: "Upon Arrival", items: ["Follow airport arrival signs", "Collect baggage at carousel", "Proceed per transfer instructions", "Keep mobile available for updates"] },
                ].map(col => (
                  <div key={col.label}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: BRAND.orange, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>{col.label}</p>
                    {col.items.map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ color: BRAND.orange, fontSize: 12, flexShrink: 0, marginTop: 1 }}>→</span>
                        <p style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.5 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* Transfer Instructions */}
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
              <div style={{ marginTop: 16, padding: 14, background: "rgba(255,140,0,0.05)", borderRadius: 10, border: `1px solid rgba(255,140,0,0.15)` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.orange, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Reminders</p>
                {["Follow transfer coordinator instructions", "Be ready at designated pick-up area 10 min early", "Notify support immediately if delayed"].map(r => (
                  <p key={r} style={{ fontSize: 12, color: BRAND.muted, marginBottom: 4, display: "flex", gap: 6 }}><span style={{ color: BRAND.orange }}>·</span>{r}</p>
                ))}
              </div>
            </Card>

            {/* Hotel Check-in */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏨</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Hotel Check-in Information</p>
              </div>
              <InfoRow label="Hotel" value={SAMPLE.hotel} />
              <InfoRow label="Address" value={SAMPLE.hotelAddress} />
              <InfoRow label="Check-in Time" value={SAMPLE.checkIn} />
              <InfoRow label="Check-out Time" value={SAMPLE.checkOut} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${BRAND.line}` }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: BRAND.orange, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Requirements</p>
                  {["Valid ID / Passport", "Hotel Voucher", "Security Deposit (if any)"].map(r => (
                    <p key={r} style={{ fontSize: 11, color: BRAND.muted, marginBottom: 4 }}>✓ {r}</p>
                  ))}
                </div>
                <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${BRAND.line}` }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: BRAND.orange, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Notes</p>
                  {["Early check-in subject to availability", "Security deposits may be required", "Keep voucher accessible"].map(n => (
                    <p key={n} style={{ fontSize: 11, color: BRAND.muted, marginBottom: 4 }}>· {n}</p>
                  ))}
                </div>
              </div>
            </Card>

            {/* Tour Reminders */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🗺️</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Tour Reminders</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Before the Tour", items: ["Arrive 15 minutes early", "Wear comfortable clothing", "Bring water and sun protection", "Charge all mobile devices"] },
                  { label: "During the Tour", items: ["Follow guide instructions at all times", "Observe all local regulations", "Secure personal belongings", "Stay with your group"] },
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
                { label: "Transfer Provider", value: SAMPLE.transferContact },
              ].map(c => <InfoRow key={c.label} label={c.label} value={c.value} />)}
              <button style={{ width: "100%", marginTop: 16, padding: "13px 16px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.04em" }}>
                🆘 Emergency Assistance
              </button>
            </Card>

            {/* Do's and Don'ts */}
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(255,140,0,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📋</div>
                <p style={{ fontWeight: 800, fontSize: 15 }}>Important Do's & Don'ts</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>✅ Do's</p>
                  {["Keep travel documents secure", "Follow all local regulations", "Arrive on time to all activities", "Stay hydrated throughout the trip", "Save all emergency contacts"].map(d => (
                    <div key={d} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                      <span style={{ color: "#22c55e", fontSize: 14, flexShrink: 0 }}>✓</span>
                      <p style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.5 }}>{d}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>❌ Don'ts</p>
                  {["Leave valuables unattended", "Miss transfer schedules", "Bring prohibited items on tours", "Ignore safety instructions", "Use unauthorized tour providers"].map(d => (
                    <div key={d} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                      <span style={{ color: "#ef4444", fontSize: 14, flexShrink: 0 }}>✗</span>
                      <p style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.5 }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: TRAVEL READINESS CHECKLIST */}
        <div id="checklist">
          <SectionLabel text="Travel Readiness Checklist" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Are You Ready to Go?
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 13, marginBottom: 24 }}>
            Check off each item before your departure day. <span style={{ color: BRAND.orange, fontWeight: 600 }}>{checkedCount}/{CHECKLIST_ITEMS.length} completed</span>
          </p>
          <div style={{ height: 4, borderRadius: 99, background: BRAND.line, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%`, background: `linear-gradient(90deg, ${BRAND.orange}, #FF6B00)`, borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 4 }}>
              {CHECKLIST_ITEMS.map(item => (
                <div key={item.id} className="check-item" onClick={() => setChecklist(p => ({ ...p, [item.id]: !p[item.id] }))}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s", userSelect: "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checklist[item.id] ? BRAND.orange : BRAND.line}`, background: checklist[item.id] ? BRAND.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
                    {checklist[item.id] && <span style={{ fontSize: 10, color: "#000", fontWeight: 900 }}>✓</span>}
                  </div>
                  <p style={{ fontSize: 12, color: checklist[item.id] ? BRAND.muted : BRAND.text, textDecoration: checklist[item.id] ? "line-through" : "none", transition: "all 0.2s" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* What to Bring */}
          <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 32, marginBottom: 16 }}>What to Bring</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              { label: "Documents", icon: "📄", items: ["Passport / Valid ID", "Travel Voucher", "Flight Ticket", "Insurance Certificate"] },
              { label: "Essentials", icon: "💳", items: ["Cash & Credit Card", "Powerbank & Charger", "Medicines", "Mobile Data"] },
              { label: "Destination Specific", icon: "🏖️", items: ["Beachwear & Slippers", "Sunscreen SPF 50+", "Waterproof Bag", "Light Jacket"] },
            ].map(cat => (
              <Card key={cat.label} style={{ padding: 18 }}>
                <p style={{ fontSize: 18, marginBottom: 8 }}>{cat.icon}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: BRAND.orange, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>{cat.label}</p>
                {cat.items.map(i => <p key={i} style={{ fontSize: 12, color: BRAND.muted, marginBottom: 5 }}>· {i}</p>)}
              </Card>
            ))}
          </div>

          {/* Outfit Guide */}
          <h3 style={{ fontSize: 16, fontWeight: 800, marginTop: 32, marginBottom: 16 }}>Outfit Guide</h3>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {OUTFITS.map(o => (
              <div key={o.label} style={{ minWidth: 150, padding: 16, borderRadius: 14, background: BRAND.card, border: `1px solid ${BRAND.cardBorder}`, flexShrink: 0 }}>
                <span style={{ fontSize: 24 }}>{o.icon}</span>
                <p style={{ fontSize: 12, fontWeight: 700, marginTop: 8, marginBottom: 6 }}>{o.label}</p>
                <p style={{ fontSize: 11, color: BRAND.muted, lineHeight: 1.5 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: DESTINATION GUIDE */}
        <div id="destguide">
          <SectionLabel text="Destination Guide" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Discover {SAMPLE.destination}
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 13, marginBottom: 24 }}>Local knowledge curated by the Gladex team.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
            {DEST_GUIDE.map(g => (
              <Card key={g.title} style={{ padding: 18 }}>
                <p style={{ fontSize: 20, marginBottom: 8 }}>{g.icon}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: BRAND.orange, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>{g.title}</p>
                {g.items.map(i => <p key={i} style={{ fontSize: 12, color: BRAND.muted, marginBottom: 5 }}>· {i}</p>)}
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { icon: "🌤️", label: "Weather", desc: "April–June: Hot, 30–34°C. Occasional afternoon rain. Light breathable clothing recommended." },
              { icon: "💱", label: "Currency", desc: "Philippine Peso (PHP). USD exchange available. Bring small bills for beach vendors." },
              { icon: "🛡️", label: "Safety Tips", desc: "Keep valuables in hotel safe. Watch your bags on the beach. Avoid unlicensed tour operators." },
            ].map(t => (
              <div key={t.label} style={{ padding: 16, borderRadius: 14, background: "rgba(255,140,0,0.05)", border: `1px solid rgba(255,140,0,0.12)` }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{t.label}</p>
                <p style={{ fontSize: 11, color: BRAND.muted, lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: OPTIONAL TOURS */}
        <div id="tours">
          <SectionLabel text="Optional Tours" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Enhance Your Experience
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 13, marginBottom: 24 }}>
            Curated optional activities for your trip. Add before departure for seamless coordination.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {TOURS.map(tour => (
              <div key={tour.id} className="tour-card"
                style={{ borderRadius: 16, overflow: "hidden", background: BRAND.card, border: `1px solid ${BRAND.cardBorder}`, transition: "border-color 0.2s", cursor: "default" }}>
                <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                  <img src={tour.image} alt={tour.name} className="tour-img"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", top: 10, left: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: BRAND.orange, color: "#000", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.04em" }}>{tour.tag}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 10, right: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", background: "rgba(0,0,0,0.5)", padding: "3px 10px", borderRadius: 99, backdropFilter: "blur(8px)" }}>⏱ {tour.duration}</span>
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>{tour.name}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                    {tour.includes.map(inc => (
                      <span key={inc} style={{ fontSize: 10, color: BRAND.muted, background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: 99, border: `1px solid ${BRAND.line}` }}>✓ {inc}</span>
                    ))}
                  </div>
                  <button className="add-btn" onClick={() => setAddedTours(p => ({ ...p, [tour.id]: !p[tour.id] }))}
                    style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid ${addedTours[tour.id] ? "#22c55e" : BRAND.orange}`, background: addedTours[tour.id] ? "rgba(34,197,94,0.08)" : "rgba(255,140,0,0.08)", color: addedTours[tour.id] ? "#22c55e" : BRAND.orange, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                    {addedTours[tour.id] ? "✓ Added to Trip" : "+ Add to Trip"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalAdded > 0 && (
            <div style={{ marginTop: 20, padding: "14px 20px", borderRadius: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 13, color: "#22c55e", fontWeight: 600 }}>✓ {totalAdded} tour{totalAdded > 1 ? "s" : ""} added to your trip</p>
              <button style={{ fontSize: 11, color: "#22c55e", background: "none", border: "1px solid rgba(34,197,94,0.3)", padding: "5px 12px", borderRadius: 99, cursor: "pointer", fontWeight: 700 }}>View Cart</button>
            </div>
          )}
        </div>

        <OrangeDivider />

        {/* SECTION: TRAVEL INSURANCE */}
        <div id="insurance">
          <SectionLabel text="Travel Insurance Add-On" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Protect Your Trip Before You Go
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 24, maxWidth: 560 }}>
            Travel insurance is optional but highly recommended. Select a plan that fits your needs.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 20 }}>
            {INSURANCE.map(plan => (
              <div key={plan.id} className="ins-card" onClick={() => setSelectedInsurance(selectedInsurance === plan.id ? null : plan.id)}
                style={{ padding: 20, borderRadius: 16, border: `1.5px solid ${selectedInsurance === plan.id ? BRAND.orange : BRAND.cardBorder}`, background: selectedInsurance === plan.id ? "rgba(255,140,0,0.06)" : BRAND.card, cursor: "pointer", transition: "all 0.2s", position: "relative" }}>
                {plan.recommended && (
                  <div style={{ position: "absolute", top: -1, right: 16, background: BRAND.orange, color: "#000", fontSize: 9, fontWeight: 900, padding: "3px 10px", borderRadius: "0 0 8px 8px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Recommended</div>
                )}
                <p style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{plan.label}</p>
                <p style={{ fontSize: 10, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Travel Insurance</p>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <span style={{ color: BRAND.orange, fontSize: 12 }}>✓</span>
                    <p style={{ fontSize: 11, color: BRAND.muted, lineHeight: 1.4 }}>{f}</p>
                  </div>
                ))}
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${BRAND.line}` }}>
                  <div style={{ height: 16, width: 16, borderRadius: "50%", border: `2px solid ${selectedInsurance === plan.id ? BRAND.orange : BRAND.line}`, background: selectedInsurance === plan.id ? BRAND.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {selectedInsurance === plan.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#000" }} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedInsurance && (
            <div style={{ padding: "14px 20px", borderRadius: 12, background: "rgba(255,140,0,0.08)", border: "1px solid rgba(255,140,0,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 13, color: BRAND.orange, fontWeight: 600 }}>
                ✓ {INSURANCE.find(p => p.id === selectedInsurance)?.label} plan selected
              </p>
              <button style={{ fontSize: 11, color: BRAND.orange, background: "none", border: "1px solid rgba(255,140,0,0.3)", padding: "5px 12px", borderRadius: 99, cursor: "pointer", fontWeight: 700 }}>Add to Cart</button>
            </div>
          )}
          <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${BRAND.line}` }}>
            <p style={{ fontSize: 11, color: BRAND.muted, lineHeight: 1.7 }}>
              Travel insurance covers: <span style={{ color: BRAND.text }}>Medical Emergencies · Trip Delays · Lost Baggage · Flight Interruptions · Unexpected Incidents</span>
            </p>
          </div>
        </div>

        <OrangeDivider />

        {/* SECTION: FAQs */}
        <div id="faq">
          <SectionLabel text="Frequently Asked Questions" />
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 24 }}>
            Got Questions?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ borderRadius: 14, border: `1px solid ${openFaq === i ? "rgba(255,140,0,0.25)" : BRAND.cardBorder}`, background: BRAND.card, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s" }}>
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{faq.q}</p>
                  <span style={{ fontSize: 16, color: BRAND.orange, transition: "transform 0.25s", transform: openFaq === i ? "rotate(45deg)" : "none", flexShrink: 0 }}>+</span>
                </div>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${BRAND.line}` }}>
                    <p style={{ fontSize: 12, color: BRAND.muted, lineHeight: 1.8, paddingTop: 12 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <OrangeDivider />

        {/* FOOTER CTA */}
        <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
          <SectionLabel text="All Set?" />
          <h2 style={{ fontSize: "clamp(1.4rem, 4vw, 2.4rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", marginBottom: 12 }}>
            Have an Amazing Trip! 🌴
          </h2>
          <p style={{ color: BRAND.muted, fontSize: 13, lineHeight: 1.7, maxWidth: 440, margin: "0 auto 28px" }}>
            Your Gladex team is always a message away. Safe travels and enjoy your {SAMPLE.destination} adventure!
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "12px 28px", borderRadius: 99, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeDeep})`, color: "#fff", fontSize: 12, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              📞 Contact Consultant
            </button>
            <button style={{ padding: "12px 28px", borderRadius: 99, background: "transparent", color: BRAND.orange, fontSize: 12, fontWeight: 800, border: `1px solid rgba(255,140,0,0.4)`, cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              ⭐ Rate My Service
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}