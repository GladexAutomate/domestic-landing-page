export default function VideoPreviewSection({ destination, darkMode, noPadding }) {
  const bg = darkMode ? "bg-[#0a0a0a]" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";

  return (
    <section className={noPadding ? "" : `py-14 px-6 ${bg}`}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Official Travel Preview</span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className={`font-black text-3xl md:text-4xl mb-2 ${textPrimary}`}>
          Experience {destination.name}
        </h2>
        <p className={`text-sm font-light mb-10 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
          Watch our exclusive cinematic preview and feel the destination before you arrive.
        </p>

        {/* Video Container */}
        <div
          className="relative rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.07)",
            aspectRatio: "16/9",
          }}
        >
          <div className="text-center px-6">
            {/* Play circle */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <svg className="w-6 h-6 ml-1" fill="rgba(255,255,255,0.6)" viewBox="0 0 24 24">
                <polygon points="8,5 19,12 8,19" />
              </svg>
            </div>
            <h3 className="text-white font-bold text-base mb-2">Official Travel Preview Coming Soon</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto mb-5">
              We're preparing an exclusive cinematic preview<br />of {destination.name}. Stay tuned.
            </p>
            <button
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-[0.15em] uppercase transition-all hover:bg-[#FF8C00] hover:text-white"
              style={{ border: "1.5px solid #FF8C00", color: "#FF8C00", background: "transparent" }}
            >
              + STAY TUNED
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}