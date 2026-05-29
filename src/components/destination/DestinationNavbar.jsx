import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function DestinationNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
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

        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase transition-all duration-300 hover:text-[#FF8C00]"
          style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          All Destinations
        </Link>
      </div>
    </nav>
  );
}