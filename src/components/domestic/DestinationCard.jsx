import { Link } from "react-router-dom";

export default function DestinationCard({ destination, delay, visible, darkMode }) {
  return (
    <Link to={`/destination/${destination.slug}`}>
      <div
        className="card-animate group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:z-10"
        style={{
          animationDelay: visible ? `${delay}ms` : "9999s",
          animationPlayState: visible ? "running" : "paused",
          opacity: visible ? undefined : 0,
          height: "220px",
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
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.82) 100%)" }}
        />
        {/* Orange top line on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "#FF8C00" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <h3 className="text-white font-black text-base leading-tight mb-2 drop-shadow-md">
            {destination.name}
          </h3>
          {/* VIEW PREVIEW row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/55 group-hover:text-[#FF8C00] transition-colors duration-300">
              VIEW PREVIEW
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FF8C00]"
              style={{ background: "rgba(255,140,0,0.2)", border: "1.5px solid rgba(255,140,0,0.5)" }}
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