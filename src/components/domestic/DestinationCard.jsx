import { Link } from "react-router-dom";
import { useState } from "react";

// Boracay video embed using Google Drive file ID
const BORACAY_VIDEO_ID = "1THzQAagycyXm8UYNztawslG7G_2Ak_J3";

function BoracayVideoCard({ destination, delay, visible }) {
  const [playing, setPlaying] = useState(false);

  return (
    <Link to={`/destination/${destination.slug}`}>
      <div
        className="card-animate group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:z-10"
        style={{
          animationDelay: visible ? `${delay}ms` : "9999s",
          animationPlayState: visible ? "running" : "paused",
          opacity: visible ? undefined : 0,
          height: "190px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(255,140,0,0.4)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
      >
        {/* Video embed */}
        <div className="absolute inset-0 bg-black">
          <iframe
            src={`https://drive.google.com/file/d/${BORACAY_VIDEO_ID}/preview`}
            className="w-full h-full"
            allow="autoplay"
            style={{ border: "none", pointerEvents: "none" }}
            title="Boracay Preview"
          />
        </div>

        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-60"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 100%)" }}
        />

        {/* Orange top line on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "#FF8C00" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3.5 z-10">
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase mb-0.5" style={{ color: "rgba(255,140,0,0.9)" }}>
            Philippines
          </p>
          <h3 className="text-white font-black text-sm leading-tight mb-1">
            {destination.name}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/60 group-hover:text-[#FF8C00] transition-colors">
              VIEW PREVIEW
            </span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{ background: "rgba(255,140,0,0.2)", border: "1.5px solid rgba(255,140,0,0.5)" }}
            >
              <svg className="w-2.5 h-2.5 ml-0.5" fill="#FF8C00" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DestinationCard({ destination, delay, visible, darkMode }) {
  // Boracay gets the video treatment
  if (destination.slug === "boracay") {
    return <BoracayVideoCard destination={destination} delay={delay} visible={visible} />;
  }

  return (
    <Link to={`/destination/${destination.slug}`}>
      <div
        className="card-animate group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:z-10"
        style={{
          animationDelay: visible ? `${delay}ms` : "9999s",
          animationPlayState: visible ? "running" : "paused",
          opacity: visible ? undefined : 0,
          height: "190px",
          boxShadow: darkMode ? "0 4px 20px rgba(0,0,0,0.7)" : "0 4px 16px rgba(0,0,0,0.12)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(255,140,0,0.4)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = darkMode ? "0 4px 20px rgba(0,0,0,0.7)" : "0 4px 16px rgba(0,0,0,0.12)"; }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url('${destination.image}')` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.85) 100%)" }}
        />
        {/* Orange top line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "#FF8C00" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3.5">
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase mb-0.5" style={{ color: "rgba(255,140,0,0.9)" }}>
            Philippines
          </p>
          <h3 className="text-white font-black text-sm leading-tight mb-1">
            {destination.name}
          </h3>
          {/* VIEW PREVIEW row */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/60 group-hover:text-[#FF8C00] transition-colors">
              VIEW PREVIEW
            </span>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
              style={{ background: "rgba(255,140,0,0.2)", border: "1.5px solid rgba(255,140,0,0.5)" }}
            >
              <svg className="w-2.5 h-2.5 ml-0.5" fill="#FF8C00" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}