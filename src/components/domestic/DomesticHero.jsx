import { useState, useEffect } from "react";

const PANELS = [
  {
    name: "Boracay",
    src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=90&fit=crop",
  },
  {
    name: "El Nido",
    src: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=90&fit=crop",
  },
  {
    name: "Siargao",
    src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=90&fit=crop",
  },
  {
    name: "Batanes",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=90&fit=crop",
  },
  {
    name: "Coron",
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=90&fit=crop",
  },
];

export default function DomesticHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>

      {/* 5-panel background */}
      <div className="absolute inset-0 flex" style={{ gap: 0 }}>
        {PANELS.map((panel, i) => (
          <div
            key={i}
            className="relative overflow-hidden group"
            style={{ flex: 1, margin: 0, padding: 0, border: "none" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out group-hover:scale-110"
              style={{ backgroundImage: `url('${panel.src}')` }}
            />
            {/* Per-panel dark overlay */}
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
            {/* Destination name at bottom */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {panel.name.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Orange bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-10" style={{ background: "#FF8C00" }} />

      {/* Centered content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 z-10">
        <h1
          className="font-black text-white uppercase leading-none mb-4"
          style={{
            fontSize: "clamp(3rem, 10vw, 9rem)",
            letterSpacing: "0.04em",
            textShadow: "0 2px 40px rgba(0,0,0,0.5)",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
            transitionDelay: "0.1s",
          }}
        >
          EXPLORE THE PHILIPPINES
        </h1>

        <p
          className="text-xs md:text-sm font-light tracking-[0.25em] uppercase mb-3"
          style={{
            color: "rgba(255,255,255,0.7)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.8s ease",
            transitionDelay: "0.3s",
          }}
        >
          Discover Premium Domestic Destinations
        </p>

        <p
          className="text-[10px] font-semibold tracking-[0.4em] uppercase"
          style={{
            color: "rgba(255,255,255,0.45)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.8s ease",
            transitionDelay: "0.5s",
          }}
        >
          Philippines
        </p>

        {/* Scroll indicator */}
        <div
          className="absolute flex flex-col items-center gap-2"
          style={{
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.8s ease",
            transitionDelay: "0.7s",
          }}
        >
          <div className="w-7 h-11 rounded-full border-2 flex items-start justify-center pt-2" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
            <div className="scroll-pulse w-1.5 h-2.5 rounded-full" style={{ background: "#FF8C00" }} />
          </div>
          <span className="text-[9px] font-semibold tracking-[0.4em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>SCROLL</span>
        </div>
      </div>
    </section>
  );
}