import { useRef, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

// Google Drive direct embed URL for the Boracay preview video
const BORACAY_VIDEO_ID = "1THzQAagycyXm8UYNztawslG7G_2Ak_J3";
const BORACAY_VIDEO_EMBED = `https://drive.google.com/file/d/${BORACAY_VIDEO_ID}/preview`;

export default function BoracayVideoSection({ darkMode }) {
  const [sectionRef, sectionVisible] = useScrollReveal(0.1);
  const [playing, setPlaying] = useState(false);

  return (
    <section
      style={{ background: darkMode ? "#111" : "#fff" }}
      className="py-20 px-6 transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-12" style={{ background: "rgba(255,140,0,0.6)" }} />
            <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "#FF8C00" }}>
              — Destination Preview —
            </span>
            <div className="h-[1px] w-12" style={{ background: "rgba(255,140,0,0.6)" }} />
          </div>
          <h2
            className="font-black mb-3"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              letterSpacing: "-0.02em",
              color: darkMode ? "#fff" : "#0F172A",
            }}
          >
            Experience Boracay
          </h2>
          <p
            className="text-sm font-light max-w-md mx-auto"
            style={{ color: darkMode ? "rgba(255,255,255,0.45)" : "#64748B" }}
          >
            A cinematic preview of the world-famous white beach paradise.
          </p>
        </div>

        {/* Video container */}
        <div
          ref={sectionRef}
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "16/9",
            background: "#000",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            opacity: sectionVisible ? 1 : 0,
            transform: sectionVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          {!playing ? (
            <>
              {/* Thumbnail overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=90&fit=crop')",
                }}
              />
              <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />

              {/* Play button */}
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 group"
              >
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "rgba(255,140,0,0.9)",
                    boxShadow: "0 0 0 0 rgba(255,140,0,0.5)",
                    animation: "videoPing 2s ease-in-out infinite",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginLeft: "4px" }}>
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <span className="text-white text-sm font-bold tracking-widest uppercase" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}>
                  Watch Preview
                </span>
              </button>

              {/* Boracay label */}
              <div className="absolute bottom-6 left-6">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-1" style={{ color: "#FF8C00" }}>Boracay, Philippines</p>
                <p className="text-white font-black text-lg leading-tight">White Beach Paradise</p>
              </div>
            </>
          ) : (
            <iframe
              src={`${BORACAY_VIDEO_EMBED}&autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{ border: "none" }}
              title="Boracay Preview Video"
            />
          )}
        </div>

        {/* CTA below video */}
        <div className="text-center mt-8">
          <a
            href="/destination/boracay"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm tracking-wide uppercase text-white transition-all hover:scale-105"
            style={{ background: "#FF8C00", boxShadow: "0 8px 28px rgba(255,140,0,0.35)" }}
          >
            View Full Boracay Package →
          </a>
        </div>
      </div>

      <style>{`
        @keyframes videoPing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,0,0.5); }
          50% { box-shadow: 0 0 0 20px rgba(255,140,0,0); }
        }
      `}</style>
    </section>
  );
}