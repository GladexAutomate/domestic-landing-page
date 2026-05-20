// Clean, structured destination package info display
export default function PackageDetails({ destination, darkMode }) {
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";
  const textMuted = darkMode ? "text-white/60" : "text-[#64748B]";
  const cardBg = darkMode ? "bg-[#1a1a1a] border-white/8" : "bg-white border-gray-200";
  const sectionBg = darkMode ? "bg-[#141414] border-white/6" : "bg-[#f9fafb] border-gray-100";
  const divider = darkMode ? "border-white/8" : "border-gray-200";

  const SectionHeading = ({ label, number }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: "#FF8C00", color: "#fff" }}>
        {number}
      </div>
      <h2 className={`font-black text-lg tracking-wide uppercase ${textPrimary}`}>{label}</h2>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* 1. Package Name & Video */}
      <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
        <SectionHeading number="1" label="Package" />
        <p className={`text-xl font-bold ${textPrimary}`}>{destination.package}</p>
        {destination.videoUrl && (
          <a
            href={destination.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "#FF8C00" }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" /></svg>
            Watch Video Preview
          </a>
        )}
      </div>

      {/* 2. Hotel Options */}
      <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
        <SectionHeading number="2" label="Hotel Options & Rates" />
        <div className="space-y-5">
          {destination.hotelCategories?.map((cat, i) => (
            <div key={i} className={`rounded-lg border p-4 ${sectionBg}`} style={{ borderWidth: "1px" }}>
              <p className={`font-bold text-sm uppercase tracking-widest mb-1`} style={{ color: "#FF8C00" }}>{cat.label}</p>
              {cat.note && <p className={`text-xs mb-1 ${textMuted}`}>{cat.note}</p>}
              {cat.hotels && <p className={`text-sm mb-3 ${textMuted}`}>{cat.hotels}</p>}
              {cat.rates?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {cat.rates.map((r, j) => (
                    <div key={j} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${darkMode ? "bg-[#0a0a0a]" : "bg-white"} border ${divider}`} style={{ borderWidth: "1px" }}>
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

      {/* 3. Inclusions */}
      <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
        <SectionHeading number="3" label="Inclusions" />
        <ul className="space-y-2">
          {destination.inclusions?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              <span className={`text-sm ${textPrimary}`}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Exclusions */}
      <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
        <SectionHeading number="4" label="Exclusions" />
        <ul className="space-y-2">
          {destination.exclusions?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span className={`text-sm ${textPrimary}`}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Itinerary */}
      {destination.itinerary?.length > 0 && (
        <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
          <SectionHeading number="5" label="Itinerary" />
          <div className="space-y-4">
            {destination.itinerary.map((day, i) => (
              <div key={i} className={`rounded-lg border p-4 ${sectionBg}`} style={{ borderWidth: "1px" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 rounded text-xs font-black uppercase tracking-widest" style={{ background: "rgba(255,140,0,0.12)", color: "#FF8C00" }}>{day.day}</div>
                  <p className={`font-bold text-sm ${textPrimary}`}>{day.title}</p>
                </div>
                <p className={`text-sm leading-relaxed whitespace-pre-line ${textMuted}`}>{day.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Optional Tours */}
      {destination.optionalTours?.length > 0 && (
        <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
          <SectionHeading number="6" label="Optional Tours" />
          <div className="space-y-4">
            {destination.optionalTours.map((tour, i) => (
              <div key={i} className={`rounded-lg border p-4 ${sectionBg}`} style={{ borderWidth: "1px" }}>
                <p className={`font-bold text-sm mb-1 ${textPrimary}`}>{tour.name}</p>
                <p className="text-xs font-semibold mb-2" style={{ color: "#FF8C00" }}>{tour.price}</p>
                {tour.details && <p className={`text-sm leading-relaxed ${textMuted}`}>{tour.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Important Notes */}
      {destination.notes?.length > 0 && (
        <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
          <SectionHeading number="7" label="Important Notes" />
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