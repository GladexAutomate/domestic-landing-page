import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function DestinationNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? darkMode
      ? "rgba(10,10,10,0.94)"
      : "rgba(255,255,255,0.94)"
    : "transparent";

  const navBorder = scrolled
    ? darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"
    : "transparent";

  const linkColor = scrolled
    ? darkMode ? "rgba(255,255,255,0.85)" : "#0F172A"
    : "rgba(255,255,255,0.9)";

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: navBg,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${navBorder}`,
        boxShadow: scrolled ? (darkMode ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.08)") : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={GLADEX_LOGO}
            alt="Gladex Travel and Tours Corp."
            className="h-9 w-auto object-contain"
            style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.3))" }}
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggleButton darkMode={darkMode} toggleTheme={toggleTheme} />

          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:text-[#FF8C00]"
            style={{ color: linkColor, letterSpacing: "0.1em" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:inline">All Destinations</span>
          </Link>
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
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        background: darkMode ? "rgba(255,140,0,0.1)" : "rgba(0,0,0,0.06)",
        border: `1px solid ${darkMode ? "rgba(255,140,0,0.35)" : "rgba(0,0,0,0.15)"}`,
        color: darkMode ? "#FF8C00" : "#374151",
        boxShadow: darkMode ? "0 0 12px rgba(255,140,0,0.1)" : "none",
      }}
    >
      {darkMode ? (
        <>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}