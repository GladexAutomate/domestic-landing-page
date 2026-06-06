// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function TBFAQs({ dest, darkMode, tk }) {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-2">
      {dest.faqs.map((faq, idx) => {
        const isOpen = open === idx;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.35 }}
            className="border rounded-xl overflow-hidden"
            style={{
              borderColor: isOpen ? "rgba(249,115,22,0.3)" : tk.borderColor,
              backgroundColor: tk.cardBg,
            }}
          >
            <button
              className="w-full flex items-center justify-between gap-4 p-4 text-left hover:opacity-80 transition-opacity"
              onClick={() => setOpen(isOpen ? null : idx)}
            >
              <span className="text-sm font-semibold" style={{ color: tk.textPrimary }}>
                {faq.q}
              </span>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                className="shrink-0"
              >
                <ChevronDown className="w-4 h-4" style={{ color: tk.textMuted }} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <p
                    className="px-4 pb-4 text-sm leading-relaxed"
                    style={{ color: tk.textMuted, borderTop: `1px solid ${tk.borderColor}`, paddingTop: "12px" }}
                  >
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
