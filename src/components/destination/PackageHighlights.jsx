const HIGHLIGHTS = [
  { label: "Roundtrip Airfare", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
  )},
  { label: "Hotel Accommodation", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
  )},
  { label: "Daily Breakfast", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5M6 13.121v3.378c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875v-3.378M6 13.121c-.316.04-.63.083-.943.13C4.137 13.415 3 14.545 3 15.878v.622A2.25 2.25 0 005.25 18.75h13.5A2.25 2.25 0 0021 16.5v-.622c0-1.333-1.137-2.463-2.057-2.627a47.878 47.878 0 00-.943-.13" /></svg>
  )},
  { label: "Guided Tours", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
  )},
  { label: "English Guide", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
  )},
  { label: "7kg Baggage", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
  )},
  { label: "Airport Transfers", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
  )},
  { label: "Entrance Fees", icon: (
    <svg className="w-7 h-7" fill="none" stroke="#FF8C00" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
  )},
];

export default function PackageHighlights({ darkMode }) {
  const bg = darkMode ? "bg-[#111]" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";
  const cardBg = darkMode ? "bg-[#1a1a1a] border-white/8" : "bg-white border-gray-100";

  return (
    <section className={`py-20 px-6 ${bg}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>What's Included</span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-2 ${textPrimary}`}>Package Highlights</h2>
        <p className={`text-center text-sm font-light mb-12 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
          Everything you need for a seamless, unforgettable journey.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all hover:scale-105 ${cardBg}`}
              style={{ borderWidth: "1px" }}
            >
              {item.icon}
              <span className={`text-xs font-medium text-center ${darkMode ? "text-white/70" : "text-[#0F172A]/70"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}