import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";

const PANELS = [
  {
    name: "BORACAY",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=90&fit=crop",
  },
  {
    name: "EL NIDO",
    src: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=1600&q=90&fit=crop",
  },
  {
    name: "SIARGAO",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=90&fit=crop",
  },
  {
    name: "BATANES",
    src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1600&q=90&fit=crop",
  },
  {
    name: "CORON",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&q=90&fit=crop",
  },
];

export default function DomesticHero() {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        minHeight: "500px",
      }}
    >
      <DomesticNavbar />
      {/* PANELS */}
      <div className="absolute inset-0 flex">
        {PANELS.map((panel, i) => (
          <motion.div
            key={panel.name}
            className="relative overflow-hidden group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: i * 0.1,
              duration: 0.9,
            }}
            style={{
              flex: hovered === i ? 1.8 : 1,
              transition: "flex 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* IMAGE */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ease-out group-hover:scale-110"
              style={{ backgroundImage: `url('${panel.src}')` }}
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/45" />

            {/* HOVER GLOW */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: "linear-gradient(to top, rgba(255,140,0,0.15), transparent 65%)",
                opacity: hovered === i ? 1 : 0,
              }}
            />

            {/* PANEL LABEL */}
            <div className="absolute bottom-12 left-0 right-0 text-center px-1">
              <span
                className="
                  text-[7px]
                  sm:text-[8px]
                  md:text-[9px]
                  font-semibold
                  tracking-[0.22em]
                  uppercase
                  text-white/60
                  whitespace-nowrap
                "
              >
                {panel.name}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GLOBAL OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      {/* ORANGE LINE */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF8C00]" />

      {/* LOGO */}
      <motion.a
        href="https://voyage-view-go.base44.app"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.7,
        }}
        whileHover={{
          scale: 1.05,
        }}
        className="
          fixed
          top-4 left-4
          md:top-6 md:left-6
          z-50
          cursor-pointer
        "
      >
        <img
          src="https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png"
          alt="Gladex Travel and Tours Corp."
          className="h-10 md:h-14 w-auto object-contain"
          style={{
            filter:
              "drop-shadow(0 0 16px rgba(255,140,0,0.5))",
          }}
        />
      </motion.a>

      {/* CENTER CONTENT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center">
        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: loaded ? 1 : 0,
            y: loaded ? 0 : 30,
          }}
          transition={{
            delay: 0.45,
            duration: 0.8,
          }}
          className="
            font-black
            text-white
            uppercase
            leading-none
            mb-4
          "
          style={{
            fontSize: "clamp(52px, 9vw, 120px)",
            letterSpacing: "0.05em",
            textShadow:
              "0 2px 40px rgba(0,0,0,0.7)",
          }}
        >
          EXPLORE THE
          <br />
          PHILIPPINES
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: loaded ? 1 : 0,
            y: loaded ? 0 : 20,
          }}
          transition={{
            delay: 0.6,
            duration: 0.8,
          }}
          className="
            text-white/75
            text-[11px]
            sm:text-sm
            lg:text-base
            max-w-lg
            uppercase
          "
          style={{
            letterSpacing: "0.15em",
            lineHeight: 1.7,
          }}
        >
          DISCOVER PREMIUM DOMESTIC DESTINATIONS
        </motion.p>

        {/* DOMESTIC LABEL */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex items-center gap-4"
        >
          <div className="h-px w-10 md:w-12 bg-white/30" />

          <span
            className="
              text-[9px]
              md:text-[10px]
              tracking-[0.4em]
              text-white/50
              uppercase
              whitespace-nowrap
            "
          >
            Domestic
          </span>

          <div className="h-px w-10 md:w-12 bg-white/30" />
        </motion.div>
      </div>

      {/* SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ delay: 1.1 }}
        className="
          absolute
          left-1/2
          top-[78%]
          -translate-x-1/2
          z-20
          flex
          flex-col
          items-center
          gap-3
        "
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-1 h-2.5 rounded-full bg-white/70"
          />
        </div>

        <span
          className="
            text-[9px]
            md:text-[10px]
            font-semibold
            uppercase
            tracking-[0.45em]
            text-white/60
          "
          style={{
            textShadow:
              "0 2px 8px rgba(0,0,0,0.6)",
          }}
        >
          Scroll
        </span>
      </motion.div>
    </section>
  );
}