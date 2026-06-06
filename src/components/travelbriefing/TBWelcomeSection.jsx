// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, BadgeCheck, Loader, AlertCircle } from "lucide-react";
import { lookupBooking, detectDestinationSlug } from "@/services/supabaseService";

const GLADEX_LOGO =
  "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function TBWelcomeSection({ darkMode, tk, compact = false }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter your GDX Confirmation Number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Real Supabase lookup from bookings_6fbdd6b2
      const booking = await lookupBooking(trimmed);

      // Detect destination slug — always returns a value (defaults to "boracay")
      const slug = detectDestinationSlug(booking);

      // Navigate to destination page with full booking pre-loaded
      navigate(`/destination/${slug}`, { state: { booking } });
    } catch (err) {
      setError(err.message || "Booking not found. Please check your GDX number.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleViewTrip();
  };

  return (
    <section
      className="w-full flex flex-col items-center justify-center px-4"
      style={{
        minHeight: compact ? "auto" : "100vh",
        backgroundColor: bg,
        paddingTop: compact ? "2rem" : "6rem",
        paddingBottom: compact ? "2rem" : "5rem",
      }}
    >
      {/* Logo — full page only */}
      {!compact && (
        <motion.img
          src={GLADEX_LOGO}
          alt="Gladex Travel and Tours"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-12 w-auto object-contain mb-10"
          style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.3))" }}
        />
      )}

      {/* Confirmed badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.45, type: "spring" }}
        className="flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
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
        className={`font-black text-center leading-tight mb-4 ${compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl md:text-6xl"}`}
        style={{ color: textPrimary, letterSpacing: "-0.025em", maxWidth: "720px" }}
      >
        Your Trip Is{" "}
        <span style={{ color: "#f97316" }}>Confirmed!</span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5 }}
        className="text-center text-sm sm:text-base leading-relaxed mb-10"
        style={{ color: textMuted, maxWidth: "540px" }}
      >
        Enter your GDX Confirmation Number or Tour Voucher Number to access your
        personalized travel briefing, vouchers, reminders, optional tours, and add-ons.
      </motion.p>

      {/* Search card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.5 }}
        className="w-full rounded-2xl border overflow-hidden"
        style={{ maxWidth: "500px", backgroundColor: cardBg, borderColor, boxShadow: cardShadow }}
      >
        <div className="p-4 sm:p-5">
          {/* Input row */}
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5 mb-3"
            style={{ borderColor, backgroundColor: surfaceBg }}
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: textMuted }} />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter GDX Confirmation Number / Tour Voucher Number"
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

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 text-xs mb-3 px-1"
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
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: "linear-gradient(135deg, #f97316, #b45309)",
              color: "#fff",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Searching bookings…</>
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
          <span className="text-[10px]" style={{ color: textMuted }}>
            🔒 Your data is securely retrieved from Gladex booking records.
          </span>
        </div>
      </motion.div>

      {/* Destination quick-links — home page only */}
      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <p className="text-xs w-full text-center mb-1" style={{ color: textMuted }}>
            Or preview a destination briefing:
          </p>
          {[
            { slug: "boracay", label: "🏖️ Boracay", color: "#f97316" },
            { slug: "cebu",    label: "🌊 Cebu",    color: "#0ea5e9" },
            { slug: "elnido",  label: "🏝️ El Nido", color: "#10b981" },
          ].map(({ slug, label, color }) => (
            <button
              key={slug}
              onClick={() => navigate(`/destination/${slug}`)}
              className="text-xs font-semibold px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95"
              style={{ borderColor: `${color}40`, backgroundColor: `${color}0f`, color }}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
    </section>
  );
}
