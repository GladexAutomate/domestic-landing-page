import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <div
  className="fixed top-6 right-6 z-50 flex items-center gap-2">
      <span
        className="text-[10px] font-bold tracking-widest uppercase hidden sm:block select-none"
        style={{ color: darkMode ? "#A0A0A0" : "#888888" }}
      >
        {darkMode ? "DARK" : "LIGHT"}
      </span>
      <button
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle theme"
        className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: darkMode ? "#FF8C00" : "#D0D0D0",
          boxShadow: darkMode ? "0 0 10px rgba(255,140,0,0.4)" : "none",
        }}
      >
        <motion.div
          animate={{ x: darkMode ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full flex items-center justify-center bg-white"
        >
          {darkMode ? (
            <Moon className="w-2.5 h-2.5" style={{ color: "#FF8C00" }} />
          ) : (
            <Sun className="w-2.5 h-2.5 text-yellow-500" />
          )}
        </motion.div>
      </button>
    </div>
  );
}