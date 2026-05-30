import { useState } from "react";

/* ─── THEME ─────────────────────────────────────────────── */
function useThemeToggle() {
  const [dark, setDark] = useState(true);
  return { dark, toggle: () => setDark(d => !d) };
}

function t(dark) {
  return {
    bg:         dark ? "#0a0a0a"                : "#f4f5f7",
    card:       dark ? "#141414"                : "#ffffff",
    cardBorder: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    navBg:      dark ? "rgba(10,10,10,0.96)"    : "rgba(255,255,255,0.96)",
    navBorder:  dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
    text:       dark ? "#ffffff"                : "#0f172a",
    muted:      dark ? "rgba(255,255,255,0.45)" : "#64748b",
    muted2:     dark ? "rgba(255,255,255,0.2)"  : "rgba(0,0,0,0.18)",
    line:       dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    pillBg:     dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    inputBg:    dark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    heroBg:     dark ? "linear-gradient(135deg,#0a0a0a 0%,#0d0800 100%)" : "linear-gradient(135deg,#fff8f0 0%,#fff3e0 100%)",
    orange:     "#FF8C00",
    orangeDeep: "#E07000",
  };
}

/* ─── LOGO (exact from reference code) ──────────────────── */
function GladexLogo({ tk }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width:32, height:32, borderRadius:9,
        background:`linear-gradient(135deg,${tk.orange},${tk.orangeDeep})`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:`0 4px 16px rgba(255,140,0,0.28)`,
      }}>
        <span style={{ fontSize:14, fontWeight:900, color:"#fff", fontStyle:"italic", fontFamily:"'Poppins',sans-serif" }}>G</span>
      </div>
      <span style={{ fontWeight:800, fontSize:15, letterSpacing:"-0.03em", color:tk.text, fontFamily:"'Poppins',sans-serif" }}>
        GLADEX <span style={{ color:tk.orange }}>TRAVEL</span>
      </span>
    </div>
  );
}

/* ─── DATA ───────────────────────────────────────────────── */
const DRIVE_VIDEO_URL = "https://drive.google.com/file/d/1THzQAagycyXm8UYNztawslG7G_2Ak_J3/preview";

const SAMPLE = {
  clientName:"Maria", destination:"Boracay", travelDate:"June 15–18, 2026",
  hotel:"Henann Lagoon Resort", guests:"4 Adults", status:"Confirmed",
  consultant:"Jessa Reyes", transferType:"Private Van", vehicleProvider:"GDX Transport",
  pickupLocation:"NAIA Terminal 3 — Arrival Hall Exit B", transferContact:"+63 917 XXX XXXX",
  estimatedTravelTime:"15 minutes", hotelAddress:"Station 1, Balabag, Boracay Island",
  checkIn:"2:00 PM", checkOut:"12:00 NN",
  gladexHotline:"+63 917 XXX XXXX", tourCoordinator:"+63 918 XXX XXXX", hotelContact:"+63 36 XXX XXXX",
};

const TOURS = [
  { id:1, name:"Island Hopping Adventure", duration:"4 hours", image:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&q=80", includes:["Boat Tour","Snorkeling","Local Guide","Life Vest"], tag:"Best Seller" },
  { id:2, name:"Sunset Sailing",           duration:"2 hours", image:"https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80", includes:["Sail Boat","Drinks","Photo Ops"],               tag:"Romantic"   },
  { id:3, name:"Helmet Diving",            duration:"1 hour",  image:"https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", includes:["Equipment","Guide","Photos"],                     tag:"Adventure"  },
  { id:4, name:"ATV Beach Ride",           duration:"1.5 hrs", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", includes:["ATV","Helmet","Guide","Scenic Route"],            tag:"Thrilling"  },
];

const INSURANCE = [
  { id:"basic",    label:"Basic",    features:["Medical Emergency","Trip Cancellation"] },
  { id:"standard", label:"Standard", features:["Medical Emergency","Trip Cancellation","Lost Baggage","Flight Delay"], recommended:true },
  { id:"premium",  label:"Premium",  features:["All Standard Benefits","24/7 Assistance","Evacuation Cover","Adventure Sports"] },
];

const FAQS = [
  { q:"What if my flight is delayed?",     a:"Contact our Gladex Hotline immediately. Our ground team will coordinate your updated arrival and adjust transfer arrangements accordingly." },
  { q:"What time is hotel check-in?",      a:"Standard check-in is at 2:00 PM. Early check-in is subject to availability. Check-out is at 12:00 NN." },
  { q:"What if it rains?",                 a:"Some outdoor tours may be rescheduled or modified for safety. Our coordinator will advise alternatives. Always bring a light raincoat." },
  { q:"Can I add optional tours on-site?", a:"Yes, you may add tours through this portal before departure. On-site availability cannot be guaranteed." },
  { q:"Who do I contact during emergencies?", a:"Use the Emergency Assistance button in the Emergency Contacts section. Our Gladex Hotline is available 24/7 during your travel dates." },
];

const CHECKLIST = [
  { id:"id",      label:"Valid ID / Passport" },
  { id:"voucher", label:"Travel Voucher"       },
  { id:"flight",  label:"Flight Ticket"        },
  { id:"hotel",   label:"Hotel Voucher"        },
  { id:"cash",    label:"Cash & Credit Card"   },
  { id:"power",   label:"Powerbank & Charger"  },
  { id:"data",    label:"Mobile Data / SIM"    },
  { id:"meds",    label:"Medicines"            },
  { id:"sun",     label:"Sunscreen"            },
  { id:"clothes", label:"Appropriate Clothing" },
];

const OUTFITS = [
  { label:"Airport",   desc:"Comfy joggers, light jacket, sneakers",    icon:"✈️" },
  { label:"Tour",      desc:"Rash guard, shorts, aqua shoes, hat",       icon:"🚤" },
  { label:"Beach",     desc:"Swimwear, cover-up, slippers, shades",      icon:"🏖️" },
  { label:"Dinner",    desc:"Smart casual — linen tops, sandals",        icon:"🍽️" },
  { label:"Photo Ops", desc:"Bright colors & sundresses pop on camera",  icon:"📸" },
];

const DEST_GUIDE = [
  { icon:"📍", title:"Best Places",  items:["White Beach Sta. 1–3","Puka Shell Beach","Crystal Cove Island","Diniwid Beach"] },
  { icon:"🍜", title:"Must-Try Food",items:["Halo-halo at D'Talipapa","Fresh BBQ seafood","Mango shake","Batchoy noodles"] },
  { icon:"📸", title:"Photo Spots",  items:["Station 1 at sunrise","Willy's Rock at low tide","Ilig-Iligan viewpoint","Crystal Cove cliffs"] },
  { icon:"💡", title:"Local Tips",   items:["Haggle at D'Talipapa","Cash is king at vendors","Avoid midday sun 11–2pm","Sunset faces White Beach"] },
];

/* ─── SMALL COMPONENTS ───────────────────────────────────── */
function SectionLabel({ text, tk }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
      <div style={{ height:1, width:36, background:`linear-gradient(90deg,transparent,${tk.orange})` }} />
      <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.4em", color:tk.orange, textTransform:"uppercase" }}>{text}</span>
      <div style={{ height:1, width:36, background:`linear-gradient(90deg,${tk.orange},transparent)` }} />
    </div>
  );
}

function Divider({ tk }) {
  return <div style={{ height:1, background:`linear-gradient(90deg,transparent,${tk.orange},transparent)`, margin:"44px 0" }} />;
}

function Card({ children, style={}, tk }) {
  return (
    <div style={{ background:tk.card, border:`1px solid ${tk.cardBorder}`, borderRadius:16, padding:24, ...style }}>
      {children}
    </div>
  );
}

function InfoRow({ label, value, tk }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 0", borderBottom:`1px solid ${tk.line}` }}>
      <span style={{ fontSize:12, color:tk.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</span>
      <span style={{ fontSize:13, color:tk.text, fontWeight:500, textAlign:"right", maxWidth:"58%" }}>{value}</span>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:`${color}18`, color, border:`1px solid ${color}30`, borderRadius:99, fontSize:11, fontWeight:700, padding:"4px 12px" }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:color }} />{label}
    </span>
  );
}

/* ─── MAIN ───────────────────────────────────────────────── */
export default function GladexBriefing() {
  const { dark, toggle } = useThemeToggle();
  const tk = t(dark);

  const [checklist, setChecklist]           = useState({});
  const [addedTours, setAddedTours]         = useState({});
  const [selectedIns, setSelectedIns]       = useState(null);
  const [openFaq, setOpenFaq]               = useState(null);
  const [activeSection, setActiveSection]   = useState("dashboard");

  const NAV = [
    { id:"dashboard", label:"My Trip"       },
    { id:"video",     label:"Briefing"      },
    { id:"info",      label:"Travel Info"   },
    { id:"checklist", label:"Checklist"     },
    { id:"destguide", label:"Destination"   },
    { id:"tours",     label:"Opt. Tours"    },
    { id:"insurance", label:"Insurance"     },
    { id:"faq",       label:"FAQs"          },
  ];

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
    setActiveSection(id);
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalAdded   = Object.keys(addedTours).length;

  return (
    <div style={{ background:tk.bg, minHeight:"100vh", fontFamily:"'Poppins','Segoe UI',sans-serif", color:tk.text, transition:"background 0.3s,color 0.3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#555;border-radius:99px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .gdx-nav-btn{background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .18s;white-space:nowrap;font-family:'Poppins',sans-serif}
        .gdx-nav-btn:hover{opacity:.8}
        .gdx-nav-btn.active{border-bottom-color:#FF8C00!important}
        .tour-card:hover .tour-img{transform:scale(1.06)!important}
        .tour-card:hover{border-color:rgba(255,140,0,0.3)!important}
        .faq-row:hover{border-color:rgba(255,140,0,0.22)!important}
        .check-row:hover{background:rgba(255,140,0,0.04)!important;border-radius:10px}
        .ins-card:hover{border-color:rgba(255,140,0,0.3)!important;transform:translateY(-1px)}
        .ghost-btn:hover{opacity:.8}
        .orange-btn:hover{opacity:.88}
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:tk.navBg, backdropFilter:"blur(20px)", borderBottom:`1px solid ${tk.navBorder}`, transition:"background 0.3s" }}>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"0 16px" }}>
          <div style={{ display:"flex", alignItems:"center", height:58, gap:16 }}>

            {/* LOGO */}
            <GladexLogo tk={tk} />

            {/* NAV LINKS */}
            <div style={{ display:"flex", alignItems:"center", flex:1, overflowX:"auto", justifyContent:"center" }}>
              {NAV.map(s => (
                <button key={s.id} className={`gdx-nav-btn ${activeSection===s.id?"active":""}`}
                  onClick={() => scrollTo(s.id)}
                  style={{ padding:"6px 9px", fontSize:10, fontWeight:700, color:activeSection===s.id ? tk.orange : tk.muted, letterSpacing:"0.04em", textTransform:"uppercase" }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* THEME TOGGLE */}
            <button onClick={toggle} className="ghost-btn"
              style={{ background:tk.pillBg, border:`1px solid ${tk.cardBorder}`, borderRadius:99, padding:"6px 14px", cursor:"pointer", fontSize:11, fontWeight:700, color:tk.muted, display:"flex", alignItems:"center", gap:6, flexShrink:0, fontFamily:"'Poppins',sans-serif", transition:"opacity 0.2s" }}>
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>

          </div>
        </div>
      </div>

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <div style={{ background:tk.heroBg, borderBottom:`1px solid ${tk.navBorder}`, padding:"40px 16px 36px", transition:"background 0.3s" }}>
        <div style={{ maxWidth:980, margin:"0 auto" }}>
          <SectionLabel text="Your Trip Is Confirmed" tk={tk} />
          <h1 style={{ fontSize:"clamp(2rem,6vw,3.6rem)", fontWeight:900, fontStyle:"italic", letterSpacing:"-0.03em", lineHeight:1.05, marginBottom:12 }}>
            Welcome back, <span style={{ color:tk.orange }}>{SAMPLE.clientName}!</span>
          </h1>
          <p style={{ color:tk.muted, fontSize:14, lineHeight:1.75, maxWidth:520, marginBottom:20 }}>
            Your <strong style={{ color:tk.text }}>{SAMPLE.destination}</strong> travel briefing is ready. Watch the destination video, review your details, and explore add-ons below.
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <Badge label="✓ Booking Confirmed" color="#22c55e" />
            <Badge label={`✈ ${SAMPLE.travelDate}`}  color={tk.orange} />
            <Badge label={`🏨 ${SAMPLE.hotel}`}       color={tk.orange} />
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div style={{ maxWidth:980, margin:"0 auto", padding:"44px 16px 80px" }}>

        {/* 1 · DASHBOARD */}
        <div id="dashboard" style={{ animation:"fadeUp 0.5s ease both" }}>
          <SectionLabel text="Personalized Travel Dashboard" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:24 }}>
            Hi {SAMPLE.clientName}! Your {SAMPLE.destination} Trip at a Glance
          </h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>

            <Card tk={tk}>
              <p style={{ fontSize:10, fontWeight:700, color:tk.orange, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16 }}>Booking Summary</p>
              <InfoRow label="Destination" value={SAMPLE.destination}  tk={tk} />
              <InfoRow label="Travel Date" value={SAMPLE.travelDate}   tk={tk} />
              <InfoRow label="Hotel"       value={SAMPLE.hotel}        tk={tk} />
              <InfoRow label="Guests"      value={SAMPLE.guests}       tk={tk} />
              <InfoRow label="Status"      value={<Badge label={SAMPLE.status} color="#22c55e" />} tk={tk} />
            </Card>

            <Card tk={tk}>
              <p style={{ fontSize:10, fontWeight:700, color:tk.orange, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:14 }}>Trip Actions</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { label:"⬇  Download Voucher",   primary:true  },
                  { label:"⬇  Download Itinerary", primary:true  },
                  { label:"📞 Contact Support",     primary:false },
                ].map(btn => (
                  <button key={btn.label} className="ghost-btn"
                    style={{ width:"100%", padding:"11px 16px", borderRadius:10, border:`1px solid ${btn.primary ? tk.orange : tk.cardBorder}`, background:btn.primary ? "rgba(255,140,0,0.09)" : tk.inputBg, color:btn.primary ? tk.orange : tk.muted, fontSize:12, fontWeight:700, cursor:"pointer", letterSpacing:"0.04em", fontFamily:"'Poppins',sans-serif", transition:"opacity 0.2s" }}>
                    {btn.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop:14, padding:"10px 14px", background:tk.inputBg, borderRadius:10, border:`1px solid ${tk.line}` }}>
                <p style={{ fontSize:10, color:tk.muted, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.08em" }}>Assigned Consultant</p>
                <p style={{ fontSize:13, fontWeight:600, color:tk.text }}>{SAMPLE.consultant}</p>
              </div>
            </Card>

          </div>
        </div>

        <Divider tk={tk} />

        {/* 2 · BRIEFING VIDEO */}
        <div id="video">
          <SectionLabel text="Destination Briefing" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>
            {SAMPLE.destination} Travel Briefing Video
          </h2>
          <p style={{ color:tk.muted, fontSize:13, lineHeight:1.75, marginBottom:28, maxWidth:520 }}>
            Watch your complete orientation before departure — arrival, transfers, hotel check-in, tour reminders, and emergency contacts all covered.
          </p>

          {/* Portrait 9:16 Google Drive player */}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{
              width:"100%", maxWidth:340,
              borderRadius:20, overflow:"hidden",
              border:`1px solid ${tk.cardBorder}`,
              background:tk.card,
              boxShadow:"0 0 60px rgba(255,140,0,0.08)",
            }}>
              {/* 9:16 ratio wrapper */}
              <div style={{ position:"relative", paddingTop:"177.78%" }}>
                <iframe
                  src={DRIVE_VIDEO_URL}
                  title="Boracay Travel Briefing"
                  allow="autoplay"
                  allowFullScreen
                  style={{
                    position:"absolute", inset:0,
                    width:"100%", height:"100%",
                    border:"none",
                  }}
                />
              </div>
            </div>
          </div>
          <p style={{ textAlign:"center", fontSize:11, color:tk.muted2, marginTop:12 }}>
            Portrait view · Google Drive · No subtitles
          </p>
        </div>

        <Divider tk={tk} />

        {/* 3 · TRAVEL INFO */}
        <div id="info">
          <SectionLabel text="Travel Information Center" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:24 }}>
            Everything You Need to Know
          </h2>
          <div style={{ display:"grid", gap:16 }}>

            {/* Arrival */}
            <Card tk={tk}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}><span style={{ fontSize:22 }}>✈️</span><p style={{ fontWeight:800, fontSize:15, color:tk.text }}>Arrival Instructions</p></div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
                {[
                  { label:"Before Departure", items:["Arrive at airport 2–3 hours early","Prepare all travel documents","Save digital copies of vouchers & itinerary"] },
                  { label:"Upon Arrival",     items:["Follow airport arrival signs","Collect baggage at carousel","Proceed per transfer instructions","Keep mobile phone available for updates"] },
                ].map(col => (
                  <div key={col.label}>
                    <p style={{ fontSize:10, fontWeight:700, color:tk.orange, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{col.label}</p>
                    {col.items.map(i => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                        <span style={{ color:tk.orange, fontSize:12, flexShrink:0, marginTop:1 }}>→</span>
                        <p style={{ fontSize:12, color:tk.muted, lineHeight:1.55 }}>{i}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* Transfer */}
            <Card tk={tk}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}><span style={{ fontSize:22 }}>🚐</span><p style={{ fontWeight:800, fontSize:15, color:tk.text }}>Transfer Instructions</p></div>
              <InfoRow label="Transfer Type"    value={SAMPLE.transferType}        tk={tk} />
              <InfoRow label="Vehicle Provider" value={SAMPLE.vehicleProvider}     tk={tk} />
              <InfoRow label="Pick-up Location" value={SAMPLE.pickupLocation}      tk={tk} />
              <InfoRow label="Contact Number"   value={SAMPLE.transferContact}     tk={tk} />
              <InfoRow label="Est. Travel Time" value={SAMPLE.estimatedTravelTime} tk={tk} />
              <div style={{ marginTop:16, padding:14, background:dark?"rgba(255,140,0,0.05)":"#fff8f0", borderRadius:10, border:"1px solid rgba(255,140,0,0.15)" }}>
                <p style={{ fontSize:10, fontWeight:700, color:tk.orange, marginBottom:8, textTransform:"uppercase", letterSpacing:"0.07em" }}>Reminders</p>
                {["Follow transfer coordinator instructions at all times","Be ready at pick-up area 10 minutes early","Notify Gladex support immediately if delayed"].map(r => (
                  <p key={r} style={{ fontSize:12, color:tk.muted, marginBottom:5, display:"flex", gap:6 }}><span style={{ color:tk.orange }}>·</span>{r}</p>
                ))}
              </div>
            </Card>

            {/* Hotel */}
            <Card tk={tk}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}><span style={{ fontSize:22 }}>🏨</span><p style={{ fontWeight:800, fontSize:15, color:tk.text }}>Hotel Check-in Information</p></div>
              <InfoRow label="Hotel"      value={SAMPLE.hotel}        tk={tk} />
              <InfoRow label="Address"    value={SAMPLE.hotelAddress} tk={tk} />
              <InfoRow label="Check-in"   value={SAMPLE.checkIn}      tk={tk} />
              <InfoRow label="Check-out"  value={SAMPLE.checkOut}     tk={tk} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:16 }}>
                {[
                  { label:"Requirements", items:["Valid ID / Passport","Hotel Voucher","Security Deposit (if any)"] },
                  { label:"Notes",        items:["Early check-in: subject to availability","Security deposits may be required","Keep voucher accessible"] },
                ].map(box => (
                  <div key={box.label} style={{ padding:12, background:tk.inputBg, borderRadius:10, border:`1px solid ${tk.line}` }}>
                    <p style={{ fontSize:10, fontWeight:700, color:tk.orange, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{box.label}</p>
                    {box.items.map(i => <p key={i} style={{ fontSize:11, color:tk.muted, marginBottom:5 }}>· {i}</p>)}
                  </div>
                ))}
              </div>
            </Card>

            {/* Tour Reminders */}
            <Card tk={tk}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}><span style={{ fontSize:22 }}>🗺️</span><p style={{ fontWeight:800, fontSize:15, color:tk.text }}>Tour Reminders</p></div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
                {[
                  { label:"Before the Tour",  items:["Arrive 15 minutes early","Wear comfortable clothing","Bring water and sun protection","Charge all mobile devices"] },
                  { label:"During the Tour",  items:["Follow guide instructions at all times","Observe all local regulations","Secure personal belongings","Stay with your group"] },
                ].map(col => (
                  <div key={col.label}>
                    <p style={{ fontSize:10, fontWeight:700, color:tk.orange, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{col.label}</p>
                    {col.items.map(i => (
                      <div key={i} style={{ display:"flex", gap:8, marginBottom:7 }}>
                        <span style={{ color:tk.orange, fontSize:12, flexShrink:0 }}>→</span>
                        <p style={{ fontSize:12, color:tk.muted, lineHeight:1.55 }}>{i}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* Emergency */}
            <Card tk={tk}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}><span style={{ fontSize:22 }}>🚨</span><p style={{ fontWeight:800, fontSize:15, color:tk.text }}>Emergency Contacts</p></div>
              <InfoRow label="Gladex Hotline"    value={SAMPLE.gladexHotline}    tk={tk} />
              <InfoRow label="Tour Coordinator"  value={SAMPLE.tourCoordinator}  tk={tk} />
              <InfoRow label="Hotel Contact"     value={SAMPLE.hotelContact}     tk={tk} />
              <InfoRow label="Transfer Provider" value={SAMPLE.transferContact}  tk={tk} />
              <button style={{ width:"100%", marginTop:16, padding:13, borderRadius:12, border:"1px solid rgba(239,68,68,0.35)", background:"rgba(239,68,68,0.08)", color:"#ef4444", fontSize:13, fontWeight:700, cursor:"pointer", letterSpacing:"0.04em", fontFamily:"'Poppins',sans-serif" }}>
                🆘 Emergency Assistance
              </button>
            </Card>

            {/* Do's & Don'ts */}
            <Card tk={tk}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18 }}><span style={{ fontSize:22 }}>📋</span><p style={{ fontWeight:800, fontSize:15, color:tk.text }}>Important Do's & Don'ts</p></div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#22c55e", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>✅ Do's</p>
                  {["Keep all travel documents secure","Follow local regulations","Arrive on time to all activities","Stay hydrated throughout","Save all emergency contacts"].map(d => (
                    <div key={d} style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <span style={{ color:"#22c55e", flexShrink:0, fontWeight:700 }}>✓</span>
                      <p style={{ fontSize:12, color:tk.muted, lineHeight:1.55 }}>{d}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p style={{ fontSize:10, fontWeight:700, color:"#ef4444", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>❌ Don'ts</p>
                  {["Leave valuables unattended","Miss transfer schedules","Bring prohibited items on tours","Ignore safety instructions","Use unauthorized tour providers"].map(d => (
                    <div key={d} style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <span style={{ color:"#ef4444", flexShrink:0, fontWeight:700 }}>✗</span>
                      <p style={{ fontSize:12, color:tk.muted, lineHeight:1.55 }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

          </div>
        </div>

        <Divider tk={tk} />

        {/* 4 · CHECKLIST */}
        <div id="checklist">
          <SectionLabel text="Travel Readiness Checklist" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>
            Are You Ready to Go?
          </h2>
          <p style={{ color:tk.muted, fontSize:13, marginBottom:20 }}>
            Tick off each item before departure. <span style={{ color:tk.orange, fontWeight:600 }}>{checkedCount}/{CHECKLIST.length} completed</span>
          </p>
          <div style={{ height:4, borderRadius:99, background:tk.line, marginBottom:24, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(checkedCount/CHECKLIST.length)*100}%`, background:`linear-gradient(90deg,${tk.orange},#FF6B00)`, borderRadius:99, transition:"width 0.35s ease" }} />
          </div>
          <Card tk={tk}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))", gap:4 }}>
              {CHECKLIST.map(item => (
                <div key={item.id} className="check-row"
                  onClick={() => setChecklist(p => ({ ...p, [item.id]:!p[item.id] }))}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", cursor:"pointer", userSelect:"none", transition:"background 0.15s" }}>
                  <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${checklist[item.id] ? tk.orange : tk.cardBorder}`, background:checklist[item.id] ? tk.orange : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", flexShrink:0 }}>
                    {checklist[item.id] && <span style={{ fontSize:10, color:"#000", fontWeight:900 }}>✓</span>}
                  </div>
                  <p style={{ fontSize:12, color:checklist[item.id] ? tk.muted : tk.text, textDecoration:checklist[item.id] ? "line-through" : "none", transition:"all 0.2s" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* What to Bring */}
          <h3 style={{ fontSize:16, fontWeight:800, marginTop:32, marginBottom:16, color:tk.text }}>What to Bring</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))", gap:12 }}>
            {[
              { label:"Documents",           icon:"📄", items:["Passport / Valid ID","Travel Voucher","Flight Ticket","Insurance Certificate"] },
              { label:"Essentials",           icon:"💳", items:["Cash & Credit Card","Powerbank & Charger","Medicines","Mobile Data / SIM"] },
              { label:"Destination Specific", icon:"🏖️", items:["Beachwear & Slippers","Sunscreen SPF 50+","Waterproof Bag","Light Jacket"] },
            ].map(cat => (
              <Card key={cat.label} tk={tk} style={{ padding:18 }}>
                <p style={{ fontSize:20, marginBottom:8 }}>{cat.icon}</p>
                <p style={{ fontSize:11, fontWeight:700, color:tk.orange, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>{cat.label}</p>
                {cat.items.map(i => <p key={i} style={{ fontSize:12, color:tk.muted, marginBottom:5 }}>· {i}</p>)}
              </Card>
            ))}
          </div>

          {/* Outfit Guide */}
          <h3 style={{ fontSize:16, fontWeight:800, marginTop:32, marginBottom:16, color:tk.text }}>Outfit Guide</h3>
          <div style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8 }}>
            {OUTFITS.map(o => (
              <div key={o.label} style={{ minWidth:148, padding:16, borderRadius:14, background:tk.card, border:`1px solid ${tk.cardBorder}`, flexShrink:0 }}>
                <span style={{ fontSize:24 }}>{o.icon}</span>
                <p style={{ fontSize:12, fontWeight:700, marginTop:8, marginBottom:5, color:tk.text }}>{o.label}</p>
                <p style={{ fontSize:11, color:tk.muted, lineHeight:1.55 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider tk={tk} />

        {/* 5 · DESTINATION GUIDE */}
        <div id="destguide">
          <SectionLabel text="Destination Guide" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>
            Discover {SAMPLE.destination}
          </h2>
          <p style={{ color:tk.muted, fontSize:13, marginBottom:24 }}>Local knowledge curated by the Gladex team.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))", gap:14, marginBottom:16 }}>
            {DEST_GUIDE.map(g => (
              <Card key={g.title} tk={tk} style={{ padding:18 }}>
                <p style={{ fontSize:20, marginBottom:8 }}>{g.icon}</p>
                <p style={{ fontSize:11, fontWeight:700, color:tk.orange, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>{g.title}</p>
                {g.items.map(i => <p key={i} style={{ fontSize:12, color:tk.muted, marginBottom:5 }}>· {i}</p>)}
              </Card>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(195px,1fr))", gap:12 }}>
            {[
              { icon:"🌤️", label:"Weather",     desc:"April–June: Hot, 30–34°C. Occasional afternoon rain. Light breathable clothing recommended." },
              { icon:"💱", label:"Currency",    desc:"Philippine Peso (PHP). Bring small bills for vendors. USD exchange available on-island." },
              { icon:"🛡️", label:"Safety Tips", desc:"Keep valuables in your hotel safe. Watch bags on the beach. Use only accredited operators." },
            ].map(tile => (
              <div key={tile.label} style={{ padding:16, borderRadius:14, background:dark?"rgba(255,140,0,0.05)":"#fff8f0", border:"1px solid rgba(255,140,0,0.14)" }}>
                <p style={{ fontSize:20, marginBottom:6 }}>{tile.icon}</p>
                <p style={{ fontSize:12, fontWeight:700, marginBottom:6, color:tk.text }}>{tile.label}</p>
                <p style={{ fontSize:11, color:tk.muted, lineHeight:1.65 }}>{tile.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider tk={tk} />

        {/* 6 · OPTIONAL TOURS */}
        <div id="tours">
          <SectionLabel text="Optional Tours" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>
            Enhance Your {SAMPLE.destination} Experience
          </h2>
          <p style={{ color:tk.muted, fontSize:13, marginBottom:24 }}>Curated activities for your trip. Add before departure for seamless coordination.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
            {TOURS.map(tour => (
              <div key={tour.id} className="tour-card"
                style={{ borderRadius:16, overflow:"hidden", background:tk.card, border:`1px solid ${tk.cardBorder}`, transition:"border-color 0.2s" }}>
                <div style={{ height:190, overflow:"hidden", position:"relative" }}>
                  <img src={tour.image} alt={tour.name} className="tour-img"
                    style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.4s ease", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)" }} />
                  <div style={{ position:"absolute", top:10, left:10 }}>
                    <span style={{ fontSize:10, fontWeight:700, background:tk.orange, color:"#000", padding:"3px 10px", borderRadius:99 }}>{tour.tag}</span>
                  </div>
                  <div style={{ position:"absolute", bottom:10, right:10 }}>
                    <span style={{ fontSize:10, color:"rgba(255,255,255,0.85)", background:"rgba(0,0,0,0.45)", padding:"3px 10px", borderRadius:99, backdropFilter:"blur(6px)" }}>⏱ {tour.duration}</span>
                  </div>
                </div>
                <div style={{ padding:16 }}>
                  <p style={{ fontSize:14, fontWeight:800, marginBottom:8, color:tk.text }}>{tour.name}</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14 }}>
                    {tour.includes.map(inc => (
                      <span key={inc} style={{ fontSize:10, color:tk.muted, background:tk.pillBg, padding:"3px 8px", borderRadius:99, border:`1px solid ${tk.line}` }}>✓ {inc}</span>
                    ))}
                  </div>
                  <button className="ghost-btn"
                    onClick={() => setAddedTours(p => ({ ...p, [tour.id]:!p[tour.id] }))}
                    style={{ width:"100%", padding:10, borderRadius:10, border:`1px solid ${addedTours[tour.id] ? "#22c55e" : tk.orange}`, background:addedTours[tour.id] ? "rgba(34,197,94,0.09)" : "rgba(255,140,0,0.09)", color:addedTours[tour.id] ? "#22c55e" : tk.orange, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Poppins',sans-serif", transition:"opacity 0.2s" }}>
                    {addedTours[tour.id] ? "✓ Added to Trip" : "+ Add to Trip"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {totalAdded > 0 && (
            <div style={{ marginTop:20, padding:"14px 20px", borderRadius:12, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:13, color:"#22c55e", fontWeight:600 }}>✓ {totalAdded} tour{totalAdded>1?"s":""} added to your trip</p>
              <button className="ghost-btn" style={{ fontSize:11, color:"#22c55e", background:"none", border:"1px solid rgba(34,197,94,0.3)", padding:"5px 12px", borderRadius:99, cursor:"pointer", fontWeight:700, fontFamily:"'Poppins',sans-serif" }}>View Cart</button>
            </div>
          )}
        </div>

        <Divider tk={tk} />

        {/* 7 · INSURANCE */}
        <div id="insurance">
          <SectionLabel text="Travel Insurance Add-On" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:8 }}>
            Protect Your Trip Before You Go
          </h2>
          <p style={{ color:tk.muted, fontSize:13, lineHeight:1.75, marginBottom:24, maxWidth:520 }}>
            Travel insurance is optional but highly recommended. Select the plan that fits your needs.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:20 }}>
            {INSURANCE.map(plan => (
              <div key={plan.id} className="ins-card"
                onClick={() => setSelectedIns(selectedIns===plan.id ? null : plan.id)}
                style={{ padding:20, borderRadius:16, border:`1.5px solid ${selectedIns===plan.id ? tk.orange : tk.cardBorder}`, background:selectedIns===plan.id ? (dark?"rgba(255,140,0,0.07)":"#fff8f0") : tk.card, cursor:"pointer", transition:"all 0.2s", position:"relative" }}>
                {plan.recommended && (
                  <div style={{ position:"absolute", top:-1, right:14, background:tk.orange, color:"#000", fontSize:9, fontWeight:900, padding:"3px 10px", borderRadius:"0 0 8px 8px", textTransform:"uppercase", letterSpacing:"0.06em" }}>Recommended</div>
                )}
                <p style={{ fontSize:15, fontWeight:800, marginBottom:4, color:tk.text }}>{plan.label}</p>
                <p style={{ fontSize:10, color:tk.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Travel Insurance</p>
                {plan.features.map(f => (
                  <div key={f} style={{ display:"flex", gap:8, marginBottom:7 }}>
                    <span style={{ color:tk.orange, fontSize:12 }}>✓</span>
                    <p style={{ fontSize:11, color:tk.muted, lineHeight:1.45 }}>{f}</p>
                  </div>
                ))}
                <div style={{ marginTop:16, paddingTop:12, borderTop:`1px solid ${tk.line}`, display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${selectedIns===plan.id ? tk.orange : tk.cardBorder}`, background:selectedIns===plan.id ? tk.orange : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                    {selectedIns===plan.id && <div style={{ width:5, height:5, borderRadius:"50%", background:"#000" }} />}
                  </div>
                  <span style={{ fontSize:11, color:selectedIns===plan.id ? tk.orange : tk.muted, fontWeight:600 }}>
                    {selectedIns===plan.id ? "Selected" : "Select Plan"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {selectedIns && (
            <div style={{ padding:"14px 20px", borderRadius:12, background:dark?"rgba(255,140,0,0.08)":"#fff8f0", border:"1px solid rgba(255,140,0,0.25)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ fontSize:13, color:tk.orange, fontWeight:600 }}>✓ {INSURANCE.find(p=>p.id===selectedIns)?.label} plan selected</p>
              <button className="ghost-btn" style={{ fontSize:11, color:tk.orange, background:"none", border:"1px solid rgba(255,140,0,0.3)", padding:"5px 12px", borderRadius:99, cursor:"pointer", fontWeight:700, fontFamily:"'Poppins',sans-serif" }}>Add to Cart</button>
            </div>
          )}
          <div style={{ marginTop:14, padding:16, borderRadius:12, background:tk.inputBg, border:`1px solid ${tk.line}` }}>
            <p style={{ fontSize:11, color:tk.muted, lineHeight:1.75 }}>
              Covers: <span style={{ color:tk.text }}>Medical Emergencies · Trip Delays · Lost Baggage · Flight Interruptions · Unexpected Incidents</span>
            </p>
          </div>
        </div>

        <Divider tk={tk} />

        {/* 8 · FAQs */}
        <div id="faq">
          <SectionLabel text="Frequently Asked Questions" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.3rem,3vw,2rem)", fontWeight:800, letterSpacing:"-0.02em", marginBottom:24 }}>
            Got Questions?
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {FAQS.map((faq,i) => (
              <div key={i} className="faq-row"
                onClick={() => setOpenFaq(openFaq===i ? null : i)}
                style={{ borderRadius:14, border:`1px solid ${openFaq===i ? "rgba(255,140,0,0.25)" : tk.cardBorder}`, background:tk.card, overflow:"hidden", cursor:"pointer", transition:"border-color 0.2s" }}>
                <div style={{ padding:"15px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                  <p style={{ fontSize:13, fontWeight:600, lineHeight:1.4, color:tk.text }}>{faq.q}</p>
                  <span style={{ fontSize:18, color:tk.orange, transition:"transform 0.25s", transform:openFaq===i?"rotate(45deg)":"none", flexShrink:0, lineHeight:1 }}>+</span>
                </div>
                {openFaq===i && (
                  <div style={{ padding:"0 20px 16px", borderTop:`1px solid ${tk.line}` }}>
                    <p style={{ fontSize:12, color:tk.muted, lineHeight:1.85, paddingTop:12 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Divider tk={tk} />

        {/* FOOTER */}
        <div style={{ textAlign:"center", padding:"12px 0 32px" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <GladexLogo tk={tk} />
          </div>
          <SectionLabel text="All Set?" tk={tk} />
          <h2 style={{ fontSize:"clamp(1.4rem,4vw,2.4rem)", fontWeight:900, fontStyle:"italic", letterSpacing:"-0.03em", marginBottom:10, color:tk.text }}>
            Have an Amazing Trip! 🌴
          </h2>
          <p style={{ color:tk.muted, fontSize:13, lineHeight:1.75, maxWidth:420, margin:"0 auto 28px" }}>
            Your Gladex team is always a message away. Safe travels and enjoy {SAMPLE.destination}!
          </p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button className="orange-btn"
              style={{ padding:"12px 28px", borderRadius:99, background:`linear-gradient(135deg,${tk.orange},${tk.orangeDeep})`, color:"#fff", fontSize:12, fontWeight:800, border:"none", cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase", boxShadow:"0 6px 24px rgba(255,140,0,0.3)", fontFamily:"'Poppins',sans-serif", transition:"opacity 0.2s" }}>
              📞 Contact Consultant
            </button>
            <button className="ghost-btn"
              style={{ padding:"12px 28px", borderRadius:99, background:"transparent", color:tk.orange, fontSize:12, fontWeight:800, border:"1px solid rgba(255,140,0,0.4)", cursor:"pointer", letterSpacing:"0.06em", textTransform:"uppercase", fontFamily:"'Poppins',sans-serif", transition:"opacity 0.2s" }}>
              ⭐ Rate My Service
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}