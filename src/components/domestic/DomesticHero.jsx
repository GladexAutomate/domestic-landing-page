import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PANELS = [
  { name: "Boracay", src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=90&fit=crop" },
  { name: "El Nido", src: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=90&fit=crop" },
  { name: "Siargao", src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=90&fit=crop" },
  { name: "Coron", src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=90&fit=crop" },
  { name: "Batanes", src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=90&fit=crop" },
];

export default function DomesticHero({ onBrowse }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>

      {/* 5-panel background */}
      <div className="absolute inset-0 flex" style={{ gap: 0 }}>
        {PANELS.map((panel, i) => (
          <div key={i} className="relative flex-1 overflow-hidden group" style={{ margin: 0, padding: 0, border: "none" }}>
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out group-hover:scale-110"
              style={{ backgroundImage: `url('${panel.src}')` }}
            />
            {/* Per-panel dim overlay */}
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.35)" }} />
            {/* Destination name at bottom */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center">
              <span
                className="text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 group-hover:text-[#FF8C00]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {panel.name.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Centered dark gradient for text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)" }}
      />

      {/* Orange bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#FF8C00" }} />

      {/* Upper-left logo */}
      <motion.a
        href="https://voyage-view-go.base44.app"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        whileHover={{ scale: 1.05 }}
        className="absolute top-5 left-6 z-50 cursor-pointer"
        title="Back to Main Page"
      >
        <img
          src="https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png"
          alt="Gladex Travel and Tours Corp."
          className="h-12 w-auto object-contain"
          style={{ filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.6))" }}
        />
      </motion.a>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        {/* Main title */}
        <h1
          className="font-black text-white uppercase leading-none transition-all duration-700"
          style={{
            fontSize: "clamp(3rem, 10vw, 9rem)",
            letterSpacing: "0.03em",
            textShadow: "0 4px 40px rgba(0,0,0,0.6)",
            fontStyle: "italic",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(28px)",
            transitionDelay: "0.15s",
          }}
        >
          EXPLORE THE PHILIPPINES
        </h1>

        {/* Sub-description */}
        <p
          className="text-xs font-semibold tracking-[0.3em] uppercase mt-5 transition-all duration-700"
          style={{
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.25em",
            opacity: loaded ? 1 : 0,
            transitionDelay: "0.35s",
          }}
        >
          DISCOVER PREMIUM DOMESTIC DESTINATIONS
        </p>

        {/* Badge label */}
        <p
          className="text-[10px] font-bold tracking-[0.5em] uppercase mt-2 transition-all duration-700"
          style={{
            color: "rgba(255,255,255,0.35)",
            opacity: loaded ? 1 : 0,
            transitionDelay: "0.45s",
          }}
        >
          DOMESTIC
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <div className="w-7 h-11 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
          <div className="scroll-pulse w-1.5 h-2.5 rounded-full" style={{ background: "#FF8C00" }} />
        </div>
        <span className="text-[9px] font-semibold tracking-[0.4em] uppercase text-white/35">SCROLL</span>
      </div>
    </section>
  );
}