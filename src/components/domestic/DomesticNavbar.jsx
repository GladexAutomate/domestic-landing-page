import { Link } from "react-router-dom";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function DomesticNavbar({ darkMode, setDarkMode, showBack = false }) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        border: "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={GLADEX_LOGO}
            alt="Gladex Travel and Tours Corp."
            className="h-10 w-auto object-contain"
            style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
          />
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {showBack && (
            <Link
              to="/"
              className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-[#FF8C00]"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              ← All Destinations
            </Link>
          )}

          {/* Dark Mode Toggle — matches international page style */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="relative flex items-center"
            style={{
              width: "44px",
              height: "24px",
              borderRadius: "12px",
              background: darkMode ? "#FF8C00" : "rgba(255,255,255,0.25)",
              border: "1.5px solid rgba(255,255,255,0.4)",
              transition: "background 0.3s ease",
              cursor: "pointer",
            }}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <span
              style={{
                position: "absolute",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "white",
                left: darkMode ? "calc(100% - 20px)" : "2px",
                transition: "left 0.3s ease",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              }}
            />
          </button>
        </div>
      </div>
    </nav>
  );
}