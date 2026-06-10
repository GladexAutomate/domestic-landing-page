// @ts-nocheck
import { motion } from "framer-motion";

export default function TBFAQs({ dest, darkMode, tk }) {
  return (
    <div className="space-y-2">
      {dest.faqs.map((faq, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05, duration: 0.35 }}
          className="border rounded-xl overflow-hidden"
          style={{
            borderColor: "rgba(249,115,22,0.3)",
            backgroundColor: tk.cardBg,
          }}
        >
          <div
            className="px-4"
            style={{ paddingTop: "14px", paddingBottom: "14px" }}
          >
            <p className="text-sm font-semibold leading-snug mb-3" style={{ color: tk.textPrimary }}>
              {faq.q}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: tk.textMuted, borderTop: `1px solid ${tk.borderColor}`, paddingTop: "12px" }}
            >
              {faq.a}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
