// @ts-nocheck
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import { getDestination, SUPPORTED_DESTINATIONS } from "@/data/destinationData";
import TBHero from "@/components/travelbriefing/TBHero";
import TBBriefingVideo from "@/components/travelbriefing/TBBriefingVideo";
import TBItinerary from "@/components/travelbriefing/TBItinerary";
import TBChecklist from "@/components/travelbriefing/TBChecklist";
import TBDestinationGuide from "@/components/travelbriefing/TBDestinationGuide";
import TBOptionalTours from "@/components/travelbriefing/TBOptionalTours";
import TBFAQs from "@/components/travelbriefing/TBFAQs";
import TBBookingVerification from "@/components/travelbriefing/TBBookingVerification";
import { lookupBooking } from "@/services/supabaseService";
import { getDomesticQuote } from "@/services/starrService";
import { loadDestinationTours, GLADEX_TOUR_PRODUCTS } from "@/services/globaltixService";
import { createGladexCheckout } from "@/services/xenditService";
import {
  Check, X, AlertTriangle, ArrowUp, Phone,
  Download, Star, Gift, ShoppingCart,
  BadgeCheck, Info, Loader,
} from "lucide-react";

// ── Starr domestic plan definitions ─────────────────────────────
// Coverage text stays static; only prices come from Starr API
const STARR_PLANS = [
  {
    key:      "economy",
    planId:   "1086",
    name:     "Economy",
    coverage: ["Emergency Medical Expenses", "Accidental Death & Disablement", "Baggage Loss / Delay"],
    recommended: false,
  },
  {
    key:      "elite",
    planId:   "1087",
    name:     "Elite",
    coverage: ["All Economy Coverage", "Trip Cancellation", "Trip Delay", "Personal Liability", "Emergency Evacuation"],
    recommended: true,
  },
];

const RATE_QUESTIONS = [
  "Was the booking process easy?",
  "Was our team responsive?",
  "Are you satisfied with the service so far?",
  "Would you recommend Gladex?",
];

// ── Status display helper ────────────────────────────────────────
function getDisplayStatus(rawStatus) {
  if (!rawStatus) return "Confirmed";
  const s = rawStatus.toLowerCase().trim();
  if (["processed", "confirmed", "booked", "complete", "completed", "verified", "approved", "active"].includes(s)) return "Confirmed";
  if (s.includes("pending")) return "Pending";
  if (s.includes("cancel")) return "Cancelled";
  return rawStatus;
}

// ── Shared animation config ──────────────────────────────────────
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const cardVariant = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };

// ── FadeIn ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Section header ───────────────────────────────────────────────
function SectionHeader({ eyebrow, title, tk }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: tk.textMuted }}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-black text-2xl sm:text-3xl" style={{ color: tk.textPrimary, letterSpacing: "-0.02em" }}>
        {title}
      </h2>
    </div>
  );
}

// ── Section divider ──────────────────────────────────────────────
function SectionDivider({ tk }) {
  return <div className="border-t my-2" style={{ borderColor: tk.borderColor }} />;
}

// ── Back to top ──────────────────────────────────────────────────
function BackToTopButton({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="btt"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #f97316, #b45309)",
            borderColor: "rgba(249,115,22,0.4)",
            boxShadow: "0 4px 18px rgba(249,115,22,0.35)",
          }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ── Arrival tab ──────────────────────────────────────────────────
function ArrivalTab({ dest, activeTab, setActiveTab, tk, darkMode }) {
  const tabs = dest.arrivalInstructions.tabs;
  const current = dest.arrivalInstructions[activeTab] || dest.arrivalInstructions[tabs[0].key];
  return (
    <div>
      {tabs.length > 1 && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="text-xs font-semibold px-4 py-2 rounded-full border transition-all"
                style={{
                  borderColor: active ? "#f97316" : tk.borderColor,
                  backgroundColor: active ? "rgba(249,115,22,0.12)" : "transparent",
                  color: active ? "#f97316" : tk.textMuted,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}
      {current && (
        <div className="space-y-3">
          {current.steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }} className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
                {i + 1}
              </div>
              <p className="text-sm leading-snug pt-1" style={{ color: tk.textPrimary }}>{step}</p>
            </motion.div>
          ))}
          {current.note && (
            <div className="mt-4 p-3 rounded-xl border text-xs flex items-start gap-2" style={{ borderColor: "rgba(249,115,22,0.25)", backgroundColor: "rgba(249,115,22,0.07)", color: tk.textMuted }}>
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
              {current.note}
            </div>
          )}
          {current.vanSchedule && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tk.textMuted }}>Van Transfer Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 border" style={{ borderColor: tk.borderColor, backgroundColor: tk.surfaceBg }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>Puerto Princesa → El Nido</p>
                  {current.vanSchedule.ppsToElNido.map((s) => (<p key={s} className="text-xs py-0.5" style={{ color: tk.textPrimary }}>{s}</p>))}
                </div>
                <div className="rounded-xl p-3 border" style={{ borderColor: tk.borderColor, backgroundColor: tk.surfaceBg }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>El Nido → Puerto Princesa</p>
                  {current.vanSchedule.elNidoToPps.map((s) => (<p key={s} className="text-xs py-0.5" style={{ color: tk.textPrimary }}>{s}</p>))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dev destination switcher ─────────────────────────────────────
function DevSwitcher({ currentSlug, navigate, darkMode, tk }) {
  const [open, setOpen] = useState(false);
  if (import.meta.env.PROD) return null;
  return (
    <div className="fixed bottom-6 left-4 z-50">
      <button onClick={() => setOpen((v) => !v)} className="text-xs font-bold px-3 py-2 rounded-xl border shadow-lg" style={{ backgroundColor: darkMode ? "#1a1a1a" : "#fff", borderColor: tk.borderColor, color: tk.textMuted, boxShadow: tk.cardShadow }}>
        🧪 {currentSlug}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.18 }} className="absolute bottom-10 left-0 rounded-xl border overflow-hidden shadow-xl" style={{ backgroundColor: darkMode ? "#141414" : "#fff", borderColor: tk.borderColor, minWidth: 140 }}>
            {SUPPORTED_DESTINATIONS.map((slug) => (
              <button key={slug} onClick={() => { navigate(`/destination/${slug}`); setOpen(false); }} className="w-full text-left text-xs px-3 py-2 hover:opacity-60 transition-opacity border-b last:border-0" style={{ borderColor: tk.borderColor, color: slug === currentSlug ? "#f97316" : tk.textPrimary, fontWeight: slug === currentSlug ? "700" : "400" }}>
                {slug === "elnido" ? "El Nido" : slug.charAt(0).toUpperCase() + slug.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE — follows GLADEX Travel Briefing Platform flow
// ═══════════════════════════════════════════════════════════════
const SESSION_KEY = "gladex-session";

export default function TravelBriefingLanding() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const dest = getDestination(slug);

  // Booking from GDX search (passed via React Router state)
  const routeBooking = location.state?.booking || null;
  const [restoredBooking, setRestoredBooking] = useState(null);
  const activeBooking = routeBooking || restoredBooking;

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [arrivalTab, setArrivalTab] = useState(() => dest?.arrivalInstructions?.tabs?.[0]?.key || "default");
  const [transferTab, setTransferTab] = useState("arrival");
  const [reminderTab, setReminderTab] = useState("before");

  // ── Phase 2: cart state ──────────────────────────────────────
  const [cart, setCart] = useState({ tours: [], insurance: null });

  // ── Phase 2: Starr live pricing ──────────────────────────────
  const [starrPrices, setStarrPrices] = useState({});     // { economy: "1146.00", elite: "1799.00" }
  const [insuranceLoading, setInsuranceLoading] = useState(true);

  // ── Phase 2: GlobalTix live tours ────────────────────────────
  const [toursLoading, setToursLoading] = useState(false);

  // ── Phase 2: Xendit checkout ─────────────────────────────────
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // ── Rate My Service ───────────────────────────────────────────
  const [ratings, setRatings] = useState({});

  // ── Cart helpers ──────────────────────────────────────────────
  const cartTotal = cart.tours.reduce((s, t) => s + (t.price || 0), 0)
    + (cart.insurance?.price || 0);

  // Button enabled when cart has items, regardless of price
  const hasCartItems = cart.tours.length > 0 || !!cart.insurance;

  // For Xendit: if prices are null, use minimum ₱1 for testing
  const xenditAmount = cartTotal > 0 ? cartTotal : 1;

  const toggleTour = (tour) =>
    setCart((prev) => ({
      ...prev,
      tours: prev.tours.some((t) => t.id === tour.id)
        ? prev.tours.filter((t) => t.id !== tour.id)
        : [...prev.tours, tour],
    }));

  const toggleInsurance = (plan) =>
    setCart((prev) => ({
      ...prev,
      insurance: prev.insurance?.key === plan.key ? null : plan,
    }));

  // ── Fetch Starr domestic plan pricing ────────────────────────
  useEffect(() => {
    setInsuranceLoading(true);
    const today = new Date();
    const end   = new Date(today);
    end.setDate(today.getDate() + 5);
    const ds = today.toISOString().split("T")[0];
    const de = end.toISOString().split("T")[0];

    Promise.all(
      STARR_PLANS.map((plan) =>
        getDomesticQuote(plan.key, ds, de, 1, 0)
          .then((data) => ({ key: plan.key, price: data?.discountPremium || null }))
          .catch(() => ({ key: plan.key, price: null }))
      )
    )
      .then((results) => {
        const priceMap = {};
        results.forEach(({ key, price }) => { priceMap[key] = price; });
        setStarrPrices(priceMap);
      })
      .finally(() => setInsuranceLoading(false));
  }, []);

  // ── Fetch GlobalTix live tours for this destination ─────────────
  const [liveTourData, setLiveTourData] = useState([]);
  useEffect(() => {
    if (!dest) return;
    // Skip API call when no products are configured for this destination
    if (!GLADEX_TOUR_PRODUCTS[dest.slug]?.length) {
      setToursLoading(false);
      return;
    }
    setToursLoading(true);
    loadDestinationTours(dest.slug)
      .then((tours) => { if (tours?.length) setLiveTourData(tours); })
      .catch(() => {})
      .finally(() => setToursLoading(false));
  }, [dest?.slug]);

  // ── Restore booking from sessionStorage on page refresh ──────
  useEffect(() => {
    setRestoredBooking(null);
    if (routeBooking) return;

    let saved;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      saved = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    if (!saved?.gdx || !saved?.slug || saved.slug !== slug) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }

    lookupBooking(saved.gdx)
      .then((booking) => setRestoredBooking(booking))
      .catch(() => sessionStorage.removeItem(SESSION_KEY));
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Itinerary PDF download ────────────────────────────────────
  const downloadItinerary = async () => {
    const bk = activeBooking;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const OG = [249, 115, 22];
    const BK = [26, 26, 26];
    const GY = [100, 100, 100];

    let y = 20;
    const PAGE_H = 270; // safe max y before footer
    const newPage = () => {
      doc.addPage();
      y = 20;
      doc.setFillColor(...OG);
      doc.rect(0, 0, 210, 8, "F");
    };
    const checkY = (needed = 15) => { if (y + needed > PAGE_H) newPage(); };
    const line = (txt, size = 10, color = BK, bold = false) => {
      doc.setFontSize(size);
      doc.setTextColor(...color);
      if (bold) doc.setFont("helvetica", "bold"); else doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(txt, 170);
      const h = lines.length * (size * 0.4 + 1.5);
      checkY(h);
      doc.text(lines, 20, y);
      y += h;
    };
    const spacer = (n = 5) => { y += n; };
    const divider = () => { checkY(8); doc.setDrawColor(...GY); doc.line(20, y, 190, y); y += 5; };

    // Header
    doc.setFillColor(...OG);
    doc.rect(0, 0, 210, 15, "F");
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(255,255,255);
    doc.text("GLADEX TRAVEL AND TOURS CORP.", 20, 10);
    doc.text("TRAVEL ITINERARY", 150, 10, { align: "right" });
    y = 25;

    line(`GDX-${bk?.gdx || ""}`, 16, OG, true);
    if (bk?.leadName) line(bk.leadName, 13, BK, true);
    spacer(3);

    divider();
    line("TRIP OVERVIEW", 9, GY, true);
    spacer(2);
    if (bk?.travelDate)    line(`Travel Date:   ${bk.travelDate}`, 10, BK);
    if (bk?.arrivalDate)   line(`Arrival:       ${bk.arrivalDate}`, 10, BK);
    if (bk?.departureDate) line(`Departure:     ${bk.departureDate}`, 10, BK);
    if (bk?.totalGuests)   line(`Guests:        ${bk.totalGuests}`, 10, BK);
    if (dest?.name)        line(`Destination:   ${dest.name}`, 10, BK);
    if (bk?.status)        line(`Status:        ${bk.status}`, 10, BK);
    if (bk?.paymentStatus) line(`Payment:       ${bk.paymentStatus}`, 10, BK);

    if (bk?.hotel) {
      spacer(3); divider();
      line("HOTEL DETAILS", 9, GY, true); spacer(2);
      if (bk.hotel.roomType)   line(`Room:    ${bk.hotel.roomType}`, 10, BK);
      if (bk.hotel.stayDates)  line(`Dates:   ${bk.hotel.stayDates}`, 10, BK);
      if (bk.hotel.nights)     line(`Nights:  ${bk.hotel.nights}`, 10, BK);
      if (bk.hotel.requests)   line(`Request: ${bk.hotel.requests}`, 10, BK);
      if (bk.tour?.hotelMention) line(`Hotel:   ${bk.tour.hotelMention}`, 10, BK);
    }

    if (bk?.ticket) {
      spacer(3); divider();
      line("FLIGHT DETAILS", 9, GY, true); spacer(2);
      if (bk.ticket.airline)      line(`Airline: ${bk.ticket.airline}`, 10, BK);
      if (bk.ticket.pnr)          line(`PNR:     ${bk.ticket.pnr}`, 10, BK);
      if (bk.ticket.ticketType)   line(`Type:    ${bk.ticket.ticketType}`, 10, BK);
    }

    if (bk?.tour) {
      spacer(3); divider();
      line("TOUR DETAILS", 9, GY, true); spacer(2);
      if (bk.tour.tourName) line(`Tour:      ${bk.tour.tourName}`, 10, BK);
      if (bk.tour.tourDate) line(`Tour Date: ${bk.tour.tourDate}`, 10, BK);
      if (bk.tour.description) {
        bk.tour.description.split("\n").filter(Boolean).forEach(l => line(l, 9, GY));
      }
    }

    if (bk?.transfer) {
      spacer(3); divider();
      line("TRANSFER DETAILS", 9, GY, true); spacer(2);
      if (bk.transfer.transferType) line(`Type: ${bk.transfer.transferType}`, 10, BK);
      if (bk.transfer.description) {
        bk.transfer.description.split("\n").filter(Boolean).forEach(l => line(l, 9, GY));
      }
    }

    // Day-by-day from destinationData
    if (dest?.itinerary?.length) {
      spacer(3); divider();
      line("DAY-BY-DAY ITINERARY", 9, GY, true); spacer(2);
      dest.itinerary.forEach(day => {
        line(`Day ${day.day} — ${day.title}`, 10, OG, true); spacer(1);
        day.activities.forEach(a => { line(`• ${a}`, 9, BK); });
        spacer(3);
      });
    }

    // Footer
    divider();
    line("Thank you for choosing Gladex Travel and Tours Corp.", 9, GY);
    line("Gladex Customer Care: +63 917 875 2200  |  7:00 AM – 9:00 PM", 9, GY);

    doc.save(`GDX-${bk?.gdx || "itinerary"}-Itinerary.pdf`);
  };

  // ── Xendit checkout ───────────────────────────────────────────
  const handleCheckout = async () => {
    if (!hasCartItems) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      // Build items — use ₱100 fallback if price not loaded yet (Xendit minimum is ₱10)
      const items = [
        ...cart.tours.map((t) => ({ name: t.name, quantity: 1, price: t.price || 100 })),
        ...(cart.insurance ? [{ name: `${cart.insurance.name} Travel Insurance`, quantity: 1, price: cart.insurance.price || 100 }] : []),
      ];
      const invoice = await createGladexCheckout({
        bookingCode: `${dest.slug.toUpperCase()}-${Date.now()}`,
        guestName:   "Guest", // Do NOT pass real client name/email during staging
        guestEmail:  null,    // Email disabled on staging — enable only on production
        items,
      });
      window.location.href = invoice.invoice_url;
    } catch (err) {
      setCheckoutError(err.message || "Checkout failed. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Design tokens ────────────────────────────────────────────
  const bg          = darkMode ? "#0c0c0c"                 : "#f4f3f1";
  const cardBg      = darkMode ? "#141414"                 : "#ffffff";
  const surfaceBg   = darkMode ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.028)";
  const textPrimary = darkMode ? "#f0f0f0"                 : "#1a1a1a";
  const textMuted   = darkMode ? "rgba(255,255,255,0.45)"  : "#6b7280";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)"  : "rgba(0,0,0,0.07)";
  const cardShadow  = darkMode
    ? "0 1px 3px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)";
  const card  = { backgroundColor: cardBg, borderColor, boxShadow: cardShadow };
  const muted = { color: textMuted };
  const tk    = { bg, cardBg, surfaceBg, textPrimary, textMuted, borderColor, cardShadow, card, muted };
  const sectionGap = "mb-12";
  const pad = "px-4 sm:px-6 max-w-2xl mx-auto";

  // ── 404 ─────────────────────────────────────────────────────
  if (!dest) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6" style={{ backgroundColor: bg }}>
        <DestinationNavbar />
        <p className="text-5xl">🗺️</p>
        <h1 className="text-2xl font-black" style={{ color: textPrimary }}>Destination Not Found</h1>
        <p className="text-xs" style={muted}>Available: {SUPPORTED_DESTINATIONS.join(", ")}</p>
        <button onClick={() => navigate("/")} className="mt-4 text-sm font-semibold px-4 py-2 rounded-full border" style={{ borderColor, color: textPrimary }}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <DestinationNavbar />

      {/* ══════════════════════════════════════════════════════
          HERO — destination imagery
         ══════════════════════════════════════════════════════ */}
      <TBHero dest={dest} darkMode={darkMode} />

      <div className={pad} style={{ paddingTop: "3rem", paddingBottom: "6rem" }}>

        {/* ══════════════════════════════════════════════════
            3. PERSONALIZED TRAVEL DASHBOARD
            Real data when via GDX · generic when direct URL
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            {/* ── Greeting card ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="p-5 pb-4" style={{ borderBottom: `1px solid ${borderColor}`, background: "linear-gradient(135deg, rgba(249,115,22,0.07), rgba(180,83,9,0.03))" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #f97316, #b45309)" }}>
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-xl" style={{ color: textPrimary }}>
                      Hi {activeBooking ? (activeBooking.leadName.split(" ")[0] || activeBooking.leadName) : "Traveler"}! 👋
                    </p>
                    <p className="font-semibold text-sm" style={{ color: "#f97316" }}>
                      Your {dest.name} trip is confirmed.
                    </p>
                  </div>
                </div>

                {/* ── Key trip info grid ── */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Destination",    value: dest.name },
                    { label: "Travel Date",    value: activeBooking?.travelDate    || dest.tagline },
                    { label: "Hotel",          value: (() => {
                      const bk = activeBooking;
                      if (!bk) return "—";
                      if (bk.hotel?.hotelName) return bk.hotel.hotelName;
                      if (bk.tour?.hotelMention) return bk.tour.hotelMention;
                      if (bk.hotel?.roomType && bk.hotel?.nights) return `${bk.hotel.roomType} · ${bk.hotel.nights} night(s)`;
                      if (bk.hotel?.roomType) return bk.hotel.roomType;
                      return "—";
                    })() },
                    { label: "Guests",         value: activeBooking ? `${activeBooking.totalGuests} person${Number(activeBooking.totalGuests) !== 1 ? "s" : ""}` : "—" },
                    { label: "Booking Status", value: getDisplayStatus(activeBooking?.status), badge: true },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="rounded-xl p-3 border" style={{ borderColor, backgroundColor: surfaceBg }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>{label}</p>
                      {badge
                        ? <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>{value}</span>
                        : <p className="text-xs font-semibold leading-snug" style={{ color: textPrimary }}>{value || "—"}</p>
                      }
                    </div>
                  ))}
                </div>

                {activeBooking && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: "GDX Reference", value: `GDX-${activeBooking.gdx}` },
                      { label: "Payment", value: activeBooking.paymentStatus || "—" },
                      ...(activeBooking.ticket?.airline ? [{ label: "Airline", value: `${activeBooking.ticket.airline}${activeBooking.ticket.pnr ? ` · ${activeBooking.ticket.pnr}` : ""}` }] : []),
                      ...(activeBooking.tour?.tourName ? [{ label: "Tour", value: activeBooking.tour.tourName }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl px-2.5 py-1 border text-xs" style={{ borderColor, backgroundColor: surfaceBg }}>
                        <span style={muted}>{label}: </span>
                        <span className="font-bold" style={{ color: textPrimary }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Action buttons ── */}
              <div className="p-4 flex flex-wrap gap-2">
                {/* Download Voucher — uses best available URL from Fusioo */}
                {(() => {
                  const bk = activeBooking;
                  const url = bk?.automatedVoucherUrl || bk?.voucherUrl || bk?.tourVoucherUrl
                    || (bk?.automatedVoucher?.startsWith?.("http") ? bk.automatedVoucher : null);
                  return url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-80"
                      style={{ borderColor: "rgba(249,115,22,0.35)", color: "#f97316", backgroundColor: "rgba(249,115,22,0.08)" }}>
                      <Download className="w-3.5 h-3.5" /> Download Voucher
                    </a>
                  ) : (
                    <button disabled className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border opacity-40"
                      style={{ borderColor, color: textPrimary, backgroundColor: surfaceBg }} title="Voucher not yet available — contact your travel consultant">
                      <Download className="w-3.5 h-3.5" /> Download Voucher
                    </button>
                  );
                })()}

                {/* Download Itinerary — always enabled, generates PDF */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={downloadItinerary}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-80"
                  style={{ borderColor: "rgba(249,115,22,0.35)", color: "#f97316", backgroundColor: "rgba(249,115,22,0.08)" }}
                >
                  <Download className="w-3.5 h-3.5" /> Download Itinerary
                </motion.button>

                {/* Contact Support */}
                <a href="tel:+639178752200"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all hover:opacity-80"
                  style={{ borderColor, color: textPrimary, backgroundColor: surfaceBg }}>
                  <Phone className="w-3.5 h-3.5" /> Contact Support
                </a>
              </div>
            </div>

            {/* ── Full booking details — expandable (contains inclusions/exclusions + itinerary) ── */}
            {activeBooking ? (
              <TBBookingVerification booking={activeBooking} dest={dest} darkMode={darkMode} tk={tk} />
            ) : (
              /* Non-logged-in view: show inclusions/exclusions directly */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-2xl border p-4" style={{ ...card }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>✓ Package Inclusions</p>
                  <ul className="space-y-2">
                    {dest.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-500" strokeWidth={2.5} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border p-4" style={{ ...card }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>✗ Exclusions</p>
                  <ul className="space-y-2">
                    {dest.exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                        <X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" strokeWidth={2.5} /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            4. TRAVEL BRIEFING VIDEO
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Pre-Departure Briefing" title="Watch Your Briefing Video" tk={tk} />
            <TBBriefingVideo dest={dest} darkMode={darkMode} tk={tk} />
            <p className="text-xs mt-3 text-center" style={muted}>
              Scroll down to review your complete travel briefing.
            </p>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            5. DAY-BY-DAY ITINERARY
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Your Trip Program" title="Day-by-Day Itinerary" tk={tk} />
            <TBItinerary dest={dest} darkMode={darkMode} tk={tk} />
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            6. TRAVEL INFORMATION CENTER
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Travel Information Center" title="Everything You Need to Know" tk={tk} />

            {/* ── 5a. Arrival Instructions ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>✈️ Arrival Instructions</p>
              </div>
              <div className="p-5">
                <ArrivalTab dest={dest} activeTab={arrivalTab} setActiveTab={setArrivalTab} tk={tk} darkMode={darkMode} />
              </div>
            </div>

            {/* ── 5b. Hotel Check-In ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>🏨 Hotel Check-In Information</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-xl p-3 border" style={{ borderColor: "rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.07)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#22c55e" }}>Check-In</p>
                    <p className="font-black text-sm" style={{ color: textPrimary }}>{dest.hotelInfo.checkin}</p>
                  </div>
                  <div className="rounded-xl p-3 border" style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.07)" }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#ef4444" }}>Check-Out</p>
                    <p className="font-black text-sm" style={{ color: textPrimary }}>{dest.hotelInfo.checkout}</p>
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={muted}>Upon Arrival to the Hotel:</p>
                <ul className="space-y-2">
                  {dest.hotelInfo.notes.map((note) => (
                    <li key={note} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                      <span className="text-orange-400 shrink-0 mt-0.5">•</span> {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── 5c. Requirements ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>📋 Requirements</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "🇵🇭 Filipino Travelers", items: dest.requirements.filipino },
                    { label: "🌏 Foreign Travelers", items: dest.requirements.foreign },
                    { label: "📄 Travel Documents", items: dest.requirements.documents },
                  ].map(({ label, items }) => (
                    <div key={label}>
                      <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>{label}</p>
                      {items.map((r) => (
                        <p key={r} className="text-xs flex items-center gap-1.5 mb-1" style={{ color: textPrimary }}>
                          <BadgeCheck className="w-3 h-3 text-green-500 shrink-0" /> {r}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 5d. Transfer Instructions ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="flex border-b" style={{ borderColor }}>
                <button className="px-5 pt-4 pb-3 font-bold text-sm flex-1 text-left" style={{ color: textPrimary }}>🚌 Transfer Instructions</button>
                <div className="flex border-l" style={{ borderColor }}>
                  {["arrival", "departure"].map((t) => (
                    <button key={t} onClick={() => setTransferTab(t)} className="px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all" style={{ color: transferTab === t ? "#f97316" : textMuted, borderBottom: transferTab === t ? "2px solid #f97316" : "2px solid transparent" }}>
                      {t === "arrival" ? "Arrival" : "Departure"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {(transferTab === "arrival" ? dest.transferInstructions.arrival : dest.transferInstructions.departure).map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
                        {s.step}
                      </div>
                      <div className="pt-1">
                        <p className="text-xs font-bold mb-0.5" style={{ color: textPrimary }}>{s.title}</p>
                        <p className="text-sm" style={muted}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {dest.transferInstructions.reminders?.length > 0 && (
                  <div className="mt-5 p-3 rounded-xl border" style={{ borderColor: "rgba(249,115,22,0.2)", backgroundColor: "rgba(249,115,22,0.06)" }}>
                    <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>Important Transfer Reminders</p>
                    {dest.transferInstructions.reminders.map((r) => (<p key={r} className="text-xs mb-1" style={muted}>• {r}</p>))}
                  </div>
                )}
              </div>
            </div>

            {/* ── 5e. Tour Reminders ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="px-5 pt-4 pb-0" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <p className="font-bold text-sm mb-3" style={{ color: textPrimary }}>📌 Tour Reminders</p>
                <div className="flex gap-0">
                  {[{ key: "before", label: "Before" }, { key: "during", label: "During Stay" }, { key: "departure", label: "Departure" }].map((t) => (
                    <button key={t.key} onClick={() => setReminderTab(t.key)} className="flex-1 pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2" style={{ color: reminderTab === t.key ? "#f97316" : textMuted, borderColor: reminderTab === t.key ? "#f97316" : "transparent" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.ul key={reminderTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-2.5">
                    {dest.reminders[reminderTab].map((r) => (
                      <li key={r} className="flex items-start gap-2.5 text-sm" style={{ color: textPrimary }}>
                        <span className="text-orange-400 shrink-0 mt-0.5">✔</span> {r}
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>
              </div>
            </div>

            {/* ── 5f. Emergency Contacts ── */}
            <div className="rounded-2xl border overflow-hidden mb-4" style={{ ...card }}>
              <div className="px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>📞 Emergency Contact Numbers</p>
              </div>
              <div className="p-4 space-y-3">
                {dest.emergencyContacts.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor, backgroundColor: surfaceBg }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #f97316, #b45309)" }}>
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={muted}>{c.label}</p>
                      <p className="font-bold text-sm" style={{ color: textPrimary }}>{c.number}</p>
                    </div>
                    {c.number.startsWith("+") && (
                      <a href={`tel:${c.number.replace(/\s/g, "")}`} className="text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0" style={{ borderColor: "rgba(249,115,22,0.35)", color: "#f97316", backgroundColor: "rgba(249,115,22,0.08)" }}>
                        Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 5g. Important Dos & Don'ts ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border p-4" style={{ ...card }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>✅ Do's</p>
                <ul className="space-y-2">
                  {dest.dos.map((d) => (<li key={d} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}><Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-500" strokeWidth={2.5} />{d}</li>))}
                </ul>
              </div>
              <div className="rounded-2xl border p-4" style={{ ...card }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>✖ Don'ts</p>
                <ul className="space-y-2">
                  {dest.donts.map((d) => (<li key={d} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}><X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" strokeWidth={2.5} />{d}</li>))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>


        {/* ══════════════════════════════════════════════════
            6. TRAVEL READINESS CHECKLIST
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Packing Checklist" title="Travel Readiness Checklist" tk={tk} />
            <div className="rounded-2xl border p-5" style={{ ...card }}>
              <TBChecklist dest={dest} darkMode={darkMode} tk={tk} />
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            7. WHAT TO BRING
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Pack Smart" title="What To Bring" tk={tk} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "📋 Essentials", items: dest.whatToBring.essentials },
                { label: "🏖️ Beach Essentials", items: dest.whatToBring.beach },
                { label: "🧳 Personal Items", items: dest.whatToBring.personal },
              ].map(({ label, items }) => (
                <div key={label} className="rounded-2xl border p-4" style={{ ...card }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={muted}>{label}</p>
                  <ul className="space-y-1.5">
                    {items.map((item) => (<li key={item} className="text-xs flex items-center gap-1.5" style={{ color: textPrimary }}><span className="text-orange-400 text-[8px]">●</span> {item}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            8. OUTFIT GUIDE
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Dress Code Guide" title="Outfit Guide" tk={tk} />
            <div className="grid grid-cols-2 gap-3">
              {dest.outfitGuide.map((o) => (
                <div key={o.occasion} className="border rounded-2xl p-4" style={{ borderColor, backgroundColor: surfaceBg }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{o.icon}</span>
                    <p className="font-bold text-sm" style={{ color: textPrimary }}>{o.occasion}</p>
                  </div>
                  <ul className="space-y-1">
                    {o.items.map((item) => (<li key={item} className="text-xs" style={muted}>→ {item}</li>))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            9. DESTINATION GUIDE
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Know Your Destination" title="Destination Guide" tk={tk} />
            <TBDestinationGuide dest={dest} darkMode={darkMode} tk={tk} />
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            10. OPTIONAL TOURS SECTION
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Add To Your Trip" title="Optional Tours & Activities" tk={tk} />
            <p className="text-sm mb-5" style={muted}>
              Select tours to add to your checkout. Contact +63 917 875 2200 for group or custom bookings.
            </p>
            {liveTourData.length > 0 ? (
              <p className="text-[10px] mb-3 flex items-center gap-1" style={{ color: "#22c55e" }}>
                ✅ Live pricing from GlobalTix · Add to cart and checkout below
              </p>
            ) : !toursLoading && (
              <p className="text-[10px] mb-3 flex items-center gap-1" style={{ color: tk.textMuted }}>
                📌 Curated tour list · Call +63 917 875 2200 to book any activity
              </p>
            )}
            <TBOptionalTours
              dest={liveTourData.length > 0
                ? { ...dest, optionalTours: liveTourData }
                : dest
              }
              darkMode={darkMode}
              tk={tk}
              loading={toursLoading}
              onAddToCart={toggleTour}
              cartItems={cart.tours}
            />
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            11. TRAVEL INSURANCE ADD-ON
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Protect Your Trip" title="Travel Insurance" tk={tk} />
            <p className="text-sm mb-5" style={muted}>
              Powered by Starr TraveLead — Philippines Domestic Travel Insurance.
              {insuranceLoading && <span className="ml-2 inline-flex items-center gap-1 text-orange-400"><Loader className="w-3 h-3 animate-spin" />Fetching live rates…</span>}
            </p>
            {/* Insurance plans — live prices from Starr API */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {STARR_PLANS.map((plan) => {
                const livePrice = starrPrices[plan.key];
                const inCart    = cart.insurance?.key === plan.key;
                return (
                  <div key={plan.key} className="rounded-2xl border p-4 relative" style={{ borderColor: plan.recommended ? "rgba(249,115,22,0.4)" : inCart ? "rgba(34,197,94,0.4)" : borderColor, backgroundColor: plan.recommended ? "rgba(249,115,22,0.05)" : cardBg, boxShadow: plan.recommended ? "0 0 0 2px rgba(249,115,22,0.2)" : cardShadow }}>
                    {plan.recommended && !inCart && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: "#f97316", color: "#fff" }}>⭐ Recommended</span>
                      </div>
                    )}
                    {inCart && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: "#22c55e", color: "#fff" }}>✓ Added</span>
                      </div>
                    )}
                    <p className="font-black text-sm mb-1 mt-1" style={{ color: textPrimary }}>{plan.name} Coverage</p>

                    {/* Live price from Starr */}
                    <p className="font-black text-xl mb-3" style={{ color: "#f97316" }}>
                      {insuranceLoading
                        ? <span className="text-sm font-normal" style={{ color: textMuted }}>Loading…</span>
                        : livePrice
                          ? <>₱{parseFloat(livePrice).toLocaleString("en-PH", { minimumFractionDigits: 2 })}<span className="text-xs font-normal ml-1" style={{ color: textMuted }}>/ person</span></>
                          : <span className="text-sm font-normal" style={{ color: textMuted }}>Contact us</span>
                      }
                    </p>

                    <ul className="space-y-1.5 mb-4">
                      {plan.coverage.map((c) => (<li key={c} className="flex items-center gap-1.5 text-xs" style={{ color: textPrimary }}><Check className="w-3 h-3 text-green-500 shrink-0" strokeWidth={2.5} />{c}</li>))}
                    </ul>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleInsurance({ key: plan.key, name: `${plan.name}`, price: livePrice ? parseFloat(livePrice) : 0 })}
                      className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: inCart ? "rgba(34,197,94,0.12)" : "linear-gradient(135deg, #f97316, #b45309)",
                        color: inCart ? "#22c55e" : "#fff",
                        border: inCart ? "1px solid rgba(34,197,94,0.4)" : "none",
                      }}
                    >
                      {inCart ? "✓ Remove Insurance" : "Add Insurance"}
                    </motion.button>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-center" style={muted}>
              Prices fetched live from Starr TraveLead API (UAT) · {new Date().toLocaleDateString("en-PH")} · Single trip, 1 adult, 5 days
            </p>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            12. CHECKOUT SECTION (Phase 1 placeholder)
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Cart Summary" title="Checkout" tk={tk} />
            <div className="rounded-2xl border p-5" style={{ ...card, borderStyle: hasCartItems ? "solid" : "dashed" }}>

              {/* Empty state */}
              {!hasCartItems && (
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingCart className="w-5 h-5" style={{ color: textMuted }} />
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>Your cart is empty</p>
                </div>
              )}

              {/* Cart items */}
              {(cart.tours.length > 0 || cart.insurance) && (
                <div className="space-y-2 mb-4">
                  {cart.tours.map((tour) => (
                    <div key={tour.id} className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor }}>
                      <span className="text-sm" style={{ color: textPrimary }}>{tour.icon} {tour.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "#f97316" }}>
                          {tour.price > 0 ? `₱${tour.price.toLocaleString("en-PH")}` : "Call for price"}
                        </span>
                        <button onClick={() => toggleTour(tour)} className="text-xs opacity-50 hover:opacity-100 transition-opacity" style={{ color: textMuted }}>✕</button>
                      </div>
                    </div>
                  ))}
                  {cart.insurance && (
                    <div className="flex items-center justify-between gap-3 py-2 border-b" style={{ borderColor }}>
                      <span className="text-sm" style={{ color: textPrimary }}>🛡️ {cart.insurance.name} Travel Insurance</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: "#f97316" }}>
                          {cart.insurance.price > 0 ? `₱${cart.insurance.price.toLocaleString("en-PH")}` : "Call for price"}
                        </span>
                        <button onClick={() => toggleInsurance(cart.insurance)} className="text-xs opacity-50 hover:opacity-100 transition-opacity" style={{ color: textMuted }}>✕</button>
                      </div>
                    </div>
                  )}
                  {cartTotal > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-sm" style={{ color: textPrimary }}>Total</span>
                      <span className="font-black text-lg" style={{ color: "#f97316" }}>
                        ₱{cartTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs mb-4" style={muted}>
                {cartTotal > 0
                  ? "Proceeding to Xendit secure payment. Accepts GCash, Maya, Credit Card, Bank Transfer."
                  : "Add optional tours or travel insurance from the sections above to proceed."}
              </p>

              {/* Payment method badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["GCash", "Maya", "Credit Card", "Bank Transfer", "Payment Link"].map((m) => (
                  <span key={m} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor, color: textMuted, backgroundColor: surfaceBg }}>{m}</span>
                ))}
              </div>

              {/* Checkout error */}
              {checkoutError && (
                <div className="mb-3 p-3 rounded-xl text-xs" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                  ⚠️ {checkoutError}
                </div>
              )}

              {/* Proceed to Checkout — live via Xendit */}
              <motion.button
                whileTap={{ scale: hasCartItems ? 0.97 : 1 }}
                onClick={handleCheckout}
                disabled={!hasCartItems || checkoutLoading}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: "linear-gradient(135deg, #f97316, #b45309)",
                  color: "#fff",
                  opacity: !hasCartItems ? 0.4 : 1,
                  cursor: !hasCartItems ? "not-allowed" : "pointer",
                }}
              >
                {checkoutLoading
                  ? <><Loader className="w-4 h-4 animate-spin" /> Creating payment link…</>
                  : hasCartItems
                    ? cartTotal > 0
                      ? <>Proceed to Checkout · ₱{cartTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</>
                      : <>Proceed to Checkout · Contact for Pricing</>
                    : "Add items to checkout"
                }
              </motion.button>

              <p className="text-[10px] text-center mt-3" style={muted}>
                Secured by Xendit · You will be redirected to the payment page.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            13. FREQUENTLY ASKED QUESTIONS
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Got Questions?" title="Frequently Asked Questions" tk={tk} />
            <TBFAQs dest={dest} darkMode={darkMode} tk={tk} />
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            14. TESTIMONIALS (Phase 1 placeholder)
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Real Gladex Experiences" title="What Our Guests Say" tk={tk} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Maria L.", dest: "Boracay · 3D2N", rating: 5, review: "Everything from our Caticlan airport pick-up to the sunset cruise was perfectly arranged. The briefing portal told us exactly where to wait and who to call — zero stress!" },
                { name: "Joel T.", dest: "Cebu · 4D3N", rating: 5, review: "The Oslob whale shark swim was a dream. Our driver had our name on a signboard before we even cleared arrivals. Gladex thought of every detail we'd never have figured out ourselves." },
                { name: "Christine B.", dest: "El Nido · 3D2N", rating: 5, review: "Tour C through the lagoons left us speechless. The van from Puerto Princesa was comfortable, stopovers were well-timed, and the team was reachable every step of the way." },
              ].map((t) => (
                <div key={t.name} className="rounded-2xl border p-4" style={{ ...card }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black" style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-xs" style={{ color: textPrimary }}>{t.name}</p>
                      <p className="text-[10px]" style={muted}>{t.dest}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />))}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed italic" style={muted}>"{t.review}"</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            15. RATE MY SERVICE (Phase 1 placeholder)
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="How Was Your Experience?" title="Rate My Service" tk={tk} />
            <div className="rounded-2xl border p-5" style={{ ...card }}>
              <div className="space-y-3 mb-5">
                {RATE_QUESTIONS.map((q) => (
                  <div key={q} className="flex items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: textPrimary }}>{q}</p>
                    <div className="flex gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          onClick={() => setRatings((prev) => ({ ...prev, [q]: s }))}
                          className="transition-transform hover:scale-110 active:scale-95"
                          aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              s <= (ratings[q] || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-yellow-400/30 hover:text-yellow-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                disabled={!RATE_QUESTIONS.every((q) => ratings[q])}
                className="w-full py-3 rounded-xl text-sm font-bold border transition-all"
                style={{
                  borderColor: "rgba(249,115,22,0.35)",
                  color: "#f97316",
                  backgroundColor: "rgba(249,115,22,0.07)",
                  opacity: RATE_QUESTIONS.every((q) => ratings[q]) ? 1 : 0.5,
                }}
              >
                {RATE_QUESTIONS.every((q) => ratings[q]) ? "Leave A Review" : `Rate ${RATE_QUESTIONS.filter((q) => !ratings[q]).length} more question${RATE_QUESTIONS.filter((q) => !ratings[q]).length !== 1 ? "s" : ""}`}
              </button>
              <p className="text-[10px] text-center mt-3" style={muted}>🔒 Review submission available in Phase 2 via Rate My Service integration.</p>
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            16. REFERRAL SECTION (Phase 1 placeholder)
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <div className="rounded-2xl border p-6 text-center" style={{ borderColor: "rgba(249,115,22,0.3)", background: darkMode ? "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(0,0,0,0))" : "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02))" }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #f97316, #b45309)" }}>
                <Gift className="w-6 h-6 text-white" />
              </div>
              <p className="font-black text-xl mb-2" style={{ color: textPrimary }}>Know Someone Who Wants To Travel?</p>
              <p className="text-sm mb-5" style={muted}>Refer a friend and receive travel rewards or discounts on your next booking with Gladex.</p>
              <button disabled className="px-8 py-3 rounded-full text-sm font-bold opacity-60" style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff", boxShadow: "0 4px 18px rgba(249,115,22,0.3)" }}>
                Refer A Friend
              </button>
              <p className="text-[10px] mt-3" style={muted}>🔒 Referral program available in Phase 2.</p>
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            Important Notes
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <div className="rounded-2xl border p-5" style={{ borderColor: "rgba(234,179,8,0.35)", backgroundColor: "rgba(234,179,8,0.07)" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" style={{ color: "#eab308" }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#eab308" }}>Important Notes & Reminders</p>
              </div>
              <ul className="space-y-2">
                {dest.notes.map((n) => (
                  <li key={n} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                    <span className="shrink-0 mt-0.5" style={{ color: "#eab308" }}>•</span> {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>

        {/* Footer CTA */}
        <FadeIn>
          <div className="text-center pt-4">
            <p className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>Thank you for choosing Gladex! 🧡</p>
            <p className="text-xs" style={muted}>We look forward to giving you a smooth, safe, and memorable {dest.name} experience.</p>
            <p className="text-xs mt-2" style={muted}>
              Need help? Call <span style={{ color: "#f97316", fontWeight: 700 }}>+63 917 875 2200</span> (7:00 AM – 9:00 PM)
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Floating UI */}
      <BackToTopButton visible={showBackToTop} />
      <DevSwitcher currentSlug={slug} navigate={navigate} darkMode={darkMode} tk={tk} />
    </div>
  );
}
