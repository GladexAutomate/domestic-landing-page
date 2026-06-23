// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Video, X, Maximize2 } from "lucide-react";

const FLOAT_W = 200;
const FLOAT_H = Math.round(FLOAT_W * 16 / 9);

export default function TBBriefingVideo({ dest, darkMode, tk }) {
  const [videoLoaded, setVideoLoaded]   = useState(false);
  const [videoFailed, setVideoFailed]   = useState(false);
  const [isVisible, setIsVisible]       = useState(true);
  const [hasBeenSeen, setHasBeenSeen]   = useState(false);
  const [dismissed, setDismissed]       = useState(false);
  const [rect, setRect]                 = useState(null);
  const [dragPos, setDragPos]           = useState(null); // {x,y} top/left; null = default corner
  const placeholderRef = useRef(null);
  const sectionRef     = useRef(null);
  const iframeRef      = useRef(null);
  const rafRef         = useRef(null);
  const drag           = useRef({ active: false, startX: 0, startY: 0, startLeft: 0, startTop: 0 });

  const isComingSoon = dest.video?.comingSoon || !dest.video?.url;
  const videoUrl     = dest.video?.url || "";
  const embedSrc     = `${videoUrl}?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&enablejsapi=1`;

  const pauseVideo = () => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: "pauseVideo", args: [] }), "*"
    );
  };

  const handleDismiss = () => {
    pauseVideo();
    setDismissed(true);
  };

  // Drag handlers
  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current.active) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const newX = Math.max(0, Math.min(window.innerWidth  - FLOAT_W,      drag.current.startLeft + (clientX - drag.current.startX)));
      const newY = Math.max(0, Math.min(window.innerHeight - FLOAT_H - 32, drag.current.startTop  + (clientY - drag.current.startY)));
      setDragPos({ x: newX, y: newY });
    };
    const onUp = () => { drag.current.active = false; };
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend",  onUp);
    return () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onUp);
    };
  }, []);

  const onDragStart = (e) => {
    e.preventDefault();
    const currentLeft = dragPos ? dragPos.x : 20;
    const currentTop  = dragPos ? dragPos.y : (window.innerHeight - FLOAT_H - 32);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    drag.current = { active: true, startX: clientX, startY: clientY, startLeft: currentLeft, startTop: currentTop };
  };

  // Failure timeout
  useEffect(() => {
    if (isComingSoon) return;
    const t = setTimeout(() => setVideoFailed(cur => cur ? cur : !videoLoaded), 10000);
    return () => clearTimeout(t);
  }, [videoLoaded, isComingSoon]);

  // Track placeholder rect
  useEffect(() => {
    if (isComingSoon) return;
    const update = () => {
      if (!placeholderRef.current) return;
      const r = placeholderRef.current.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    update();
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isComingSoon]);

  // Visibility observer
  useEffect(() => {
    if (isComingSoon || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) { setHasBeenSeen(true); setDismissed(false); }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isComingSoon]);

  const showInline   = !isComingSoon && isVisible;
  const floatActive  = !isComingSoon && !videoFailed && !isVisible && hasBeenSeen;
  const showFloat    = floatActive && !dismissed;

  // ── Coming Soon ──────────────────────────────────────────────────
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-2"
              style={{ borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.06)" }}>
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
              <div className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", borderColor: "rgba(255,255,255,0.18)", color: "#fff" }}>
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const floatPos = dragPos
    ? { top: `${dragPos.y}px`, left: `${dragPos.x}px` }
    : { bottom: "1.25rem", left: "1.25rem" };

  const portalStyle = showInline && rect ? {
    position: "fixed",
    top:    `${rect.top}px`,
    left:   `${rect.left}px`,
    width:  `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: 40,
    borderRadius: "1.75rem",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.06)",
  } : floatActive ? {
    position: "fixed",
    ...floatPos,
    width:   `${FLOAT_W}px`,
    height:  `${FLOAT_H}px`,
    zIndex:  9999,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)",
    animation: !dragPos ? "slideUpFloat 0.25s ease" : undefined,
    touchAction: "none",
    visibility: dismissed ? "hidden" : "visible",
    pointerEvents: dismissed ? "none" : "auto",
  } : null;

  return (
    <>
      <div className="flex flex-col items-center" ref={sectionRef}>
        <div style={{ width: "clamp(220px, 70vw, 320px)" }}>
          <div
            ref={placeholderRef}
            className="relative w-full rounded-[1.75rem]"
            style={{ aspectRatio: "9 / 16" }}
          />
        </div>
      </div>

      {portalStyle && createPortal(
        <>
        <div style={portalStyle} onTouchStart={showFloat ? onDragStart : undefined}>
          {!videoFailed && (
            <iframe
              ref={iframeRef}
              src={embedSrc}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              allow="autoplay; fullscreen; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={dest.video?.title || `${dest.name} Briefing Video`}
              onLoad={() => setVideoLoaded(true)}
            />
          )}

          {videoFailed && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center", background: "linear-gradient(170deg,#0d0d0d 0%,#1a0800 100%)" }}>
              <span style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>🎬</span>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>Briefing Video Unavailable</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                Please check your connection or contact your Gladex consultant.
              </p>
            </div>
          )}

          {/* Inline overlays */}
          {showInline && !videoFailed && (
            <>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60px", cursor: "default", zIndex: 20 }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: "60px", height: "80px", cursor: "default", zIndex: 20 }} />
              <div style={{ position: "absolute", bottom: "1rem", left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 30 }}>
                <div style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" }}>
                  Official Briefing Video
                </div>
              </div>
            </>
          )}

          {/* Float title overlay at bottom */}
          {showFloat && (
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "5px 8px", background: "rgba(0,0,0,0.75)", zIndex: 10, pointerEvents: "none" }}>
              <p style={{ color: "#fff", fontSize: "9px", fontWeight: 700, margin: 0, letterSpacing: "0.02em", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {dest.video?.title || `${dest.name} Briefing`}
              </p>
            </div>
          )}
        </div>

        {/* Buttons outside the float — positioned above top-right corner */}
        {showFloat && !dismissed && (
          <>
            {/* Scroll-to-briefing button (left of X) */}
            <button
              onClick={() => sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              onTouchStart={e => e.stopPropagation()}
              title="Go to briefing section"
              style={{
                position: "fixed",
                ...(dragPos
                  ? { top: `${dragPos.y - 14}px`, left: `${dragPos.x + FLOAT_W - 14 - 36}px` }
                  : { bottom: `${FLOAT_H + 20 - 14}px`, left: `${20 + FLOAT_W - 14 - 36}px` }),
                zIndex: 10000,
                width: "28px", height: "28px",
                borderRadius: "50%",
                background: "#ff6b00",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0,
              }}
            >
              <Maximize2 style={{ width: "12px", height: "12px" }} />
            </button>

            {/* X / dismiss button */}
            <button
              onClick={handleDismiss}
              onTouchStart={e => e.stopPropagation()}
              style={{
                position: "fixed",
                ...(dragPos
                  ? { top: `${dragPos.y - 14}px`, left: `${dragPos.x + FLOAT_W - 14}px` }
                  : { bottom: `${FLOAT_H + 20 - 14}px`, left: `${20 + FLOAT_W - 14}px` }),
                zIndex: 10000,
                width: "28px", height: "28px",
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                color: "#333",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0,
              }}
            >
              <X style={{ width: "12px", height: "12px" }} />
            </button>
          </>
        )}
        </>,
        document.body
      )}

      <style>{`
        @keyframes slideUpFloat {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
