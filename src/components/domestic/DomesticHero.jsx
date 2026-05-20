export default function DomesticHero({ onBrowse, darkMode }) {
  // Multi-panel Philippine images
  const panels = [
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdce2b?w=800&q=85&fit=crop",
    "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=85&fit=crop",
    "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=85&fit=crop",
    "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=800&q=85&fit=crop",
  ];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "640px" }}>
      {/* Multi-panel background grid */}
      <div className="absolute inset-0 grid grid-cols-4">
        {panels.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{
              backgroundImage: `url('${src}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0" style={{
              background: "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.5) 100%)"
            }} />
          </div>
        ))}
      </div>

      {/* Main cinematic overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.75) 100%)"
      }} />

      {/* Orange accent line bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#FF8C00" }} />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <h1
          className="font-black text-white uppercase leading-none mb-4"
          style={{ fontSize: "clamp(3rem, 10vw, 8rem)", letterSpacing: "0.04em", textShadow: "0 4px 32px rgba(0,0,0,0.5)" }}
        >
          EXPLORE THE PHILIPPINES
        </h1>
        <p className="max-w-xl text-sm md:text-base font-light leading-relaxed mb-10 uppercase tracking-widest"
          style={{ color: "rgba(248,250,252,0.7)" }}>
          Discover premium domestic destinations across the beautiful Philippines<br className="hidden md:block" />
          with cinematic travel experiences.
        </p>

        {/* CTA */}
        <button
          onClick={onBrowse}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-sm tracking-[0.15em] uppercase text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{ background: "#FF8C00", boxShadow: "0 8px 32px rgba(255,140,0,0.45)" }}
        >
          Browse Destinations
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="w-8 h-12 rounded-full border-2 border-white/40 flex items-start justify-center pt-2">
            <div className="scroll-pulse w-1.5 h-3 rounded-full" style={{ background: "#FF8C00" }} />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.35em] uppercase text-white/50">SCROLL</span>
        </div>
      </div>
    </section>
  );
}