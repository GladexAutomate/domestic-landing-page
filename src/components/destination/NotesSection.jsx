import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function NotesSection({ destination, darkMode }) {
  const [headRef, headVisible] = useScrollReveal(0.15);
  const [ref, visible] = useScrollReveal(0.1);

  if (!destination.notes?.length) return null;

  const sectionBg = darkMode ? "#111" : "#f8fafc";
  const textMuted = darkMode ? "rgba(255,255,255,0.6)" : "#374151";
  const textPrimary = darkMode ? "#fff" : "#0F172A";

  return (
    <section className="relative py-16 px-6 overflow-hidden" style={{ background: sectionBg }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,140,0,0.03) 0%, transparent 70%)" }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-10 transition-all duration-700"
          style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(20px)" }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.5))" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>
              Important
            </span>
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, rgba(255,140,0,0.5), transparent)" }} />
          </div>
          <h2
            className="font-black mb-2"
            style={{ color: textPrimary, fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", letterSpacing: "-0.02em" }}
          >
            Requirements &amp; Notes
          </h2>
        </div>

        {/* Card */}
        <div
          ref={ref}
          className="rounded-2xl overflow-hidden transition-all duration-700"
          style={{
            background: darkMode ? "rgba(18,12,4,0.9)" : "rgba(255,251,245,0.98)",
            border: `1px solid ${darkMode ? "rgba(255,140,0,0.18)" : "rgba(255,140,0,0.22)"}`,
            boxShadow: darkMode
              ? "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,140,0,0.06)"
              : "0 8px 40px rgba(255,140,0,0.06)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* Top accent strip */}
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.7), transparent)" }} />

          <div className="p-7">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,140,0,0.12)", border: "1px solid rgba(255,140,0,0.2)" }}
              >
                <svg className="w-5 h-5" fill="#FF8C00" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <h3 className="font-bold text-base" style={{ color: textPrimary }}>
                Important Notes
              </h3>
            </div>

            <ul className="space-y-3.5">
              {destination.notes.map((note, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm transition-all duration-500"
                  style={{
                    color: textMuted,
                    opacity: visible ? 1 : 0,
                    transitionDelay: `${0.06 + i * 0.05}s`,
                  }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full mt-0.5 flex items-center justify-center"
                    style={{ background: "rgba(255,140,0,0.12)", minWidth: "20px" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#FF8C00" }}
                    />
                  </span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}