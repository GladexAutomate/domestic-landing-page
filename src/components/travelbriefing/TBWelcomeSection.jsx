// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, User, ArrowRight, BadgeCheck, Loader, AlertCircle, ExternalLink } from "lucide-react";
import { lookupBooking, detectDomesticSlug, normalizeGdx } from "@/services/supabaseService";

// Normalize accents + lowercase so "Castañeda" matches "Castaneda"
function normStr(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Returns true if `entered` matches the guest's surname in `fullName`.
// Handles single-word ("Villa") and multi-word ("de Villa", "de la Cruz",
// "San Juan") surnames — the entered value is split into words too, so a
// compound last name is matched as a contiguous run of name words.
function lastNameMatches(fullName, entered) {
  if (!fullName || !entered) return false;
  const nameWords   = normStr(fullName).split(/[\s,.\-/]+/).filter(Boolean);
  const needleWords = normStr(entered).split(/[\s,.\-/]+/).filter(Boolean);
  if (!needleWords.length || !nameWords.length) return false;

  // Single word entered — match any word in the name exactly (e.g. "villa", "cruz")
  if (needleWords.length === 1) return nameWords.includes(needleWords[0]);

  // Multi-word surname — match as a contiguous run of words anywhere in the name
  for (let i = 0; i + needleWords.length <= nameWords.length; i++) {
    if (needleWords.every((w, j) => w === nameWords[i + j])) return true;
  }
  // Fallback — every entered word appears somewhere in the name (order-independent)
  return needleWords.every((w) => nameWords.includes(w));
}

const NAME_MISMATCH_ERROR =
  "That last name doesn't match this booking. Please enter the Lead Guest's last name exactly as it appears on your confirmation.";
const GENERIC_ERROR =
  "Something went wrong while verifying your booking. Please try again, or contact your travel consultant if this keeps happening.";

export default function TBWelcomeSection({ darkMode, tk, compact = false }) {
  const navigate = useNavigate();
  const [code, setCode]         = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const bg          = tk?.bg          ?? (darkMode ? "#0c0c0c" : "#f4f3f1");
  const cardBg      = tk?.cardBg      ?? (darkMode ? "#141414" : "#ffffff");
  const surfaceBg   = tk?.surfaceBg   ?? (darkMode ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.028)");
  const textPrimary = tk?.textPrimary ?? (darkMode ? "#f0f0f0" : "#1a1a1a");
  const textMuted   = tk?.textMuted   ?? (darkMode ? "rgba(255,255,255,0.45)" : "#6b7280");
  const borderColor = tk?.borderColor ?? (darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)");
  const cardShadow  = tk?.cardShadow  ?? (darkMode
    ? "0 1px 3px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)");

  const handleViewTrip = async () => {
    const trimmedCode     = code.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedCode) {
      setError("Please enter your GDX Confirmation Number.");
      return;
    }
    if (!trimmedLastName) {
      setError("Please enter the Lead Guest Last Name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Throws with code "GDX_NOT_FOUND" if the confirmation number doesn't exist
      const booking = await lookupBooking(trimmedCode);

      // GDX exists — now verify the lead guest's last name
      if (!lastNameMatches(booking.leadName, trimmedLastName)) {
        setError(NAME_MISMATCH_ERROR);
        return;
      }

      const domesticSlug = detectDomesticSlug(booking);

      if (!domesticSlug) {
        setRedirecting(true);
        setTimeout(() => {
          const intlBase = "https://international-landing-page.vercel.app/";
          window.location.href = booking.gdx ? `${intlBase}?gdx=${booking.gdx}` : intlBase;
        }, 2500);
        return;
      }

      const slug = domesticSlug;

      try {
        sessionStorage.setItem("gladex-session", JSON.stringify({ gdx: booking.gdx, slug }));
      } catch {}

      navigate(`/destination/${slug}`, { state: { booking } });
    } catch (err) {
      if (err?.code === "GDX_NOT_FOUND") {
        setError(`We couldn't find a booking for ${normalizeGdx(trimmedCode)}. Please double-check your GDX Confirmation Number.`);
      } else {
        setError(err?.message || GENERIC_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleViewTrip();
  };

  const clearAll = () => { setCode(""); setLastName(""); setError(null); };

  return (
    <section
      className={`w-full flex flex-col items-center justify-center px-4 ${compact ? "py-8" : "pt-16 pb-12 sm:min-h-dvh sm:py-24"}`}
      style={{ backgroundColor: bg }}
    >
      {/* Confirmed badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45, type: "spring" }}
        className="flex items-center gap-2 px-4 py-2 rounded-full border mb-3 sm:mb-6"
        style={{ borderColor: "rgba(249,115,22,0.35)", backgroundColor: "rgba(249,115,22,0.08)" }}
      >
        <BadgeCheck className="w-4 h-4" style={{ color: "#f97316" }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#f97316" }}>
          Booking Confirmed
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.55 }}
        className={`font-black text-center leading-tight mb-3 sm:mb-4 ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl md:text-4xl"}`}
        style={{ color: textPrimary, letterSpacing: "-0.02em" }}
      >
        Your Trip Is{" "}
        <span style={{ color: "#f97316" }}>Confirmed! 🧡</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5 }}
        className="text-center text-sm leading-relaxed mb-4 sm:mb-10"
        style={{ color: textMuted, maxWidth: "460px" }}
      >
        Enter your GDX Confirmation Number and Lead Guest Last Name to access your personalized travel briefing.
      </motion.p>

      {/* Search card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.5 }}
        className="w-full rounded-2xl border overflow-hidden"
        style={{ maxWidth: "500px", backgroundColor: cardBg, borderColor, boxShadow: cardShadow }}
      >
        <div className="p-4 sm:p-5 space-y-2.5">

          {/* GDX Number */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>
              GDX Confirmation Number
            </p>
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{ borderColor, backgroundColor: surfaceBg }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="GDX Confirmation Number"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: textPrimary }}
                autoComplete="off"
                spellCheck="false"
                disabled={loading}
              />
              {code && !loading && (
                <button onClick={() => { setCode(""); setError(null); }} className="text-xs opacity-40 hover:opacity-70 transition-opacity" style={{ color: textMuted }}>✕</button>
              )}
            </div>
          </div>

          {/* Lead Guest Last Name */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>
              Lead Guest Last Name
            </p>
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={{ borderColor, backgroundColor: surfaceBg }}
            >
              <User className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
              <input
                type="text"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Lead Guest Last Name"
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: textPrimary }}
                autoComplete="off"
                spellCheck="false"
                disabled={loading}
              />
              {lastName && !loading && (
                <button onClick={() => { setLastName(""); setError(null); }} className="text-xs opacity-40 hover:opacity-70 transition-opacity" style={{ color: textMuted }}>✕</button>
              )}
            </div>
          </div>

          {/* International redirect notice */}
          <AnimatePresence>
            {redirecting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-xl border px-3.5 py-3 flex items-start gap-2.5"
                style={{ borderColor: "rgba(251,191,36,0.35)", backgroundColor: "rgba(251,191,36,0.08)" }}
              >
                <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                <div>
                  <p className="text-xs font-bold leading-snug" style={{ color: "#f59e0b" }}>
                    International Booking Detected
                  </p>
                  <p className="text-xs leading-relaxed mt-0.5" style={{ color: darkMode ? "rgba(255,255,255,0.5)" : "#6b7280" }}>
                    This page is for domestic packages only. Redirecting you to the international travel briefing…
                  </p>
                </div>
                <Loader className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-spin ml-auto" style={{ color: "#f59e0b" }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 text-xs px-1"
                style={{ color: "#ef4444" }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.97 }}
            onClick={handleViewTrip}
            disabled={loading || redirecting}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #f97316, #b45309)",
              color: "#fff",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Verifying booking…</>
            ) : (
              <>View My Trip <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>

        {/* Footer note */}
        <div
          className="px-4 sm:px-5 py-3 flex items-center justify-center gap-1.5 border-t"
          style={{ borderColor, backgroundColor: surfaceBg }}
        >
          <span className="text-xs" style={{ color: textMuted }}>
            Secured — GDX Number and Last Name are required to access booking details.
          </span>
        </div>
      </motion.div>

    </section>
  );
}
