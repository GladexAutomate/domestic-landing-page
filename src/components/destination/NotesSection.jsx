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
        style={{ background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,140,0,0.03) 0%, transparent 70%)" }} />
      

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div
          ref={headRef}
          className="text-center mb-10 transition-all duration-700"
          style={{ opacity: headVisible ? 1 : 0, transform: headVisible ? "translateY(0)" : "translateY(20px)" }}>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.5))" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>
              Important
            </span>
            <div className="h-[1px] flex-1 max-w-[60px]" style={{ background: "linear-gradient(90deg, rgba(255,140,0,0.5), transparent)" }} />
          </div>
          




          
        </div>

        {/* Card */}
        <div
          ref={ref}
          className="rounded-2xl overflow-hidden transition-all duration-700"
          style={{
            background: darkMode ? "rgba(18,12,4,0.9)" : "rgba(255,251,245,0.98)",
            border: `1px solid ${darkMode ? "rgba(255,140,0,0.18)" : "rgba(255,140,0,0.22)"}`,
            boxShadow: darkMode ?
            "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,140,0,0.06)" :
            "0 8px 40px rgba(255,140,0,0.06)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)"
          }}>
          
          {/* Top accent strip */}
          <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.7), transparent)" }} />

          







































          
        </div>
      </div>
    </section>);

}