import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

// Extract Google Drive file ID from various Drive URL formats
function getDriveFileId(url) {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoSection({ destination }) {
  const [ref, visible] = useScrollReveal();
  const [playing, setPlaying] = useState(false);

  const fileId = getDriveFileId(destination.videoUrl);
  const embedUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`
    : null;

  const hasVideo = !!embedUrl;

  return (
    <section style={{ background: "#111", padding: "72px 24px" }}>
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-12" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            Official Travel Preview
          </span>
          <div className="h-[1px] w-12" style={{ background: "#FF8C00" }} />
        </div>
        <h2
          className="font-black text-white mb-3"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontStyle: "italic", letterSpacing: "-0.02em" }}
        >
          Experience {destination.name}
        </h2>
        <p className="text-sm font-light max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
          Watch our exclusive cinematic preview and feel the destination before you arrive.
        </p>
      </div>

      {/* Video Container */}
      <div
        ref={ref}
        className="max-w-4xl mx-auto transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)" }}
      >
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            aspectRatio: "16/9",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          }}
        >
          {hasVideo ? (
            <>
              {/* Iframe — always mounted but invisible until play */}
              {playing && (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: "none" }}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title={`Experience ${destination.name}`}
                />
              )}

              {/* Static branded cover — shown until user clicks play */}
              {!playing && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                  onClick={() => setPlaying(true)}
                  style={{
                    background: `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.6) 100%), url('${destination.hero}') center/cover no-repeat`,
                  }}
                >
                  {/* Play button */}
                  <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {/* Glow ring */}
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: "90px",
                        height: "90px",
                        background: "rgba(255,140,0,0.2)",
                        animation: "playRing 2s ease-in-out infinite",
                      }}
                    />
                    {/* Button circle */}
                    <div
                      className="relative flex items-center justify-center rounded-full"
                      style={{
                        width: "72px",
                        height: "72px",
                        background: "rgba(255,140,0,0.92)",
                        boxShadow: "0 8px 32px rgba(255,140,0,0.5)",
                      }}
                    >
                      <svg className="w-8 h-8 ml-1" fill="white" viewBox="0 0 24 24">
                        <polygon points="8,5 19,12 8,19" />
                      </svg>
                    </div>
                  </div>

                  {/* "Play Preview" label */}
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <span className="text-xs font-bold tracking-[0.25em] uppercase text-white/70">
                      Play Preview
                    </span>
                  </div>

                  {/* Gladex watermark badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF8C00" }} />
                    <span className="text-[10px] font-bold tracking-widest uppercase text-white/80">
                      Gladex Official
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No video uploaded — keep original "Coming Soon" placeholder exactly */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="relative mx-auto mb-6" style={{ width: "72px", height: "72px" }}>
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{ background: "rgba(255,140,0,0.15)", animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }}
                  />
                  <div
                    className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.2)" }}
                  >
                    <svg className="w-8 h-8 ml-1" fill="rgba(255,255,255,0.7)" viewBox="0 0 24 24">
                      <polygon points="8,5 19,12 8,19" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Official Travel Preview Coming Soon</h3>
                <p className="text-sm max-w-xs mx-auto mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
                  We&apos;re preparing an exclusive cinematic preview of {destination.name}. Stay tuned.
                </p>
                <button
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold tracking-[0.15em] uppercase transition-all hover:bg-[#FF8C00] hover:text-white"
                  style={{ border: "1.5px solid #FF8C00", color: "#FF8C00", background: "transparent", animation: "staytunedPulse 3s ease-in-out infinite" }}
                >
                  + STAY TUNED
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @keyframes staytunedPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,140,0,0); }
          50% { box-shadow: 0 0 0 6px rgba(255,140,0,0.15); }
        }
        @keyframes playRing {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0.2; }
        }
      `}</style>
    </section>
  );
}