export default function DomesticHero({ onBrowse }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: "640px" }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518509562904-e7ef99cdce2b?w=1920&q=90&fit=crop')",
        }}
      />

      {/* Gradient Overlay — deep dark at top and bottom, lighter in center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.25) 40%, rgba(15,23,42,0.55) 75%, rgba(15,23,42,0.82) 100%)",
        }}
      />

      {/* Decorative kinetic line — bottom of hero */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: "rgba(255,107,0,0.35)" }}
      />

      {/* Hero Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        {/* Pre-label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-[1px] w-12" style={{ background: "#FF6B00" }} />
          <span
            className="text-xs font-semibold tracking-[0.3em] uppercase"
            style={{ color: "#FF6B00" }}
          >
            Gladex Philippines
          </span>
          <div className="h-[1px] w-12" style={{ background: "#FF6B00" }} />
        </div>

        {/* Main Headline */}
        <h1 className="font-black text-white leading-none mb-2"
          style={{ fontSize: "clamp(2.8rem, 8vw, 7rem)", letterSpacing: "-0.02em" }}>
          Explore the Philippines
        </h1>
        <h1
          className="font-black leading-none mb-8"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 7rem)",
            letterSpacing: "-0.02em",
            color: "#FF6B00",
          }}
        >
          in Style
        </h1>

        {/* Subtext */}
        <p
          className="max-w-xl text-base md:text-lg font-light leading-relaxed mb-12"
          style={{ color: "rgba(248,250,252,0.82)" }}
        >
          Curated domestic travel packages across the Philippines.
          <br className="hidden md:block" />
          Book your dream trip today.
        </p>

        {/* CTA */}
        <button
          onClick={onBrowse}
          className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-sm tracking-[0.1em] uppercase text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
          style={{
            background: "#FF6B00",
            boxShadow: "0 8px 32px rgba(255,107,0,0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e05c00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#FF6B00";
          }}
        >
          Browse Destinations
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span
            className="text-[10px] font-semibold tracking-[0.35em] uppercase"
            style={{ color: "rgba(248,250,252,0.55)" }}
          >
            Scroll
          </span>
          <div
            className="scroll-pulse w-2.5 h-2.5 rounded-full"
            style={{ background: "#FF6B00" }}
          />
        </div>
      </div>
    </section>
  );
}