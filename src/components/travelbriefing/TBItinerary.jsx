// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar } from "lucide-react";

export default function TBItinerary({ dest, darkMode, tk }) {
  const [openDay, setOpenDay] = useState(0);

  const mealLabel = (meals) => {
    const [b, l, d] = meals.split("/").map((s) => s.trim());
    const icon = (m) => (m === "B" ? "🍳" : m === "L" ? "🍱" : m === "D" ? "🌙" : null);
    const label = (m, t) => (m !== "X" ? `${icon(m)} ${t}` : null);
    return [label(b, "Breakfast"), label(l, "Lunch"), label(d, "Dinner")].filter(Boolean);
  };

  return (
    <div className="space-y-3">
      {dest.itinerary.map((day, idx) => {
        const isOpen = openDay === idx;
        const meals = mealLabel(day.meals);

        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="border rounded-2xl overflow-hidden"
            style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg, boxShadow: tk.cardShadow }}
          >
            {/* Header */}
            <button
              className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:opacity-80 transition-opacity"
              onClick={() => setOpenDay(isOpen ? -1 : idx)}
            >
              {/* Day badge */}
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                style={{
                  background: isOpen
                    ? "linear-gradient(135deg, #f97316, #b45309)"
                    : darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                }}
              >
                <Calendar className="w-3.5 h-3.5 mb-0.5" style={{ color: isOpen ? "#fff" : tk.textMuted }} strokeWidth={2} />
                <span className="text-[10px] font-black leading-none" style={{ color: isOpen ? "#fff" : tk.textMuted }}>
                  D{day.day}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm sm:text-base" style={{ color: tk.textPrimary }}>
                  Day {day.day} — {day.title}
                </p>
                {meals.length > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: tk.textMuted }}>
                    {meals.join("  ·  ")}
                  </p>
                )}
              </div>

              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="shrink-0"
              >
                <ChevronDown className="w-4 h-4" style={{ color: tk.textMuted }} />
              </motion.div>
            </button>

            {/* Activities */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="px-4 sm:px-5 pb-5 pt-0"
                    style={{ borderTop: `1px solid ${tk.borderColor}` }}
                  >
                    {day.image && (
                      <div className="w-full rounded-xl overflow-hidden mb-4 mt-4" style={{ aspectRatio: "16/7" }}>
                        <img src={day.image} alt={day.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <ul className="space-y-2.5 mt-4">
                      {day.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div
                            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                            style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#f97316" }} />
                          </div>
                          <p className="text-sm leading-snug" style={{ color: tk.textPrimary }}>
                            {act}
                          </p>
                        </li>
                      ))}
                    </ul>
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
