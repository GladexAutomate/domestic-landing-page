import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function DomesticNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: scrolled
          ? "rgba(15, 23, 42, 0.88)"
          : "rgba(15, 23, 42, 0.12)",
        borderBottom: scrolled ? "1px solid rgba(255,107,0,0.15)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex items-center gap-1">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ background: "#FF6B00" }}
            >
              <span className="text-white font-black text-sm tracking-tight">G</span>
            </div>
            <span className="text-white font-black text-xl tracking-widest uppercase">
              GLADEX
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <a
            href="#"
            className="relative text-white text-sm font-semibold tracking-[0.12em] uppercase group"
          >
            Domestic
            <span
              className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full transition-all duration-300"
              style={{ background: "#FF6B00" }}
            />
          </a>
          <a
            href="#"
            className="relative text-white/70 text-sm font-medium tracking-[0.12em] uppercase hover:text-white transition-colors duration-200 group"
          >
            All Destinations
            <span
              className="absolute -bottom-1 left-0 w-0 h-[2px] rounded-full group-hover:w-full transition-all duration-300"
              style={{ background: "#FF6B00" }}
            />
          </a>
        </div>
      </div>
    </nav>
  );
}