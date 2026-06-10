// @ts-nocheck
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

function getChecklistIcon(item) {
  const t = item.toLowerCase();
  if (t.includes("passport") || t.includes("id")) return "🪪";
  if (t.includes("flight") || t.includes("ticket")) return "✈️";
  if (t.includes("hotel") || t.includes("voucher")) return "🏨";
  if (t.includes("tour") || t.includes("confirmat")) return "📋";
  if (t.includes("cash") || t.includes("card") || t.includes("credit")) return "💳";
  if (t.includes("phone") || t.includes("mobile") || t.includes("charger")) return "📱";
  if (t.includes("power bank")) return "🔋";
  if (t.includes("medication") || t.includes("medicine")) return "💊";
  if (t.includes("insurance")) return "🛡️";
  if (t.includes("sunscreen") || t.includes("sunblock")) return "🧴";
  if (t.includes("swimwear") || t.includes("swim")) return "🩱";
  if (t.includes("camera")) return "📷";
  if (t.includes("bag") || t.includes("backpack")) return "🎒";
  if (t.includes("water bottle") || t.includes("bottle")) return "🍶";
  if (t.includes("towel")) return "🏖️";
  if (t.includes("sunglasses") || t.includes("shades")) return "🕶️";
  if (t.includes("hat") || t.includes("cap")) return "🧢";
  if (t.includes("shoes") || t.includes("sandal") || t.includes("footwear")) return "👟";
  if (t.includes("clothes") || t.includes("outfit") || t.includes("top") || t.includes("shirt")) return "👕";
  if (t.includes("toiletries") || t.includes("hygiene")) return "🪥";
  if (t.includes("first aid") || t.includes("kit")) return "🩹";
  return "✅";
}

export default function TBChecklist({ dest, darkMode, tk }) {
  const storageKey = `gdx-tbchecklist-${dest.slug}`;

  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {}
  }, [checked, storageKey]);

  const toggle = (item) =>
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = dest.checklist.length;
  const pct = Math.round((doneCount / total) * 100);

  const resetAll = () => setChecked({});

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: tk.textMuted }}>
            {doneCount} of {total} items packed
          </span>
          {doneCount > 0 && (
            <button
              onClick={resetAll}
              className="text-xs hover:opacity-70 transition-opacity"
              style={{ color: tk.textMuted }}
            >
              Reset
            </button>
          )}
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #f97316, #b45309)" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {dest.checklist.map((item) => {
          const done = !!checked[item];
          const icon = getChecklistIcon(item);
          return (
            <motion.button
              key={item}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(item)}
              className="flex items-center gap-3 rounded-xl border text-left transition-all"
              style={{
                minHeight: "52px",
                padding: "10px 12px",
                borderColor: done ? "rgba(249,115,22,0.4)" : tk.borderColor,
                backgroundColor: done ? "rgba(249,115,22,0.08)" : tk.surfaceBg,
              }}
            >
              {/* Item emoji icon */}
              <span className="text-lg shrink-0 leading-none" style={{ opacity: done ? 0.45 : 1 }}>
                {icon}
              </span>
              <span
                className="text-sm leading-snug flex-1 transition-all"
                style={{
                  color: done ? tk.textMuted : tk.textPrimary,
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {item}
              </span>
              {/* Checkbox */}
              <div
                className="shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: done ? "#f97316" : tk.borderColor,
                  backgroundColor: done ? "#f97316" : "transparent",
                }}
              >
                {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
            </motion.button>
          );
        })}
      </div>

      {doneCount === total && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl text-center text-sm font-semibold"
          style={{
            background: "rgba(34,197,94,0.1)",
            color: "#22c55e",
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          All packed and ready to go!
        </motion.div>
      )}
    </div>
  );
}
