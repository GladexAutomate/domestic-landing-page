import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function InclusionsExclusionsSection({ destination, darkMode }) {
  const [headRef, headVisible] = useScrollReveal(0.15);
  const [leftRef, leftVisible] = useScrollReveal(0.1);
  const [rightRef, rightVisible] = useScrollReveal(0.1);

  if (!destination.inclusions?.length && !destination.exclusions?.length) return null;

  const sectionBg = darkMode ?
  "linear-gradient(180deg, #111 0%, #0d0d0d 100%)" :
  "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)";

  const cardBg = darkMode ? "rgba(20,20,20,0.9)" : "rgba(255,255,255,0.95)";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb";
  const textMuted = darkMode ? "rgba(255,255,255,0.6)" : "#374151";
  const textPrimary = darkMode ? "#fff" : "#0F172A";

  return (
    <section className="relative py-14 sm:py-20 px-4 sm:px-6 overflow-hidden" style={{ background: sectionBg }}>
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,140,0,0.03) 0%, transparent 70%)" }} />
      

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-8 sm:mb-12 transition-all duration-700"
          style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(24px)" }}>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, transparent, #FF8C00)" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>
              Package Details
            </span>
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, #FF8C00, transparent)" }} />
          </div>
          <h2
            className="font-black mb-3"
            style={{
              color: textPrimary,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1
            }}>
            
            Inclusions &amp; Exclusions
          </h2>
          <p className="text-sm" style={{ color: darkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
            Everything you need to know about what's covered in your package.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Included */}
          <div
            ref={leftRef}
            className="rounded-2xl overflow-hidden transition-all duration-700"
            style={{
              background: cardBg,
              border: `1px solid ${darkMode ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.15)"}`,
              boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.06)",
              opacity: leftVisible ? 1 : 0,
              transform: leftVisible ? "translateX(0)" : "translateX(-40px)"
            }}>
            
            {/* Card top strip */}
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.6), transparent)" }} />

            




































            
          </div>

          {/* Not Included */}
          <div
            ref={rightRef}
            className="rounded-2xl overflow-hidden transition-all duration-700"
            style={{
              background: cardBg,
              border: `1px solid ${darkMode ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.15)"}`,
              boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.06)",
              opacity: rightVisible ? 1 : 0,
              transform: rightVisible ? "translateX(0)" : "translateX(40px)"
            }}>
            
            <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)" }} />

            




































            
          </div>
        </div>
      </div>
    </section>);

}