import { useScrollReveal } from "@/hooks/useScrollReveal";

// Map of slug → Google Drive preview embed URLs
const VIDEO_EMBEDS = {
  boracay: "https://drive.google.com/file/d/1THzQAagycyXm8UYNztawslG7G_2Ak_J3/preview",
};

// Map videoUrl (bit.ly links) from destination data
function getEmbedUrl(destination) {
  if (VIDEO_EMBEDS[destination.slug]) return VIDEO_EMBEDS[destination.slug];
  return null;
}

export default function VideoSection({ destination }) {
  const [containerRef, containerVisible] = useScrollReveal(0.1);
  const [headRef, headVisible] = useScrollReveal(0.15);
  const embedUrl = getEmbedUrl(destination);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #000 0%, #0a0a0a 50%, #111 100%)", padding: "96px 24px" }}
    >
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,140,0,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div
        ref={headRef}
        className="text-center mb-14 relative z-10 transition-all duration-700"
        style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(28px)" }}
      >
        <div className="flex items-center justify-center gap-4 mb-5">
          <div
            className="h-[1px]"
            style={{ width: "48px", background: "linear-gradient(90deg, transparent, #FF8C00)" }}
          />
          <span
            className="text-[10px] font-bold tracking-[0.4em] uppercase"
            style={{ color: "#FF8C00", letterSpacing: "0.4em" }}
          >
            Official Travel Preview
          </span>
          <div
            className="h-[1px]"
            style={{ width: "48px", background: "linear-gradient(90deg, #FF8C00, transparent)" }}
          />
        </div>

        <h2
          className="font-black text-white mb-4"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 4rem)",
            fontStyle: "italic",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textShadow: "0 0 60px rgba(255,140,0,0.2)",
          }}
        >
          Experience {destination.name}
        </h2>

        <p
          className="text-sm font-light max-w-md mx-auto"
          style={{ color: "rgba(255,255,255,0.4)", lineHeight: 1.8, letterSpacing: "0.02em" }}
        >
          Watch our exclusive cinematic travel preview and explore the beauty,
          culture, and unforgettable moments waiting for you in {destination.name}.
        </p>
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative max-w-4xl mx-auto z-10 transition-all duration-900"
        style={{ opacity: containerVisible ? 1 : 0, transform: containerVisible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.98)", transitionDelay: "0.1s" }}
      >
        {/* Outer glow ring */}
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,140,0,0.3) 0%, rgba(255,140,0,0.05) 40%, rgba(255,140,0,0.15) 100%)",
            borderRadius: "20px",
          }}
        />

        <div
          className="relative w-full overflow-hidden"
          style={{
            borderRadius: "18px",
            aspectRatio: "16/9",
            background: "linear-gradient(135deg, #141414 0%, #0d0d0d 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {embedUrl ? (
            <>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
                allow="autoplay; fullscreen"
                allowFullScreen
                title={`Experience ${destination.name}`}
              />
              {/* Corner decorations */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <div style={{ width: 20, height: 20, borderTop: "2px solid rgba(255,140,0,0.5)", borderLeft: "2px solid rgba(255,140,0,0.5)", borderRadius: "3px 0 0 0" }} />
              </div>
              <div className="absolute top-4 right-4 pointer-events-none">
                <div style={{ width: 20, height: 20, borderTop: "2px solid rgba(255,140,0,0.5)", borderRight: "2px solid rgba(255,140,0,0.5)", borderRadius: "0 3px 0 0" }} />
              </div>
              <div className="absolute bottom-4 left-4 pointer-events-none">
                <div style={{ width: 20, height: 20, borderBottom: "2px solid rgba(255,140,0,0.5)", borderLeft: "2px solid rgba(255,140,0,0.5)", borderRadius: "0 0 0 3px" }} />
              </div>
              <div className="absolute bottom-4 right-4 pointer-events-none">
                <div style={{ width: 20, height: 20, borderBottom: "2px solid rgba(255,140,0,0.5)", borderRight: "2px solid rgba(255,140,0,0.5)", borderRadius: "0 0 3px 0" }} />
              </div>
            </>
          ) : (
            <ComingSoonPlaceholder destination={destination} />
          )}
        </div>

        {/* Bottom label bar */}
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2 rounded-full"
          style={{
            background: "rgba(10,10,10,0.9)",
            border: "1px solid rgba(255,140,0,0.2)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: embedUrl ? "#22c55e" : "#FF8C00", boxShadow: embedUrl ? "0 0 6px #22c55e" : "0 0 6px #FF8C00", animation: "videoDot 2s ease-in-out infinite" }} />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.6)" }}>
            {embedUrl ? `${destination.name} — Official Preview` : "Cinematic Preview Coming Soon"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes videoDot {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes comingSoonPing {
          0% { transform: scale(1); opacity: 0.5; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes stayTunedGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,0,0); }
          50% { box-shadow: 0 0 0 8px rgba(255,140,0,0.12); }
        }
      `}</style>
    </section>
  );
}

function ComingSoonPlaceholder({ destination }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #0d0d0d 0%, #111 50%, #0a0a0a 100%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,140,0,0.05) 0%, transparent 70%)" }}
      />

      <div className="text-center px-8 relative z-10">
        {/* Pulsing play circle */}
        <div className="relative mx-auto mb-8" style={{ width: "88px", height: "88px" }}>
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(255,140,0,0.12)", animation: "comingSoonPing 2.5s cubic-bezier(0,0,0.2,1) infinite" }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(255,140,0,0.08)", animation: "comingSoonPing 2.5s cubic-bezier(0,0,0.2,1) 0.4s infinite" }}
          />
          <div
            className="relative w-full h-full rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
              border: "1.5px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <svg className="w-9 h-9 ml-1" fill="rgba(255,255,255,0.6)" viewBox="0 0 24 24">
              <polygon points="8,5 19,12 8,19" />
            </svg>
          </div>
        </div>

        {/* Decorative label */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "rgba(255,140,0,0.4)" }} />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "rgba(255,140,0,0.7)" }}>
            Coming Soon
          </span>
          <div className="h-[1px] w-10" style={{ background: "rgba(255,140,0,0.4)" }} />
        </div>

        <h3
          className="font-black text-white mb-3"
          style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontStyle: "italic", letterSpacing: "-0.02em" }}
        >
          Official Travel Preview Coming Soon
        </h3>
        <p
          className="text-sm max-w-xs mx-auto mb-7 leading-relaxed"
          style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}
        >
          We&apos;re currently editing the cinematic preview video for {destination.name}. Stay tuned for the full travel experience showcase.
        </p>

        <button
          className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-[#FF8C00] hover:text-white hover:border-[#FF8C00] active:scale-95"
          style={{
            border: "1.5px solid rgba(255,140,0,0.5)",
            color: "#FF8C00",
            background: "transparent",
            animation: "stayTunedGlow 3s ease-in-out infinite",
          }}
        >
          <span>+</span> Stay Tuned
        </button>
      </div>
    </div>
  );
}