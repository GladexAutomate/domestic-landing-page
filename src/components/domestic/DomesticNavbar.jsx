import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6115eb14182fe3684619/ed2488356_5ecc9b2cd_Untitled-design-75.png";

export default function DomesticNavbar({ darkMode, setDarkMode, showBack = false }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        backgroundColor: scrolled
          ? darkMode ? "rgba(10,10,10,0.94)" : "rgba(255,255,255,0.94)"
          : darkMode ? "rgba(10,10,10,0.25)" : "rgba(255,255,255,0.4)",
        borderBottom: scrolled
          ? darkMode ? "1px solid rgba(255,140,0,0.12)" : "1px solid rgba(0,0,0,0.07)"
          : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={GLADEX_LOGO}
            alt="Gladex Travel and Tours Corp."
            className="h-10 w-auto object-contain"
            style={{ filter: "drop-shadow(0 2px 10px rgba(255,140,0,0.3))" }}
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-5">
          {showBack ? (
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-colors hover:text-[#FF8C00]"
              style={{ color: darkMode ? "rgba(255,255,255,0.8)" : "#0F172A" }}
            >
              ← All Destinations
            </Link>
          ) : (
            <>
              <Link
                to="/"
                className={`text-sm font-medium tracking-widest uppercase transition-colors hover:text-[#FF8C00] hidden sm:block ${darkMode ? "text-white/60" : "text-[#0F172A]/60"}`}
              >
                All Destinations
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-widest uppercase transition-all hover:scale-105"
            style={{
              borderColor: darkMode ? "rgba(255,140,0,0.45)" : "rgba(0,0,0,0.18)",
              color: darkMode ? "#FF8C00" : "#0F172A",
              background: darkMode ? "rgba(255,140,0,0.08)" : "rgba(0,0,0,0.04)",
            }}
          >
            {darkMode ? (
              <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg> Light</>
            ) : (
              <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> Dark</>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}