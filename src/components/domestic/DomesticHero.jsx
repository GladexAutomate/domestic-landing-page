const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6115eb14182fe3684619/ed2488356_5ecc9b2cd_Untitled-design-75.png";

const PANELS = [
  {
    label: "Boracay",
    src: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&q=90&fit=crop&crop=center",
  },
  {
    label: "El Nido",
    src: "https://images.unsplash.com/photo-1573790387438-4da905039392?w=900&q=90&fit=crop&crop=center",
  },
  {
    label: "Batanes",
    src: "https://images.unsplash.com/photo-1518509562904-e7ef99cdce2b?w=900&q=90&fit=crop&crop=center",
  },
  {
    label: "Siargao",
    src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=900&q=90&fit=crop&crop=center",
  },
];

export default function DomesticHero({ darkMode }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "600px" }}
    >
      {/* 4 panels — flex, each 25% width, filled with img */}
      <div className="absolute inset-0 flex">
        {PANELS.map((panel, i) => (
          <div
            key={i}
            className="relative overflow-hidden group"
            style={{ flex: "1 1 0%", minWidth: 0 }}
          >
            <img
              src={panel.src}
              alt={panel.label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="eager"
              fetchpriority="high"
              style={{ display: "block" }}
            />
            {/* Per-panel bottom gradient only */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.80) 100%)",
              }}
            />
            {/* Thin right divider (skip last) */}
            {i < 3 && (
              <div
                className="absolute top-0 right-0 bottom-0 w-[1px]"
                style={{ background: "rgba(255,255,255,0.18)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Orange bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] z-10"
        style={{ background: "#FF8C00" }}
      />

      {/* Centered overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        {/* Gladex logo */}
        <img
          src={GLADEX_LOGO}
          alt="Gladex Travel and Tours"
          className="h-14 md:h-16 w-auto object-contain mb-7"
          style={{
            filter:
              "drop-shadow(0 2px 16px rgba(0,0,0,0.7)) brightness(1.1)",
          }}
        />

        {/* Headline */}
        <h1
          className="font-black text-white uppercase leading-none mb-4"
          style={{
            fontSize: "clamp(2.2rem, 7.5vw, 7rem)",
            letterSpacing: "0.05em",
            textShadow: "0 2px 32px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          EXPLORE THE PHILIPPINES
        </h1>

        {/* Subtext */}
        <p
          className="max-w-xl text-sm md:text-base font-light tracking-wider leading-relaxed uppercase"
          style={{
            color: "rgba(255,255,255,0.75)",
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          }}
        >
          Discover premium domestic destinations across the beautiful Philippines
          <br className="hidden md:block" />
          with cinematic travel experiences.
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <div className="w-7 h-11 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div
            className="scroll-pulse w-1.5 h-2.5 rounded-full"
            style={{ background: "#FF8C00" }}
          />
        </div>
        <span className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/40">
          SCROLL
        </span>
      </div>
    </section>
  );
}