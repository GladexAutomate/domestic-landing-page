const HIGHLIGHT_ICONS = [
  { label: "Natural Wonders", icon: "🏝️" },
  { label: "Local Cuisine", icon: "🍜" },
  { label: "Adventure Sports", icon: "🤿" },
  { label: "Cultural Sites", icon: "🏛️" },
  { label: "Beach Activities", icon: "🌊" },
  { label: "Photography Spots", icon: "📸" },
  { label: "Wildlife & Nature", icon: "🦅" },
  { label: "Sunset Views", icon: "🌅" },
];

export default function DestinationHighlights({ destination, darkMode }) {
  return (
    <section className={`py-20 px-6 ${darkMode ? "bg-[#111]" : "bg-white"}`}>
      <div className="max-w-4xl mx-auto">
        {/* Highlights */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            What's Included
          </span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-2 ${darkMode ? "text-white" : "text-[#0F172A]"}`}>
          Destination Highlights
        </h2>
        <p className={`text-center text-sm font-light mb-12 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
          Everything you need for a seamless, unforgettable journey.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {HIGHLIGHT_ICONS.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl transition-all hover:scale-105"
              style={{
                background: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-medium text-center ${darkMode ? "text-white/70" : "text-[#0F172A]/70"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Gallery Placeholder */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            Gallery Preview
          </span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h3 className={`text-center font-black text-2xl mb-8 ${darkMode ? "text-white" : "text-[#0F172A]"}`}>
          {destination.name} in Frames
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl aspect-square"
              style={{
                background: darkMode
                  ? "linear-gradient(135deg, #1a1a1a 0%, #222 100%)"
                  : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
                border: darkMode ? "1px solid rgba(255,140,0,0.08)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div className="w-full h-full flex items-center justify-center opacity-25">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" style={{ color: darkMode ? "#fff" : "#000" }}>
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}