import { useScrollReveal } from "@/hooks/useScrollReveal";

function DayRow({ day, index, darkMode }) {
  const [ref, visible] = useScrollReveal(0.1);

  // Parse details into bullet lines
  const lines = day.details
    ? day.details.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];

  return (
    <div
      ref={ref}
      className="flex gap-5 transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-40px)",
        transitionDelay: `${index * 0.12}s`,
      }}
    >
      {/* Left: circle + line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0 z-10"
          style={{ background: "#FF8C00", boxShadow: "0 4px 16px rgba(255,140,0,0.4)" }}
        >
          {index + 1}
        </div>
        <div className="flex-1 w-[2px] mt-1" style={{ background: "rgba(0,0,0,0.08)", minHeight: "20px" }} />
      </div>

      {/* Right: card */}
      <div
        className="flex-1 mb-5 rounded-xl p-5"
        style={{
          background: darkMode ? "#1a1a1a" : "#fff",
          boxShadow: darkMode ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
          border: darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <p
          className="font-bold text-sm mb-3 uppercase tracking-wide"
          style={{ color: darkMode ? "#fff" : "#0F172A" }}
        >
          {day.day} — {day.title}
        </p>
        <ul className="space-y-1.5">
          {lines.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: darkMode ? "rgba(255,255,255,0.55)" : "#64748B" }}>
              <span className="font-bold mt-0.5 flex-shrink-0" style={{ color: "#FF8C00" }}>›</span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ItinerarySection({ destination, darkMode }) {
  const [headRef, headVisible] = useScrollReveal(0.2);

  if (!destination.itinerary?.length) return null;

  return (
    <section
      className="py-16 px-6"
      style={{ background: darkMode ? "#0d0d0d" : "#fff" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-12 transition-all duration-700"
          style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
              Day by Day
            </span>
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          </div>
          <h2
            className="font-black text-3xl md:text-4xl mb-3"
            style={{ color: darkMode ? "#fff" : "#0F172A" }}
          >
            Your {destination.name} Itinerary
          </h2>
          <p className="text-sm font-light" style={{ color: darkMode ? "rgba(255,255,255,0.45)" : "#64748B" }}>
            A carefully crafted journey from arrival to departure.
          </p>
        </div>

        {/* Timeline */}
        <div>
          {destination.itinerary.map((day, i) => (
            <DayRow key={i} day={day} index={i} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </section>
  );
}