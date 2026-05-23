import { useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const BORACAY_VIDEO_ID = "1THzQAagycyXm8UYNztawslG7G_2Ak_J3";

export default function BoracayVideoSection({ darkMode }) {
  const [headRef, headVisible] = useScrollReveal(0.15);
  const [videoRef, videoVisible] = useScrollReveal(0.1);

  return (
    <section
      className="py-20 px-6"
      style={{ background: darkMode ? "#000" : "#0a0a0a" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-10 transition-all duration-700"
          style={{
            opacity: headVisible ? 1 : 0,
            transform: headVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "#FF8C00" }}>
              Official Travel Preview
            </span>
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          </div>
          <h2
            className="font-black text-4xl md:text-5xl text-white mb-3"
            style={{ letterSpacing: "-0.01em" }}
          >
            Experience Boracay
          </h2>
          <p className="text-sm font-light max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            Watch our exclusive cinematic preview and feel the destination before you arrive.
          </p>
        </div>

        {/* Video Container */}
        <div
          ref={videoRef}
          className="relative rounded-2xl overflow-hidden transition-all duration-700"
          style={{
            opacity: videoVisible ? 1 : 0,
            transform: videoVisible ? "translateY(0)" : "translateY(32px)",
            background: "#111",
            boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ position: "relative", paddingTop: "56.25%" }}>
            <iframe
              src={`https://drive.google.com/file/d/${BORACAY_VIDEO_ID}/preview`}
              allow="autoplay; fullscreen"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
              }}
              title="Boracay Official Travel Preview"
            />
          </div>
        </div>
      </div>
    </section>
  );
}