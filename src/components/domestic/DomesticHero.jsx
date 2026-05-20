export default function DomesticHero({ onBrowse, darkMode }) {
  const panels = [
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdce2b?w=700&q=85&fit=crop",
    "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=700&q=85&fit=crop",
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&q=85&fit=crop",
    "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=700&q=85&fit=crop",
  ];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>
      {/* Multi-panel bg */}
      <div className="absolute inset-0 grid grid-cols-4">
        {panels.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden"
            style={{ backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        ))}
      </div>

      {/* Cinematic overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.35) 40%, rgba(5,5,5,0.8) 100%)"
      }} />

      {/* Orange bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#FF8C00" }} />

      {/* Gladex logo center top (subtle) */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <h1
          className="font-black text-white uppercase leading-none mb-3"
          style={{ fontSize: "clamp(2.8rem, 9vw, 8rem)", letterSpacing: "0.06em", textShadow: "0 4px 40px rgba(0,0,0,0.6)" }}
        >
          EXPLORE THE PHILIPPINES
        </h1>
        <p
          className="max-w-xl text-sm md:text-base font-light tracking-wider leading-relaxed mb-10 uppercase"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          Discover premium domestic destinations across the beautiful Philippines<br className="hidden md:block" />
          with cinematic travel experiences.
        </p>

        {/* CTA */}
        <button
          onClick={onBrowse}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-sm tracking-[0.15em] uppercase text-white transition-all duration-300 hover:scale-105"
          style={{ background: "#FF8C00", boxShadow: "0 8px 36px rgba(255,140,0,0.5)" }}
        >
          Browse Destinations
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-7 h-11 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="scroll-pulse w-1.5 h-2.5 rounded-full" style={{ background: "#FF8C00" }} />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/40">SCROLL</span>
        </div>
      </div>
    </section>
  );
}