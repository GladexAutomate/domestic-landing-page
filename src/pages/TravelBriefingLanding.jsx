// @ts-nocheck
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
import { lookupBooking, submitReview, deleteReview, uploadReviewPhoto } from "@/services/supabaseService";
import { loadDestinationTours } from "@/services/globaltixService";
import TBAddOnsCheckout from "@/components/travelbriefing/TBAddOnsCheckout";
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
  {
    name: "Rhea Mendoza",
    location: "Bohol",
    destination: "bohol",
    date: "May 2025",
    review: "Ang ganda ng Bohol! The Chocolate Hills talaga are breathtaking in person. Yung briefing page ng Gladex was so complete — hotel details, tour schedule, emergency numbers lahat nandoon. Walang kaming naging problema sa buong trip!",
    rating: 5,
  },
  {
    name: "Carlo Fontanilla",
    location: "Bohol",
    destination: "bohol",
    date: "April 2025",
    review: "First time in Bohol and it was perfect. The tarsier sanctuary and Loboc River cruise were the highlights! The pre-departure briefing had all the info we needed — especially the airport pickup instructions at BPH. Highly recommend Gladex!",
    rating: 5,
  },
  {
    name: "Donna T.",
    location: "Bohol",
    destination: "bohol",
    date: "March 2025",
    review: "Panglao Beach is absolutely stunning! We checked the briefing page several times during our trip and it had everything — from the tour itinerary down to what to pack. Gladex made our first Bohol trip completely stress-free.",
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

// ── Booking status chip styles ───────────────────────────────────
function getStatusChipStyle(status) {
  const s = (status || "").toLowerCase();
  if (["confirmed"].includes(s))
    return { background: "rgba(22,163,74,0.12)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.3)" };
  if (s.includes("pending"))
    return { background: "rgba(245,158,11,0.12)", color: "#d97706", border: "1px solid rgba(245,158,11,0.3)" };
  if (s.includes("cancel"))
    return { background: "rgba(239,68,68,0.12)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.3)" };
  return { background: "rgba(255,153,19,0.1)", color: "#cc7700", border: "1px solid rgba(255,153,19,0.2)" };
}
function getPaymentChipStyle(paymentStatus) {
  const s = (paymentStatus || "").toLowerCase();
  if (s.includes("paid") || s.includes("complete"))
    return { background: "rgba(22,163,74,0.12)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.3)" };
  if (s.includes("partial"))
    return { background: "rgba(245,158,11,0.12)", color: "#d97706", border: "1px solid rgba(245,158,11,0.3)" };
  if (s.includes("unpaid") || s.includes("fail"))
    return { background: "rgba(239,68,68,0.12)", color: "#dc2626", border: "1px solid rgba(239,68,68,0.3)" };
  return { background: "rgba(255,153,19,0.1)", color: "#cc7700", border: "1px solid rgba(255,153,19,0.2)" };
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Travel-themed hero decorations ───────────────────────────────
function CloudDecor({ width = 140, opacity = 0.13, style = {} }) {
  return (
    <div className="absolute pointer-events-none select-none" style={style}>
      <svg width={width} viewBox="0 0 140 52" fill="none">
        <ellipse cx="70"  cy="35" rx="52" ry="16" fill="white" fillOpacity={opacity} />
        <ellipse cx="43"  cy="33" rx="30" ry="18" fill="white" fillOpacity={opacity} />
        <ellipse cx="100" cy="31" rx="26" ry="15" fill="white" fillOpacity={opacity} />
      </svg>
    </div>
  );
}

function HeroPlane() {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{ top: "22%", left: 0, animation: "tb-plane-fly 22s linear 1.5s infinite" }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="rgba(255,255,255,0.72)">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    </div>
  );
}

function HeroWave({ fill }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
      <svg viewBox="0 0 1440 54" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "54px" }}>
        <path d="M0,27 C240,54 480,0 720,27 C960,54 1200,6 1440,27 L1440,54 L0,54 Z" fill={fill} />
      </svg>
    </div>
  );
}

function SectionWave({ fillTop, fillBottom, flip = false }) {
  const fill = flip ? fillTop : fillBottom;
  return (
    <div className="pointer-events-none" style={{ lineHeight: 0, overflow: "hidden", height: "38px" }}>
      <svg viewBox="0 0 1440 38" preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "38px", transform: flip ? "scaleY(-1)" : "none" }}>
        <path d="M0,19 C360,38 1080,0 1440,19 L1440,38 L0,38 Z" fill={fill} />
      </svg>
    </div>
  );
}

// ── Inline Review Editor — self-contained state guarantees pre-fill ──
function InlineReviewEditor({ myReview, onSave, onCancel, darkMode, textPrimary, textMuted, cardBg, borderColor }) {
  const [stars, setStars] = useState(() => myReview?.rating ?? myReview?.stars ?? 0);
  const [comment, setComment] = useState(() => myReview?.review ?? myReview?.comment ?? "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(() => myReview?.photo ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  };

  const handleSave = async () => {
    if (stars === 0) return;
    setUploading(true);
    await onSave(stars, comment, photoFile);
    setUploading(false);
  };

  return (
    <motion.div
      id="review-edit-inline"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border p-5 mt-4"
      style={{ backgroundColor: cardBg, borderColor: "#ff9913", boxShadow: "0 0 0 1px #ff9913, 0 4px 20px rgba(255,153,19,0.12)" }}
    >
      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#ff9913" }}>Update Your Review</p>
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
      {/* Photo upload */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {photoPreview ? (
        <div className="relative mb-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img src={photoPreview} alt="Trip photo" className="w-full h-full object-cover" />
          <button
            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          >✕</button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full mb-3 py-3 rounded-xl border-2 border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80"
          style={{ borderColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)", color: textMuted }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Add trip photo (optional)
        </button>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={stars === 0 || uploading}
          className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ backgroundColor: stars > 0 ? "#ff9913" : "rgba(255,153,19,0.2)", color: stars > 0 ? "#fff" : "#ff9913" }}
        >
          {uploading ? "Uploading…" : "Update Review"}
        </button>
        <button
          onClick={onCancel}
          disabled={uploading}
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

function StripeHeader({ eyebrow, title, description, tk, colored = false }) {
  return (
    <div className="text-center mb-6">
      {eyebrow && (
        <p className="text-[11px] font-black uppercase tracking-widest mb-2"
          style={{ color: colored ? "rgba(255,255,255,0.72)" : "#ff9913" }}>
          {eyebrow}
        </p>
      )}
      <h2 className="font-black text-2xl sm:text-3xl"
        style={{ color: colored ? "#ffffff" : tk.textPrimary, letterSpacing: "-0.02em" }}>
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed max-w-xl mx-auto"
          style={{ color: colored ? "rgba(255,255,255,0.85)" : tk.textMuted }}>
          {description}
        </p>
      )}
    </div>
  );
}

// ── SectionStripe — full-viewport-width alternating background via CSS bleed ─
// For colored stripes (alt=1,2): header renders on color, content wraps in white card.
// Usage: <SectionStripe alt={1}><StripeHeader .../><SectionCard darkMode={darkMode}>content</SectionCard></SectionStripe>
function SectionStripe({ children, alt = 0, darkMode, py = "py-10" }) {
  const bgs = darkMode
    ? [
        "transparent",
        "linear-gradient(155deg, rgba(255,153,19,0.22) 0%, rgba(200,90,0,0.14) 100%)",
        "linear-gradient(155deg, rgba(255,153,19,0.12) 0%, rgba(200,90,0,0.07) 100%)",
      ]
    : [
        "transparent",
        "linear-gradient(155deg, #ff9913 0%, #d96800 100%)",
        "linear-gradient(155deg, #ffa726 0%, #e07000 100%)",
      ];
  const bg = bgs[alt % 3];
  const isColored = bg && bg !== "transparent";

  if (!isColored) {
    const dotPattern = darkMode
      ? "radial-gradient(circle, rgba(255,153,19,0.09) 1.5px, transparent 1.5px)"
      : "radial-gradient(circle, rgba(0,0,0,0.045) 1.5px, transparent 1.5px)";
    return (
      <div className={`${py} mb-2`} style={{ backgroundImage: dotPattern, backgroundSize: "26px 26px" }}>
        {children}
      </div>
    );
  }

  return (
    <div className={`relative ${py} mb-2`}>
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, bottom: 0,
          left: "50%", width: "100vw",
          transform: "translateX(-50%)",
          background: bg,
          zIndex: 0,
        }}
      />
      {/* Subtle diagonal texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, bottom: 0,
          left: "50%", width: "100vw",
          transform: "translateX(-50%)",
          backgroundImage: "repeating-linear-gradient(-55deg, transparent, transparent 18px, rgba(255,255,255,0.04) 18px, rgba(255,255,255,0.04) 19px)",
          zIndex: 1,
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}

// White rounded card wrapper — used inside colored SectionStripes so content sits on white
function SectionCard({ children, darkMode }) {
  return (
    <div
      className="rounded-3xl"
      style={{
        backgroundColor: darkMode ? "#1a1a1a" : "#ffffff",
        boxShadow: darkMode
          ? "0 4px 24px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.03)"
          : "0 2px 6px rgba(0,0,0,0.04), 0 10px 36px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)",
        overflow: "hidden",
        padding: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}

// ── Section divider ──────────────────────────────────────────────
function SectionDivider({ tk }) {
  return <div className="border-t my-2" style={{ borderColor: tk.borderColor }} />;
}

// ── Back to top ──────────────────────────────────────────────────
function BackToTopButton({ visible, lift }) {
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
          className="fixed right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center hover:scale-110 active:scale-95"
          style={{
            bottom: lift ? "84px" : "24px",
            transition: "bottom 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            background: "#ffffff",
            border: "2px solid rgba(255,153,19,0.5)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)",
          }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" style={{ color: "#ff9913" }} strokeWidth={2.5} />
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
                  borderColor: active ? "#ff9913" : tk.borderColor,
                  backgroundColor: active ? "rgba(255,153,19,0.12)" : "transparent",
                  color: active ? "#ff9913" : tk.textMuted,
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
              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #ff9913, #cc7700)", color: "#fff" }}>
                {i + 1}
              </div>
              <p className="text-sm leading-snug pt-1" style={{ color: tk.textPrimary }}>{step}</p>
            </motion.div>
          ))}
          {current.note && (
            <div className="mt-4 p-3 rounded-xl border text-xs flex items-start gap-2" style={{ borderColor: "rgba(255,153,19,0.25)", backgroundColor: "rgba(255,153,19,0.07)", color: tk.textMuted }}>
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
              {current.note}
            </div>
          )}
          {current.travelTime && (
            <div className="mt-4 rounded-xl border overflow-hidden" style={{ borderColor: tk.borderColor }}>
              <div className="px-3 py-2" style={{ backgroundColor: darkMode ? "rgba(255,153,19,0.1)" : "rgba(255,153,19,0.07)" }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ff9913" }}>Estimated Travel Time</p>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                {current.travelTime.breakdown.map((b) => (
                  <div key={b.leg} className="flex items-center justify-between gap-3">
                    <p className="text-xs" style={{ color: tk.textMuted }}>{b.leg}</p>
                    <p className="text-xs font-bold shrink-0" style={{ color: tk.textPrimary }}>{b.duration}</p>
                  </div>
                ))}
                <div className="pt-1.5 mt-1 border-t" style={{ borderColor: tk.borderColor }}>
                  <p className="text-[10px] font-semibold" style={{ color: tk.textMuted }}>{current.travelTime.summary}</p>
                </div>
              </div>
            </div>
          )}
          {current.vanSchedule && (
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tk.textMuted }}>Van Transfer Schedule</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 border" style={{ borderColor: tk.borderColor, backgroundColor: tk.surfaceBg }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#ff9913" }}>Puerto Princesa → El Nido</p>
                  {current.vanSchedule.ppsToElNido.map((s) => (<p key={s} className="text-xs py-0.5" style={{ color: tk.textPrimary }}>{s}</p>))}
                </div>
                <div className="rounded-xl p-3 border" style={{ borderColor: tk.borderColor, backgroundColor: tk.surfaceBg }}>
                  <p className="text-xs font-bold mb-2" style={{ color: "#ff9913" }}>El Nido → Puerto Princesa</p>
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
              <button key={slug} onClick={() => { navigate(`/destination/${slug}`); setOpen(false); }} className="w-full text-left text-xs px-3 py-2 hover:opacity-60 transition-opacity border-b last:border-0" style={{ borderColor: tk.borderColor, color: slug === currentSlug ? "#ff9913" : tk.textPrimary, fontWeight: slug === currentSlug ? "700" : "400" }}>
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

// ── Room/board type normalizer ───────────────────────────────────
function formatRoomType(rt) {
  if (!rt) return null;
  switch (rt.trim().toUpperCase()) {
    case "BREAKFAST": case "BB": case "B&B": case "BED AND BREAKFAST": return "Breakfast Included";
    case "HB": case "HALF BOARD": return "Half Board";
    case "FB": case "FULL BOARD": return "Full Board";
    case "RO": case "ROOM ONLY": return "Room Only";
    case "AI": case "ALL INCLUSIVE": return "All Inclusive";
    default: return rt;
  }
}

// ── BookingSection ───────────────────────────────────────────────
function BookingSection({ label, children, darkMode }) {
  return (
    <div style={{ borderTop: `1px solid ${darkMode ? "rgba(255,255,255,0.06)" : "#f0ece7"}` }}>
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{ backgroundColor: darkMode ? "rgba(255,153,19,0.04)" : "rgba(255,153,19,0.025)" }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,153,19,0.12)", border: "1.5px solid rgba(255,153,19,0.35)" }}
        >
          <div className="w-1 h-1 rounded-full" style={{ background: "#ff9913" }} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: "#ff9913" }}>
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
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>
          {label1}
        </p>
        <p className={`text-sm font-semibold leading-snug${preWrap1 ? " whitespace-pre-line" : ""}`} style={{ color: textPrimary }}>
          {value1 || "—"}
        </p>
      </div>
      {label2 ? (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>
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
        <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#ff9913", color: "#fff" }}>
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
        <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>Outfit for:</p>
        <div className="flex flex-wrap gap-1.5">
          {OUTFIT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="text-xs font-bold px-3 py-1.5 rounded-full border transition-all"
              style={activeTab === tab
                ? { background: "#ff9913", color: "#fff", borderColor: "#ff9913" }
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
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ff9913" }}>✦ Save This For Later!</span>
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
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#ff9913" }}>Style Guide</p>
      <h2
        className="font-black text-2xl mb-2"
        style={{ color: textPrimary, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.02em", borderLeft: "4px solid #ff9913", paddingLeft: "0.75rem" }}
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
                color: safePage === 0 ? textMuted : "#ff9913",
                borderColor: safePage === 0 ? borderColor : "#ff9913",
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
                background: safePage === totalPages - 1 ? "transparent" : "linear-gradient(135deg, #ff9913, #cc7700)",
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
            background: safePage === totalPages - 1 ? borderColor : "linear-gradient(135deg, #ff9913, #cc7700)",
            color: "#fff",
            fontSize: "1.3rem",
            lineHeight: 1,
            boxShadow: safePage === totalPages - 1 ? "none" : "0 4px 14px rgba(255,153,19,0.45)",
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
              style={{ width: i === safePage ? "24px" : "8px", height: "8px", background: i === safePage ? "#ff9913" : borderColor }}
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

  // ── Test mode: /destination/siargao-test bypasses Supabase lookup ──
  const isTestMode = slug?.endsWith("-test");
  const realSlug   = isTestMode ? slug.replace(/-test$/, "") : slug;
  const dest       = getDestination(realSlug);

  const MOCK_BOOKING = isTestMode ? {
    gdx:             "DEMO",
    leadName:        "Gladex Demo Guest",
    status:          "confirmed",
    paymentStatus:   "Fully Paid",
    transactionType: "Package",
    bookingDate:     "2026-01-01",
    travelDate:      "2026-08-01",
    arrivalDate:     "2026-08-01",
    departureDate:   "2026-08-04",
    duration:        3,
    totalGuests:     2,
    guestList:       ["Demo Guest 1", "Demo Guest 2"],
    email:           "demo@gladextours.com",
    mobile:          "+63 917 875 2200",
    phone:           "+63 917 875 2200",
    hotel: {
      hotelName:    "Demo Resort & Hotel",
      hotelAddress: `${dest?.name ?? realSlug}, Philippines`,
      checkIn:      "2026-08-01",
      checkOut:     "2026-08-04",
      roomType:     "Superior Room",
      noNights:     3,
      note:         null,
    },
    tour: {
      tourName:     dest ? `${dest.name} Package` : "Demo Package",
      description:  "Demo tour package for testing purposes.",
      hotelMention: null,
    },
    ticket: {
      airline:        "Philippine Airlines",
      flightNo:       "PR 123",
      departureCity:  "Manila",
      departureDate:  "2026-08-01",
      departureTime:  "06:00",
      arrivalCity:    dest?.name ?? realSlug,
      arrivalDate:    "2026-08-01",
      arrivalTime:    "08:00",
    },
    transfer:        null,
    transferDetails: null,
    rawData:         {},
  } : null;

  // Booking from GDX search (passed via React Router state)
  const routeBooking = location.state?.booking || null;
  const [restoredBooking, setRestoredBooking] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(!!routeBooking || isTestMode);
  const activeBooking = isTestMode ? MOCK_BOOKING : (routeBooking || restoredBooking);

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
  const [reviewDeleteConfirm, setReviewDeleteConfirm] = useState(false);
  const [reviewPhotoFile, setReviewPhotoFile] = useState(null);
  const [reviewPhotoPreview, setReviewPhotoPreview] = useState(null);
  const [reviewUploading, setReviewUploading] = useState(false);
  const reviewPhotoRef = useRef(null);
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

  // ── Optional tours / add-ons ──────────────────────────────────
  const [liveTours, setLiveTours] = useState([]);
  const [liveToursLoading, setLiveToursLoading] = useState(false);
  const [addOnsCart, setAddOnsCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLiveToursLoading(true);
    setLiveTours([]);
    loadDestinationTours(realSlug)
      .then((tours) => { if (!cancelled) { setLiveTours(tours); setLiveToursLoading(false); } })
      .catch(() => { if (!cancelled) setLiveToursLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const handleAddToCart = ({ id, name, price, icon, day, dayTitle }) => {
    setAddOnsCart((prev) => {
      const key = `${id}__${day ?? "any"}`;
      const exists = prev.some((c) => `${c.id}__${c.day ?? "any"}` === key);
      return exists
        ? prev.filter((c) => `${c.id}__${c.day ?? "any"}` !== key)
        : [...prev, { id, name, price, icon, day, dayTitle }];
    });
  };

  const handleSubmitReview = async (starsParam, commentParam, photoFile) => {
    const finalStars = starsParam ?? reviewStars;
    const finalComment = commentParam ?? reviewComment;
    if (finalStars === 0) return;
    const gdx = activeBooking?.gdx ?? "guest";
    const destination = realSlug ?? "boracay";
    const now = new Date();
    const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    let photoUrl = myReview?.photo ?? null;
    if (photoFile) {
      try { photoUrl = await uploadReviewPhoto({ gdx_reference: gdx, file: photoFile }); } catch {}
    }

    const review = {
      name: "You",
      location: destination.charAt(0).toUpperCase() + destination.slice(1),
      date: monthYear,
      review: String(finalComment).trim() || `${finalStars === 5 ? "Amazing" : finalStars >= 4 ? "Great" : "Good"} experience with Gladex Tours!`,
      rating: finalStars,
      ...(photoUrl ? { photo: photoUrl } : {}),
    };
    try { localStorage.setItem(`gladex-review-${gdx}`, JSON.stringify(review)); } catch {}
    setMyReview(review);
    setReviewStars(finalStars);
    setReviewComment(String(finalComment).trim());
    setReviewSubmitted(true);
    setReviewEditing(false);
    setReviewPhotoFile(null);
    setReviewPhotoPreview(null);
    setReviewUploading(false);
    submitReview({ gdx_reference: gdx, rating: finalStars, comment: String(finalComment).trim(), photo_url: photoUrl }).catch(() => {});
  };

  const handleDeleteReview = () => {
    const gdx = activeBooking?.gdx ?? "guest";
    try { localStorage.removeItem(`gladex-review-${gdx}`); } catch {}
    setMyReview(null);
    setReviewSubmitted(false);
    setReviewEditing(false);
    setReviewStars(0);
    setReviewComment("");
    deleteReview({ gdx_reference: gdx }).catch(() => {});
  };

  // ── Restore booking from sessionStorage on page refresh ──────
  useEffect(() => {
    if (isTestMode) return; // test mode uses mock booking, skip restore
    setRestoredBooking(null);
    if (routeBooking) { setSessionChecked(true); return; }

    let saved;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) { setSessionChecked(true); return; }
      saved = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      setSessionChecked(true);
      return;
    }

    if (!saved?.gdx || !saved?.slug || saved.slug !== realSlug) {
      sessionStorage.removeItem(SESSION_KEY);
      setSessionChecked(true);
      return;
    }

    lookupBooking(saved.gdx)
      .then((booking) => { setRestoredBooking(booking); setSessionChecked(true); })
      .catch(() => { sessionStorage.removeItem(SESSION_KEY); setSessionChecked(true); });
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redirect unauthenticated users to home ────────────────────
  useEffect(() => {
    if (isTestMode) return; // test mode always has a booking
    if (sessionChecked && !activeBooking) {
      navigate("/");
    }
  }, [sessionChecked, activeBooking]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (bk.hotel.roomType)   line(`Inclusions: ${formatRoomType(bk.hotel.roomType)}`, 10, BK);
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
  const bg          = darkMode ? "#0c0c0c"                 : "#fff8f3";
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

  // ── Orange section tokens — white overlay so inner cards stay pure orange (no brown) ──
  const orangeCardBg  = "rgba(255,255,255,0.15)";
  const orangeBorder  = "rgba(255,255,255,0.25)";
  const orangeCard    = { backgroundColor: orangeCardBg, borderColor: orangeBorder, boxShadow: "none" };
  const orangeTk      = {
    bg: "transparent", cardBg: orangeCardBg, surfaceBg: "rgba(255,255,255,0.1)",
    textPrimary: "#ffffff", textMuted: "rgba(255,255,255,0.72)",
    borderColor: orangeBorder, cardShadow: "none",
    card: orangeCard, muted: { color: "rgba(255,255,255,0.72)" },
  };

  const sectionGap = "mb-16";
  const pad = "px-4 sm:px-6 max-w-6xl mx-auto";

  // ── Loading — wait for session check before revealing destination ──
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Loader className="w-7 h-7 animate-spin" style={{ color: "#ff9913" }} />
      </div>
    );
  }

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
    <div className="min-h-screen" style={{ backgroundColor: bg, paddingBottom: (isTestMode && addOnsCart.length > 0) ? "80px" : 0, transition: "padding-bottom 0.3s ease" }}>
      <DestinationNavbar hideLogo={!activeBooking} />

      {/* ── TEST MODE BANNER ── */}
      {isTestMode && (
        <div className="sticky top-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-black tracking-widest uppercase" style={{ backgroundColor: "#7c3aed", color: "#fff" }}>
          <span>🧪</span>
          <span>TEST MODE — {dest?.name} · Demo Data · Not a Real Booking</span>
        </div>
      )}

      {/* ── DESTINATION HERO IMAGE ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "400px", maxHeight: "500px" }}>
        <img
          src={dest.heroImage}
          alt={dest.name}
          className="w-full h-full object-cover"
          style={{ position: "absolute", inset: 0, height: "100%" }}
        />
        {/* Gradient overlay — richer depth */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.72) 100%)" }}
        />

        {/* Decorative clouds */}
        <CloudDecor width={170} opacity={0.13} style={{ top: "10%", left: "6%",  animation: "tb-cloud-1 30s ease-in-out infinite" }} />
        <CloudDecor width={120} opacity={0.09} style={{ top: "20%", right: "8%", animation: "tb-cloud-2 38s ease-in-out infinite" }} />
        <CloudDecor width={90}  opacity={0.06} style={{ top: "6%",  left: "45%", animation: "tb-cloud-3 45s ease-in-out infinite" }} />

        {/* Animated airplane */}
        <HeroPlane />

        {/* Wave transition to content */}
        <HeroWave fill={bg} />

        <div
          className="absolute inset-0 flex flex-col items-center justify-end text-center pb-16 px-6"
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

      <div className={pad}>

        {/* ══════════════════════════════════════════════════
            1. HERO / BOOKING ENTRY
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={0} darkMode={darkMode} py="py-10">

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
              whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(255,153,19,0.18)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowTripDetails(true)}
              className="w-full flex items-center gap-3 px-4 pt-3 pb-2.5 rounded-2xl border transition-all cursor-pointer"
              style={{
                backgroundColor: darkMode ? "rgba(255,153,19,0.1)" : "rgba(255,153,19,0.07)",
                borderColor: "rgba(255,153,19,0.3)",
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,153,19,0.15)" }}
              >
                <BadgeCheck className="w-4 h-4" style={{ color: "#ff9913" }} />
              </div>

              {/* Text */}
              <div className="text-left flex-1 min-w-0">
                <p className="font-black text-sm leading-tight" style={{ color: "#ff9913" }}>View Booking Details</p>
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
                  style={{ background: "rgba(22,163,74,0.12)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.3)" }}
                >
                  ✓ Confirmed
                </span>
                <ChevronDown className="w-4 h-4" style={{ color: "#ff9913" }} />
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
                  background: "linear-gradient(135deg, #ff9913 0%, #ea580c 55%, #ff9913 100%)",
                  boxShadow: "0 8px 32px rgba(255,153,19,0.4), 0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                <div className="p-5 pb-5">
                  {/* Confirmed badge + collapse button */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                      style={{ background: "#ff9913", color: "#fff" }}
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
                          || (activeBooking.hotel?.roomType ? formatRoomType(activeBooking.hotel.roomType) : null)
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
                          className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
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
                              background: "rgba(22,163,74,0.12)",
                              color: "#16a34a",
                              border: "1px solid rgba(22,163,74,0.3)",
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
                            style={getStatusChipStyle(getDisplayStatus(activeBooking.status))}
                          >
                            <Check className="w-3 h-3" /> {getDisplayStatus(activeBooking.status)}
                          </span>
                          {activeBooking.paymentStatus && (
                            <span
                              className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                              style={getPaymentChipStyle(activeBooking.paymentStatus)}
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
                            label2={activeBooking.totalGuests === 1 ? "Total Guest" : "Total Guests"}  value2={String(activeBooking.totalGuests || "—")}
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
                              label2="Inclusions"
                              value2={
                                activeBooking.hotel?.roomType
                                  ? `${formatRoomType(activeBooking.hotel.roomType)}${activeBooking.hotel.nights ? ` · ${activeBooking.hotel.nights} ${Number(activeBooking.hotel.nights) === 1 ? "night" : "nights"}` : ""}`
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
                            {(activeBooking.ticket?.airline || activeBooking.ticket?.pnr) && (
                              <BookingRow
                                label1="Airline"  value1={activeBooking.ticket.airline || "—"}
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
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: textMuted }}>
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
                                <Download className="w-4 h-4" style={{ color: "#ff9913" }} />
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
                            <Download className="w-4 h-4" style={{ color: "#ff9913" }} />
                            View Itinerary
                          </motion.button>
                        </div>
                      </BookingSection>

                    </div>
                </motion.div>
              )}
            </SectionStripe>

        {/* ── EMERGENCY CONTACTS — consolidated, always visible near top ── */}
        <SectionStripe alt={1} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Important" title="Emergency Contacts" description="Save these numbers before your trip. Available for any emergency during your stay." tk={tk} colored />
            <SectionCard darkMode={darkMode}>
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Save These Numbers</p>
                <p className="font-black text-base" style={{ color: textPrimary }}>Emergency Contacts</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Gladex Hotline — always shown */}
                <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(255,153,19,0.12)" }}>📞</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Gladex Hotline</p>
                    <a href="tel:+639178752200" className="text-sm font-black" style={{ color: "#ff9913" }}>+63 917 875 2200</a>
                    <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>Available 8AM–8PM</p>
                  </div>
                </div>

                {/* Destination-defined emergency contacts — one card per group */}
                {dest.emergencyContacts
                  ?.filter((grp) => {
                    if (grp.contacts.every((c) => c.number === "+63 917 875 2200")) return false;
                    const tourName = (activeBooking?.tour?.tourName || "").toLowerCase();
                    if (grp.hideForKeywords?.some((kw) => tourName.includes(kw.toLowerCase()))) return false;
                    if (grp.tourKeywords) {
                      return grp.tourKeywords.some((kw) => tourName.includes(kw.toLowerCase()));
                    }
                    return true;
                  })
                  .map((grp) => {
                    const contacts = grp.contacts.filter((c) => c.number !== "+63 917 875 2200");
                    const multi = contacts.length > 1;
                    const allSameLabel = contacts.every(x => x.label === contacts[0].label);
                    return (
                      <div key={grp.group} className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(255,153,19,0.12)" }}>{grp.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>{grp.group}</p>
                          {multi ? (
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1">
                              {contacts.map((c, i) => (
                                <span key={c.number} className="flex items-center gap-x-1.5">
                                  {!allSameLabel && (
                                    <span className="text-xs font-semibold" style={{ color: textPrimary }}>{c.label}:</span>
                                  )}
                                  {/^[0+]/.test(c.number) ? (
                                    <a href={`tel:${c.number.replace(/[\s\-]/g, "")}`} className="text-xs font-bold" style={{ color: "#ff9913" }}>{c.number}</a>
                                  ) : (
                                    <span className="text-xs font-semibold" style={{ color: textPrimary }}>{c.number}</span>
                                  )}
                                  {i < contacts.length - 1 && <span className="text-xs font-bold" style={{ color: textMuted }}>/</span>}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-sm font-black" style={{ color: textPrimary }}>{contacts[0].label}</p>
                              {/^[0+]/.test(contacts[0].number) ? (
                                <a href={`tel:${contacts[0].number.replace(/[\s\-]/g, "")}`} className="text-xs font-bold" style={{ color: "#ff9913" }}>{contacts[0].number}</a>
                              ) : (
                                <p className="text-xs font-semibold" style={{ color: textPrimary }}>{contacts[0].number}</p>
                              )}
                            </>
                          )}
                          {grp.email && (
                            <a href={`mailto:${grp.email}`} className="text-[10px] font-semibold mt-1 block" style={{ color: textMuted }}>{grp.email}</a>
                          )}
                        </div>
                      </div>
                    );
                  })
                }

                {/* Booking-specific contacts */}
                {(activeBooking?.consultantName || activeBooking?.agentName) && (
                  <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(255,153,19,0.12)" }}>👤</div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Your Coordinator</p>
                      <p className="text-sm font-black" style={{ color: textPrimary }}>{activeBooking.consultantName || activeBooking.agentName}</p>
                      {activeBooking.consultantPhone ? (
                        <a href={`tel:${activeBooking.consultantPhone.replace(/\s/g,"")}`} className="text-xs font-bold" style={{ color: "#ff9913" }}>{activeBooking.consultantPhone}</a>
                      ) : (
                        <p className="text-xs" style={{ color: textMuted }}>Contact via Gladex Hotline</p>
                      )}
                    </div>
                  </div>
                )}
                {(activeBooking?.hotel?.hotelName || activeBooking?.tour?.hotelMention) && (
                  <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(255,153,19,0.12)" }}>🏨</div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Hotel</p>
                      <p className="text-sm font-black" style={{ color: textPrimary }}>{activeBooking.hotel?.hotelName || activeBooking.tour?.hotelMention}</p>
                      {activeBooking.hotel?.hotelPhone ? (
                        <a href={`tel:${activeBooking.hotel.hotelPhone.replace(/\s/g,"")}`} className="text-xs font-bold" style={{ color: "#ff9913" }}>{activeBooking.hotel.hotelPhone}</a>
                      ) : (
                        <p className="text-xs" style={{ color: textMuted }}>Contact via Gladex Hotline</p>
                      )}
                    </div>
                  </div>
                )}
                {activeBooking?.transfer?.transferContact && (
                  <div className="rounded-xl border p-3 flex items-start gap-3" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base" style={{ background: "rgba(255,153,19,0.12)" }}>🚌</div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: textMuted }}>Transfer Contact</p>
                      <p className="text-sm font-black" style={{ color: textPrimary }}>{activeBooking.transfer.supplier || "Transfer Coordinator"}</p>
                      <a href={`tel:${activeBooking.transfer.transferContact.replace(/\s/g,"")}`} className="text-xs font-bold" style={{ color: "#ff9913" }}>{activeBooking.transfer.transferContact}</a>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            2. TRAVEL BRIEFING VIDEO
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={0} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Watch Before You Travel" title="Your Travel Briefing" tk={tk} />
            <TBBriefingVideo dest={dest} darkMode={darkMode} tk={tk} />
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            3. OFFICIAL BRIEFING WELCOME
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={1} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Official Briefing" title={`Official ${dest.name} Briefing`} description={`Everything you need to know before arriving in ${dest.name}.`} tk={tk} colored />

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
                  style={{ background: "#ff9913", color: "#fff" }}
                >
                  {dest.tagline}
                </span>
                {dest.itinerary?.length && (
                  <span
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full border"
                    style={{ borderColor, color: textMuted, backgroundColor: surfaceBg }}
                  >
                    {dest.itinerary.length} {dest.itinerary.length === 1 ? "Day" : "Days"} / {dest.itinerary.length - 1} {dest.itinerary.length - 1 === 1 ? "Night" : "Nights"}
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
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            3b. PACKAGE INCLUSIONS & EXCLUSIONS
           ══════════════════════════════════════════════════ */}
        {(dest.inclusions?.length || dest.exclusions?.length) && (
          <SectionStripe alt={0} darkMode={darkMode}>
            <FadeIn>
              <StripeHeader eyebrow="What's Included" title="Package Inclusions" tk={tk} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* ── INCLUSIONS ── */}
                {dest.inclusions?.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(34,197,94,0.25)", boxShadow: cardShadow }}>
                    <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #16a34a 0%, #15803d 100%)" }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>What's Covered</p>
                      <p className="font-black text-base text-white" style={{ letterSpacing: "-0.01em" }}>Package Inclusions</p>
                    </div>
                    <div className="p-4 space-y-3" style={{ backgroundColor: cardBg }}>
                      {dest.inclusions.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: "#16a34a" }}>
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </div>
                          <span className="text-sm leading-relaxed pt-1" style={{ color: textPrimary }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── EXCLUSIONS ── */}
                {dest.exclusions?.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(239,68,68,0.25)", boxShadow: cardShadow }}>
                    <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #dc2626 0%, #b91c1c 100%)" }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>Not Covered</p>
                      <p className="font-black text-base text-white" style={{ letterSpacing: "-0.01em" }}>Package Exclusions</p>
                    </div>
                    <div className="p-4 space-y-3" style={{ backgroundColor: cardBg }}>
                      {dest.exclusions.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: "#dc2626" }}>
                            <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </div>
                          <span className="text-sm leading-relaxed pt-1" style={{ color: textPrimary }}>{item}</span>
                        </div>
                      ))}
                      {dest.exclusionNotes?.length > 0 && (
                        <div className="pt-3 space-y-1.5" style={{ borderTop: `1px solid ${borderColor}` }}>
                          {dest.exclusionNotes.map((note, i) => (
                            <p key={i} className="text-xs leading-snug" style={{ color: textMuted }}>{note}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </FadeIn>
          </SectionStripe>
        )}

        {/* ══════════════════════════════════════════════════
            3c. DAY-BY-DAY ITINERARY TIMELINE
           ══════════════════════════════════════════════════ */}
        {dest.itinerary?.length > 0 && (
          <SectionStripe alt={1} darkMode={darkMode}>
            <FadeIn>
              <StripeHeader eyebrow="Day by Day" title="Itinerary Timeline" description="Your complete day-by-day schedule from arrival to departure." tk={tk} colored />
              <SectionCard darkMode={darkMode}>
                <TBItinerary
                  dest={dest}
                  darkMode={darkMode}
                  tk={tk}
                  availableTours={isTestMode ? (liveTours.length > 0 ? liveTours : dest?.optionalTours || []) : []}
                  addOnsCart={isTestMode ? addOnsCart : []}
                  onAddToCart={isTestMode ? handleAddToCart : undefined}
                />
              </SectionCard>
            </FadeIn>
          </SectionStripe>
        )}

        {/* ══════════════════════════════════════════════════
            4. TRAVEL INFORMATION CENTER
           ══════════════════════════════════════════════════ */}

        <SectionStripe alt={0} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Operational Information" title="Travel Information Center" description="Arrival instructions, hotel check-in, transfers, and local info — everything in one place." tk={tk} />
            <div className="space-y-4">

              {/* 5a. Arrival Instructions */}
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">Arrival Instructions</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>How to get from the airport to your hotel</p>
                </div>
                <div className="p-5 space-y-7" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  {dest.arrivalInstructions.tabs.map(({ key, label }, tabIdx) => {
                    const info = dest.arrivalInstructions[key];
                    if (!info) return null;
                    return (
                      <div key={key} className={tabIdx > 0 ? "pt-6 border-t" : ""} style={{ borderColor }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#ff9913" }}>{label}</p>
                        <div className="space-y-3">
                          {info.steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #ff9913, #cc7700)", color: "#fff" }}>
                                {i + 1}
                              </div>
                              <p className="text-sm leading-snug pt-1" style={{ color: textPrimary }}>{step}</p>
                            </div>
                          ))}
                        </div>
                        {info.note && (
                          <div className="mt-4 p-3 rounded-xl border text-xs flex items-start gap-2" style={{ borderColor: "rgba(255,153,19,0.25)", backgroundColor: "rgba(255,153,19,0.07)", color: textMuted }}>
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-orange-400" />
                            {info.note}
                          </div>
                        )}
                        {info.travelTime && (
                          <div className="mt-4 rounded-xl border overflow-hidden" style={{ borderColor }}>
                            <div className="px-3 py-2" style={{ backgroundColor: darkMode ? "rgba(255,153,19,0.1)" : "rgba(255,153,19,0.07)" }}>
                              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#ff9913" }}>Estimated Travel Time</p>
                            </div>
                            <div className="px-3 py-2.5 space-y-1.5">
                              {info.travelTime.breakdown.map((b) => (
                                <div key={b.leg} className="flex items-center justify-between gap-3">
                                  <p className="text-xs" style={{ color: textMuted }}>{b.leg}</p>
                                  <p className="text-xs font-bold shrink-0" style={{ color: textPrimary }}>{b.duration}</p>
                                </div>
                              ))}
                              <div className="pt-1.5 mt-1 border-t" style={{ borderColor }}>
                                <p className="text-[10px] font-semibold" style={{ color: textMuted }}>{info.travelTime.summary}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        {info.vanSchedule && (
                          <div className="mt-4">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: textMuted }}>Van Transfer Schedule</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="rounded-xl p-3 border" style={{ borderColor, backgroundColor: surfaceBg }}>
                                <p className="text-xs font-bold mb-2" style={{ color: "#ff9913" }}>Puerto Princesa → El Nido</p>
                                {info.vanSchedule.ppsToElNido.map((s) => (<p key={s} className="text-xs py-0.5" style={{ color: textPrimary }}>{s}</p>))}
                              </div>
                              <div className="rounded-xl p-3 border" style={{ borderColor, backgroundColor: surfaceBg }}>
                                <p className="text-xs font-bold mb-2" style={{ color: "#ff9913" }}>El Nido → Puerto Princesa</p>
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
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">Transfer Instructions</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Arrival and departure transport details</p>
                </div>
                <div className="p-5 space-y-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  {[
                    { key: "arrival",   label: "Arrival Transfer" },
                    { key: "departure", label: "Departure Transfer" },
                  ].map(({ key, label }, gi) => (
                    <div key={key} className={gi > 0 ? "pt-5" : ""} style={{ borderTop: gi > 0 ? `1px solid ${borderColor}` : undefined }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#ff9913" }}>{label}</p>
                      <div className="space-y-3">
                        {dest.transferInstructions[key].map((s) => (
                          <div key={s.step} className="flex items-start gap-3">
                            <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #ff9913, #cc7700)", color: "#fff" }}>
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
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">Hotel Check-In Information</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Arriving at your accommodation</p>
                </div>
                <div className="p-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="rounded-xl p-3 border" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.07)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#ff9913" }}>Check-In Time</p>
                      <p className="text-sm" style={{ color: textPrimary }}>{dest.hotelInfo.checkin}</p>
                    </div>
                    <div className="rounded-xl p-3 border" style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.07)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#ff9913" }}>Check-Out Time</p>
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
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">Travel Requirements</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Documents and entry requirements</p>
                </div>
                <div className="p-5" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { label: "Filipino Travelers",  items: dest.requirements.filipino },
                      { label: "Foreign Travelers",   items: dest.requirements.foreign },
                      { label: "Travel Documents",    items: dest.requirements.documents },
                    ].map(({ label, items }) => (
                      <div key={label}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ff9913" }}>{label}</p>
                        <ul className="space-y-2">
                          {items.map((r) => (
                            <li key={r} className="flex items-start gap-2 text-sm leading-snug" style={{ color: textPrimary }}>
                              <BadgeCheck className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5e. Tour Reminders */}
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">Tour Reminders</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>What to remember before, during, and after your tour</p>
                </div>
                <div className="p-5 space-y-6" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  {[
                    { key: "before",    label: "Before Your Trip" },
                    { key: "during",    label: "During Your Stay" },
                    { key: "departure", label: "On Departure Day" },
                  ].map(({ key, label }, gi) => (
                    <div key={key} className={gi > 0 ? "pt-5" : ""} style={{ borderTop: gi > 0 ? `1px solid ${borderColor}` : undefined }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ff9913" }}>{label}</p>
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
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(34,197,94,0.3)", boxShadow: cardShadow }}>
                  <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #16a34a 0%, #15803d 100%)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>Behavior Guide</p>
                    <p className="font-black text-base text-white" style={{ letterSpacing: "-0.01em" }}>✓ Do's</p>
                  </div>
                  <div className="p-5" style={{ backgroundColor: darkMode ? "rgba(34,197,94,0.07)" : "rgba(34,197,94,0.04)" }}>
                  <ul className="space-y-2.5">
                    {dest.dos.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm leading-snug" style={{ color: textPrimary }}>
                        <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#16a34a" }} strokeWidth={2.5} />{d}
                      </li>
                    ))}
                  </ul>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(239,68,68,0.3)", boxShadow: cardShadow }}>
                  <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #dc2626 0%, #b91c1c 100%)" }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>Avoid These</p>
                    <p className="font-black text-base text-white" style={{ letterSpacing: "-0.01em" }}>✗ Don'ts</p>
                  </div>
                  <div className="p-5" style={{ backgroundColor: darkMode ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.04)" }}>
                    <ul className="space-y-2.5">
                      {dest.donts.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm leading-snug" style={{ color: textPrimary }}>
                          <X className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#dc2626" }} strokeWidth={2.5} />{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            5b2. CURRENCY & MONEY TIPS
           ══════════════════════════════════════════════════ */}
        {dest.currency && (
          <SectionStripe alt={0} darkMode={darkMode}>
            <FadeIn>
              <StripeHeader eyebrow="Money Matters" title="Currency Guide" description="Tips on handling money and exchange rates during your trip." tk={tk} />
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">{dest.currency.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Local currency symbol: {dest.currency.symbol}</p>
                </div>
                <div className="p-5 space-y-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  {dest.currency.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: "#ff9913" }}>
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-sm leading-relaxed pt-1" style={{ color: textPrimary }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </SectionStripe>
        )}

        {/* ══════════════════════════════════════════════════
            5b3. SAFETY TIPS
           ══════════════════════════════════════════════════ */}
        {dest.safetyTips?.length > 0 && (
          <SectionStripe alt={0} darkMode={darkMode}>
            <FadeIn>
              <StripeHeader eyebrow="Stay Safe" title="Safety Tips" description="Important safety reminders to keep you and your group protected." tk={tk} />
              <div className="rounded-2xl overflow-hidden" style={{ boxShadow: cardShadow }}>
                <div className="px-5 py-3.5" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
                  <p className="font-bold text-base text-white">Important Safety Guidelines</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>Please read carefully before your trip</p>
                </div>
                <div className="p-5 space-y-4" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, borderTop: "none" }}>
                  {dest.safetyTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: "#ff9913" }}>
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-sm leading-relaxed pt-1" style={{ color: textPrimary }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </SectionStripe>
        )}

        {/* ══════════════════════════════════════════════════
            7. TRAVEL READINESS CHECKLIST
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={1} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Packing Checklist" title="Travel Readiness Checklist" description="Check off everything you need before heading to the airport." tk={tk} colored />
            <SectionCard darkMode={darkMode}>
              <TBChecklist dest={dest} darkMode={darkMode} tk={tk} />
            </SectionCard>
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            7. WHAT TO BRING — Packing Guide
           ══════════════════════════════════════════════════ */}
        {dest.packingGuide && (
          <SectionStripe alt={0} darkMode={darkMode}>
            <FadeIn>
              <StripeHeader eyebrow="Packing Guide" title="What to Bring" description="Pack smart — everything you need for a comfortable and stress-free trip." tk={tk} />
              <div className={`${pad} space-y-6`}>
              {[
                { key: "documents",           label: "Documents" },
                { key: "essentials",          label: "Essentials" },
                { key: "destinationSpecific", label: "Destination Specific" },
              ].map(({ key, label }) => {
                const items = dest.packingGuide[key];
                if (!items?.length) return null;
                return (
                  <div key={key}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,153,19,0.2)" }} />
                      <p className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{ color: "#ff9913", border: "1px solid rgba(255,153,19,0.3)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                        {label}
                      </p>
                      <div className="h-px flex-1" style={{ backgroundColor: "rgba(255,153,19,0.2)" }} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
                      {items.map((item) => (
                        <div key={item.name} className="rounded-2xl overflow-hidden w-[calc(50%-6px)] sm:w-[150px] flex-shrink-0"
                          style={{ backgroundColor: cardBg, border: "1.5px solid rgba(255,153,19,0.3)", boxShadow: "0 2px 8px rgba(255,153,19,0.08), 0 1px 3px rgba(0,0,0,0.06)" }}>
                          <div className="flex items-center justify-center" style={{ aspectRatio: "1/1", backgroundColor: darkMode ? "rgba(255,153,19,0.06)" : "rgba(255,153,19,0.04)" }}>
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
          </SectionStripe>
        )}

        {/* ══════════════════════════════════════════════════
            8. OUTFIT GUIDE
           ══════════════════════════════════════════════════ */}
        {dest.outfitGuide?.length >= 2 && (
          <SectionStripe alt={1} darkMode={darkMode}>
            <FadeIn>
              <StripeHeader eyebrow="Dress for the Trip" title="Outfit Guide" description="What to wear for each part of your trip — airport, beach, and dinner." tk={tk} colored />
              <SectionCard darkMode={darkMode}>
                <OutfitGuideSection
                  dest={dest}
                  darkMode={darkMode}
                  sectionGap=""
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  cardBg={cardBg}
                  borderColor={borderColor}
                  cardShadow={cardShadow}
                />
              </SectionCard>
            </FadeIn>
          </SectionStripe>
        )}

        {/* ══════════════════════════════════════════════════
            9. DESTINATION GUIDE
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={0} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Know Your Destination" title="Destination Guide" tk={tk} />
            <TBDestinationGuide dest={dest} darkMode={darkMode} tk={tk} />
          </FadeIn>
        </SectionStripe>


        {/* ══════════════════════════════════════════════════
            13. FREQUENTLY ASKED QUESTIONS
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={1} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Have Questions?" title="Frequently Asked Questions" description="Common questions from Gladex travelers — answered before you even ask." tk={tk} colored />
            <SectionCard darkMode={darkMode}>
              <TBFAQs dest={dest} darkMode={darkMode} tk={tk} />
            </SectionCard>
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            14. TESTIMONIALS
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={0} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Traveler Reviews" title="Real Gladex Travel Experiences" tk={tk} />

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
                        className="rounded-2xl border overflow-hidden flex flex-col"
                        style={{
                          backgroundColor: isOwn ? "rgba(255,153,19,0.05)" : cardBg,
                          borderColor: isOwn ? "#ff9913" : borderColor,
                          boxShadow: isOwn ? "0 0 0 1px #ff9913, 0 4px 20px rgba(255,153,19,0.15)" : cardShadow,
                        }}
                      >
                        {/* Trip photo — optional */}
                        {t.photo && (
                          <div className="w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                            <img
                              src={t.photo}
                              alt={`${t.name}'s trip photo`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="p-4 flex flex-col gap-3 flex-1">
                        {/* YOUR REVIEW badge + edit button */}
                        {isOwn && (
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,153,19,0.15)", color: "#ff9913" }}>
                              Your Review
                            </span>
                            <div className="flex items-center gap-1.5">
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
                                style={{ color: "#ff9913", backgroundColor: "rgba(255,153,19,0.1)" }}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              {reviewDeleteConfirm ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold" style={{ color: "#dc2626" }}>Delete?</span>
                                  <button
                                    onClick={() => { setReviewDeleteConfirm(false); handleDeleteReview(); }}
                                    className="text-[10px] font-black px-2 py-1 rounded-lg"
                                    style={{ color: "#fff", backgroundColor: "#dc2626" }}
                                  >Yes</button>
                                  <button
                                    onClick={() => setReviewDeleteConfirm(false)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg"
                                    style={{ color: textPrimary, backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}
                                  >No</button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setReviewDeleteConfirm(true)}
                                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-all hover:opacity-80"
                                  style={{ color: "#dc2626", backgroundColor: "rgba(239,68,68,0.1)" }}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                                  Delete
                                </button>
                              )}
                            </div>
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
                        <div className="flex items-center gap-2.5 pt-2 border-t" style={{ borderColor: isOwn ? "rgba(255,153,19,0.2)" : borderColor }}>
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: isOwn ? "#ff9913" : "#1a1a1a", color: "#fff" }}
                          >
                            {isOwn ? "★" : t.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-xs" style={{ color: isOwn ? "#ff9913" : textPrimary }}>{t.name}</p>
                            <p className="text-[10px]" style={{ color: "#ff9913" }}>{t.location} · {t.date}</p>
                          </div>
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
                            backgroundColor: pi === safePage ? "#ff9913" : (darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"),
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
                          backgroundColor: safePage === totalPages - 1 ? "rgba(255,153,19,0.3)" : "#ff9913",
                          opacity: safePage === totalPages - 1 ? 0.5 : 1,
                          color: "#fff",
                          boxShadow: safePage < totalPages - 1 ? "0 4px 14px rgba(255,153,19,0.4)" : "none",
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
          </FadeIn>
        </SectionStripe>

        {/* ══════════════════════════════════════════════════
            15. RATE MY SERVICE
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={1} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Your Experience" title="Review Our Service" description="Your feedback helps us improve every trip for future travelers." tk={tk} colored />
            <div className="rounded-2xl border p-5" style={{ ...orangeCard }}>
              {(reviewSubmitted || myReview) ? (
                /* ── Already submitted ── */
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                    <svg className="w-6 h-6" fill="none" stroke="#ffffff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="font-black text-sm text-white">Thank you for your review!</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= (myReview?.rating ?? reviewStars) ? "fill-yellow-400 text-yellow-400" : "text-yellow-200"}`} />
                    ))}
                  </div>
                  {(myReview?.review || reviewComment) && (
                    <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.75)" }}>"{myReview?.review || reviewComment}"</p>
                  )}
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>Your review is visible above in the traveler reviews section.</p>
                </div>
              ) : (
                /* ── Form ── */
                <>
                  <p className="text-sm mb-3 text-white">
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
                              : "text-white/30 hover:text-yellow-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                    Comments <span className="font-normal normal-case tracking-normal">(optional)</span>
                  </p>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none transition-colors placeholder:text-white/40"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.15)",
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "#ffffff",
                    }}
                  />

                  {/* Photo upload */}
                  <input
                    ref={reviewPhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || !file.type.startsWith("image/")) return;
                      setReviewPhotoFile(file);
                      setReviewPhotoPreview(URL.createObjectURL(file));
                    }}
                  />
                  {reviewPhotoPreview ? (
                    <div className="relative mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <img src={reviewPhotoPreview} alt="Trip photo" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setReviewPhotoFile(null); setReviewPhotoPreview(null); }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
                        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
                      >✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => reviewPhotoRef.current?.click()}
                      className="w-full mt-3 py-2.5 rounded-xl border-2 border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80"
                      style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)" }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      Add trip photo (optional)
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      setReviewUploading(true);
                      await handleSubmitReview(reviewStars, reviewComment, reviewPhotoFile);
                    }}
                    disabled={reviewStars === 0 || reviewUploading}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      backgroundColor: reviewStars > 0 ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                      color: "#ffffff",
                      opacity: reviewStars === 0 ? 0.5 : 1,
                    }}
                  >
                    {reviewUploading ? "Uploading…" : reviewEditing ? "Update Review" : "Submit Review"}
                  </button>
                  {reviewEditing && (
                    <button
                      onClick={() => setReviewEditing(false)}
                      className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{ color: "rgba(255,255,255,0.7)", backgroundColor: "rgba(255,255,255,0.08)" }}
                    >
                      Cancel
                    </button>
                  )}
                </>
              )}
            </div>
          </FadeIn>
        </SectionStripe>


        {/* ══════════════════════════════════════════════════
            Important Notes
           ══════════════════════════════════════════════════ */}
        <SectionStripe alt={0} darkMode={darkMode}>
          <FadeIn>
            <StripeHeader eyebrow="Before You Go" title="Important Notes" description="Please read these reminders carefully before your trip begins." tk={tk} />
            <div className="rounded-2xl border overflow-hidden" style={{ ...card }}>
              <div className="px-5 pt-4 pb-3 border-b flex items-center gap-2" style={{ borderColor }}>
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#ff9913" }} />
                <p className="font-bold text-base" style={{ color: textPrimary }}>Please Read Carefully</p>
              </div>
              <div className="p-5 space-y-4">
                {dest.notes.map((n, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: "#ff9913" }}>
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <p className="text-sm leading-relaxed pt-1" style={{ color: textPrimary }}>{n}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </SectionStripe>

        {/* Footer CTA */}
        <FadeIn>
          <div className="text-center py-12 px-4">
            <div className="w-10 h-0.5 rounded-full mx-auto mb-6" style={{ background: "linear-gradient(90deg, #ff9913, #e07800)" }} />
            <p className="text-base font-black mb-2" style={{ color: textPrimary, fontFamily: "'Montserrat', sans-serif", letterSpacing: "-0.01em" }}>
              Thank you for choosing Gladex! 🧡
            </p>
            <p className="text-sm mb-4" style={muted}>
              We look forward to giving you a smooth, safe, and memorable {dest.name} experience.
            </p>
            <p className="text-xs" style={muted}>
              Need help? Call <span style={{ color: "#ff9913", fontWeight: 700 }}>+63 917 875 2200</span>
              <span className="mx-1">·</span>
              7:00 AM – 9:00 PM
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Floating UI */}
      <BackToTopButton visible={showBackToTop} lift={isTestMode && addOnsCart.length > 0} />

      {/* Floating cart bar — test mode only */}
      <AnimatePresence>
        {isTestMode && addOnsCart.length > 0 && (
          <motion.div
            key="cart-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="max-w-lg mx-auto rounded-2xl flex items-center gap-3 px-4 py-3 shadow-2xl"
              style={{
                background: darkMode ? "rgba(17,24,39,0.96)" : "rgba(255,255,255,0.97)",
                border: "1px solid rgba(255,153,19,0.35)",
                backdropFilter: "blur(16px)",
                pointerEvents: "auto",
              }}
            >
              {/* Item count badge */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0"
                style={{ background: "linear-gradient(135deg,#ff9913,#cc7700)", color: "#fff" }}
              >
                {addOnsCart.length}
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm leading-tight" style={{ color: tk.textPrimary }}>
                  {addOnsCart.length} add-on{addOnsCart.length > 1 ? "s" : ""} selected
                </p>
                <p className="text-xs" style={{ color: tk.textMuted }}>
                  ₱{addOnsCart.reduce((s, i) => s + (i.price || 0), 0).toLocaleString("en-PH")} total
                </p>
              </div>

              {/* Book button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setCheckoutOpen(true)}
                className="shrink-0 px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-1.5"
                style={{
                  background: "linear-gradient(135deg,#ff9913,#cc7700)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(255,153,19,0.4)",
                }}
              >
                Book Add-Ons →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add-ons checkout sheet — test mode only */}
      {isTestMode && (
        <TBAddOnsCheckout
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          addOnsCart={addOnsCart}
          booking={activeBooking}
          slug={realSlug}
          darkMode={darkMode}
          tk={tk}
        />
      )}
    </div>
  );
}
