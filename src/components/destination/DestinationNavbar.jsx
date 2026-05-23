import { Link } from "react-router-dom";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function DestinationNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={GLADEX_LOGO}
            alt="Gladex Travel and Tours Corp."
            className="h-9 w-auto object-contain"
          />
        </Link>

        {/* Right: Back link */}
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-wide text-[#0F172A] hover:text-[#FF8C00] transition-colors"
        >
          ← All Destinations
        </Link>
      </div>
    </nav>
  );
}