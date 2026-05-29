import { useState } from "react";
import { Link } from "react-router-dom";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&fit=crop";

export default function DestinationCard({
  destination,
  delay,
  visible,
  darkMode,
}) {
  const [imgSrc, setImgSrc] = useState(destination.image);

  return (
    <Link to={`/destination/${destination.slug}`}>
      <div
        className="card-animate group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:z-10"
        style={{
          animationDelay: visible ? `${delay}ms` : "9999s",
          animationPlayState: visible ? "running" : "paused",
          opacity: visible ? undefined : 0,
          aspectRatio: "4/3",
          boxShadow: darkMode
            ? "0 4px 20px rgba(0,0,0,0.7)"
            : "0 4px 16px rgba(0,0,0,0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 8px 40px rgba(255,140,0,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = darkMode
            ? "0 4px 20px rgba(0,0,0,0.7)"
            : "0 4px 16px rgba(0,0,0,0.12)";
        }}
      >
        {/* Background image */}
        <img
          src={imgSrc}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          alt=""
          className="sr-only"
        />
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2"
          style={{
            backgroundImage: `url('${imgSrc}')`,
          }}
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.88) 100%)",
          }}
        />

        {/* Orange glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to top, rgba(255,140,0,0.22), transparent 60%)",
          }}
        />

        {/* Orange top line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "#FF8C00" }}
        />

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="
              w-9 h-9 rounded-full
              flex items-center justify-center
              opacity-0
              group-hover:opacity-100
              transition-all duration-300
              scale-75
              group-hover:scale-100
            "
            style={{
              backgroundColor: "rgba(255,140,0,0.9)",
              boxShadow: "0 0 20px rgba(255,140,0,0.6)",
            }}
          >
            <svg
              className="w-4 h-4 text-white ml-0.5"
              fill="white"
              viewBox="0 0 24 24"
            >
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Destination Name */}
          <h3 className="text-white font-black text-sm leading-tight tracking-wide drop-shadow-md transition-all duration-300 group-hover:-translate-y-1">
            {destination.name}
          </h3>

          {/* VIEW PREVIEW */}
          <div
            className="
              text-[9px]
              font-semibold
              tracking-widest
              uppercase
              mt-1
              opacity-0
              group-hover:opacity-100
              transition-opacity duration-300
            "
            style={{ color: "#FF8C00" }}
          >
            VIEW PREVIEW
          </div>
        </div>
      </div>
    </Link>
  );
}