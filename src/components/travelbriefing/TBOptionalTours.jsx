// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, MapPin, Plus, Check } from "lucide-react";

export default function TBOptionalTours({ dest, darkMode, tk, onAddToCart, cartItems = [], loading = false }) {
  const [open, setOpen] = useState(null);
  const tours = dest.optionalTours;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-2xl overflow-hidden animate-pulse" style={{ borderColor: tk.borderColor }}>
            <div className="h-44 w-full" style={{ backgroundColor: tk.surfaceBg }} />
            <div className="p-4 space-y-2">
              <div className="h-4 rounded w-3/4" style={{ backgroundColor: tk.surfaceBg }} />
              <div className="h-3 rounded w-1/2" style={{ backgroundColor: tk.surfaceBg }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      {tours.map((tour, idx) => {
        const isOpen  = open === idx;
        const cartKey = String(tour.id || tour.name);
        const inCart  = cartItems.some((c) => c.id === cartKey);

        return (
          <motion.div
            key={cartKey}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            className="border rounded-2xl overflow-hidden flex flex-col"
            style={{
              borderColor: inCart ? "rgba(34,197,94,0.4)" : isOpen ? "rgba(249,115,22,0.35)" : tk.borderColor,
              backgroundColor: tk.cardBg,
              boxShadow: tk.cardShadow,
            }}
          >
            {/* ── Activity Photo ─────────────────────────────────── */}
            <div
              className="relative overflow-hidden cursor-pointer"
              style={{ aspectRatio: "16 / 7" }}
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              {tour.image ? (
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:${darkMode ? '#1a1a1a' : '#f0f0f0'}">${tour.icon || '🏝️'}</div>`;
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-5xl"
                  style={{ background: darkMode ? "linear-gradient(135deg,#1a1a1a,#0c0c0c)" : "linear-gradient(135deg,#e8e8e8,#d5d5d5)" }}
                >
                  {tour.icon || "🏝️"}
                </div>
              )}

              {/* Badges over image */}
              <div className="absolute top-2.5 left-2.5 flex gap-1.5 flex-wrap">
                {tour.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm"
                    style={{ background: "rgba(249,115,22,0.88)", color: "#fff" }}>
                    {tour.badge}
                  </span>
                )}
                {tour.liveData && (
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full backdrop-blur-sm"
                    style={{ background: "rgba(34,197,94,0.88)", color: "#fff" }}>
                    ✅ Live
                  </span>
                )}
              </div>

              {/* Price over image */}
              {tour.price && (
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="text-sm font-black px-2.5 py-1 rounded-lg backdrop-blur-sm"
                    style={{ background: "rgba(0,0,0,0.65)", color: "#fff" }}>
                    ₱{Number(tour.price).toLocaleString("en-PH")}
                    <span className="text-[10px] font-normal ml-0.5 opacity-80">/pax</span>
                  </span>
                </div>
              )}
            </div>

            {/* ── Tour Header ─────────────────────────────────────── */}
            <button
              className="flex items-start gap-3 p-4 text-left w-full"
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-snug" style={{ color: tk.textPrimary }}>
                  {tour.name}
                </p>
                {tour.duration && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 shrink-0" style={{ color: tk.textMuted }} />
                    <span className="text-xs" style={{ color: tk.textMuted }}>{tour.duration}</span>
                  </div>
                )}
              </div>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }} className="shrink-0 mt-0.5">
                <ChevronDown className="w-4 h-4" style={{ color: tk.textMuted }} />
              </motion.div>
            </button>

            {/* ── Expandable Details ──────────────────────────────── */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${tk.borderColor}`, paddingTop: "14px" }}>

                    {/* Description */}
                    {tour.description && (
                      <p className="text-sm leading-relaxed" style={{ color: tk.textPrimary }}>
                        {tour.description.length > 250
                          ? tour.description.substring(0, 250) + "…"
                          : tour.description
                        }
                      </p>
                    )}

                    {/* Inclusions / Stops */}
                    {(tour.stops?.length > 0 || tour.highlights?.length > 0) && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tk.textMuted }}>
                          {tour.stops?.length > 0 ? "What's Included" : "Highlights"}
                        </p>
                        <div className="space-y-1.5">
                          {(tour.stops?.length > 0 ? tour.stops : tour.highlights)
                            .slice(0, 6)
                            .map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: tk.textPrimary }}>
                                <span className="text-orange-400 shrink-0 mt-0.5">✓</span>
                                <span>{typeof item === "string" ? item : item.name || JSON.stringify(item)}</span>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Destinations */}
                    {!tour.liveData && tour.stops?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tk.textMuted }}>
                          Destinations
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tour.stops.map((stop) => (
                            <div key={stop} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                              style={{ borderColor: tk.borderColor, color: tk.textMuted, backgroundColor: tk.surfaceBg }}>
                              <MapPin className="w-2.5 h-2.5" /> {stop}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add to Trip */}
                    {onAddToCart ? (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart({ id: cartKey, name: tour.name, price: tour.price || 0, icon: tour.icon });
                        }}
                        className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: inCart ? "rgba(34,197,94,0.12)" : "linear-gradient(135deg, #f97316, #b45309)",
                          color: inCart ? "#22c55e" : "#fff",
                          border: inCart ? "1px solid rgba(34,197,94,0.4)" : "none",
                        }}
                      >
                        {inCart
                          ? <><Check className="w-4 h-4" /> Added to Trip</>
                          : <><Plus className="w-4 h-4" /> Add to Trip</>
                        }
                      </motion.button>
                    ) : (
                      <p className="text-xs italic" style={{ color: tk.textMuted }}>
                        Contact Gladex at +63 917 875 2200 to book this tour.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
