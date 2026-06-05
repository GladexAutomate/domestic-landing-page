// @ts-nocheck
/*
  VIDEO PLAYER — Google Drive /preview embed
  ─────────────────────────────────────────────────────────────────────────────
  · ?rm=minimal strips the Drive header/toolbar link at the top of the player.
  · sandbox attribute blocks all popup / top-navigation attempts at the browser
    level — clicking "Open in Drive" does nothing; the browser silently
    discards the attempt.
  · Transparent overlay divs intercept pointer events in the known Drive
    button regions (top bar, top-right corner, bottom-right corner).
  · The vertical centre (play button) and the bottom-left controls are
    intentionally left uncovered so normal playback works.
  · El Nido and any dest with comingSoon: true shows the "Video Coming Soon"
    fallback screen instead of an iframe.
  ─────────────────────────────────────────────────────────────────────────────
*/
import { useState, useEffect } from "react";
import { Video } from "lucide-react";

export default function TBBriefingVideo({ dest, darkMode, tk }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const isComingSoon = dest.video?.comingSoon || !dest.video?.url;
  const videoUrl = dest.video?.url || "";

  // Mark failed if onLoad hasn't fired within 8 s
  useEffect(() => {
    if (isComingSoon) return;
    const t = setTimeout(() => {
      setVideoFailed((cur) => (cur ? cur : !videoLoaded));
    }, 8000);
    return () => clearTimeout(t);
  }, [videoLoaded, isComingSoon]);

  // ── Coming Soon state ──────────────────────────────────────────
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
                🎬 Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Topics row below */}
        <VideoTopics tk={tk} />
      </div>
    );
  }

  // ── Live Google Drive iframe ───────────────────────────────────
  return (
    <div className="flex flex-col items-center">
      {/*
        Portrait phone-screen container.
        clamp keeps it centred and phone-sized on every breakpoint.
      */}
      <div style={{ width: "clamp(220px, 70vw, 320px)" }}>
        <div
          className="relative w-full rounded-[1.75rem] overflow-hidden border border-white/12"
          style={{
            aspectRatio: "9 / 16",
            background: "#000",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 3px rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Live iframe ── */}
          {!videoFailed && (
            <iframe
              src={`${videoUrl}?rm=minimal`}
              className="absolute inset-0 w-full h-full border-0"
              /*
                sandbox — browser-level enforcement (not a CSS trick)
                ─────────────────────────────────────────────────────
                Tokens INCLUDED (minimum needed for the player):
                  allow-scripts        — video player JavaScript
                  allow-same-origin    — Google Drive session/storage
                  allow-forms          — internal player form elements
                  allow-presentation   — Fullscreen API

                Tokens OMITTED (intentionally):
                  allow-popups         — clicking "Open in Drive" or
                                         any external-launch button now
                                         does NOTHING; the browser
                                         silently discards the attempt
                  allow-top-navigation — the iframe cannot redirect or
                                         navigate the parent page
                  allow-popups-to-escape-sandbox — belt + braces
              */
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
              title={dest.video?.title || `${dest.name} Briefing Video`}
              style={{ background: "#000" }}
              onLoad={() => setVideoLoaded(true)}
            />
          )}

          {/* ── Fallback ── */}
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
            ── Pointer-blocking overlays ───────────────────────────
            Google Drive injects its own UI (external-launch button,
            logo link, pop-out icon) inside the cross-origin iframe —
            these cannot be removed with CSS from outside.

            Each overlay div is transparent but sits above the iframe
            in z-order. A DOM element with default pointer-events: auto
            absorbs ALL pointer events in its area, silently preventing
            those clicks from ever reaching the iframe beneath it.

            Areas covered:
            ① Top bar  — Drive header / "Open in Drive" toolbar
            ② Top-right corner — persistent logo / external icon
            ③ Bottom-right corner — pop-out / external-launch button

            The vertical centre (play button) and the bottom-left
            quarter (standard controls) are intentionally left uncovered.
          */}
          {!videoFailed && (
            <>
              {/* ① Top header bar */}
              <div
                className="absolute top-0 left-0 right-0 z-20"
                style={{ height: "56px", cursor: "default" }}
              />
              {/* ② Top-right corner — logo / icon */}
              <div
                className="absolute top-0 right-0 z-20"
                style={{ width: "72px", height: "88px", cursor: "default" }}
              />
              {/* ③ Bottom-right corner — pop-out / external-launch */}
              <div
                className="absolute bottom-0 right-0 z-20"
                style={{ width: "72px", height: "56px", cursor: "default" }}
              />
            </>
          )}

          {/* ── Badge pinned to BOTTOM-CENTRE ── */}
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

      {/* Topics covered — centred grid below the portrait frame */}
      <VideoTopics tk={tk} />
    </div>
  );
}

function VideoTopics({ tk }) {
  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm">
      {[
        { icon: "✈️", text: "Arrival & airport walkthrough" },
        { icon: "🏨", text: "Hotel check-in procedures" },
        { icon: "🌊", text: "Tour schedules & reminders" },
        { icon: "🛡️", text: "Safety tips & eco guidelines" },
        { icon: "📞", text: "Emergency contacts" },
        { icon: "📋", text: "Important do's & don'ts" },
      ].map(({ icon, text }) => (
        <div
          key={text}
          className="flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs"
          style={{
            borderColor: tk?.borderColor || "rgba(255,255,255,0.08)",
            backgroundColor: tk?.surfaceBg || "rgba(255,255,255,0.04)",
            color: tk?.textMuted || "rgba(255,255,255,0.65)",
          }}
        >
          <span>{icon}</span>
          <span className="leading-tight">{text}</span>
        </div>
      ))}
    </div>
  );
}
