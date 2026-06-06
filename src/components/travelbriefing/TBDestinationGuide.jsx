// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";

function PhotoSpotCard({ spot, idx, darkMode, tk }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.06, duration: 0.4 }}
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: tk.borderColor, boxShadow: tk.cardShadow }}
    >
      {spot.image && !imgFailed ? (
        <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center text-3xl"
          style={{ aspectRatio: "4/3", background: darkMode ? "#1a1a1a" : "#e8e8e8" }}
        >
          📸
        </div>
      )}
      <div className="p-3" style={{ backgroundColor: tk.cardBg }}>
        <p className="font-bold text-sm mb-0.5" style={{ color: tk.textPrimary }}>{spot.name}</p>
        <p className="text-xs leading-snug" style={{ color: tk.textMuted }}>{spot.note}</p>
      </div>
    </motion.div>
  );
}

function ImageCard({ item, darkMode, tk, priority = false }) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: tk.borderColor, boxShadow: tk.cardShadow }}
    >
      {/* Image */}
      <div
        className="overflow-hidden"
        style={{ aspectRatio: priority ? "16 / 7" : "4 / 3", position: "relative" }}
      >
        {item.image && !failed ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #1a1a1a, #0c0c0c)"
                : "linear-gradient(135deg, #e8e8e8, #d0d0d0)",
              fontSize: "4rem",
            }}
          >
            {item.icon}
          </div>
        )}
      </div>

      {/* Text */}
      <div className="p-4" style={{ backgroundColor: tk.cardBg }}>
        <p className="font-black text-base mb-1" style={{ color: tk.textPrimary }}>
          {item.name}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: tk.textMuted }}>
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function TBDestinationGuide({ dest, darkMode, tk }) {
  const guide = dest.destinationGuide;

  return (
    <div className="space-y-10">

      {/* ── Must-Visit Spots — Klook large vertical layout ── */}
      {guide.highlights?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: tk.textMuted }}>
            Must-Visit Spots
          </p>

          {/* First card: full-width hero (16:9) */}
          <div className="mb-4">
            <ImageCard item={guide.highlights[0]} darkMode={darkMode} tk={tk} priority />
          </div>

          {/* Remaining: 2-column grid (4:3) — scrolls DOWN on all devices */}
          {guide.highlights.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {guide.highlights.slice(1).map((h) => (
                <ImageCard key={h.name} item={h} darkMode={darkMode} tk={tk} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Local Food To Try ── */}
      {guide.food?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: tk.textMuted }}>
            Local Food To Try
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guide.food.map((f) => (
              <div
                key={f.name}
                className="border rounded-2xl p-4 flex items-start gap-3"
                style={{ borderColor: tk.borderColor, backgroundColor: tk.surfaceBg }}
              >
                <span className="text-2xl shrink-0">{f.emoji}</span>
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: tk.textPrimary }}>{f.name}</p>
                  <p className="text-xs leading-snug" style={{ color: tk.textMuted }}>{f.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Best Photo Spots ── */}
      {guide.photoSpots?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: tk.textMuted }}>
            Best Photo Spots
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.photoSpots.map((spot, i) => (
              <PhotoSpotCard key={spot.name} spot={spot} idx={i} darkMode={darkMode} tk={tk} />
            ))}
          </div>
        </div>
      )}

      {/* ── Local Tips ── */}
      {guide.localTips?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tk.textMuted }}>
            Local Tips
          </p>
          <ul className="space-y-2">
            {guide.localTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: tk.textPrimary }}>
                <span className="text-orange-400 shrink-0 mt-0.5">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Weather Reminder ── */}
      {guide.weather && (
        <div
          className="rounded-2xl p-4 border"
          style={{ borderColor: "rgba(59,130,246,0.3)", backgroundColor: "rgba(59,130,246,0.05)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#3b82f6" }}>
            🌤️ Weather & Climate
          </p>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: tk.textMuted }}>Best Season</p>
              <p className="text-sm" style={{ color: tk.textPrimary }}>{guide.weather.bestSeason}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: tk.textMuted }}>Rainy Season</p>
              <p className="text-sm" style={{ color: tk.textPrimary }}>{guide.weather.rainySeason}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: tk.textMuted }}>Temperature</p>
              <p className="text-sm" style={{ color: tk.textPrimary }}>{guide.weather.temperature}</p>
            </div>
            <div className="mt-2 pt-2 border-t" style={{ borderColor: "rgba(59,130,246,0.2)" }}>
              <p className="text-xs italic" style={{ color: tk.textMuted }}>💡 {guide.weather.packingTip}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Currency & Payments ── */}
      {guide.currency && (
        <div
          className="rounded-2xl p-4 border"
          style={{ borderColor: "rgba(34,197,94,0.3)", backgroundColor: "rgba(34,197,94,0.05)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>
            💵 Currency & Payments
          </p>
          <p className="font-bold text-sm mb-3" style={{ color: tk.textPrimary }}>
            {guide.currency.symbol} {guide.currency.name}
          </p>
          <ul className="space-y-2">
            {guide.currency.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: tk.textPrimary }}>
                <span className="shrink-0 mt-0.5" style={{ color: "#22c55e" }}>✓</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Safety Tips ── */}
      {guide.safetyTips?.length > 0 && (
        <div
          className="rounded-2xl p-4 border"
          style={{ borderColor: "rgba(239,68,68,0.25)", backgroundColor: "rgba(239,68,68,0.04)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>
            🛡️ Safety Tips
          </p>
          <ul className="space-y-2">
            {guide.safetyTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: tk.textPrimary }}>
                <span className="shrink-0 mt-0.5" style={{ color: "#ef4444" }}>•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
