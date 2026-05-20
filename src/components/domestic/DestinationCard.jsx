import { Link } from "react-router-dom";

// Cinematic gradient backgrounds per card (cycles)
const GRADIENTS = [
  "linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 50%, #0d1b2a 100%)",
  "linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #1a0800 100%)",
  "linear-gradient(135deg, #0a1628 0%, #0d3347 50%, #0a1220 100%)",
  "linear-gradient(135deg, #141008 0%, #2d2000 50%, #101008 100%)",
  "linear-gradient(135deg, #001a0d 0%, #003320 50%, #001a0a 100%)",
];

export default function DestinationCard({ destination, delay, visible, darkMode }) {
  const gradIdx = destination.name.charCodeAt(0) % GRADIENTS.length;

  return (
    <Link to={`/destination/${destination.slug}`}>
      <div
        className="card-animate group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:z-10"
        style={{
          animationDelay: visible ? `${delay}ms` : "9999s",
          animationPlayState: visible ? "running" : "paused",
          opacity: visible ? undefined : 0,
          height: "200px",
          background: GRADIENTS[gradIdx],
          boxShadow: darkMode
            ? "0 4px 20px rgba(0,0,0,0.6)"
            : "0 4px 20px rgba(0,0,0,0.15)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 40px rgba(255,140,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = darkMode
            ? "0 4px 20px rgba(0,0,0,0.6)"
            : "0 4px 20px rgba(0,0,0,0.15)";
        }}
      >
        {/* Subtle shimmer overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(ellipse at 30% 20%, rgba(0,140,255,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,140,0,0.15) 0%, transparent 50%)"
        }} />

        {/* Orange top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: "#FF8C00" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-3.5">
          {/* Top */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: "rgba(255,140,0,0.85)" }}>
              Philippines
            </p>
            <h3 className="text-white font-black text-sm leading-tight" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {destination.name}
            </h3>
            <p className="text-[10px] font-light mt-1 leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
              {destination.tagline}
            </p>
          </div>

          {/* Bottom — View Preview button */}
          <div className="flex items-center justify-between">
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors group-hover:text-[#FF8C00]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fillOpacity="0.2" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
              </svg>
              VIEW PREVIEW
            </span>
            {/* Play circle */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ background: "rgba(255,140,0,0.15)", border: "1.5px solid rgba(255,140,0,0.4)" }}
            >
              <svg className="w-3 h-3 ml-0.5" fill="#FF8C00" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}