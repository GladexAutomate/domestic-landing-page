import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function InclusionsExclusionsSection({ destination, darkMode }) {
  const [leftRef, leftVisible] = useScrollReveal(0.15);
  const [rightRef, rightVisible] = useScrollReveal(0.15);
  const [headRef, headVisible] = useScrollReveal(0.2);

  if (!destination.inclusions?.length && !destination.exclusions?.length) return null;

  return (
    <section className="py-16 px-6" style={{ background: darkMode ? "#111" : "#F5F5F5" }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-10 transition-all duration-700"
          style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(24px)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
              Package Details
            </span>
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          </div>
          <h2 className="font-black text-3xl md:text-4xl" style={{ color: darkMode ? "#fff" : "#0F172A" }}>
            Inclusions &amp; Exclusions
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Included */}
          <div
            ref={leftRef}
            className="rounded-xl p-6 transition-all duration-700"
            style={{
              background: darkMode ? "#1a1a1a" : "#fff",
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
              boxShadow: darkMode ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
              opacity: leftVisible ? 1 : 0,
              transform: leftVisible ? "translateX(0)" : "translateX(-40px)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-base" style={{ color: darkMode ? "#fff" : "#0F172A" }}>
                Included ✅
              </h3>
            </div>

            <ul className="space-y-2.5">
              {destination.inclusions?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm transition-all duration-500"
                  style={{
                    color: darkMode ? "rgba(255,255,255,0.65)" : "#374151",
                    opacity: leftVisible ? 1 : 0,
                    transitionDelay: `${0.1 + i * 0.05}s`,
                  }}
                >
                  <span className="font-bold flex-shrink-0 mt-0.5 text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not Included */}
          <div
            ref={rightRef}
            className="rounded-xl p-6 transition-all duration-700"
            style={{
              background: darkMode ? "#1a1a1a" : "#fff",
              border: `1px solid ${darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
              boxShadow: darkMode ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
              opacity: rightVisible ? 1 : 0,
              transform: rightVisible ? "translateX(0)" : "translateX(40px)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-base" style={{ color: darkMode ? "#fff" : "#0F172A" }}>
                Not Included ❌
              </h3>
            </div>
            <ul className="space-y-2.5">
              {destination.exclusions?.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm transition-all duration-500"
                  style={{
                    color: darkMode ? "rgba(255,255,255,0.65)" : "#374151",
                    opacity: rightVisible ? 1 : 0,
                    transitionDelay: `${0.1 + i * 0.05}s`,
                  }}
                >
                  <span className="font-bold flex-shrink-0 mt-0.5 text-red-500">✗</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}