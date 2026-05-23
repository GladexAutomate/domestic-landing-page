import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PANELS = [
  {
    name: "Boracay",
    src: "https://images.unsplash.com/photo-1573548842355-73bb50e50323?w=1200&q=90&fit=crop",
  },
  {
    name: "El Nido",
    src: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=90&fit=crop",
  },
  {
    name: "Siargao",
    src: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=90&fit=crop",
  },
  {
    name: "Batanes",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=90&fit=crop",
  },
  {
    name: "Coron",
    src: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=90&fit=crop",
  },
];

export default function DomesticHero({ onBrowse }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>

      {/* 5-panel background */}
      <div className="absolute inset-0 flex" style={{ gap: 0 }}>
        {PANELS.map((panel, i) => (
          <div
            key={i}
            className="relative flex-1 overflow-hidden group"
            style={{ margin: 0, padding: 0, border: "none" }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out group-hover:scale-110"
              style={{ backgroundImage: `url('${panel.src}')`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
          </div>
        ))}
      </div>

      {/* Bottom-only dark gradient for text readability */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.72) 100%)"
        }}
      />

      {/* Orange bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#FF8C00" }} />

      {/* Upper-left logo */}
      <motion.a
        href="https://voyage-view-go.base44.app"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7 }}
        whileHover={{ scale: 1.06, y: -2 }}
        className="absolute top-6 left-6 z-50 cursor-pointer"
        title="Back to Main Page"
      >
        <img
          src="https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png"
          alt="Gladex Travel and Tours Corp."
          className="h-14 w-auto object-contain transition-all duration-300"
          style={{
            filter: "drop-shadow(0 0 16px rgba(255,140,0,0.5))",
          }}
        />
      </motion.a>

      {/* Centered content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">

        <h1
          className="font-black text-white uppercase leading-none mb-4 transition-all duration-700"
          style={{
            fontSize: "clamp(2.6rem, 8vw, 7.5rem)",
            letterSpacing: "0.06em",
            textShadow: "0 2px 30px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.4)",
            transitionDelay: "0.2s",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(24px)",
          }}
        >
          EXPLORE THE PHILIPPINES
        </h1>

        <p
          className="max-w-lg text-sm md:text-base font-light tracking-wider leading-relaxed transition-all duration-700"
          style={{
            color: "rgba(255,255,255,0.7)",
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
            transitionDelay: "0.4s",
            opacity: loaded ? 1 : 0,
          }}
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