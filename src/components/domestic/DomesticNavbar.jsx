import { Link } from "react-router-dom";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6115eb14182fe3684619/ed2488356_5ecc9b2cd_Untitled-design-75.png";

export default function DomesticNavbar({ showBack = false }) {
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
              style={{ color: "#0F172A" }}
            >
              ← All Destinations
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
