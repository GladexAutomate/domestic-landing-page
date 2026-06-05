// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/ThemeContext";
import { motion } from "framer-motion";
import { XCircle, Phone, RotateCcw } from "lucide-react";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function PaymentFailed() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const bg          = darkMode ? "#0c0c0c" : "#f4f3f1";
  const cardBg      = darkMode ? "#141414" : "#ffffff";
  const textPrimary = darkMode ? "#f0f0f0"  : "#1a1a1a";
  const textMuted   = darkMode ? "rgba(255,255,255,0.45)" : "#6b7280";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: bg }}>
      <img src={GLADEX_LOGO} alt="Gladex" className="h-10 w-auto mb-8 object-contain"
        style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.3))" }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-8 text-center max-w-md w-full"
        style={{ backgroundColor: cardBg, borderColor }}>

        <XCircle className="w-14 h-14 mx-auto mb-4" style={{ color: "#ef4444" }} />
        <p className="font-black text-2xl mb-2" style={{ color: textPrimary }}>Payment Failed</p>
        <p className="text-sm mb-8" style={{ color: textMuted }}>
          Your payment was not completed. No charges were made. Please try again or contact our support team.
        </p>

        <div className="space-y-3">
          <button onClick={() => navigate(-1)}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>

          <a href="tel:+639178752200"
            className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border"
            style={{ borderColor, color: textPrimary }}>
            <Phone className="w-4 h-4" /> Call +63 917 875 2200
          </a>

          <button onClick={() => navigate("/")}
            className="block w-full py-2 text-sm"
            style={{ color: textMuted }}>
            Go Back Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
