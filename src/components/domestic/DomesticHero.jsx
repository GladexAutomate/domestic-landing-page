import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const PANELS = [
  {
    name: "Boracay",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90&fit=crop",
  },
  {
    name: "El Nido",
    src: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1600&q=90&fit=crop",
  },
  {
    name: "Siargao",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=90&fit=crop",
  },
  {
    name: "Batanes",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1600&q=90&fit=crop",
  },
  {
    name: "Coron",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=90&fit=crop",
  },
];

export default function DomesticHero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        minHeight: "680px",
      }}
    >
      {/* Background Panels */}
      <div className="absolute inset-0 flex">
        {PANELS.map((panel, i) => (
          <div
            key={i}
            className="relative flex-1 overflow-hidden group"
          >
            {/* Image */}
            <div
              className="
                absolute inset-0
                bg-cover bg-center
                transition-all duration-[7000ms] ease-out
                group-hover:scale-110
                group-hover:-translate-y-2
              "
              style={{
                backgroundImage: `url('${panel.src}')`,
              }}
            />

            {/* Dark Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.35)",
              }}
            />

            {/* Hover Glow */}
            <div
              className="
                absolute inset-0
                opacity-0
                group-hover:opacity-100
                transition-opacity duration-500
              "
              style={{
                background:
                  "linear-gradient(to top, rgba(255,140,0,0.18), transparent 65%)",
              }}
            />

            {/* Bottom Gradient */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "140px",
                background:
                  "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, transparent 100%)",
              }}
            />

            {/* Panel Label */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center px-1">
              <span
                className="
                  text-[7px]
                  sm:text-[8px]
                  md:text-[9px]
                  font-bold
                  tracking-[0.22em]
                  uppercase
                  whitespace-nowrap
                  transition-all duration-300
                  group-hover:text-[#FF8C00]
                "
                style={{
                  color: "rgba(255,255,255,0.82)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.95)",
                }}
              >
                {panel.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      {/* Bottom Orange Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: "#FF8C00",
        }}
      />

      {/* Logo */}
      <a
        href="https://voyage-view-go.base44.app"
        className="
          fixed top-4 left-4 md:top-6 md:left-6
          z-50
          transition-all duration-300
          hover:scale-105
        "
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded
            ? "translateY(0)"
            : "translateY(-14px)",
          transition:
            "opacity 0.7s 0.3s, transform 0.7s 0.3s",
        }}
      >
        <img
          src="https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png"
          alt="Gladex Travel and Tours Corp."
          className="h-10 md:h-14 w-auto object-contain"
          style={{
            filter:
              "drop-shadow(0 0 20px rgba(255,140,0,0.55))",
          }}
        />
      </a>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
        <div className="w-full max-w-[1200px] mx-auto">
          {/* Main Title */}
          <h1
            className="
              font-black
              uppercase
              text-white
              leading-[0.9]
              transition-all duration-700
            "
            style={{
              fontSize: "clamp(3.2rem, 8vw, 7.5rem)",
              letterSpacing: "0.03em",
              textShadow:
                "0 8px 30px rgba(0,0,0,0.6)",
              opacity: loaded ? 1 : 0,
              transform: loaded
                ? "translateY(0)"
                : "translateY(32px)",
            }}
          >
            EXPLORE THE
            <br />
            PHILIPPINES
          </h1>

          {/* Subtitle */}
          <p
            className="
              mt-5
              text-[11px]
              sm:text-xs
              md:text-sm
              uppercase
              tracking-[0.22em]
              md:tracking-[0.28em]
              font-light
              transition-all duration-700
            "
            style={{
              color: "rgba(255,255,255,0.78)",
              textShadow: "0 1px 12px rgba(0,0,0,0.7)",
              transitionDelay: "0.25s",
              opacity: loaded ? 1 : 0,
              transform: loaded
                ? "translateY(0)"
                : "translateY(20px)",
            }}
          >
            Discover Premium Domestic Destinations
          </p>

          {/* Domestic Label */}
          <div
            className="
              mt-5
              flex items-center justify-center gap-3 md:gap-5
              transition-all duration-700
            "
            style={{
              transitionDelay: "0.4s",
              opacity: loaded ? 1 : 0,
              transform: loaded
                ? "translateY(0)"
                : "translateY(16px)",
            }}
          >
            <div className="h-px w-10 md:w-16 bg-white/30" />

            <span
              className="
                text-[9px]
                md:text-[11px]
                font-semibold
                tracking-[0.35em]
                uppercase
              "
              style={{
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Domestic
            </span>

            <div className="h-px w-10 md:w-16 bg-white/30" />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="
            absolute bottom-8 md:bottom-10 left-1/2
            -translate-x-1/2
            flex flex-col items-center gap-2
            transition-all duration-700
          "
          style={{
            transitionDelay: "0.55s",
            opacity: loaded ? 1 : 0,
          }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 1.7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1 h-2.5 rounded-full bg-white/60"
            />
          </div>

          <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.35em] uppercase text-white/40">
            Scroll
          </span>
        </div>
      </div>
    </section>
  );
}