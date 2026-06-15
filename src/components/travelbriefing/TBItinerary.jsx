// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.12)" }}
        onClick={onClose}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
      >
        {current + 1} / {photos.length}
      </div>

      {/* Prev */}
      {photos.length > 1 && (
        <button
          className="absolute left-3 w-10 h-10 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={photos[current]}
          alt=""
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Next */}
      {photos.length > 1 && (
        <button
          className="absolute right-3 w-10 h-10 rounded-full flex items-center justify-center z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {photos.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-lg overflow-hidden border-2 transition-all"
              style={{
                width: "44px",
                height: "32px",
                borderColor: i === current ? "#f97316" : "rgba(255,255,255,0.25)",
                opacity: i === current ? 1 : 0.55,
              }}
            >
              <img src={p} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function TBItinerary({ dest, darkMode, tk }) {
  const { cardBg, borderColor, cardShadow, textPrimary, textMuted } = tk;
  const [lightbox, setLightbox] = useState(null); // { photos, index }
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
    const included = parts
      .map((v, i) => v !== "X" ? labels[i] : null)
      .filter(Boolean);
    return included.length ? included.join("  ·  ") : null;
  };

  return (
    <>
      <div className="space-y-4">
        {dest.itinerary.map((day, idx) => {
          const meals = mealLabel(day.meals);
          const photos = day.photos?.length
            ? day.photos
            : day.image ? [day.image] : [];

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
              <div
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)" }}
              >
                <span
                  className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shrink-0"
                  style={{ background: "#f97316", color: "#fff" }}
                >
                  Day {day.day}
                </span>
                <p className="font-black text-base leading-snug" style={{ color: textPrimary }}>
                  {day.title}
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${borderColor}` }}>
                {/* ── Activities ── */}
                <div className="px-4 py-4 space-y-3">
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <ActivityDot />
                      <p className="text-sm leading-snug flex-1" style={{ color: textPrimary }}>
                        {act}
                      </p>
                    </div>
                  ))}
                </div>

                {/* ── Meals ── */}
                {meals && (
                  <div
                    className="px-4 py-2.5 flex items-center gap-2"
                    style={{
                      borderTop: `1px solid ${borderColor}`,
                      backgroundColor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.018)",
                    }}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "#f97316" }}>
                      Meals
                    </span>
                    <span className="text-xs" style={{ color: textMuted }}>{meals}</span>
                  </div>
                )}

                {/* ── Photo grid ── */}
                {photos.length > 0 && (
                  <div style={{ borderTop: `1px solid ${borderColor}` }}>
                    {/* Label row */}
                    <div
                      className="px-4 py-2 flex items-center gap-1.5"
                      style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.018)" }}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: textMuted }}>
                        {photos.length} {photos.length === 1 ? "Photo" : "Photos"}
                      </span>
                    </div>

                    {/* Grid — 3 cols on mobile, 5 on desktop */}
                    <div className="grid gap-0.5 p-2" style={{ gridTemplateColumns: `repeat(${Math.min(photos.length, isMobile ? 3 : 5)}, 1fr)` }}>
                      {photos.map((src, i) => (
                        <button
                          key={i}
                          className="relative overflow-hidden block"
                          style={{ aspectRatio: "1/1" }}
                          onClick={() => setLightbox({ photos, index: i })}
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Lightbox portal ── */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            photos={lightbox.photos}
            startIndex={lightbox.index}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
