import { useScrollReveal } from "@/hooks/useScrollReveal";

// Shows: Package name, Hotel options, Optional tours, Important notes
export default function PackageDetails({ destination, darkMode }) {
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";
  const textMuted = darkMode ? "text-white/60" : "text-[#64748B]";
  const cardBg = darkMode ? "bg-[#1a1a1a]" : "bg-white";
  const cardBorder = darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb";
  const sectionBg = darkMode ? "#141414" : "#f9fafb";

  const SectionHeading = ({ label }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-[1px] w-8" style={{ background: "#FF8C00" }} />
      <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>{label}</span>
      <div className="h-[1px] flex-1" style={{ background: darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb" }} />
    </div>
  );

  const [ref1, vis1] = useScrollReveal();
  const [ref2, vis2] = useScrollReveal();
  const [ref3, vis3] = useScrollReveal();

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Package Name */}
    

      {/* Hotel Options */}
      <div
        ref={ref2}
        className={`rounded-xl p-6 transition-all duration-700 ${cardBg}`}
        style={{ border: `1px solid ${cardBorder}`, boxShadow: darkMode ? "none" : "0 2px 16px rgba(0,0,0,0.05)", opacity: vis2 ? 1 : 0, transform: vis2 ? "translateY(0)" : "translateY(24px)", transitionDelay: "0.1s" }}
      >
        <SectionHeading label="Rooms &amp; Rates" />
        <div className="space-y-4">
          {destination.hotelCategories?.map((cat, i) => (
            <div key={i} className="rounded-lg p-4" style={{ background: sectionBg, border: `1px solid ${cardBorder}` }}>
              <p className="font-bold text-sm uppercase tracking-widest mb-1" style={{ color: "#FF8C00" }}>{cat.label}</p>
              {cat.note && <p className={`text-xs mb-1 ${textMuted}`}>{cat.note}</p>}
              {cat.hotels && <p className={`text-sm mb-3 ${textMuted}`}>{cat.hotels}</p>}
              {cat.rates?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cat.rates.map((r, j) => (
                    <div key={j} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${cardBg}`} style={{ border: `1px solid ${cardBorder}` }}>
                      <span className={textMuted}>{r.label}:</span>
                      <span className={`font-bold ${textPrimary}`}>{r.price}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Optional Tours */}
      {destination.optionalTours?.length > 0 && (
        <div
          ref={ref3}
          className={`rounded-xl p-6 transition-all duration-700 ${cardBg}`}
          style={{ border: `1px solid ${cardBorder}`, boxShadow: darkMode ? "none" : "0 2px 16px rgba(0,0,0,0.05)", opacity: vis3 ? 1 : 0, transform: vis3 ? "translateY(0)" : "translateY(24px)", transitionDelay: "0.2s" }}
        >
          <SectionHeading label="Optional Add-Ons" />
          <div className="space-y-4">
            {destination.optionalTours.map((tour, i) => (
              <div key={i} className="rounded-lg p-4" style={{ background: sectionBg, border: `1px solid ${cardBorder}` }}>
                <p className={`font-bold text-sm mb-1 ${textPrimary}`}>{tour.name}</p>
                <p className="text-xs font-semibold mb-2" style={{ color: "#FF8C00" }}>{tour.price}</p>
                {tour.details && <p className={`text-sm leading-relaxed ${textMuted}`}>{tour.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Notes */}
      {destination.notes?.length > 0 && (
        <div className={`rounded-xl p-6 ${cardBg}`} style={{ border: `1px solid ${cardBorder}`, boxShadow: darkMode ? "none" : "0 2px 16px rgba(0,0,0,0.05)" }}>
          <SectionHeading label="Important" />
          <ul className="space-y-2">
            {destination.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="#FF8C00" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                <span className={`text-sm ${textMuted}`}>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}