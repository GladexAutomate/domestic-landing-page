// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Plus, Check, ChevronDown, Clock, Image, Calendar } from "lucide-react";

function ActivityDot() {
  return (
    <div
      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5"
      style={{ background: "rgba(249,115,22,0.12)", border: "2px solid rgba(249,115,22,0.45)" }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
    </div>
  );
}

function AddedDot() {
  return (
    <div
      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5"
      style={{ background: "rgba(249,115,22,0.18)", border: "2px solid #f97316" }}
    >
      <Plus className="w-2.5 h-2.5" style={{ color: "#f97316" }} />
    </div>
  );
}

function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length);
  const next = () => setCurrent((c) => (c + 1) % photos.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.12)" }} onClick={onClose}>
        <X className="w-5 h-5 text-white" />
      </button>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}>
        {current + 1} / {photos.length}
      </div>
      {photos.length > 1 && (
        <button className="absolute left-3 w-10 h-10 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={(e) => { e.stopPropagation(); prev(); }}>
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}
      <AnimatePresence mode="wait">
        <motion.img key={current} src={photos[current]} alt=""
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()} />
      </AnimatePresence>
      {photos.length > 1 && (
        <button className="absolute right-3 w-10 h-10 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={(e) => { e.stopPropagation(); next(); }}>
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className="rounded-lg overflow-hidden border-2 transition-all"
              style={{ width: "44px", height: "32px", borderColor: i === current ? "#f97316" : "rgba(255,255,255,0.25)", opacity: i === current ? 1 : 0.55 }}>
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Full add-on card — 2-col grid, visible details ────────────────
function AddOnCard({ tour, day, dayTitle, addOnsCart, onAddToCart, darkMode, tk }) {
  const { borderColor, textPrimary, textMuted, surfaceBg } = tk;
  const cartKey = String(tour.id || tour.name);
  const dayKey  = `${cartKey}__${day}`;
  const added   = addOnsCart.some((c) => `${c.id}__${c.day}` === dayKey);
  const price   = tour.price ? Number(tour.price) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: added ? "rgba(34,197,94,0.5)" : borderColor,
        backgroundColor: added
          ? (darkMode ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.03)")
          : (darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
      }}
    >
      {/* ── Desktop: vertical card (sm+) ── */}

      {/* Desktop 16:9 image — hidden on mobile */}
      <div className="relative overflow-hidden hidden sm:block" style={{ aspectRatio: "16 / 9" }}>
        {tour.image && (
          <img src={tour.image} alt={tour.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        )}
        {!tour.image && (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: darkMode ? "linear-gradient(135deg,#1a1a1a,#111)" : "linear-gradient(135deg,#e8e8e8,#d5d5d5)" }}>
            <Image className="w-8 h-8 opacity-30" style={{ color: textMuted }} />
          </div>
        )}
        {tour.badge && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
              style={{ background: "rgba(249,115,22,0.9)", color: "#fff", backdropFilter: "blur(4px)" }}>
              {tour.badge}
            </span>
          </div>
        )}
        {added && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: "rgba(34,197,94,0.9)", color: "#fff", backdropFilter: "blur(4px)" }}>
              <Check className="w-3 h-3" /> Added
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-10"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />
      </div>

      {/* Desktop body */}
      <div className="hidden sm:flex p-3 flex-col gap-2 flex-1">
        <div>
          <p className="font-black text-sm leading-snug mb-1" style={{ color: textPrimary }}>{tour.name}</p>
          <p className="font-black text-xl" style={{ color: "#f97316", letterSpacing: "-0.02em" }}>
            {price !== null
              ? <>{`₱${price.toLocaleString("en-PH")}`}<span className="text-[11px] font-normal opacity-70 ml-1">/pax</span></>
              : <span className="text-xs font-semibold" style={{ color: textMuted }}>Contact for price</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {tour.duration && (
            <div className="flex items-center gap-1 text-xs" style={{ color: textMuted }}>
              <Clock className="w-3 h-3 shrink-0" /><span>{tour.duration}</span>
            </div>
          )}
          {tour.schedule && (
            <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(34,197,94,0.85)" }}>
              <Calendar className="w-3 h-3 shrink-0" /><span>{tour.schedule}</span>
            </div>
          )}
        </div>
        {tour.highlights?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tour.highlights.slice(0, 2).map((h, i) => (
              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ borderColor, backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", color: textPrimary }}>
                {h}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => onAddToCart({ id: cartKey, name: tour.name, price: price || 0, day, dayTitle })}
          className="mt-auto w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
          style={{
            background: added ? "rgba(34,197,94,0.1)" : "linear-gradient(135deg, #f97316, #b45309)",
            color:      added ? "#22c55e"              : "#fff",
            border:     added ? "1px solid rgba(34,197,94,0.4)" : "none",
          }}
        >
          {added ? <><Check className="w-4 h-4" /> Added to Day {day}</> : <><Plus className="w-4 h-4" /> Add to Day {day}</>}
        </button>
      </div>

      {/* ── Mobile: horizontal row (< sm) ── */}
      <div className="flex sm:hidden">
        {/* Square thumbnail */}
        <div className="relative overflow-hidden shrink-0" style={{ width: 100, aspectRatio: "1 / 1" }}>
          {tour.image && (
            <img src={tour.image} alt={tour.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          {!tour.image && (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: darkMode ? "linear-gradient(135deg,#1a1a1a,#111)" : "linear-gradient(135deg,#e8e8e8,#d5d5d5)" }}>
              <Image className="w-6 h-6 opacity-30" style={{ color: textMuted }} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-between gap-1">
          {/* Badges row */}
          {(tour.badge || added) && (
            <div className="flex flex-wrap gap-1">
              {tour.badge && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(249,115,22,0.9)", color: "#fff" }}>
                  {tour.badge}
                </span>
              )}
              {added && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                  style={{ background: "rgba(34,197,94,0.9)", color: "#fff" }}>
                  <Check className="w-2.5 h-2.5" /> Added
                </span>
              )}
            </div>
          )}

          <p className="font-black text-sm leading-snug" style={{ color: textPrimary }}>{tour.name}</p>

          <p className="font-black text-base leading-none" style={{ color: "#f97316", letterSpacing: "-0.02em" }}>
            {price !== null
              ? <>{`₱${price.toLocaleString("en-PH")}`}<span className="text-[10px] font-normal opacity-70 ml-1">/pax</span></>
              : <span className="text-[11px] font-semibold" style={{ color: textMuted }}>Contact for price</span>}
          </p>

          {tour.duration && (
            <div className="flex items-center gap-1 text-[10px]" style={{ color: textMuted }}>
              <Clock className="w-2.5 h-2.5 shrink-0" /><span className="truncate">{tour.duration}</span>
            </div>
          )}

          <button
            onClick={() => onAddToCart({ id: cartKey, name: tour.name, price: price || 0, day, dayTitle })}
            className="w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all"
            style={{
              background: added ? "rgba(34,197,94,0.1)" : "linear-gradient(135deg, #f97316, #b45309)",
              color:      added ? "#22c55e"              : "#fff",
              border:     added ? "1px solid rgba(34,197,94,0.4)" : "none",
            }}
          >
            {added ? <><Check className="w-3 h-3" /> Added Day {day}</> : <><Plus className="w-3 h-3" /> Add to Day {day}</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function TBItinerary({ dest, darkMode, tk, availableTours = [], addOnsCart = [], onAddToCart }) {
  const { cardBg, borderColor, cardShadow, textPrimary, textMuted } = tk;
  const [lightbox, setLightbox]             = useState(null);
  const [expandedAddOns, setExpandedAddOns] = useState({});
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const mealLabel = (meals) => {
    if (!meals) return null;
    const parts = meals.split("/").map((s) => s.trim());
    const labels = ["Breakfast", "Lunch", "Dinner"];
    const included = parts.map((v, i) => v !== "X" ? labels[i] : null).filter(Boolean);
    return included.length ? included.join("  ·  ") : null;
  };

  const toggleAddOns = (dayNum) =>
    setExpandedAddOns((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));

  return (
    <>
      <div className="space-y-4">
        {dest.itinerary.map((day, idx) => {
          const meals  = mealLabel(day.meals);
          const photos = day.photos?.length ? day.photos : day.image ? [day.image] : [];

          const dayTours       = availableTours.filter((t) => !t.applicableDays || t.applicableDays.includes(day.day));
          const addedActivities = addOnsCart.filter((c) => c.day === day.day);
          const hasTours       = dayTours.length > 0 && !!onAddToCart;
          const addOnsOpen     = !!expandedAddOns[day.day];
          const addedCount     = addedActivities.length;

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: idx * 0.07, duration: 0.38 }}
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: cardBg, borderColor, boxShadow: cardShadow }}
            >
              {/* ── Header ── */}
              <div className="flex items-center gap-3 px-4 py-3.5"
                style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)" }}>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shrink-0"
                  style={{ background: "#f97316", color: "#fff" }}>
                  Day {day.day}
                </span>
                <p className="font-black text-base leading-snug flex-1" style={{ color: textPrimary }}>
                  {day.title}
                </p>
                {addedCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.3)" }}>
                    +{addedCount} add-on{addedCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div style={{ borderTop: `1px solid ${borderColor}` }}>
                {/* ── Activities (included in package) ── */}
                <div className="px-4 py-4 space-y-3">
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ActivityDot />
                      <p className="text-sm leading-snug flex-1" style={{ color: textPrimary }}>{act}</p>
                    </div>
                  ))}

                  {/* ── User-added activities appear here ── */}
                  <AnimatePresence>
                    {addedActivities.map((item) => (
                      <motion.div
                        key={`${item.id}__${item.day}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-3"
                      >
                        <AddedDot />
                        <div className="flex-1 flex items-start justify-between gap-2 rounded-xl px-3 py-2.5"
                          style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.22)" }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold leading-snug" style={{ color: "#f97316" }}>
                              {item.name}
                            </p>
                            <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>
                              Optional · {item.price > 0 ? `₱${Number(item.price).toLocaleString("en-PH")}/pax` : "Contact for price"}
                            </p>
                          </div>
                          <button
                            onClick={() => onAddToCart({ id: item.id, name: item.name, price: item.price, day: item.day, dayTitle: item.dayTitle })}
                            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 mt-0.5"
                            style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}
                            title="Remove"
                          >
                            <X className="w-3 h-3" style={{ color: "#f97316" }} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* ── Meals ── */}
                {meals && (
                  <div className="px-4 py-2.5 flex items-center gap-2"
                    style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.018)" }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#f97316" }}>Meals</span>
                    <span className="text-xs" style={{ color: textMuted }}>{meals}</span>
                  </div>
                )}

                {/* ── Photo grid ── */}
                {photos.length > 0 && (
                  <div style={{ borderTop: `1px solid ${borderColor}` }}>
                    <div className="px-4 py-2 flex items-center gap-1.5"
                      style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.018)" }}>
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                        {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
                      </span>
                    </div>
                    <div className="grid gap-0.5 p-2"
                      style={{ gridTemplateColumns: `repeat(${Math.min(photos.length, isMobile ? 3 : 5)}, 1fr)` }}>
                      {photos.map((src, i) => (
                        <button key={i} className="relative overflow-hidden block" style={{ aspectRatio: "1/1" }}
                          onClick={() => setLightbox({ photos, index: i })}>
                          <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-200 hover:scale-105" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Optional Add-Ons ── */}
                {hasTours && (
                  <div style={{ borderTop: `1px solid ${borderColor}` }}>
                    {/* Toggle row */}
                    <button
                      className="w-full px-4 py-3 flex items-center justify-between transition-opacity hover:opacity-80"
                      style={{ backgroundColor: darkMode ? "rgba(249,115,22,0.06)" : "rgba(249,115,22,0.05)" }}
                      onClick={() => toggleAddOns(day.day)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest" style={{ color: "#f97316" }}>
                          <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
                          Optional Add-Ons
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: darkMode ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.12)", color: "#f97316" }}>
                          {dayTours.length} available
                        </span>
                        {addedCount > 0 && !addOnsOpen && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                            {addedCount} added
                          </span>
                        )}
                      </div>
                      <motion.span animate={{ rotate: addOnsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-4 h-4" style={{ color: "#f97316" }} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {addOnsOpen && (
                        <motion.div key="addons"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {dayTours.map((tour) => (
                              <AddOnCard
                                key={String(tour.id || tour.name)}
                                tour={tour}
                                day={day.day}
                                dayTitle={day.title}
                                addOnsCart={addOnsCart}
                                onAddToCart={onAddToCart}
                                darkMode={darkMode}
                                tk={tk}
                              />
                            ))}
                          </div>
                          <p className="px-4 pb-3 text-[11px]" style={{ color: textMuted }}>
                            Added activities will appear in your Day {day.day} schedule above.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox photos={lightbox.photos} startIndex={lightbox.index} onClose={() => setLightbox(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
