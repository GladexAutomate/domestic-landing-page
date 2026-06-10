// @ts-nocheck
import { useState, useEffect } from "react";
import { Video } from "lucide-react";

export default function TBBriefingVideo({ dest, darkMode, tk }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const isComingSoon = dest.video?.comingSoon || !dest.video?.url;
  const videoUrl = dest.video?.url || "";

  useEffect(() => {
    if (isComingSoon) return;
    const t = setTimeout(() => {
      setVideoFailed((cur) => (cur ? cur : !videoLoaded));
    }, 10000);
    return () => clearTimeout(t);
  }, [videoLoaded, isComingSoon]);

  // ── Coming Soon ────────────────────────────────────────────────
  if (isComingSoon) {
    return (
      <div className="flex flex-col items-center">
        <div style={{ width: "clamp(220px, 70vw, 320px)" }}>
          <div
            className="relative w-full rounded-[1.75rem] overflow-hidden border border-white/12 flex flex-col items-center justify-center gap-4 px-6 text-center"
            style={{
              aspectRatio: "9 / 16",
              background: darkMode
                ? "linear-gradient(170deg, #0d0d0d 0%, #1a0800 100%)"
                : "linear-gradient(170deg, #1a1a1a 0%, #2a1200 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 3px rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.06)" }}
            >
              <Video className="w-7 h-7 text-white/60" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-2">
                {dest.video?.title || `${dest.name} Briefing Video`}
              </p>
              <p className="text-white/50 text-sm leading-relaxed">
                Video coming soon. Please review the written briefing below while we prepare your personalized video.
              </p>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-30">
              <div
                className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(8px)",
                  borderColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                }}
              >
                🎬 Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── YouTube embed — portrait phone frame ───────────────────────
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: "clamp(220px, 70vw, 320px)" }}>
        <div
          className="relative w-full rounded-[1.75rem] overflow-hidden border border-white/12"
          style={{
            aspectRatio: "9 / 16",
            background: "#000",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 3px rgba(255,255,255,0.06)",
          }}
        >
          {!videoFailed && (
            <iframe
              /*
                YouTube embed params:
                  rel=0             — no related videos after playback
                  modestbranding=1  — minimal YouTube branding
                  showinfo=0        — hide video title bar
                  iv_load_policy=3  — no annotations

                sandbox:
                  allow-popups and allow-top-navigation intentionally OMITTED
                  so clicking any YouTube link (logo, title, channel) does nothing.
              */
              src={`${videoUrl}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
              className="absolute inset-0 w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              allow="autoplay; fullscreen; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={dest.video?.title || `${dest.name} Briefing Video`}
              style={{ background: "#000" }}
              onLoad={() => setVideoLoaded(true)}
            />
          )}

          {videoFailed && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
              style={{ background: "linear-gradient(170deg,#0d0d0d 0%,#1a0800 100%)" }}
            >
              <span className="text-5xl mb-5">🎬</span>
              <p className="text-white font-bold text-base mb-2">Briefing Video Unavailable</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Please check your connection or contact your Gladex consultant for assistance.
              </p>
            </div>
          )}

          {/*
            Pointer-blocking overlays — prevent clicks from reaching
            YouTube's title bar, channel link, and logo watermark.
            The play button and controls in the centre/bottom-left
            are intentionally left uncovered.
          */}
          {!videoFailed && (
            <>
              {/* Top bar — title & channel name */}
              <div
                className="absolute top-0 left-0 right-0 z-20"
                style={{ height: "60px", cursor: "default" }}
              />
              {/* Top-right — menu icon */}
              <div
                className="absolute top-0 right-0 z-20"
                style={{ width: "60px", height: "80px", cursor: "default" }}
              />
              {/* Bottom-right — YouTube logo watermark */}
              <div
                className="absolute bottom-0 right-0 z-20"
                style={{ width: "80px", height: "50px", cursor: "default" }}
              />
            </>
          )}

          {/* Badge */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-30">
            <div
              className="px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border"
              style={{
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                borderColor: "rgba(255,255,255,0.18)",
                color: "#fff",
              }}
            >
              {videoFailed ? "⚠️ Unavailable" : "🎬 Official Briefing Video"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
