import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function NotesSection({ destination, darkMode }) {
  const [ref, visible] = useScrollReveal(0.15);

  if (!destination.notes?.length) return null;

  return (
    <section className="py-12 px-6" style={{ background: darkMode ? "#0d0d0d" : "#fff" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-[1px] flex-1" style={{ background: darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            Notes &amp; Requirements
          </span>
          <div className="h-[1px] flex-1" style={{ background: darkMode ? "rgba(255,255,255,0.1)" : "#e5e7eb" }} />
        </div>

        <div
          ref={ref}
          className="rounded-xl p-6 transition-all duration-700"
          style={{
            background: darkMode ? "#1a1a1a" : "#fffbf5",
            border: `1px solid ${darkMode ? "rgba(255,140,0,0.15)" : "rgba(255,140,0,0.25)"}`,
            boxShadow: darkMode ? "none" : "0 2px 16px rgba(255,140,0,0.06)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 flex-shrink-0" fill="#FF8C00" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <h3 className="font-bold text-base" style={{ color: darkMode ? "#fff" : "#0F172A" }}>
              Important Notes
            </h3>
          </div>
          <ul className="space-y-3">
            {destination.notes.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm transition-all duration-500"
                style={{
                  color: darkMode ? "rgba(255,255,255,0.65)" : "#374151",
                  opacity: visible ? 1 : 0,
                  transitionDelay: `${0.05 + i * 0.06}s`,
                }}
              >
                <span
                  className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                  style={{ background: "#FF8C00" }}
                />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}