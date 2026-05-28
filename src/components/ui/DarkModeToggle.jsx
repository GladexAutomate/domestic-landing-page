import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const { isDark, setIsDark } = useTheme();

  return (
    <div className="fixed top-4 right-5 z-50 flex items-center gap-2">
      <span
        className="font-body text-[10px] font-bold tracking-widest uppercase hidden sm:block"
        style={{ color: isDark ? "#A0A0A0" : "#888888" }}
      >
        {isDark ? "DARK" : "LIGHT"}
      </span>
      <button
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle theme"
        className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: isDark ? "#FF8C00" : "#D0D0D0",
          boxShadow: isDark ? "0 0 10px rgba(255,140,0,0.4)" : "none",
        }}
      >
        <motion.div
          animate={{ x: isDark ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full flex items-center justify-center bg-white"
        >
          {isDark ? (
            <Moon className="w-2.5 h-2.5" style={{ color: "#FF8C00" }} />
          ) : (
            <Sun className="w-2.5 h-2.5 text-yellow-500" />
          )}
        </motion.div>
      </button>
    </div>
  );
}