import { useScrollReveal } from "@/hooks/useScrollReveal";

const VIDEO_EMBEDS = {
  boracay: "https://drive.google.com/file/d/1THzQAagycyXm8UYNztawslG7G_2Ak_J3/preview",
  cebu: "https://drive.google.com/file/d/1ad6Nwx84ASOIqOqkYzkQsKDhzQGEC3Ro/preview",
};

function getEmbedUrl(destination) {
  if (VIDEO_EMBEDS[destination.slug]) return VIDEO_EMBEDS[destination.slug];
  return null;
}

function ComingSoonPlaceholder({ destination, darkMode }) {
  const bg = darkMode
    ? "linear-gradient(135deg, #0d0d0d 0%, #111 50%, #0a0a0a 100%)"
    : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e8ecf0 100%)";
  const headingColor = darkMode ? "#ffffff" : "#0F172A";
  const subtitleColor = darkMode ? "rgba(255,255,255,0.35)" : "#64748B";
  const playBtnBg = darkMode
    ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)"
    : "linear-gradient(135deg, rgba(255,140,0,0.12) 0%, rgba(255,140,0,0.06) 100%)";
  const playBtnBorder = darkMode ? "rgba(255,255,255,0.15)" : "rgba(255,140,0,0.3)";
  const playIconColor = darkMode ? "rgba(255,255,255,0.6)" : "rgba(255,140,0,0.8)";

  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ background: bg }}>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,140,0,0.05) 0%, transparent 70%)" }} />

      <div className="text-center px-8 relative z-10">
        <div className="relative mx-auto mb-8" style={{ width: "88px", height: "88px" }}>
          <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,140,0,0.12)", animation: "comingSoonPing 2.5s cubic-bezier(0,0,0.2,1) infinite" }} />
          <div className="absolute inset-0 rounded-full" style={{ background: "rgba(255,140,0,0.08)", animation: "comingSoonPing 2.5s cubic-bezier(0,0,0.2,1) 0.4s infinite" }} />
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{ background: playBtnBg, border: `1.5px solid ${playBtnBorder}`, backdropFilter: "blur(8px)" }}
          >
            <svg className="w-9 h-9 ml-1" fill={playIconColor} viewBox="0 0 24 24">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "rgba(255,140,0,0.4)" }} />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "rgba(255,140,0,0.7)" }}>Coming Soon</span>
          <div className="h-[1px] w-10" style={{ background: "rgba(255,140,0,0.4)" }} />
        </div>

        <h3 className="font-black mb-3 transition-colors duration-500" style={{ color: headingColor, fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontStyle: "italic", letterSpacing: "-0.02em" }}>
          Official Travel Preview Coming Soon
        </h3>
        <p className="text-sm max-w-xs mx-auto mb-7 leading-relaxed transition-colors duration-500" style={{ color: subtitleColor, lineHeight: 1.7 }}>
          We&apos;re currently editing the cinematic preview video for {destination.name}. Stay tuned for the full travel experience showcase.
        </p>
        <button
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#FF8C00] hover:text-white hover:border-[#FF8C00] active:scale-95"
          style={{ border: "1.5px solid rgba(255,140,0,0.5)", color: "#FF8C00", background: "transparent", animation: "stayTunedGlow 3s ease-in-out infinite" }}
        >
          <span>+</span> Stay Tuned
        </button>
      </div>
    </div>
  );
}

export default function VideoSection({ destination, darkMode }) {
  const [containerRef, containerVisible] = useScrollReveal(0.1);
  const [headRef, headVisible] = useScrollReveal(0.15);
  const embedUrl = getEmbedUrl(destination);

  const sectionBg = darkMode
    ? "linear-gradient(180deg, #000 0%, #0a0a0a 50%, #111 100%)"
    : "linear-gradient(180deg, #f5f7fa 0%, #eef0f4 50%, #f0f2f5 100%)";
  const headingColor = darkMode ? "#ffffff" : "#0F172A";
  const subtitleColor = darkMode ? "rgba(255,255,255,0.4)" : "#64748B";
  const containerBg = darkMode
    ? "linear-gradient(135deg, #141414 0%, #0d0d0d 100%)"
    : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
  const containerBorder = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const containerShadow = darkMode
    ? "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)"
    : "0 24px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)";
  const labelBarBg = darkMode ? "rgba(10,10,10,0.9)" : "rgba(255,255,255,0.95)";
  const labelBarBorder = darkMode ? "rgba(255,140,0,0.2)" : "rgba(255,140,0,0.25)";
  const labelColor = darkMode ? "rgba(255,255,255,0.6)" : "#374151";

  return (
    <section
      className="relative overflow-hidden transition-colors duration-500"
      style={{ background: sectionBg, padding: "96px 24px" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,140,0,0.05) 0%, transparent 70%)" }}
      />

      {/* Header */}
      <div
        ref={headRef}
        className="text-center mb-14 relative z-10 transition-all duration-700"
        style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(28px)" }}
      >
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-[1px]" style={{ width: "48px", background: "linear-gradient(90deg, transparent, #FF8C00)" }} />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>
            Official Travel Preview
          </span>
          <div className="h-[1px]" style={{ width: "48px", background: "linear-gradient(90deg, #FF8C00, transparent)" }} />
        </div>
        <h2
          className="font-black mb-4 transition-colors duration-500"
          style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontStyle: "italic", letterSpacing: "-0.03em", lineHeight: 1.1, color: headingColor, textShadow: darkMode ? "0 0 60px rgba(255,140,0,0.2)" : "none" }}
        >
          Experience {destination.name}
        </h2>
        <p className="text-sm font-light max-w-md mx-auto transition-colors duration-500" style={{ color: subtitleColor, lineHeight: 1.8, letterSpacing: "0.02em" }}>
          Watch our exclusive cinematic travel preview and explore the beauty,
          culture, and unforgettable moments waiting for you in {destination.name}.
        </p>
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative max-w-4xl mx-auto z-10 transition-all duration-700"
        style={{ opacity: containerVisible ? 1 : 0, transform: containerVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.98)", transitionDelay: "0.1s" }}
      >
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,140,0,0.3) 0%, rgba(255,140,0,0.05) 40%, rgba(255,140,0,0.15) 100%)", borderRadius: "20px" }}
        />
        <div
          className="relative w-full overflow-hidden transition-colors duration-500"
          style={{ borderRadius: "18px", aspectRatio: "16/9", background: containerBg, border: `1px solid ${containerBorder}`, boxShadow: containerShadow }}
        >
          {embedUrl ? (
            <>
              {/* Pop-out blocker overlay on top-right corner */}
              <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 50, zIndex: 10, background: containerBg, pointerEvents: "all" }} />
              <iframe
                src={embedUrl}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                allow="autoplay; fullscreen"
                allowFullScreen
                title={`Experience ${destination.name}`}
              />
              {[["top-4 left-4", "borderTop", "borderLeft", "3px 0 0 0"], ["top-4 right-4", "borderTop", "borderRight", "0 3px 0 0"], ["bottom-4 left-4", "borderBottom", "borderLeft", "0 0 0 3px"], ["bottom-4 right-4", "borderBottom", "borderRight", "0 0 3px 0"]].map(([pos, b1, b2, radius], i) => (
                <div key={i} className={`absolute ${pos} pointer-events-none`}>
                  <div style={{ width: 20, height: 20, [b1]: "2px solid rgba(255,140,0,0.5)", [b2]: "2px solid rgba(255,140,0,0.5)", borderRadius: radius }} />
                </div>
              ))}
            </>
          ) : (
            <ComingSoonPlaceholder destination={destination} darkMode={darkMode} />
          )}
        </div>

        {/* Bottom label */}
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 rounded-full transition-colors duration-500"
          style={{ background: labelBarBg, border: `1px solid ${labelBarBorder}`, backdropFilter: "blur(12px)", boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.1)", whiteSpace: "nowrap" }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: embedUrl ? "#22c55e" : "#FF8C00", boxShadow: embedUrl ? "0 0 6px #22c55e" : "0 0 6px #FF8C00", animation: "videoDot 2s ease-in-out infinite" }} />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: labelColor }}>
            {embedUrl ? `${destination.name} — Official Preview` : "Cinematic Preview Coming Soon"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes videoDot { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes comingSoonPing { 0% { transform: scale(1); opacity: 0.5; } 70% { transform: scale(2.2); opacity: 0; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes stayTunedGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,0,0); } 50% { box-shadow: 0 0 0 8px rgba(255,140,0,0.12); } }
      `}</style>
    </section>
  );
}