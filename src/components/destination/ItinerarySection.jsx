export default function ItinerarySection({ destination, darkMode, noPadding }) {
  const bg = darkMode ? "bg-[#0a0a0a]" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";
  const cardBorder = darkMode ? "border-white/6" : "border-gray-100";

  return (
    <section className={noPadding ? "" : `py-20 px-6 ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Day by Day</span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-2 ${textPrimary}`}>
          Your {destination.name} Itinerary
        </h2>
        <p className={`text-center text-sm font-light mb-14 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
          A carefully crafted journey from arrival to departure.
        </p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 top-5 bottom-5 w-[2px]"
            style={{ background: darkMode ? "rgba(255,140,0,0.15)" : "rgba(255,140,0,0.2)" }}
          />

          <div className="space-y-4">
            {destination.itinerary.map((item, i) => (
              <div key={i} className="flex items-center gap-5">
                {/* Orange circle bullet */}
                <div
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-black text-white text-xs"
                  style={{ background: "#FF8C00", boxShadow: "0 4px 12px rgba(255,140,0,0.35)" }}
                >
                  {i + 1}
                </div>
                {/* Item card */}
                <div
                  className={`flex-1 py-4 px-5 rounded-xl border font-medium text-sm ${textPrimary} ${cardBorder}`}
                  style={{ background: darkMode ? "rgba(255,255,255,0.03)" : "#fff", borderWidth: "1px" }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}