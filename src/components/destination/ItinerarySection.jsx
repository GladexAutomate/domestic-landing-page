import { useScrollReveal } from "@/hooks/useScrollReveal";

function DayRow({ day, index, darkMode, total }) {
  const [ref, visible] = useScrollReveal(0.08);
  const isLast = index === total - 1;

  const lines = day.details
    ? day.details.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  const cardBg = darkMode ? "rgba(20,20,20,0.85)" : "rgba(255,255,255,0.95)";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb";
  const textPrimary = darkMode ? "#fff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.5)" : "#64748B";

  return (
    <div
      ref={ref}
      className="flex gap-3 sm:gap-5 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-32px)",
        transitionDelay: `${index * 0.08}s`,
      }}
    >
      {/* Left: circle + line */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: "36px" }}>
        <div
          className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-white text-xs sm:text-sm flex-shrink-0 z-10 transition-transform duration-300 hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%)",
            boxShadow: "0 4px 20px rgba(255,140,0,0.4), 0 0 0 3px rgba(255,140,0,0.1)",
          }}
        >
          {index + 1}
        </div>
        {!isLast && (
          <div
            className="flex-1 mt-1"
            style={{
              width: "2px",
              minHeight: "20px",
              background: darkMode
                ? "linear-gradient(180deg, rgba(255,140,0,0.2) 0%, rgba(255,255,255,0.04) 100%)"
                : "linear-gradient(180deg, rgba(255,140,0,0.2) 0%, rgba(0,0,0,0.04) 100%)",
            }}
          />
        )}
      </div>

      {/* Right: card */}
      <div
        className="flex-1 min-w-0 mb-5 rounded-2xl overflow-hidden group"
        style={{
          background: cardBg,
          boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)",
          border: `1px solid ${borderColor}`,
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(255,140,0,0.25)";
          e.currentTarget.style.boxShadow = darkMode ? "0 8px 32px rgba(255,140,0,0.08)" : "0 8px 28px rgba(255,140,0,0.1)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = borderColor;
          e.currentTarget.style.boxShadow = darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.05)";
        }}
      >
        {/* Day label strip */}
        <div
          className="px-4 py-2.5 flex flex-wrap items-center gap-2"
          style={{ background: darkMode ? "rgba(255,140,0,0.04)" : "rgba(255,140,0,0.03)", borderBottom: `1px solid ${darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}
        >
          <span
            className="text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: "rgba(255,140,0,0.12)", color: "#FF8C00", border: "1px solid rgba(255,140,0,0.2)" }}
          >
            {day.day}
          </span>
          <p className="font-bold text-xs sm:text-sm uppercase tracking-wide leading-snug break-words min-w-0" style={{ color: textPrimary }}>
            {day.title}
          </p>
        </div>

        <div className="px-4 py-3">
          <ul className="space-y-2">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-xs sm:text-sm" style={{ color: textMuted }}>
                <span className="font-bold mt-0.5 flex-shrink-0 text-xs" style={{ color: "#FF8C00" }}>›</span>
                <span className="leading-relaxed break-words min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ItinerarySection({ destination, darkMode }) {
  const [headRef, headVisible] = useScrollReveal(0.15);

  if (!destination.itinerary?.length) return null;

  const sectionBg = darkMode ? "#0a0a0a" : "#ffffff";

  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden" style={{ background: sectionBg }}>
      {/* Subtle ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 30% at 50% 100%, rgba(255,140,0,0.03) 0%, transparent 70%)" }}
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-14 transition-all duration-700"
          style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, transparent, #FF8C00)" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>
              Day by Day
            </span>
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, #FF8C00, transparent)" }} />
          </div>
          <h2
            className="font-black mb-3"
            style={{
              color: darkMode ? "#fff" : "#0F172A",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Your {destination.name} Itinerary
          </h2>
          <p className="text-sm" style={{ color: darkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
            A carefully crafted journey from arrival to departure.
          </p>
        </div>

        {/* Timeline */}
        <div>
          {destination.itinerary.map((day, i) => (
            <DayRow key={i} day={day} index={i} darkMode={darkMode} total={destination.itinerary.length} />
          ))}
        </div>
      </div>
    </section>
  );
}