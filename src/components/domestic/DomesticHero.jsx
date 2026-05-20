const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6115eb14182fe3684619/ed2488356_5ecc9b2cd_Untitled-design-75.png";

export default function DomesticHero({ onBrowse, darkMode }) {
  const panels = [
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdce2b?w=800&q=85&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=85&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=85&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85&fit=crop&crop=center",
  ];

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>
      {/* Multi-panel bg — 4 equal columns, each pre-loaded as img for reliability */}
      <div className="absolute inset-0 flex">
        {panels.map((src, i) => (
          <div key={i} className="flex-1 relative overflow-hidden">
            <img
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          </div>
        ))}
      </div>

      {/* Cinematic overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(180deg, rgba(5,5,5,0.52) 0%, rgba(5,5,5,0.28) 35%, rgba(5,5,5,0.75) 100%)"
      }} />

      {/* Vertical dividers between panels */}
      <div className="absolute inset-0 flex pointer-events-none">
        {[1,2,3].map((i) => (
          <div key={i} className="flex-1 border-r" style={{ borderColor: "rgba(255,140,0,0.12)" }} />
        ))}
        <div className="flex-1" />
      </div>

      {/* Orange bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#FF8C00" }} />

      {/* Hero Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        {/* Logo centered above headline */}
        <img
          src={GLADEX_LOGO}
          alt="Gladex Travel and Tours Corp."
          className="h-14 md:h-16 w-auto object-contain mb-8"
          style={{ filter: "drop-shadow(0 2px 20px rgba(255,140,0,0.5)) brightness(1.1)" }}
        />

        <h1
          className="font-black text-white uppercase leading-none mb-4"
          style={{ fontSize: "clamp(2.4rem, 8vw, 7rem)", letterSpacing: "0.05em", textShadow: "0 4px 40px rgba(0,0,0,0.7)" }}
        >
          EXPLORE THE PHILIPPINES
        </h1>
        <p
          className="max-w-xl text-sm md:text-base font-light tracking-wider leading-relaxed uppercase"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Discover premium domestic destinations across the beautiful Philippines<br className="hidden md:block" />
          with cinematic travel experiences.
        </p>

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