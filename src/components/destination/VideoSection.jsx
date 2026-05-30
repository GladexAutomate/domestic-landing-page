// ─────────────────────────────────────────────────────────────────────────────
// TravelBriefingSection.jsx
// GLADEX Travel Briefing Landing Page — Phase 1
// Covers: Travel Reminders, Transfer Instructions, Hotel Check-In, Tour Reminders,
//         Emergency Contacts, Do's & Don'ts, Travel Readiness Checklist,
//         What To Bring, Outfit Guide, Destination Guide, Optional Tours,
//         Travel Insurance Add-On, Checkout Section, FAQs
//
// USAGE:
//   <TravelBriefingSection destination={destination} darkMode={darkMode} />
//
// BLANKS TO FILL (marked with ░░ TODO ░░):
//   - Transfer details (vehicle, provider, pickup, contact, ETA)
//   - Hotel details (name, address, check-in/out time)
//   - Emergency contacts (hotline, coordinator, hotel, transfer)
//   - Optional tours array
//   - Destination guide content (places, food, photo spots, tips)
//   - Outfit guide images
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";

// ░░ TODO ░░ — Replace with real data from admin / Fusioo API (Phase 2)
const PLACEHOLDER = {
  transfer: {
    type: "░░ Transfer Type (e.g. Shared Van) ░░",
    provider: "░░ Vehicle Provider ░░",
    pickup: "░░ Pick-Up Location ░░",
    contact: "░░ Contact Number ░░",
    eta: "░░ Estimated Travel Time ░░",
  },
  hotel: {
    name: "░░ Hotel Name ░░",
    address: "░░ Hotel Address ░░",
    checkIn: "░░ Check-In Time ░░",
    checkOut: "░░ Check-Out Time ░░",
  },
  emergency: {
    hotline: "░░ Gladex Hotline ░░",
    coordinator: "░░ Tour Coordinator ░░",
    hotelContact: "░░ Hotel Contact Number ░░",
    transfer: "░░ Transfer Provider Contact ░░",
  },
  // ░░ TODO ░░ — Add real tour data per destination
  tours: [
    {
      id: 1,
      name: "░░ Tour Name ░░",
      price: "░░ ₱0 per person ░░",
      duration: "░░ Duration ░░",
      inclusions: ["░░ Inclusion 1 ░░", "░░ Inclusion 2 ░░", "░░ Inclusion 3 ░░"],
      dates: "░░ Available Dates ░░",
      emoji: "🏝️",
    },
  ],
  // ░░ TODO ░░ — Add real destination guide content
  destinationGuide: {
    places: ["░░ Best Place 1 ░░", "░░ Best Place 2 ░░", "░░ Best Place 3 ░░"],
    food: ["░░ Must-Try Food 1 ░░", "░░ Must-Try Food 2 ░░", "░░ Must-Try Food 3 ░░"],
    photoSpots: ["░░ Photo Spot 1 ░░", "░░ Photo Spot 2 ░░"],
    localTips: "░░ Local tips here ░░",
    weather: "░░ Weather reminder ░░",
    currency: "░░ Currency reminder ░░",
    safety: "░░ Safety tips ░░",
  },
  faqs: [
    { q: "What if my flight is delayed?", a: "░░ Answer here ░░" },
    { q: "What time is hotel check-in?", a: "░░ Answer here ░░" },
    { q: "What if it rains?", a: "░░ Answer here ░░" },
    { q: "Is the tour refundable?", a: "░░ Answer here ░░" },
    { q: "Can I add optional tours?", a: "░░ Answer here ░░" },
    { q: "Is travel insurance required?", a: "░░ Answer here ░░" },
    { q: "Who do I contact during emergencies?", a: "░░ Answer here ░░" },
  ],
};

const INSURANCE_PLANS = [
  { id: "basic", name: "Basic", price: 399, badge: null, features: ["Medical Emergencies", "Trip Delays"] },
  { id: "standard", name: "Standard", price: 699, badge: "Popular", features: ["Medical Emergencies", "Trip Delays", "Lost Baggage", "Flight Interruptions"] },
  { id: "premium", name: "Premium", price: 999, badge: "Recommended", features: ["Medical Emergencies", "Trip Delays", "Lost Baggage", "Flight Interruptions", "Unexpected Incidents"] },
];

const CHECKLIST_ITEMS = [
  { id: "id", label: "Valid ID / Passport" },
  { id: "voucher", label: "Travel Voucher" },
  { id: "flight", label: "Flight Ticket" },
  { id: "hotel", label: "Hotel Voucher" },
  { id: "cash", label: "Cash" },
  { id: "powerbank", label: "Powerbank" },
  { id: "data", label: "Mobile Data" },
  { id: "charger", label: "Chargers" },
  { id: "meds", label: "Medicines" },
  { id: "sunscreen", label: "Sunscreen" },
  { id: "clothes", label: "Appropriate Clothing" },
];

const WHAT_TO_BRING = {
  Documents: ["Passport", "Valid ID", "Travel Voucher", "Insurance Certificate", "Flight Ticket"],
  Essentials: ["Cash", "Credit Card", "Powerbank", "Charger", "Medicines"],
  // ░░ TODO ░░ — Customize per destination
  "Destination-Specific": ["Beachwear", "Slippers", "Sunscreen", "Waterproof Bag", "Jacket", "Travel Adapter"],
};

// ░░ TODO ░░ — Replace with real outfit images from admin
const OUTFIT_CARDS = [
  { label: "Airport Outfit", emoji: "✈️", hint: "Comfortable & smart casual" },
  { label: "Tour Outfit", emoji: "🗺️", hint: "Light & breathable" },
  { label: "Dinner Outfit", emoji: "🍽️", hint: "Smart casual / semi-formal" },
  { label: "Beach Outfit", emoji: "🏖️", hint: "Swimwear + cover-up" },
  { label: "Photo Spot Outfit", emoji: "📸", hint: "Colorful & Instagram-ready" },
];

// ─── Shared style helpers ────────────────────────────────────────────────────
function useTheme(dark) {
  return {
    bg: dark ? "#0a0a0a" : "#f5f7fa",
    card: dark ? "#111111" : "#ffffff",
    cardBorder: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dark ? "#ffffff" : "#0F172A",
    sub: dark ? "rgba(255,255,255,0.45)" : "#64748B",
    muted: dark ? "rgba(255,255,255,0.2)" : "#94a3b8",
    accent: "#FF8C00",
    accentFaint: dark ? "rgba(255,140,0,0.12)" : "rgba(255,140,0,0.08)",
    accentBorder: dark ? "rgba(255,140,0,0.25)" : "rgba(255,140,0,0.3)",
    divider: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    inputBg: dark ? "#1a1a1a" : "#f8fafc",
    shadow: dark
      ? "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
      : "0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
  };
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────
function Section({ id, children, dark, style }) {
  const t = useTheme(dark);
  return (
    <section
      id={id}
      style={{
        background: t.bg,
        padding: "80px 24px",
        transition: "background 0.5s",
        ...style,
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ label, title, sub, dark }) {
  const t = useTheme(dark);
  return (
    <div style={{ marginBottom: 48, textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, transparent, ${t.accent})` }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.4em", textTransform: "uppercase", color: t.accent }}>{label}</span>
        <div style={{ height: 1, width: 40, background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />
      </div>
      <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, fontStyle: "italic", letterSpacing: "-0.03em", color: t.text, marginBottom: 12, lineHeight: 1.1, transition: "color 0.5s" }}>{title}</h2>
      {sub && <p style={{ fontSize: 14, color: t.sub, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>{sub}</p>}
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ children, dark, style }) {
  const t = useTheme(dark);
  return (
    <div
      style={{
        background: t.card,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow: t.shadow,
        transition: "background 0.5s, border-color 0.5s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Tag / Pill ──────────────────────────────────────────────────────────────
function Tag({ children, dark }) {
  const t = useTheme(dark);
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: t.accent, background: t.accentFaint, border: `1px solid ${t.accentBorder}`, borderRadius: 20, padding: "3px 10px" }}>
      {children}
    </span>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ label, value, dark }) {
  const t = useTheme(dark);
  const isPlaceholder = typeof value === "string" && value.includes("░░");
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "10px 0", borderBottom: `1px solid ${t.divider}` }}>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: t.sub, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: isPlaceholder ? t.muted : t.text, fontStyle: isPlaceholder ? "italic" : "normal", textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ─── 1. ARRIVAL INSTRUCTIONS ────────────────────────────────────────────────
function ArrivalInstructions({ dark }) {
  const t = useTheme(dark);
  const steps = [
    { phase: "Before Departure", icon: "📋", items: ["Arrive at the airport 2–3 hours before departure", "Prepare all travel documents", "Save digital copies of your vouchers and itinerary"] },
    { phase: "Upon Arrival", icon: "🛬", items: ["Follow airport arrival signs", "Collect your baggage at the carousel", "Proceed according to your transfer instructions", "Keep your mobile phone available for updates"] },
  ];
  return (
    <Section dark={dark}>
      <SectionHeader label="Step 1" title="Arrival Instructions" sub="Everything you need to know before and after you land." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {steps.map((s) => (
          <Card key={s.phase} dark={dark}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: t.accent, letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.phase}</span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {s.items.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: t.text, lineHeight: 1.6 }}>
                  <span style={{ color: t.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ─── 2. TRANSFER INSTRUCTIONS ───────────────────────────────────────────────
function TransferInstructions({ dark }) {
  const t = useTheme(dark);
  const { transfer } = PLACEHOLDER;
  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Step 2" title="Transfer Instructions" sub="Your ride from the airport to your hotel — all details here." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <Card dark={dark}>
          <Tag dark={dark}>Your Transfer Details</Tag>
          <div style={{ marginTop: 16 }}>
            <InfoRow label="Transfer Type" value={transfer.type} dark={dark} />
            <InfoRow label="Vehicle Provider" value={transfer.provider} dark={dark} />
            <InfoRow label="Pick-Up Location" value={transfer.pickup} dark={dark} />
            <InfoRow label="Contact Number" value={transfer.contact} dark={dark} />
            <InfoRow label="Estimated Travel Time" value={transfer.eta} dark={dark} />
          </div>
        </Card>
        <Card dark={dark}>
          <Tag dark={dark}>Reminders</Tag>
          <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {["Follow transfer coordinator instructions", "Be ready at your designated pick-up area", "Notify support immediately if you are delayed"].map((r, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: t.text, lineHeight: 1.6 }}>
                <span style={{ color: t.accent, fontWeight: 700, flexShrink: 0 }}>✓</span>
                {r}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

// ─── 3. HOTEL CHECK-IN ──────────────────────────────────────────────────────
function HotelCheckIn({ dark }) {
  const t = useTheme(dark);
  const { hotel } = PLACEHOLDER;
  return (
    <Section dark={dark}>
      <SectionHeader label="Step 3" title="Hotel Check-In" sub="What to expect when you arrive at your accommodation." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        <Card dark={dark}>
          <Tag dark={dark}>Your Hotel</Tag>
          <div style={{ marginTop: 16 }}>
            <InfoRow label="Hotel" value={hotel.name} dark={dark} />
            <InfoRow label="Address" value={hotel.address} dark={dark} />
            <InfoRow label="Check-In" value={hotel.checkIn} dark={dark} />
            <InfoRow label="Check-Out" value={hotel.checkOut} dark={dark} />
          </div>
        </Card>
        <Card dark={dark}>
          <Tag dark={dark}>What to Bring to Front Desk</Tag>
          <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {["Valid ID", "Passport (if applicable)", "Hotel Voucher"].map((r, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: t.text }}>
                <span style={{ color: t.accent, fontWeight: 700 }}>→</span> {r}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 20, padding: "12px 16px", background: t.accentFaint, border: `1px solid ${t.accentBorder}`, borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: t.sub, margin: 0, lineHeight: 1.7 }}>
              ⚠️ Early check-in is subject to availability. Security deposits may be required by the hotel.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  );
}

// ─── 4. TOUR REMINDERS ──────────────────────────────────────────────────────
function TourReminders({ dark }) {
  const t = useTheme(dark);
  const groups = [
    { label: "Before The Tour", icon: "🌅", items: ["Arrive 15 minutes early", "Wear comfortable clothing", "Bring water and sun protection", "Charge your mobile devices"] },
    { label: "During The Tour", icon: "🗺️", items: ["Follow guide instructions", "Observe local regulations", "Secure your personal belongings"] },
  ];
  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Step 4" title="Tour Reminders" dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {groups.map((g) => (
          <Card key={g.label} dark={dark}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 22 }}>{g.icon}</span>
              <Tag dark={dark}>{g.label}</Tag>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {g.items.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: t.text, lineHeight: 1.6 }}>
                  <span style={{ color: t.accent, fontWeight: 700, flexShrink: 0 }}>→</span> {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ─── 5. EMERGENCY CONTACTS ──────────────────────────────────────────────────
function EmergencyContacts({ dark }) {
  const t = useTheme(dark);
  const { emergency } = PLACEHOLDER;
  const contacts = [
    { label: "Gladex Hotline", value: emergency.hotline, icon: "📞" },
    { label: "Tour Coordinator", value: emergency.coordinator, icon: "👤" },
    { label: "Hotel Contact", value: emergency.hotelContact, icon: "🏨" },
    { label: "Transfer Provider", value: emergency.transfer, icon: "🚐" },
  ];
  return (
    <Section dark={dark}>
      <SectionHeader label="Emergency" title="Emergency Contacts" sub="Save these numbers before you travel." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {contacts.map((c) => (
          <Card key={c.label} dark={dark} style={{ textAlign: "center", padding: "20px 16px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: c.value.includes("░░") ? t.muted : t.accent, fontStyle: c.value.includes("░░") ? "italic" : "normal" }}>{c.value}</div>
          </Card>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <button
          style={{ padding: "14px 40px", background: "linear-gradient(135deg, #FF8C00, #e07800)", color: "#fff", border: "none", borderRadius: 50, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 4px 20px rgba(255,140,0,0.4)" }}
        >
          🚨 Emergency Assistance
        </button>
      </div>
    </Section>
  );
}

// ─── 6. DO'S & DON'TS ───────────────────────────────────────────────────────
function DosAndDonts({ dark }) {
  const t = useTheme(dark);
  const dos = ["Keep travel documents secure", "Follow local regulations", "Arrive on time", "Stay hydrated", "Save emergency contacts"];
  const donts = ["Leave valuables unattended", "Miss transfer schedules", "Bring prohibited items", "Ignore safety instructions", "Use unauthorized tour providers"];
  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Important" title="Do's & Don'ts" dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card dark={dark}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>✅ Do's</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {dos.map((d, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: t.text, lineHeight: 1.6 }}>
                <span style={{ color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>✓</span> {d}
              </li>
            ))}
          </ul>
        </Card>
        <Card dark={dark}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>❌ Don'ts</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {donts.map((d, i) => (
              <li key={i} style={{ display: "flex", gap: 10, fontSize: 14, color: t.text, lineHeight: 1.6 }}>
                <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>✗</span> {d}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  );
}

// ─── 7. TRAVEL READINESS CHECKLIST ──────────────────────────────────────────
function TravelChecklist({ dark }) {
  const t = useTheme(dark);
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const count = Object.values(checked).filter(Boolean).length;

  return (
    <Section dark={dark}>
      <SectionHeader label="Checklist" title="Travel Readiness" sub="Tick off every item before you head to the airport." dark={dark} />
      <Card dark={dark}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: t.sub }}>Your progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.accent }}>{count} / {CHECKLIST_ITEMS.length}</span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: t.divider, borderRadius: 4, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(count / CHECKLIST_ITEMS.length) * 100}%`, background: "linear-gradient(90deg, #FF8C00, #FFB347)", borderRadius: 4, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {CHECKLIST_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                background: checked[item.id] ? t.accentFaint : "transparent",
                border: `1px solid ${checked[item.id] ? t.accentBorder : t.cardBorder}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked[item.id] ? t.accent : t.muted}`,
                background: checked[item.id] ? t.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.2s",
              }}>
                {checked[item.id] && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, color: checked[item.id] ? t.accent : t.text, fontWeight: checked[item.id] ? 600 : 400, transition: "color 0.2s" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </Section>
  );
}

// ─── 8. WHAT TO BRING ───────────────────────────────────────────────────────
function WhatToBring({ dark }) {
  const t = useTheme(dark);
  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Pack Smart" title="What To Bring" dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {Object.entries(WHAT_TO_BRING).map(([cat, items]) => (
          <Card key={cat} dark={dark}>
            <Tag dark={dark}>{cat}</Tag>
            <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: t.text }}>
                  <span style={{ color: t.accent }}>·</span> {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ─── 9. OUTFIT GUIDE ────────────────────────────────────────────────────────
function OutfitGuide({ dark }) {
  const t = useTheme(dark);
  return (
    <Section dark={dark}>
      <SectionHeader label="Style Guide" title="Outfit Guide" sub="Get excited — here's what to wear for every moment of your trip." dark={dark} />
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
        {OUTFIT_CARDS.map((card) => (
          <Card key={card.label} dark={dark} style={{ minWidth: 160, flexShrink: 0, textAlign: "center", padding: "28px 20px" }}>
            {/* ░░ TODO ░░ — Replace emoji with real outfit image from admin */}
            <div style={{ fontSize: 40, marginBottom: 12 }}>{card.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}>{card.hint}</div>
            <div style={{ marginTop: 12, fontSize: 10, color: t.muted, fontStyle: "italic" }}>Image coming soon</div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ─── 10. DESTINATION GUIDE ──────────────────────────────────────────────────
function DestinationGuide({ destination, dark }) {
  const t = useTheme(dark);
  const guide = PLACEHOLDER.destinationGuide;
  const sections = [
    { label: "Best Places to Visit", icon: "📍", items: guide.places },
    { label: "Best Food to Try", icon: "🍜", items: guide.food },
    { label: "Best Photo Spots", icon: "📸", items: guide.photoSpots },
  ];
  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Explore" title={`${destination.name} Guide`} sub="Your insider guide to making the most of your trip." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 20 }}>
        {sections.map((s) => (
          <Card key={s.label} dark={dark}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <Tag dark={dark}>{s.label}</Tag>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {s.items.map((item, i) => (
                <li key={i} style={{ fontSize: 14, color: item.includes("░░") ? t.muted : t.text, fontStyle: item.includes("░░") ? "italic" : "normal" }}>· {item}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {[
          { label: "🌤 Weather", value: guide.weather },
          { label: "💱 Currency", value: guide.currency },
          { label: "🔒 Safety", value: guide.safety },
          { label: "💡 Local Tips", value: guide.localTips },
        ].map((tip) => (
          <div key={tip.label} style={{ padding: "14px 18px", background: t.accentFaint, border: `1px solid ${t.accentBorder}`, borderRadius: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.accent, marginBottom: 6 }}>{tip.label}</div>
            <div style={{ fontSize: 13, color: tip.value.includes("░░") ? t.muted : t.text, fontStyle: tip.value.includes("░░") ? "italic" : "normal" }}>{tip.value}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── 11. OPTIONAL TOURS ─────────────────────────────────────────────────────
function OptionalTours({ dark }) {
  const t = useTheme(dark);
  const [cart, setCart] = useState([]);
  const toggle = (id) => setCart((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <Section dark={dark}>
      <SectionHeader label="Add-Ons" title="Optional Tours" sub="Enhance your trip with these curated experiences." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {PLACEHOLDER.tours.map((tour) => {
          const added = cart.includes(tour.id);
          return (
            <Card key={tour.id} dark={dark}>
              {/* ░░ TODO ░░ — Replace with real tour photo */}
              <div style={{ height: 120, background: `linear-gradient(135deg, ${dark ? "#1a1a1a" : "#f1f5f9"}, ${dark ? "#111" : "#e8ecf0"})`, borderRadius: 10, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                {tour.emoji}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{tour.name}</div>
              <div style={{ fontSize: 13, color: t.sub, marginBottom: 4 }}>{tour.duration}</div>
              <div style={{ fontSize: 13, color: t.sub, marginBottom: 12 }}>📅 {tour.dates}</div>
              <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
                {tour.inclusions.map((inc, i) => (
                  <li key={i} style={{ fontSize: 13, color: t.sub, marginBottom: 4 }}>✓ {inc}</li>
                ))}
              </ul>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: t.accent }}>{tour.price}</span>
                <button
                  onClick={() => toggle(tour.id)}
                  style={{
                    padding: "8px 20px", borderRadius: 50, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", transition: "all 0.2s",
                    background: added ? t.accent : "transparent",
                    color: added ? "#fff" : t.accent,
                    border: `1.5px solid ${t.accent}`,
                  }}
                >
                  {added ? "✓ Added" : "+ Add to Trip"}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

// ─── 12. TRAVEL INSURANCE ───────────────────────────────────────────────────
function TravelInsurance({ dark }) {
  const t = useTheme(dark);
  const [selected, setSelected] = useState(null);

  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Protection" title="Protect Your Trip Before You Go" sub="Travel insurance is optional but highly recommended." dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 24 }}>
        {INSURANCE_PLANS.map((plan) => {
          const isSelected = selected === plan.id;
          return (
            <Card key={plan.id} dark={dark} style={{ position: "relative", border: `1.5px solid ${isSelected ? t.accent : t.cardBorder}`, transition: "all 0.3s" }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: t.accent, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "3px 12px", borderRadius: 20 }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: t.accent, marginBottom: 4 }}>₱{plan.price}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{plan.name} Plan</div>
              </div>
              <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: t.sub, marginBottom: 6, display: "flex", gap: 6 }}>
                    <span style={{ color: "#22c55e" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setSelected(isSelected ? null : plan.id)}
                style={{
                  width: "100%", padding: "10px", borderRadius: 50, fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.2s",
                  background: isSelected ? t.accent : "transparent",
                  color: isSelected ? "#fff" : t.accent,
                  border: `1.5px solid ${t.accent}`,
                }}
              >
                {isSelected ? "✓ Selected" : "Add Insurance"}
              </button>
            </Card>
          );
        })}
      </div>
      <Card dark={dark} style={{ background: t.accentFaint, border: `1px solid ${t.accentBorder}` }}>
        <p style={{ fontSize: 13, color: t.sub, margin: 0, lineHeight: 1.8, textAlign: "center" }}>
          Travel insurance covers: <strong style={{ color: t.text }}>Medical Emergencies · Trip Delays · Lost Baggage · Flight Interruptions · Unexpected Incidents</strong>
        </p>
      </Card>
    </Section>
  );
}

// ─── 13. CHECKOUT ────────────────────────────────────────────────────────────
function CheckoutSection({ dark }) {
  const t = useTheme(dark);
  // ░░ TODO ░░ — Wire to actual cart state from OptionalTours + Insurance sections
  return (
    <Section dark={dark}>
      <SectionHeader label="Checkout" title="Complete Your Add-Ons" dark={dark} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        <Card dark={dark}>
          <Tag dark={dark}>Cart Summary</Tag>
          <div style={{ marginTop: 16 }}>
            {/* ░░ TODO ░░ — Map real cart items here */}
            <div style={{ padding: "12px 0", borderBottom: `1px solid ${t.divider}`, display: "flex", justifyContent: "space-between", fontSize: 14, color: t.muted, fontStyle: "italic" }}>
              <span>No items added yet</span>
              <span>₱0</span>
            </div>
            <div style={{ padding: "14px 0 0", display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}>
              <span style={{ color: t.text }}>Total</span>
              <span style={{ color: t.accent }}>₱0</span>
            </div>
          </div>
        </Card>
        <Card dark={dark}>
          <Tag dark={dark}>Payment Methods</Tag>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["GCash", "Maya", "Credit Card", "Bank Transfer", "Payment Link"].map((pm) => (
              <span key={pm} style={{ fontSize: 12, padding: "5px 12px", background: t.accentFaint, border: `1px solid ${t.accentBorder}`, borderRadius: 20, color: t.text }}>{pm}</span>
            ))}
          </div>
          <button
            style={{ marginTop: 20, width: "100%", padding: "13px", background: "linear-gradient(135deg, #FF8C00, #e07800)", color: "#fff", border: "none", borderRadius: 50, fontSize: 13, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 4px 20px rgba(255,140,0,0.3)" }}
          >
            Proceed to Checkout →
          </button>
          <p style={{ fontSize: 11, color: t.muted, textAlign: "center", marginTop: 10 }}>
            {/* ░░ TODO ░░ — Wire Xendit API (Phase 2) */}
            Payment processing via Xendit — Phase 2
          </p>
        </Card>
      </div>
    </Section>
  );
}

// ─── 14. FAQs ────────────────────────────────────────────────────────────────
function FAQs({ dark }) {
  const t = useTheme(dark);
  const [open, setOpen] = useState(null);
  return (
    <Section dark={dark} style={{ background: dark ? "#0d0d0d" : "#eef0f4" }}>
      <SectionHeader label="Help" title="Frequently Asked Questions" dark={dark} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PLACEHOLDER.faqs.map((faq, i) => (
          <Card key={i} dark={dark} style={{ padding: 0, overflow: "hidden" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{ width: "100%", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{faq.q}</span>
              <span style={{ fontSize: 18, color: t.accent, flexShrink: 0, marginLeft: 12, transition: "transform 0.2s", transform: open === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 20px 16px", fontSize: 14, color: faq.a.includes("░░") ? t.muted : t.sub, lineHeight: 1.7, fontStyle: faq.a.includes("░░") ? "italic" : "normal" }}>
                {faq.a}
              </div>
            )}
          </Card>
        ))}
      </div>
    </Section>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function TravelBriefingSection({ destination, darkMode }) {
  return (
    <div>
      <ArrivalInstructions dark={darkMode} />
      <TransferInstructions dark={darkMode} />
      <HotelCheckIn dark={darkMode} />
      <TourReminders dark={darkMode} />
      <EmergencyContacts dark={darkMode} />
      <DosAndDonts dark={darkMode} />
      <TravelChecklist dark={darkMode} />
      <WhatToBring dark={darkMode} />
      <OutfitGuide dark={darkMode} />
      <DestinationGuide destination={destination} dark={darkMode} />
      <OptionalTours dark={darkMode} />
      <TravelInsurance dark={darkMode} />
      <CheckoutSection dark={darkMode} />
      <FAQs dark={darkMode} />
    </div>
  );
}