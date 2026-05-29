import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeContext";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6115eb14182fe3684619/ed2488356_5ecc9b2cd_Untitled-design-75.png";

export default function DomesticNavbar({ showBack = false }) {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: "transparent" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          {showBack && (
            <img src={GLADEX_LOGO} alt="Gladex" className="h-9 w-auto object-contain" />
          )}
        </Link>

        <div className="flex items-center gap-5">
          {showBack && (
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-colors hover:text-[#FF8C00]"
              style={{ color: darkMode ? "rgba(255,255,255,0.8)" : "#0F172A" }}
            >
              ← All Destinations
            </Link>
          )}
          <ThemeToggleButton darkMode={darkMode} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>
  );
}

function ThemeToggleButton({ darkMode, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
      style={{
        borderColor: darkMode ? "rgba(255,140,0,0.45)" : "rgba(0,0,0,0.18)",
        color: darkMode ? "#FF8C00" : "#0F172A",
        background: darkMode ? "rgba(255,140,0,0.08)" : "rgba(0,0,0,0.04)",
        boxShadow: darkMode ? "0 0 12px rgba(255,140,0,0.1)" : "none",
      }}
    >
      {darkMode ? (
        <>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          Dark
        </>
      )}
    </button>
  );
}