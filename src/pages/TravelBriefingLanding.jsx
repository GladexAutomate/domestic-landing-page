// @ts-nocheck
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import { getDestination, SUPPORTED_DESTINATIONS } from "@/data/destinationData";
import TBWelcomeSection from "@/components/travelbriefing/TBWelcomeSection";
import TBBriefingVideo from "@/components/travelbriefing/TBBriefingVideo";
import TBItinerary from "@/components/travelbriefing/TBItinerary";
import TBChecklist from "@/components/travelbriefing/TBChecklist";
import TBDestinationGuide from "@/components/travelbriefing/TBDestinationGuide";
import TBFAQs from "@/components/travelbriefing/TBFAQs";
import TBOptionalTours from "@/components/travelbriefing/TBOptionalTours";
import { lookupBooking, submitReview } from "@/services/supabaseService";
import {
  Check, X, AlertTriangle, ArrowUp, Phone,
  Download, Star, Gift,
  BadgeCheck, Info, Loader, ChevronDown, ChevronUp, MapPin,
} from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Maria Santos",
    location: "Boracay",
    destination: "boracay",
    date: "May 2025",
    review: "The briefing page had everything we needed — the island hopping schedule, hotel check-in details, and boat transfer instructions were all spot on. Zero stress on arrival!",
    rating: 5,
  },
  {
    name: "Jose Reyes",
    location: "Boracay",
    destination: "boracay",
    date: "March 2025",
    review: "Our family of 5 had zero confusion the entire trip. The jetty port instructions and boat transfer timing were explained so clearly. Gladex exceeded our expectations!",
    rating: 5,
  },
  {
    name: "Ana Villanueva",
    location: "Boracay",
    destination: "boracay",
    date: "April 2025",
    review: "Best beach trip ever! The pre-trip briefing had everything — even the reef-safe sunscreen reminder. White Beach was stunning and the island hopping tour was the highlight!",
    rating: 5,
  },
  {
    name: "Joel T.",
    location: "Boracay",
    destination: "boracay",
    date: "February 2025",
    review: "The portal made our Boracay arrival completely seamless. We knew exactly which port to go to, which boat to take, and what time to be there. No confusion at all!",
    rating: 4,
  },
  {
    name: "Christine B.",
    location: "Boracay",
    destination: "boracay",
    date: "January 2025",
    review: "Having all the hotel and tour schedules in one place was so helpful. We referred to the portal several times during the trip and everything matched exactly what happened on the ground.",
    rating: 5,
  },
  {
    name: "Raul M.",
    location: "Cebu",
    destination: "cebu",
    date: "March 2025",
    review: "The Cebu briefing was incredibly detailed. Oslob instructions and pick-up reminders saved us — we were ready at 3 AM without any panic. Smooth trip from start to finish!",
    rating: 5,
  },
  {
    name: "Liza C.",
    location: "Cebu",
    destination: "cebu",
    date: "April 2025",
    review: "We referred to the briefing page constantly during our Cebu trip. The tour schedule, hotel info, and local tips were all accurate and super helpful. Highly recommended!",
    rating: 5,
  },
  {
    name: "Patrick D.",
    location: "El Nido",
    destination: "elnido",
    date: "February 2025",
    review: "The El Nido briefing prepared us perfectly for the long van transfer from Puerto Princesa. We knew what to expect every step of the way. Absolutely worth it!",
    rating: 5,
  },
  {
    name: "Sandra L.",
    location: "El Nido",
    destination: "elnido",
    date: "May 2025",
    review: "Island hopping in El Nido was a dream. The briefing page told us exactly what to bring, which tours to expect, and the environmental fee reminders were very helpful!",
    rating: 5,
  },
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
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const cardVariant = { hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } };

// ── Item icon for What to Bring grid ────────────────────────────
function getItemIcon(item) {
  const t = item.toLowerCase();
  if (t.includes("passport") || (t.includes("id") && !t.includes("valid"))) return "🪪";
  if (t.includes("power bank")) return "🔋";
  if (t.includes("phone") || t.includes("mobile")) return "📱";
  if (t.includes("wallet") || (t.includes("cash") && !t.includes("bottle"))) return "💳";
  if (t.includes("water bottle") || t.includes("reusable")) return "🍶";
  if (t.includes("swimwear") || t.includes("swim")) return "🩱";
  if (t.includes("beach towel") || t.includes("towel")) return "🏖️";
  if (t.includes("sunscreen") || t.includes("sunblock")) return "🧴";
  if (t.includes("sunglasses") || t.includes("shades")) return "🕶️";
  if (t.includes("hat") || t.includes("cap")) return "🧢";
  if (t.includes("waterproof bag")) return "🎒";
  if (t.includes("waterproof phone") || t.includes("phone case")) return "📷";
  if (t.includes("clothes") || t.includes("outfit") || t.includes("extra")) return "👕";
  if (t.includes("toiletries")) return "🪥";
  if (t.includes("medication") || t.includes("medicine")) return "💊";
  if (t.includes("charger")) return "🔌";
  if (t.includes("rash guard")) return "🏄";
  if (t.includes("sandal") || t.includes("flip") || t.includes("shoe")) return "🩴";
  if (t.includes("valid id")) return "🪪";
  return "✅";
}

// ── FadeIn ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
}

// ── Inline Review Editor — self-contained state guarantees pre-fill ──
function InlineReviewEditor({ myReview, onSave, onCancel, darkMode, textPrimary, textMuted, cardBg, borderColor }) {
  const [stars, setStars] = useState(() => myReview?.rating ?? myReview?.stars ?? 0);
  const [comment, setComment] = useState(() => myReview?.review ?? myReview?.comment ?? "");
  return (
    <motion.div
      id="review-edit-inline"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border p-5 mt-4"
      style={{ backgroundColor: cardBg, borderColor: "#f97316", boxShadow: "0 0 0 1px #f97316, 0 4px 20px rgba(249,115,22,0.12)" }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>Update Your Review</p>
      <div className="flex gap-2 mb-4">
        {[1,2,3,4,5].map((s) => (
          <button key={s} onClick={() => setStars(s)} className="transition-transform hover:scale-110 active:scale-95">
            <Star className={`w-7 h-7 transition-colors ${s <= stars ? "fill-yellow-400 text-yellow-400" : darkMode ? "text-white/20 hover:text-yellow-400" : "text-black/15 hover:text-yellow-400"}`} />
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Update your review..."
        className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-colors mb-3"
        style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", color: textPrimary }}
      />
      <div className="flex gap-2">
        <button
          onClick={() => stars > 0 && onSave(stars, comment)}
          disabled={stars === 0}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ backgroundColor: stars > 0 ? "#f97316" : "rgba(249,115,22,0.2)", color: stars > 0 ? "#fff" : "#f97316" }}
        >
          Update Review
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ color: textMuted, backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
        >
          Cancel
        </button>
      </div>
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

function SectionBanner({ eyebrow, title, imageUrl, tk }) {
  if (!imageUrl) return <SectionHeader eyebrow={eyebrow} title={title} tk={tk} />;
  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-6" style={{ height: "180px" }}>
      <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.65) 0%, rgba(0,0,0,0.72) 100%)" }} />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {eyebrow && (
          <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.68)" }}>
            {eyebrow}
          </p>
        )}
        <h2 className="font-black text-2xl sm:text-3xl text-white" style={{ letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
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
            <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.25 }} className="flex items-start gap-3">
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

// ── Date formatter — "December 10, 2027" ─────────────────────────
function formatDate(val) {
  if (!val || val === "—") return val || "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ── BookingSection ───────────────────────────────────────────────
function BookingSection({ label, children, darkMode }) {
  return (
    <div style={{ borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "#f0ece7"}` }}>
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ backgroundColor: darkMode ? "rgba(249,115,22,0.04)" : "rgba(249,115,22,0.025)" }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(249,115,22,0.12)", border: "1.5px solid rgba(249,115,22,0.35)" }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: "#f97316" }} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: "#f97316" }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

// ── BookingRow ───────────────────────────────────────────────────
function BookingRow({ label1, value1, label2, value2, textPrimary, textMuted, preWrap1 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>
          {label1}
        </p>
        <p className={`text-sm font-semibold leading-snug${preWrap1 ? " whitespace-pre-line" : ""}`} style={{ color: textPrimary }}>
          {value1 || "—"}
        </p>
      </div>
      {label2 ? (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>
            {label2}
          </p>
          <p className="text-sm font-semibold leading-snug" style={{ color: textPrimary }}>
            {value2 || "—"}
          </p>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  OUTFIT GUIDE — helper components
// ═══════════════════════════════════════════════════════════════
const OUTFIT_TABS = ["Female","Male","Couple","Family","Kids","Senior"];

function OutfitCard({ occasion, darkMode, textPrimary, textMuted, cardBg, borderColor, cardShadow }) {
  const [activeTab, setActiveTab] = useState("Female");
  const [photoIdx, setPhotoIdx]   = useState(0);

  const variant    = occasion.variants?.[activeTab];
  const rawPhotos  = variant?.photos?.filter(Boolean) ?? [];
  const photos     = rawPhotos.length ? rawPhotos : (occasion.image ? [occasion.image] : []);
  const tip        = variant?.tip || occasion.tip || "";

  const getTabPhotos = (tab) => {
    const v = occasion.variants?.[tab];
    const raw = v?.photos?.filter(Boolean) ?? [];
    return raw.length ? raw : (occasion.image ? [occasion.image] : []);
  };

  const handleTabChange = (tab) => { setActiveTab(tab); setPhotoIdx(0); };

  const nextPhoto = () => {
    if (photoIdx < photos.length - 1) {
      setPhotoIdx((c) => c + 1);
    } else {
      const nextTabIndex = (OUTFIT_TABS.indexOf(activeTab) + 1) % OUTFIT_TABS.length;
      setActiveTab(OUTFIT_TABS[nextTabIndex]);
      setPhotoIdx(0);
    }
  };

  const prevPhoto = () => {
    if (photoIdx > 0) {
      setPhotoIdx((c) => c - 1);
    } else {
      const prevTabIndex = (OUTFIT_TABS.indexOf(activeTab) - 1 + OUTFIT_TABS.length) % OUTFIT_TABS.length;
      const prevTab = OUTFIT_TABS[prevTabIndex];
      const prevPhotos = getTabPhotos(prevTab);
      setActiveTab(prevTab);
      setPhotoIdx(Math.max(0, prevPhotos.length - 1));
    }
  };

  return (
    <div className="rounded-2xl border overflow-hidden flex flex-col" style={{ backgroundColor: cardBg, borderColor, boxShadow: cardShadow }}>
      {/* ── Photo area ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/5" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${photoIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {photos.length > 0 ? (
              <img
                src={photos[photoIdx]}
                alt={`${occasion.occasion} — ${activeTab}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-6xl"
                style={{ background: darkMode ? "#1a1a1a" : "#f5f5f5" }}
              >
                {occasion.icon}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 55%)" }} />

        {/* Counter */}
        <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}>
          {photos.length > 1 ? `${photoIdx + 1} / ${photos.length}` : `1 / ${photos.length || 1}`}
        </div>

        {/* Gender badge */}
        <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#f97316", color: "#fff" }}>
          {activeTab}
        </div>

        {/* Prev/Next arrows — always visible, flows across tabs */}
        <>
          <button
            onClick={prevPhoto}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: "1.1rem", lineHeight: 1 }}
            aria-label="Previous photo"
          >‹</button>
          <button
            onClick={nextPhoto}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: "1.1rem", lineHeight: 1 }}
            aria-label="Next photo"
          >›</button>
        </>

        {/* Photo dots (inside image, above label) */}
        {photos.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-1 pointer-events-none">
            {photos.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{ width: i === photoIdx ? "14px" : "5px", height: "5px", background: i === photoIdx ? "#fff" : "rgba(255,255,255,0.45)" }}
              />
            ))}
          </div>
        )}

        {/* Occasion label */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-black text-sm text-white leading-snug">{occasion.occasion}</p>
        </div>
      </div>

      {/* ── Gender tabs ── */}
      <div className="px-3 pt-2.5 pb-1">
        <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>Outfit for:</p>
        <div className="flex flex-wrap gap-1.5">
          {OUTFIT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
              style={activeTab === tab
                ? { background: "#f97316", color: "#fff", borderColor: "#f97316" }
                : { background: "transparent", color: textMuted, borderColor }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Save badge */}
      <div className="px-3 pb-1">
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#f97316" }}>✦ Save This For Later!</span>
      </div>

      {/* Tip */}
      <div className="px-3 pb-3 flex items-start gap-1.5">
        <span className="text-xs shrink-0">💡</span>
        <p className="text-[11px] leading-relaxed" style={{ color: textMuted }}>{tip}</p>
      </div>
    </div>
  );
}

function OutfitGuideSection({ dest, darkMode, sectionGap, textPrimary, textMuted, cardBg, borderColor, cardShadow }) {
  const [page, setPage]       = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e) => { setIsMobile(e.matches); setPage(0); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const occasions = dest.outfitGuide || [];
  if (!occasions.length) return null;

  const PER_PAGE   = isMobile ? 1 : 2;
  const totalPages = Math.ceil(occasions.length / PER_PAGE);
  const safePage   = Math.min(page, totalPages - 1);
  const visible    = occasions.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);
  const prevPage   = () => setPage((p) => Math.max(0, p - 1));
  const nextPage   = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className={sectionGap}>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>Style Guide</p>
      <h2
        className="font-black text-2xl mb-2"
        style={{ color: textPrimary, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.02em", borderLeft: "4px solid #f97316", paddingLeft: "0.75rem" }}
      >
        Outfit Inspiration
      </h2>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: textMuted }}>
        Tap a category to swap photos per gender. Gray arrows → browse photos. Orange arrow → change outfit type.
      </p>

      {/* Cards + outer nav arrows */}

      {/* Mobile: full-width card + clear labeled Prev/Next buttons below */}
      <div className="sm:hidden">
        <div className="grid grid-cols-1 gap-3">
          {visible.map((o) => (
            <OutfitCard
              key={o.occasion}
              occasion={o}
              darkMode={darkMode}
              textPrimary={textPrimary}
              textMuted={textMuted}
              cardBg={cardBg}
              borderColor={borderColor}
              cardShadow={cardShadow}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={prevPage}
              disabled={safePage === 0}
              className="flex-1 py-3 rounded-xl text-sm font-bold border transition-all"
              style={{
                color: safePage === 0 ? textMuted : "#f97316",
                borderColor: safePage === 0 ? borderColor : "#f97316",
                background: "transparent",
                opacity: safePage === 0 ? 0.4 : 1,
              }}
            >← Prev Outfit</button>
            <p className="text-[10px] font-black shrink-0" style={{ color: textMuted }}>
              {safePage + 1} / {totalPages}
            </p>
            <button
              onClick={nextPage}
              disabled={safePage === totalPages - 1}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: safePage === totalPages - 1 ? "transparent" : "linear-gradient(135deg, #f97316, #b45309)",
                color: safePage === totalPages - 1 ? textMuted : "#fff",
                border: safePage === totalPages - 1 ? `1px solid ${borderColor}` : "none",
                opacity: safePage === totalPages - 1 ? 0.4 : 1,
              }}
            >Next Outfit →</button>
          </div>
        )}
      </div>

      {/* Desktop: cards with side arrows */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={prevPage}
          disabled={safePage === 0}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{
            background: safePage === 0 ? "transparent" : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
            color: safePage === 0 ? "transparent" : textMuted,
            border: `1px solid ${safePage === 0 ? "transparent" : borderColor}`,
            fontSize: "1.1rem",
            lineHeight: 1,
          }}
          aria-label="Previous outfit type"
        >‹</button>

        <div className="flex-1 grid sm:grid-cols-2 gap-3">
          {visible.map((o) => (
            <OutfitCard
              key={o.occasion}
              occasion={o}
              darkMode={darkMode}
              textPrimary={textPrimary}
              textMuted={textMuted}
              cardBg={cardBg}
              borderColor={borderColor}
              cardShadow={cardShadow}
            />
          ))}
        </div>

        <button
          onClick={nextPage}
          disabled={page === totalPages - 1}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
          style={{
            background: safePage === totalPages - 1 ? borderColor : "linear-gradient(135deg, #f97316, #b45309)",
            color: "#fff",
            fontSize: "1.3rem",
            lineHeight: 1,
            boxShadow: safePage === totalPages - 1 ? "none" : "0 4px 14px rgba(249,115,22,0.45)",
          }}
          aria-label="Next outfit type"
        >›</button>
      </div>

      {/* Page dots — desktop only; mobile uses labeled Prev/Next buttons */}
      {totalPages > 1 && (
        <div className="hidden sm:flex items-center justify-center gap-2 mt-3">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="rounded-full transition-all"
              style={{ width: i === safePage ? "24px" : "8px", height: "8px", background: i === safePage ? "#f97316" : borderColor }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
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
  const [bookingExpanded, setBookingExpanded] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);

  // ── Testimonials carousel ─────────────────────────────────────
  const [testimonialsPage, setTestimonialsPage] = useState(0);
  const [testimonialsMobile, setTestimonialsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  // ── Rate My Service ───────────────────────────────────────────
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewEditing, setReviewEditing] = useState(false);
  const [myReview, setMyReview] = useState(() => {
    try {
      const gdx = JSON.parse(sessionStorage.getItem("gladex-session") || "{}").gdx;
      if (!gdx) return null;
      const stored = localStorage.getItem(`gladex-review-${gdx}`);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setTestimonialsMobile(mq.matches);
    const handler = (e) => { setTestimonialsMobile(e.matches); setTestimonialsPage(0); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync edit form with stored review whenever the edit panel opens
  useEffect(() => {
    if (reviewEditing && myReview) {
      setReviewStars(myReview.rating ?? myReview.stars ?? 0);
      setReviewComment(myReview.review ?? myReview.comment ?? "");
    }
  }, [reviewEditing]);

  const handleSubmitReview = (starsParam, commentParam) => {
    const finalStars = starsParam ?? reviewStars;
    const finalComment = commentParam ?? reviewComment;
    if (finalStars === 0) return;
    const gdx = activeBooking?.gdx ?? "guest";
    const destination = slug ?? "boracay";
    const now = new Date();
    const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });
    const review = {
      name: "You",
      location: destination.charAt(0).toUpperCase() + destination.slice(1),
      date: monthYear,
      review: String(finalComment).trim() || `${finalStars === 5 ? "Amazing" : finalStars >= 4 ? "Great" : "Good"} experience with Gladex Tours!`,
      rating: finalStars,
    };
    try { localStorage.setItem(`gladex-review-${gdx}`, JSON.stringify(review)); } catch {}
    setMyReview(review);
    setReviewStars(finalStars);
    setReviewComment(String(finalComment).trim());
    setReviewSubmitted(true);
    setReviewEditing(false);
    submitReview({ gdx_reference: gdx, rating: finalStars, comment: String(finalComment).trim() }).catch(() => {});
  };

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
  const sectionGap = "mb-16";
  const pad = "px-4 sm:px-6 max-w-4xl mx-auto";

  // Section banner images — sourced from dest.bannerImages (local assets or Pexels CDN)
  const BANNER = {
    travelInfo:  dest?.bannerImages?.travelInfo  || dest?.itinerary?.[0]?.image,
    currency:    dest?.bannerImages?.currency    || dest?.heroImages?.[1] || dest?.heroImage,
    safety:      dest?.bannerImages?.safety      || dest?.heroImages?.[0] || dest?.heroImage,
    packing:     dest?.bannerImages?.packing     || dest?.heroImages?.[2] || dest?.heroImage,
    destination: dest?.bannerImages?.destination || dest?.heroImage,
    localTips:   dest?.bannerImages?.localTips   || dest?.heroImages?.[1] || dest?.heroImage,
    faq:         dest?.bannerImages?.faq         || dest?.heroImages?.[3] || dest?.heroImage,
  };

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
      <DestinationNavbar hideLogo={!activeBooking} />

      {/* ── DESTINATION HERO IMAGE ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "380px", maxHeight: "480px" }}>
        <img
          src={dest.heroImage}
          alt={dest.name}
          className="w-full h-full object-cover"
          style={{ position: "absolute", inset: 0, height: "100%" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.68) 100%)" }}
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-end text-center pb-10 px-6"
        >
          <h1
            className="font-black text-white mb-2"
            style={{
              fontSize: "clamp(2.6rem, 11vw, 5rem)",
              letterSpacing: "-0.03em",
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1.05,
              textShadow: "0 2px 24px rgba(0,0,0,0.5)",
            }}
          >
            {dest.name}
          </h1>
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.7)" }} />
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>
              {dest.region}
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            {dest.description.split(".")[0]}.
          </p>
        </div>
      </div>

      <div className={pad} style={{ paddingTop: "2rem", paddingBottom: "8rem" }}>

        {/* ══════════════════════════════════════════════════
            1. HERO / BOOKING ENTRY
           ══════════════════════════════════════════════════ */}
        <div className={sectionGap}>

          {/* No booking — show search hero */}
          {!activeBooking && (
            <TBWelcomeSection darkMode={darkMode} tk={tk} />
          )}

          {/* Booking found, not yet revealed — compact tap-to-expand card */}
          {activeBooking && !showTripDetails && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(249,115,22,0.18)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowTripDetails(true)}
              className="w-full flex items-center gap-3 px-4 pt-3 pb-2.5 rounded-2xl border transition-all cursor-pointer"
              style={{
                backgroundColor: darkMode ? "rgba(249,115,22,0.1)" : "rgba(249,115,22,0.07)",
                borderColor: "rgba(249,115,22,0.3)",
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(249,115,22,0.15)" }}
              >
                <BadgeCheck className="w-4 h-4" style={{ color: "#f97316" }} />
              </div>

              {/* Text */}
              <div className="text-left flex-1 min-w-0">
                <p className="font-black text-sm leading-tight" style={{ color: "#f97316" }}>View Booking Details</p>
                <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>
                  GDX-{activeBooking.gdx} · {activeBooking.leadName}
                </p>
                <p className="text-[10px] mt-1" style={{ color: textMuted }}>
                  Tap to view your complete booking details
                </p>
              </div>

              {/* Confirmed + downward chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
                >
                  ✓ Confirmed
                </span>
                <ChevronDown className="w-4 h-4" style={{ color: "#f97316" }} />
              </div>
            </motion.button>
          )}

          {/* Booking found + revealed — Orange Card + Booking Details */}
          {activeBooking && showTripDetails && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* ── ORANGE CONFIRMATION CARD ── */}
              <div
                className="rounded-2xl overflow-hidden mb-4"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 55%, #f97316 100%)",
                  boxShadow: "0 8px 32px rgba(249,115,22,0.4), 0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                <div className="p-5 pb-5">
                  {/* Confirmed badge + collapse button */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(34,197,94,0.88)", color: "#fff" }}
                    >
                      <BadgeCheck className="w-3 h-3" /> Trip Confirmed
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowTripDetails(false); }}
                      className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full transition-opacity hover:opacity-70 cursor-pointer"
                      style={{ background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.85)" }}
                    >
                      <ChevronUp className="w-3 h-3" /> Collapse
                    </button>
                  </div>
                  {/* Heading */}
                  <h1
                    className="font-black text-white mb-2"
                    style={{
                      fontSize: "clamp(1.55rem, 6vw, 2.4rem)",
                      letterSpacing: "-0.025em",
                      fontFamily: "'Montserrat', sans-serif",
                      lineHeight: 1.15,
                    }}
                  >
                    Your Trip Is Confirmed! 🧡
                  </h1>
                  <p className="text-sm font-medium mb-5" style={{ color: "rgba(255,255,255,0.82)" }}>
                    Hi {activeBooking.leadName.split(" ")[0]}! Your {dest.name} trip is all set.
                  </p>
                  {/* 4 info chips */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Destination", value: dest.name },
                      { label: "Travel Date",  value: activeBooking.travelDate || "—" },
                      {
                        label: "Hotel",
                        value: activeBooking.hotel?.hotelName
                          || activeBooking.hotel?.roomType
                          || activeBooking.tour?.hotelMention
                          || "—",
                      },
                      { label: "Guests", value: `${activeBooking.totalGuests || 1} pax` },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-xl px-3 py-2.5"
                        style={{ background: "rgba(0,0,0,0.18)" }}
                      >
                        <p
                          className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                          style={{ color: "rgba(255,255,255,0.62)" }}
                        >
                          {label}
                        </p>
                        <p className="text-sm font-black text-white leading-snug">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── BOOKING DETAILS CARD (continues from orange card above) ── */}
                    <div
                      className="rounded-2xl border overflow-hidden"
                      style={{
                        backgroundColor: darkMode ? "#141414" : "#fefcfb",
                        borderColor: darkMode ? "rgba(255,255,255,0.08)" : "#e8ddd4",
                        boxShadow: darkMode
                          ? "0 2px 16px rgba(0,0,0,0.5)"
                          : "0 2px 8px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* ── HEADER ── */}
                      <div
                        className="p-5"
                        style={{
                          borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "#f0ece7"}`,
                        }}
                      >
                        <div className="flex items-center mb-3">
                          <span
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              color: "#16a34a",
                              border: "1px solid rgba(34,197,94,0.2)",
                            }}
                          >
                            <BadgeCheck className="w-3 h-3" /> Booking Verified
                          </span>
                        </div>
                        <h2
                          className="font-black text-xl mb-0.5"
                          style={{
                            color: textPrimary,
                            fontFamily: "'Montserrat', sans-serif",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          Your Booking Details
                        </h2>
                        <p className="text-xs mb-4" style={{ color: textMuted }}>
                          Retrieved from your GDX booking record
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              color: "#16a34a",
                              border: "1px solid rgba(34,197,94,0.2)",
                            }}
                          >
                            <Check className="w-3 h-3" /> {getDisplayStatus(activeBooking.status)}
                          </span>
                          {activeBooking.paymentStatus && (
                            <span
                              className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                              style={{
                                background: "rgba(217,119,6,0.1)",
                                color: "#b45309",
                                border: "1px solid rgba(217,119,6,0.2)",
                              }}
                            >
                              {activeBooking.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── SECTIONS ── */}

                      {/* BOOKING SUMMARY */}
                      <BookingSection label="Booking Summary" darkMode={darkMode}>
                        <div className="px-5 py-4 space-y-4">
                          <BookingRow
                            label1="GDX Number"    value1={`GDX-${activeBooking.gdx}`}
                            label2="Status"        value2={getDisplayStatus(activeBooking.status)}
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                          <BookingRow
                            label1="Payment Status"    value1={activeBooking.paymentStatus || "—"}
                            label2="Transaction Type"  value2={activeBooking.transactionType || "—"}
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                          <BookingRow
                            label1="Booking Date"  value1={formatDate(activeBooking.bookingDate) || "Not Available"}
                            label2=""              value2=""
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                        </div>
                      </BookingSection>

                      {/* TRAVELER INFORMATION */}
                      <BookingSection label="Traveler Information" darkMode={darkMode}>
                        <div className="px-5 py-4 space-y-4">
                          <BookingRow
                            label1="Lead Guest"    value1={activeBooking.leadName}
                            label2="Total Guests"  value2={String(activeBooking.totalGuests || "—")}
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                          <BookingRow
                            label1="Guest Names"  value1={activeBooking.guestList?.join("\n") || activeBooking.leadName || "—"}
                            label2="Email"        value2={activeBooking.email || "—"}
                            textPrimary={textPrimary} textMuted={textMuted}
                            preWrap1
                          />
                          <BookingRow
                            label1="Mobile Number"  value1={activeBooking.mobile || activeBooking.phone || "—"}
                            label2=""               value2=""
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                        </div>
                      </BookingSection>

                      {/* TRAVEL INFORMATION */}
                      <BookingSection label="Travel Information" darkMode={darkMode}>
                        <div className="px-5 py-4 space-y-4">
                          <BookingRow
                            label1="Destination"   value1={dest.name}
                            label2="Travel Date"   value2={formatDate(activeBooking.travelDate) || "—"}
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                          <BookingRow
                            label1="Arrival Date"    value1={formatDate(activeBooking.arrivalDate || activeBooking.travelDate) || "—"}
                            label2="Departure Date"  value2={formatDate(activeBooking.departureDate) || "—"}
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                          <BookingRow
                            label1="Duration"  value1={activeBooking.duration || dest.duration || "—"}
                            label2=""          value2=""
                            textPrimary={textPrimary} textMuted={textMuted}
                          />
                        </div>
                      </BookingSection>

                      {/* ACCOMMODATION */}
                      {(activeBooking.hotel?.hotelName || activeBooking.hotel?.roomType || activeBooking.tour?.hotelMention) && (
                        <BookingSection label="Accommodation" darkMode={darkMode}>
                          <div className="px-5 py-4 space-y-4">
                            <BookingRow
                              label1="Hotel"
                              value1={activeBooking.hotel?.hotelName || activeBooking.tour?.hotelMention || "—"}
                              label2="Room Type"
                              value2={
                                activeBooking.hotel?.roomType
                                  ? `${activeBooking.hotel.roomType}${activeBooking.hotel.nights ? ` · ${activeBooking.hotel.nights} night(s)` : ""}`
                                  : "—"
                              }
                              textPrimary={textPrimary} textMuted={textMuted}
                            />
                            {activeBooking.hotel?.hotelConfirmation && (
                              <BookingRow
                                label1="Confirmation No."  value1={activeBooking.hotel.hotelConfirmation}
                                label2="Hotel Contact"     value2={activeBooking.hotel.hotelPhone || "See voucher"}
                                textPrimary={textPrimary} textMuted={textMuted}
                              />
                            )}
                          </div>
                        </BookingSection>
                      )}

                      {/* TOUR INFORMATION */}
                      {activeBooking.tour?.tourName && (
                        <BookingSection label="Tour Information" darkMode={darkMode}>
                          <div className="px-5 py-4 space-y-4">
                            <BookingRow
                              label1="Tour"       value1={activeBooking.tour.tourName}
                              label2="Tour Date"  value2={formatDate(activeBooking.tour?.tourDate) || "—"}
                              textPrimary={textPrimary} textMuted={textMuted}
                            />
                          </div>
                        </BookingSection>
                      )}

                      {/* TRANSFER INFORMATION */}
                      {(activeBooking.ticket || activeBooking.transfer || activeBooking.transferDetails) && (
                        <BookingSection label="Ticket / Flight Information" darkMode={darkMode}>
                          <div className="px-5 py-4 space-y-4">
                            {activeBooking.ticket?.airline && (
                              <BookingRow
                                label1="Airline"  value1={activeBooking.ticket.airline}
                                label2="PNR"      value2={activeBooking.ticket.pnr || "—"}
                                textPrimary={textPrimary} textMuted={textMuted}
                              />
                            )}
                            {activeBooking.ticket?.terminal && (
                              <BookingRow
                                label1="Terminal"  value1={activeBooking.ticket.terminal}
                                label2=""          value2=""
                                textPrimary={textPrimary} textMuted={textMuted}
                              />
                            )}
                            {activeBooking.transfer?.supplier && (
                              <BookingRow
                                label1="Transfer Supplier"  value1={activeBooking.transfer.supplier}
                                label2="Transfer Type"      value2={activeBooking.transfer.transferType || "—"}
                                textPrimary={textPrimary} textMuted={textMuted}
                              />
                            )}
                            {(activeBooking.transfer?.transferConfirmation || activeBooking.transfer?.transferContact) && (
                              <BookingRow
                                label1="Transfer Confirmation"  value1={activeBooking.transfer.transferConfirmation || "See voucher"}
                                label2="Transfer Contact"       value2={activeBooking.transfer.transferContact || "See voucher"}
                                textPrimary={textPrimary} textMuted={textMuted}
                              />
                            )}
                            {activeBooking.transferDetails && (
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>
                                  Transfer Details
                                </p>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: textPrimary }}>
                                  {activeBooking.transferDetails}
                                </p>
                              </div>
                            )}
                          </div>
                        </BookingSection>
                      )}

                      {/* AGENT INFORMATION */}
                      {(activeBooking.consultantName || activeBooking.consultantPhone || activeBooking.agentName) && (
                        <BookingSection label="Your Coordinator" darkMode={darkMode}>
                          <div className="px-5 py-4 space-y-4">
                            <BookingRow
                              label1="Coordinator"
                              value1={activeBooking.consultantName || activeBooking.agentName || "—"}
                              label2="Contact"
                              value2={activeBooking.consultantPhone || "Refer to your voucher"}
                              textPrimary={textPrimary} textMuted={textMuted}
                            />
                          </div>
                        </BookingSection>
                      )}

                      {/* TRAVEL DOCUMENTS */}
                      <BookingSection label="Travel Documents" darkMode={darkMode}>
                        <div className="px-5 py-5 flex flex-wrap gap-3">
                          {(() => {
                            const bk = activeBooking;
                            const url =
                              bk?.automatedVoucherUrl ||
                              bk?.voucherUrl ||
                              bk?.tourVoucherUrl ||
                              (bk?.automatedVoucher?.startsWith?.("http") ? bk.automatedVoucher : null);
                            return url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
                                style={{
                                  borderColor: darkMode ? "rgba(255,255,255,0.1)" : "#ddd8d0",
                                  color: textPrimary,
                                  backgroundColor: surfaceBg,
                                }}
                              >
                                <Download className="w-4 h-4" style={{ color: "#f97316" }} />
                                View Your Voucher
                              </a>
                            ) : null;
                          })()}
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={downloadItinerary}
                            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all hover:opacity-80"
                            style={{
                              borderColor: darkMode ? "rgba(255,255,255,0.1)" : "#ddd8d0",
                              color: textPrimary,
                              backgroundColor: surfaceBg,
                            }}
                          >
                            <Download className="w-4 h-4" style={{ color: "#f97316" }} />
                            View Itinerary
                          </motion.button>
                        </div>
                      </BookingSection>

                    </div>
                </motion.div>
              )}
            </div>

        {/* ── EMERGENCY CONTACTS — consolidated, always visible near top ── */}
        <FadeIn>
          <div className={sectionGap}>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(249,115,22,0.4)", backgroundColor: "rgba(249,115,22,0.04)" }}>
              <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "#f97316" }}>Save These Numbers</p>
                <p className="font-black text-base" style={{ color: textPrimary }}>Emergency Contacts</p>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Gladex Hotline — always shown */}
                <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor, backgroundColor: cardBg }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(249,115,22,0.12)" }}>📞</div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Gladex Hotline</p>
                    <a href="tel:+639178752200" className="text-sm font-black" style={{ color: "#f97316" }}>+63 917 875 2200</a>
                    <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>Available 8AM–8PM</p>
                  </div>
                </div>

                {/* Destination-defined emergency contacts (Ms. Che, Mr. Mark, etc.) */}
                {dest.emergencyContacts
                  ?.flatMap((grp) => grp.contacts.map((c) => ({ ...c, group: grp.group, icon: grp.icon })))
                  .filter((c) => c.number !== "+63 917 875 2200")
                  .map((c) => (
                    <div key={c.label} className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor, backgroundColor: cardBg }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(249,115,22,0.12)" }}>{c.icon}</div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>{c.group}</p>
                        <p className="text-sm font-black" style={{ color: textPrimary }}>{c.label}</p>
                        {c.number.startsWith("+") ? (
                          <a href={`tel:${c.number.replace(/\s/g, "")}`} className="text-xs font-bold" style={{ color: "#f97316" }}>{c.number}</a>
                        ) : (
                          <p className="text-xs font-semibold" style={{ color: textMuted }}>{c.number}</p>
                        )}
                      </div>
                    </div>
                  ))
                }

                {/* Booking-specific contacts */}
                {(activeBooking?.consultantName || activeBooking?.agentName) && (
                  <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor, backgroundColor: cardBg }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(249,115,22,0.12)" }}>👤</div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Your Coordinator</p>
                      <p className="text-sm font-black" style={{ color: textPrimary }}>{activeBooking.consultantName || activeBooking.agentName}</p>
                      {activeBooking.consultantPhone ? (
                        <a href={`tel:${activeBooking.consultantPhone.replace(/\s/g,"")}`} className="text-xs font-bold" style={{ color: "#f97316" }}>{activeBooking.consultantPhone}</a>
                      ) : (
                        <p className="text-xs" style={{ color: textMuted }}>Contact via Gladex Hotline</p>
                      )}
                    </div>
                  </div>
                )}
                {(activeBooking?.hotel?.hotelName || activeBooking?.tour?.hotelMention) && (
                  <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor, backgroundColor: cardBg }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(249,115,22,0.12)" }}>🏨</div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Hotel</p>
                      <p className="text-sm font-black" style={{ color: textPrimary }}>{activeBooking.hotel?.hotelName || activeBooking.tour?.hotelMention}</p>
                      {activeBooking.hotel?.hotelPhone ? (
                        <a href={`tel:${activeBooking.hotel.hotelPhone.replace(/\s/g,"")}`} className="text-xs font-bold" style={{ color: "#f97316" }}>{activeBooking.hotel.hotelPhone}</a>
                      ) : (
                        <p className="text-xs" style={{ color: textMuted }}>Contact via Gladex Hotline</p>
                      )}
                    </div>
                  </div>
                )}
                {activeBooking?.transfer?.transferContact && (
                  <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor, backgroundColor: cardBg }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(249,115,22,0.12)" }}>🚌</div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Transfer Contact</p>
                      <p className="text-sm font-black" style={{ color: textPrimary }}>{activeBooking.transfer.supplier || "Transfer Coordinator"}</p>
                      <a href={`tel:${activeBooking.transfer.transferContact.replace(/\s/g,"")}`} className="text-xs font-bold" style={{ color: "#f97316" }}>{activeBooking.transfer.transferContact}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            2. TRAVEL BRIEFING VIDEO
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Watch Before You Travel" title="Your Travel Briefing" tk={tk} />
            <TBBriefingVideo dest={dest} darkMode={darkMode} tk={tk} />
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            3. OFFICIAL BRIEFING WELCOME
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            {/* Eyebrow + title */}
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
              Official Briefing
            </p>
            <h2
              className="font-black text-2xl mb-5"
              style={{
                color: textPrimary,
                fontFamily: "'Montserrat', sans-serif",
                letterSpacing: "-0.02em",
                borderLeft: "4px solid #f97316",
                paddingLeft: "0.75rem",
              }}
            >
              Official {dest.name} Briefing
            </h2>

            {/* Card */}
            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: cardBg,
                borderColor,
                boxShadow: cardShadow,
              }}
            >
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ background: "#f97316", color: "#fff" }}
                >
                  {dest.tagline}
                </span>
                {dest.itinerary?.length && (
                  <span
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                    style={{ borderColor, color: textMuted, backgroundColor: surfaceBg }}
                  >
                    {dest.itinerary.length} Days / {dest.itinerary.length - 1} Nights
                  </span>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${borderColor}`, marginBottom: "1rem" }} />

              <p className="text-sm mb-3 font-semibold" style={{ color: textPrimary }}>
                Welcome and congratulations on your upcoming trip to {dest.name} with Gladex Tours!
              </p>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: textMuted }}>
                This page contains your complete travel briefing — including all important travel information, arrival instructions, transfer details, hotel check-in policies, tour reminders, requirements, FAQs, and emergency contacts.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: textMuted }}>
                Please read every section carefully before your departure and keep this page bookmarked for easy reference throughout your trip. If you have questions after reviewing the briefing, reach out to our team via Messenger, WhatsApp, or our hotline.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            3b. PACKAGE INCLUSIONS & EXCLUSIONS
           ══════════════════════════════════════════════════ */}
        {(dest.inclusions?.length || dest.exclusions?.length) && (
          <FadeIn>
            <div className={sectionGap}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* ── INCLUSIONS ── */}
                {dest.inclusions?.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                      What's Covered
                    </p>
                    <h3
                      className="font-black text-xl mb-3"
                      style={{
                        color: textPrimary,
                        fontFamily: "'Montserrat', sans-serif",
                        letterSpacing: "-0.02em",
                        borderLeft: "4px solid #16a34a",
                        paddingLeft: "0.75rem",
                      }}
                    >
                      Package Inclusions
                    </h3>
                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        backgroundColor: darkMode ? "rgba(34,197,94,0.06)" : "#f0fdf4",
                        borderColor: darkMode ? "rgba(34,197,94,0.18)" : "#bbf7d0",
                        boxShadow: cardShadow,
                      }}
                    >
                      <ul className="space-y-2.5">
                        {dest.inclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: "#16a34a" }}
                            />
                            <span className="text-sm leading-snug" style={{ color: darkMode ? "rgba(255,255,255,0.82)" : "#166534" }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* ── EXCLUSIONS ── */}
                {dest.exclusions?.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                      Not Covered
                    </p>
                    <h3
                      className="font-black text-xl mb-3"
                      style={{
                        color: textPrimary,
                        fontFamily: "'Montserrat', sans-serif",
                        letterSpacing: "-0.02em",
                        borderLeft: "4px solid #dc2626",
                        paddingLeft: "0.75rem",
                      }}
                    >
                      Package Exclusions
                    </h3>
                    <div
                      className="rounded-2xl border p-4"
                      style={{
                        backgroundColor: darkMode ? "rgba(220,38,38,0.06)" : "#fff7f7",
                        borderColor: darkMode ? "rgba(220,38,38,0.18)" : "#fecaca",
                        boxShadow: cardShadow,
                      }}
                    >
                      <ul className="space-y-2.5">
                        {dest.exclusions.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <X
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: "#dc2626" }}
                            />
                            <span className="text-sm leading-snug" style={{ color: darkMode ? "rgba(255,255,255,0.82)" : "#7f1d1d" }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {/* Footnotes */}
                      {dest.exclusionNotes?.length > 0 && (
                        <div className="mt-4 pt-3 space-y-1.5" style={{ borderTop: `1px solid ${darkMode ? "rgba(220,38,38,0.15)" : "#fecaca"}` }}>
                          {dest.exclusionNotes.map((note, i) => (
                            <p key={i} className="text-xs leading-snug" style={{ color: textMuted }}>
                              {note}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </FadeIn>
        )}

        {/* ══════════════════════════════════════════════════
            3c. DAY-BY-DAY ITINERARY TIMELINE
           ══════════════════════════════════════════════════ */}
        {dest.itinerary?.length > 0 && (
          <FadeIn>
            <div className={sectionGap}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>
                Day by Day
              </p>
              <h2
                className="font-black text-2xl mb-5"
                style={{
                  color: textPrimary,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "-0.02em",
                  borderLeft: "4px solid #f97316",
                  paddingLeft: "0.75rem",
                }}
              >
                Itinerary Timeline
              </h2>
              <TBItinerary dest={dest} darkMode={darkMode} tk={tk} />
            </div>
          </FadeIn>
        )}

        {/* ══════════════════════════════════════════════════
            4. TRAVEL INFORMATION CENTER
           ══════════════════════════════════════════════════ */}

        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Operational Information" title="Travel Information Center" tk={tk} />
            <div className="space-y-4">

              {/* 5a. Arrival Instructions — all airports shown vertically, no tabs */}
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>Arrival Instructions</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>How to get from the airport to your hotel</p>
                </div>
                <div className="p-5 space-y-7">
                  {dest.arrivalInstructions.tabs.map(({ key, label }, tabIdx) => {
                    const info = dest.arrivalInstructions[key];
                    if (!info) return null;
                    return (
                      <div key={key} className={tabIdx > 0 ? "pt-6 border-t" : ""} style={{ borderColor }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#f97316" }}>{label}</p>
                        <div className="space-y-3">
                          {info.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
                                {i + 1}
                              </div>
                              <p className="text-sm leading-snug pt-1" style={{ color: textPrimary }}>{step}</p>
                            </div>
                          ))}
                        </div>
                        {info.note && (
                          <div className="mt-4 p-3 rounded-xl border text-xs flex items-start gap-2" style={{ borderColor: "rgba(249,115,22,0.25)", backgroundColor: "rgba(249,115,22,0.07)", color: textMuted }}>
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
                            {info.note}
                          </div>
                        )}
                        {info.vanSchedule && (
                          <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: textMuted }}>Van Transfer Schedule</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="rounded-xl p-3 border" style={{ borderColor, backgroundColor: surfaceBg }}>
                                <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>Puerto Princesa → El Nido</p>
                                {info.vanSchedule.ppsToElNido.map((s) => (<p key={s} className="text-xs py-0.5" style={{ color: textPrimary }}>{s}</p>))}
                              </div>
                              <div className="rounded-xl p-3 border" style={{ borderColor, backgroundColor: surfaceBg }}>
                                <p className="text-xs font-bold mb-2" style={{ color: "#f97316" }}>El Nido → Puerto Princesa</p>
                                {info.vanSchedule.elNidoToPps.map((s) => (<p key={s} className="text-xs py-0.5" style={{ color: textPrimary }}>{s}</p>))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5b. Transfer Instructions */}
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>Transfer Instructions</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>Arrival and departure transport details</p>
                </div>
                <div className="p-5 space-y-6">
                  {[
                    { key: "arrival",   label: "Arrival Transfer",  color: "#f97316" },
                    { key: "departure", label: "Departure Transfer", color: "#3b82f6" },
                  ].map(({ key, label, color }, gi) => (
                    <div key={key} className={gi > 0 ? "pt-5" : ""} style={{ borderTop: gi > 0 ? `1px solid ${borderColor}` : undefined }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color }}>{label}</p>
                      <div className="space-y-3">
                        {dest.transferInstructions[key].map((s) => (
                          <div key={s.step} className="flex items-start gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
                              {s.step}
                            </div>
                            <div className="pt-1">
                              <p className="text-sm font-bold mb-0.5" style={{ color: textPrimary }}>{s.title}</p>
                              <p className="text-sm leading-relaxed" style={muted}>{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5c. Hotel Check-In */}
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>Hotel Check-In Information</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>Arriving at your accommodation</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl p-3 border" style={{ borderColor: "rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.07)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#22c55e" }}>Check-In Time</p>
                      <p className="text-sm" style={{ color: textPrimary }}>{dest.hotelInfo.checkin}</p>
                    </div>
                    <div className="rounded-xl p-3 border" style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.07)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#ef4444" }}>Check-Out Time</p>
                      <p className="text-sm" style={{ color: textPrimary }}>{dest.hotelInfo.checkout}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={muted}>Upon Arrival:</p>
                  <ul className="space-y-2.5">
                    {dest.hotelInfo.notes.map((note) => (
                      <li key={note} className="flex items-start gap-2 text-sm leading-snug" style={{ color: textPrimary }}>
                        <span className="text-orange-400 shrink-0 mt-0.5">•</span> {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5d. Travel Requirements */}
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>Travel Requirements</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>Documents and entry requirements</p>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { label: "Filipino Travelers",  items: dest.requirements.filipino },
                      { label: "Foreign Travelers",   items: dest.requirements.foreign },
                      { label: "Travel Documents",    items: dest.requirements.documents },
                    ].map(({ label, items }) => (
                      <div key={label}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#f97316" }}>{label}</p>
                        <ul className="space-y-2">
                          {items.map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm leading-snug" style={{ color: textPrimary }}>
                              <BadgeCheck className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5e. Tour Reminders */}
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>Tour Reminders</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>What to remember before, during, and after your tour</p>
                </div>
                <div className="p-5 space-y-6">
                  {[
                    { key: "before",    label: "Before Your Trip",  color: "#f97316" },
                    { key: "during",    label: "During Your Stay",  color: "#3b82f6" },
                    { key: "departure", label: "On Departure Day",  color: "#22c55e" },
                  ].map(({ key, label, color }, gi) => (
                    <div key={key} className={gi > 0 ? "pt-5" : ""} style={{ borderTop: gi > 0 ? `1px solid ${borderColor}` : undefined }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>{label}</p>
                      <ul className="space-y-2.5">
                        {dest.reminders[key].map((r) => (
                          <li key={r} className="flex items-start gap-2.5 text-sm leading-snug" style={{ color: textPrimary }}>
                            <span className="text-orange-400 shrink-0 mt-0.5">✔</span> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5f. Do's & Don'ts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border p-5" style={{ backgroundColor: darkMode ? "rgba(34,197,94,0.06)" : "#f0fdf4", borderColor: darkMode ? "rgba(34,197,94,0.18)" : "#bbf7d0" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#16a34a" }}>Do's</p>
                  <ul className="space-y-2.5">
                    {dest.dos.map((d) => (<li key={d} className="flex items-start gap-2 text-sm leading-snug" style={{ color: darkMode ? "rgba(255,255,255,0.82)" : "#166534" }}><Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#16a34a" }} strokeWidth={2.5} />{d}</li>))}
                  </ul>
                </div>
                <div className="rounded-2xl border p-5" style={{ backgroundColor: darkMode ? "rgba(220,38,38,0.06)" : "#fff7f7", borderColor: darkMode ? "rgba(220,38,38,0.18)" : "#fecaca" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#dc2626" }}>Don'ts</p>
                  <ul className="space-y-2.5">
                    {dest.donts.map((d) => (<li key={d} className="flex items-start gap-2 text-sm leading-snug" style={{ color: darkMode ? "rgba(255,255,255,0.82)" : "#7f1d1d" }}><X className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#dc2626" }} strokeWidth={2.5} />{d}</li>))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            5b2. CURRENCY & MONEY TIPS
           ══════════════════════════════════════════════════ */}
        {dest.currency && (
          <FadeIn>
            <div className={sectionGap}>
              <SectionBanner eyebrow="Money Matters" title="Currency Guide" imageUrl={BANNER.currency} tk={tk} />
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>{dest.currency.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>Local currency symbol: {dest.currency.symbol}</p>
                </div>
                <div className="p-5 space-y-3">
                  {dest.currency.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mt-0.5" style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}>₱</div>
                      <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ══════════════════════════════════════════════════
            5b3. SAFETY TIPS
           ══════════════════════════════════════════════════ */}
        {dest.safetyTips?.length > 0 && (
          <FadeIn>
            <div className={sectionGap}>
              <SectionBanner eyebrow="Stay Safe" title="Safety Tips" imageUrl={BANNER.safety} tk={tk} />
              <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
                <div className="px-5 pt-4 pb-3 border-b" style={{ borderColor }}>
                  <p className="font-bold text-base" style={{ color: textPrimary }}>Important Safety Guidelines</p>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>Please read carefully before your trip</p>
                </div>
                <div className="p-5 space-y-3">
                  {dest.safetyTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm mt-0.5" style={{ background: "rgba(234,179,8,0.12)" }}>⚠️</div>
                      <p className="text-sm leading-relaxed" style={{ color: textPrimary }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ══════════════════════════════════════════════════
            7. TRAVEL READINESS CHECKLIST
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
            7. WHAT TO BRING — Packing Guide
           ══════════════════════════════════════════════════ */}
        {dest.packingGuide && (
          <FadeIn>
            <div className={sectionGap}>
              <SectionHeader eyebrow="Packing Guide" title="What to Bring" tk={tk} />
              {[
                { key: "documents",           label: "Documents" },
                { key: "essentials",          label: "Essentials" },
                { key: "destinationSpecific", label: "Destination Specific" },
              ].map(({ key, label }) => {
                const items = dest.packingGuide[key];
                if (!items?.length) return null;
                return (
                  <div key={key} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: textMuted }}>{label}</p>
                    </div>
                    <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                      {items.map((item) => (
                        <div key={item.name} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: cardBg, borderColor }}>
                          <div className="flex items-center justify-center" style={{ aspectRatio: "1/1", backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <span style={{ fontSize: "3.25rem" }}>{item.icon}</span>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-black text-sm leading-snug mb-0.5" style={{ color: textPrimary }}>{item.name}</p>
                            <p className="text-xs leading-snug" style={{ color: textMuted }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        )}

        {/* ══════════════════════════════════════════════════
            8. OUTFIT GUIDE
           ══════════════════════════════════════════════════ */}
        {dest.outfitGuide?.length >= 2 && (
          <FadeIn>
            <OutfitGuideSection
              dest={dest}
              darkMode={darkMode}
              sectionGap={sectionGap}
              textPrimary={textPrimary}
              textMuted={textMuted}
              cardBg={cardBg}
              borderColor={borderColor}
              cardShadow={cardShadow}
            />
          </FadeIn>
        )}

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
            10. OPTIONAL TOURS — hidden until tours/pricing/upsell flow are finalized
           ══════════════════════════════════════════════════ */}
        {/* Optional Tours intentionally not rendered — uncomment when ready
        {dest.optionalTours?.length > 0 && (
          <FadeIn>
            <div className={sectionGap}>
              <SectionBanner eyebrow="Enhance Your Trip" title="Optional Tours & Add-Ons" imageUrl={BANNER.destination} tk={tk} />
              <TBOptionalTours
                dest={dest}
                darkMode={darkMode}
                tk={tk}
                onAddToCart={() => {}}
                cartItems={[]}
              />
            </div>
          </FadeIn>
        )}
        */}

        {/* ══════════════════════════════════════════════════
            13. FREQUENTLY ASKED QUESTIONS
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Have Questions?" title="Frequently Asked Questions" tk={tk} />
            <TBFAQs dest={dest} darkMode={darkMode} tk={tk} />
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            14. TESTIMONIALS
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Traveler Reviews" title="Real Gladex Travel Experiences 🧡" tk={tk} />

            {/* Carousel cards */}
            {(() => {
              const filteredTestimonials = TESTIMONIALS.filter(
                (t) => (!t.destination || t.destination === slug) && t.rating >= 3
              );
              const allTestimonials = myReview ? [myReview, ...filteredTestimonials] : filteredTestimonials;
              const PER = testimonialsMobile ? 1 : 3;
              const totalPages = Math.ceil(allTestimonials.length / PER);
              const safePage = Math.min(testimonialsPage, totalPages - 1);
              const visible = allTestimonials.slice(safePage * PER, (safePage + 1) * PER);
              return (
                <>
                  <div className={`grid gap-3 mb-4 ${testimonialsMobile ? "grid-cols-1" : "grid-cols-3"}`}>
                    {visible.map((t, i) => {
                      const isOwn = t === myReview;
                      return (
                      <motion.div
                        key={`${safePage}-${i}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        className="rounded-2xl border p-4 flex flex-col gap-3"
                        style={{
                          backgroundColor: isOwn ? "rgba(249,115,22,0.05)" : cardBg,
                          borderColor: isOwn ? "#f97316" : borderColor,
                          boxShadow: isOwn ? "0 0 0 1px #f97316, 0 4px 20px rgba(249,115,22,0.15)" : cardShadow,
                        }}
                      >
                        {/* YOUR REVIEW badge + edit button */}
                        {isOwn && (
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "#f97316" }}>
                              Your Review
                            </span>
                            <button
                              onClick={() => {
                                setReviewStars(myReview?.rating ?? myReview?.stars ?? 0);
                                setReviewComment(myReview?.review ?? myReview?.comment ?? "");
                                setReviewSubmitted(false);
                                setReviewEditing(true);
                                setReviewError(null);
                                setTimeout(() => {
                                  document.getElementById("review-edit-inline")?.scrollIntoView({ behavior: "smooth", block: "center" });
                                }, 80);
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                              style={{ color: "#f97316", backgroundColor: "rgba(249,115,22,0.1)" }}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                          </div>
                        )}
                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= (t.rating ?? t.stars ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-yellow-200"}`} />
                          ))}
                        </div>
                        {/* Quote */}
                        <p className="text-xs leading-relaxed flex-1 italic" style={{ color: textPrimary }}>
                          "{t.review ?? t.comment ?? ""}"
                        </p>
                        {/* Reviewer */}
                        <div className="flex items-center gap-2.5 pt-2 border-t" style={{ borderColor: isOwn ? "rgba(249,115,22,0.2)" : borderColor }}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: isOwn ? "#f97316" : "#1a1a1a", color: "#fff" }}
                          >
                            {isOwn ? "★" : t.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-xs" style={{ color: isOwn ? "#f97316" : textPrimary }}>{t.name}</p>
                            <p className="text-[10px]" style={{ color: "#f97316" }}>{t.location} · {t.date}</p>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>

                  {/* Navigation row — dots left, arrows right */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }).map((_, pi) => (
                        <button
                          key={pi}
                          onClick={() => setTestimonialsPage(pi)}
                          className="rounded-full transition-all"
                          style={{
                            width: pi === safePage ? "20px" : "8px",
                            height: "8px",
                            backgroundColor: pi === safePage ? "#f97316" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"),
                          }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTestimonialsPage((p) => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                        className="w-11 h-11 rounded-full flex items-center justify-center border transition-all"
                        style={{
                          borderColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                          backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "#fff",
                          opacity: safePage === 0 ? 0.35 : 1,
                          color: textPrimary,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <button
                        onClick={() => setTestimonialsPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={safePage === totalPages - 1}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                        style={{
                          backgroundColor: safePage === totalPages - 1 ? "rgba(249,115,22,0.3)" : "#f97316",
                          opacity: safePage === totalPages - 1 ? 0.5 : 1,
                          color: "#fff",
                          boxShadow: safePage < totalPages - 1 ? "0 4px 14px rgba(249,115,22,0.4)" : "none",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* ── Inline Edit Form — separate component guarantees pre-filled state ── */}
            <AnimatePresence>
              {reviewEditing && myReview && (
                <InlineReviewEditor
                  key={`edit-${myReview.rating}-${myReview.date}`}
                  myReview={myReview}
                  onSave={handleSubmitReview}
                  onCancel={() => setReviewEditing(false)}
                  darkMode={darkMode}
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  cardBg={cardBg}
                  borderColor={borderColor}
                />
              )}
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* ══════════════════════════════════════════════════
            15. RATE MY SERVICE
           ══════════════════════════════════════════════════ */}
        <FadeIn>
          <div id="review-form-section" className={sectionGap}>
            <SectionHeader eyebrow="Your Experience" title="Review Our Service" tk={tk} />
            <div className="rounded-2xl border p-5" style={{ ...card }}>
              {(reviewSubmitted || myReview) ? (
                /* ── Already submitted ── */
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(249,115,22,0.12)" }}>
                    <svg className="w-6 h-6" fill="none" stroke="#f97316" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="font-black text-sm" style={{ color: textPrimary }}>Thank you for your review!</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= (myReview?.rating ?? reviewStars) ? "fill-yellow-400 text-yellow-400" : "text-yellow-200"}`} />
                    ))}
                  </div>
                  {(myReview?.review || reviewComment) && (
                    <p className="text-xs italic" style={{ color: textMuted }}>"{myReview?.review || reviewComment}"</p>
                  )}
                  <p className="text-[10px]" style={{ color: textMuted }}>Your review is visible above in the traveler reviews section.</p>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  <p className="text-sm mb-3" style={{ color: textPrimary }}>
                    How would you rate your experience with Gladex Tours?
                  </p>
                  <div className="flex gap-2 mb-5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setReviewStars(s)}
                        className="transition-transform hover:scale-110 active:scale-95"
                        aria-label={`${s} star${s > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            s <= reviewStars
                              ? "fill-yellow-400 text-yellow-400"
                              : darkMode ? "text-white/20 hover:text-yellow-400" : "text-black/15 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>
                    Comments <span className="font-normal normal-case tracking-normal">(optional)</span>
                  </p>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-colors"
                    style={{
                      backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      color: textPrimary,
                    }}
                  />

                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewStars === 0}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: reviewStars > 0 ? "#f97316" : (darkMode ? "rgba(249,115,22,0.25)" : "rgba(249,115,22,0.2)"),
                      color: reviewStars > 0 ? "#fff" : "#f97316",
                      opacity: reviewStars === 0 ? 0.6 : 1,
                    }}
                  >
                    {reviewEditing ? "Update Review" : "Submit Review"}
                  </button>
                  {reviewEditing && (
                    <button
                      onClick={() => setReviewEditing(false)}
                      className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ color: textMuted, backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
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
    </div>
  );
}
