const INCLUDED = [
  "Round-trip airfare",
  "Hotel accommodation",
  "Daily breakfast",
  "Tour entrance fees",
  "English-speaking tour guide",
  "Airport transfers",
];

const NOT_INCLUDED = [
  "Philippine travel tax",
  "Tips and gratuities",
  "Travel insurance",
  "Extra baggage fees",
  "Optional tours",
  "Personal expenses",
];

export default function InclusionsExclusions({ darkMode, noPadding }) {
  const bg = darkMode ? "bg-[#111]" : "bg-[#f8f9fa]";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";
  const cardBg = darkMode ? "bg-[#1a1a1a] border-white/8" : "bg-white border-gray-100";

  return (
    <section className={noPadding ? "" : `py-20 px-6 ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Package Details</span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-12 ${textPrimary}`}>
          Inclusions & Exclusions
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Included */}
          <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <h3 className={`font-bold text-base ${textPrimary}`}>Included</h3>
            </div>
            <ul className="space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className={`text-sm ${darkMode ? "text-white/70" : "text-[#374151]"}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Included */}
          <div className={`rounded-xl border p-6 ${cardBg}`} style={{ borderWidth: "1px" }}>
            <div className="flex items-center gap-2 mb-5">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h3 className={`font-bold text-base ${textPrimary}`}>Not Included</h3>
            </div>
            <ul className="space-y-3">
              {NOT_INCLUDED.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className={`text-sm ${darkMode ? "text-white/70" : "text-[#374151]"}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}