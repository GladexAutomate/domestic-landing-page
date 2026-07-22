import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function DestinationNavbar({ hideLogo = false, topOffset = 0, asFixed = true }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg     = scrolled ? "rgba(255,255,255,0.94)" : "transparent";
  const navBorder = scrolled ? "rgba(0,0,0,0.08)" : "transparent";

  return (
    <nav
      className={`${asFixed ? "fixed top-0 left-0 right-0" : "relative w-full"} z-50 transition-all duration-500`}
      style={{
        top: asFixed ? topOffset : undefined,
        background: navBg,
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${navBorder}`,
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
        {!hideLogo ? (
          <Link to="/" className="flex items-center shrink-0" style={{ maxWidth: "clamp(100px, 40vw, 160px)" }}>
            <img
              src={GLADEX_LOGO}
              alt="Gladex Travel and Tours Corp."
              className="h-8 w-auto max-w-full object-contain"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.3))" }}
            />
          </Link>
        ) : (
          <div />
        )}
        <div />
      </div>
    </nav>
  );
}
