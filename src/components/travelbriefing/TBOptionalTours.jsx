// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, MapPin, CalendarDays } from "lucide-react";

function getChipIcon(text) {
  const t = text.toLowerCase();
  if (t.includes("lunch") || t.includes("bbq") || t.includes("meal") || t.includes("food")) return "🍱";
  if (t.includes("snorkel")) return "🤿";
  if (t.includes("guide") || t.includes("instructor")) return "👨‍✈️";
  if (t.includes("boat") || t.includes("bangka") || t.includes("ferry")) return "⛴️";
  if (t.includes("gear") || t.includes("equipment")) return "🎽";
  if (t.includes("photo") || t.includes("picture")) return "📸";
  if (t.includes("transport") || t.includes("transfer")) return "🚌";
  if (t.includes("fish") || t.includes("marine") || t.includes("coral")) return "🐠";
  if (t.includes("underwater") || t.includes("ocean floor")) return "🌊";
  if (t.includes("helmet") || t.includes("safety")) return "⛑️";
  if (t.includes("wetsuit")) return "🤽";
  if (t.includes("lifejacket") || t.includes("life jacket")) return "🦺";
  if (t.includes("beach") || t.includes("island")) return "🏖️";
  return "✓";
}

export default function TBOptionalTours({
  dest,
  tours: propTours,
  darkMode,
  tk,
  cartItems = [],
  loading = false,
}) {
  const [open, setOpen] = useState(null);

  const tours = propTours || dest?.optionalTours || [];
  const { cardBg, cardShadow, borderColor, textPrimary, textMuted, surfaceBg } = tk;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-2xl overflow-hidden animate-pulse" style={{ borderColor }}>
            <div className="h-44 w-full" style={{ backgroundColor: surfaceBg }} />
            <div className="p-4 space-y-3">
              <div className="h-5 rounded w-3/4" style={{ backgroundColor: surfaceBg }} />
              <div className="h-6 rounded w-1/3" style={{ backgroundColor: surfaceBg }} />
              <div className="h-3 rounded w-1/2" style={{ backgroundColor: surfaceBg }} />
              <div className="h-9 rounded-xl" style={{ backgroundColor: surfaceBg }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border text-center"
        style={{ borderColor, backgroundColor: surfaceBg }}
      >
        <span className="text-4xl">🏝️</span>
        <p className="font-bold text-sm" style={{ color: textPrimary }}>No tours available at the moment</p>
        <p className="text-xs" style={{ color: textMuted }}>
          Contact Gladex at +63 917 875 2200 to arrange custom activities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Helper hint */}
      <div
        className="flex items-start gap-2.5 px-4 py-3 rounded-xl border"
        style={{ borderColor: "rgba(249,115,22,0.25)", backgroundColor: "rgba(249,115,22,0.06)" }}
      >
        <span className="text-base shrink-0">👆</span>
        <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
          To add activities to your trip, open any day in the <strong style={{ color: textPrimary }}>Itinerary</strong> above and tap{" "}
          <strong style={{ color: "#f97316" }}>Optional Add-Ons</strong> to pick what fits your schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tours.map((tour, idx) => {
          const isOpen     = open === idx;
          const cartKey    = String(tour.id || tour.name);
          const addedDays  = cartItems.filter((c) => c.id === cartKey);
          const inCart     = addedDays.length > 0;
          const resolvedPrice = tour.price ? Number(tour.price) : null;
          const priceIsLive   = tour.liveData === true;

          const allInclusions     = tour.highlights?.length ? tour.highlights : (tour.stops?.length ? tour.stops : []);
          const visibleInclusions = allInclusions.slice(0, 3);
          const hiddenInclusions  = allInclusions.slice(3);

          return (
            <motion.div
              key={cartKey}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="border rounded-2xl overflow-hidden flex flex-col"
              style={{
                borderColor: inCart ? "rgba(34,197,94,0.4)" : isOpen ? "rgba(249,115,22,0.35)" : borderColor,
                backgroundColor: cardBg,
                boxShadow: cardShadow,
              }}
            >
              {/* Photo */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "16 / 7" }}>
                {tour.image ? (
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3.5rem;background:${darkMode ? '#1a1a1a' : '#f0f0f0'}">${tour.icon || '🏝️'}</div>`;
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

                {tour.badge && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm"
                      style={{ background: "rgba(249,115,22,0.88)", color: "#fff" }}>
                      {tour.badge}
                    </span>
                  </div>
                )}

                {tour.liveData !== undefined && (
                  <div className="absolute top-2.5 right-2.5">
                    {priceIsLive ? (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm"
                        style={{ background: "rgba(34,197,94,0.88)", color: "#fff" }}>Live API</span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm"
                        style={{ background: "rgba(249,115,22,0.82)", color: "#fff" }}>Est. Price</span>
                    )}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-16"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1 gap-0">
                <p className="font-black text-base leading-snug mb-2" style={{ color: textPrimary }}>
                  {tour.name}
                </p>

                <p className="font-heading font-black text-2xl mb-1" style={{ color: "#f97316", letterSpacing: "-0.02em" }}>
                  {resolvedPrice !== null
                    ? <>{`₱${resolvedPrice.toLocaleString("en-PH")}`}<span className="text-xs font-normal ml-1.5 opacity-70">/pax</span></>
                    : <span className="text-sm font-semibold" style={{ color: textMuted }}>Contact for pricing</span>
                  }
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {tour.duration && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: textMuted }}>
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{tour.duration}</span>
                    </div>
                  )}
                  {tour.schedule && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(34,197,94,0.85)" }}>
                      <span>📅</span>
                      <span>{tour.schedule}</span>
                    </div>
                  )}
                </div>

                {visibleInclusions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {visibleInclusions.map((item, i) => {
                      const text = typeof item === "string" ? item : (item.name || "");
                      return (
                        <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1"
                          style={{ borderColor, backgroundColor: surfaceBg, color: textPrimary }}>
                          {getChipIcon(text)} {text}
                        </span>
                      );
                    })}
                  </div>
                )}

                {(hiddenInclusions.length > 0 || tour.description) && (
                  <button
                    className="flex items-center gap-1 text-xs mb-3 font-semibold self-start"
                    style={{ color: "#f97316" }}
                    onClick={() => setOpen(isOpen ? null : idx)}
                  >
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                    {isOpen ? "Show less" : "View full details"}
                  </button>
                )}

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="space-y-3 mb-3 pt-1">
                        {tour.description && (
                          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{tour.description}</p>
                        )}
                        {hiddenInclusions.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                              Additional Inclusions
                            </p>
                            {hiddenInclusions.map((item, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                                <span className="text-orange-400 shrink-0 mt-0.5">✓</span>
                                <span>{typeof item === "string" ? item : item.name || JSON.stringify(item)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {!tour.liveData && tour.stops?.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: textMuted }}>
                              Destinations
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {tour.stops.map((stop) => (
                                <div key={stop} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                                  style={{ borderColor, color: textMuted, backgroundColor: surfaceBg }}>
                                  <MapPin className="w-2.5 h-2.5" />
                                  {stop}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Added-to days chips */}
                {addedDays.length > 0 && (
                  <div className="mt-auto pt-2 flex flex-wrap gap-1.5">
                    {addedDays.map((c) => (
                      <span
                        key={`${c.id}__${c.day}`}
                        className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.35)" }}
                      >
                        <CalendarDays className="w-3 h-3" />
                        Day {c.day} · {c.dayTitle}
                      </span>
                    ))}
                  </div>
                )}

                {addedDays.length === 0 && (
                  <p className="mt-auto pt-2 text-xs italic" style={{ color: textMuted }}>
                    Add this from the Itinerary section above ↑
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
