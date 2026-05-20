import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        backgroundColor: scrolled
          ? darkMode
            ? "rgba(10,10,10,0.92)"
            : "rgba(255,255,255,0.92)"
          : "transparent",
        borderBottom: scrolled
          ? darkMode
            ? "1px solid rgba(255,140,0,0.12)"
            : "1px solid rgba(0,0,0,0.07)"
          : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Back link — only on destination preview */}
        {showBack ? (
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-colors hover:text-[#FF8C00]"
            style={{ color: darkMode ? "rgba(255,255,255,0.8)" : "#0F172A" }}
          >
            ← All Destinations
          </Link>
        ) : (
          <div />
        )}

        {/* Toggle — exact pill design: dark bg, text label, orange circle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-2 select-none focus:outline-none"
          style={{ padding: 0, background: "none", border: "none" }}
        >
          {/* Label */}
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{
              color: darkMode ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.85)",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {darkMode ? "DARK" : "LIGHT"}
          </span>

          {/* Pill */}
          <div
            className="relative flex items-center rounded-full transition-all duration-300"
            style={{
              width: "44px",
              height: "24px",
              background: "#1e1e1e",
              border: "1.5px solid rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            {/* Orange circle */}
            <div
              className="absolute rounded-full transition-all duration-300"
              style={{
                width: "18px",
                height: "18px",
                background: "#FF8C00",
                boxShadow: "0 0 8px rgba(255,140,0,0.7)",
                top: "50%",
                transform: "translateY(-50%)",
                left: darkMode ? "3px" : "calc(100% - 21px)",
              }}
            />
          </div>
        </button>
      </div>
    </nav>
  );
}