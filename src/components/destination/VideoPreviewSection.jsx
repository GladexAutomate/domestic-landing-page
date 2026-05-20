export default function VideoPreviewSection({ destination, darkMode }) {
  return (
    <section className={`py-16 px-6 ${darkMode ? "bg-[#0a0a0a]" : "bg-[#faf9f7]"}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            Official Travel Preview
          </span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-3 ${darkMode ? "text-white" : "text-[#0F172A]"}`}>
          Experience {destination.name}
        </h2>
        <p className={`text-center text-sm font-light mb-10 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
          Watch our exclusive cinematic preview and feel the destination before you arrive.
        </p>

        {/* Video Container */}
        <div
          className="relative rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: darkMode
              ? "linear-gradient(135deg, #111 0%, #1a1a1a 100%)"
              : "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
            border: darkMode ? "1px solid rgba(255,140,0,0.12)" : "1px solid rgba(0,0,0,0.12)",
            aspectRatio: "16/9",
          }}
        >
          {/* Film grain texture */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundSize: "200px"
          }} />

          {/* Film icon */}
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <svg className="w-7 h-7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Official Travel Preview Coming Soon</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto mb-6">
              We're preparing an exclusive cinematic preview<br />of {destination.name}. Stay tuned.
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase transition-all hover:scale-105"
              style={{
                border: "1.5px solid #FF8C00",
                color: "#FF8C00",
                background: "rgba(255,140,0,0.08)"
              }}
            >
              + STAY TUNED
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}