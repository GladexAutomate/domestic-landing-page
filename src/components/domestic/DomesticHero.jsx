import { useState, useEffect } from "react";

const PANELS = [
  { name: "Boracay", src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200&q=90&fit=crop" },
  { name: "El Nido", src: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=90&fit=crop" },
  { name: "Siargao", src: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&q=90&fit=crop" },
  { name: "Batanes", src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=90&fit=crop" },
  { name: "Coron", src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=90&fit=crop" },
];

export default function DomesticHero({ darkMode, setDarkMode }) {
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
            {/* Per-panel dark overlay */}
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.28)" }} />
            {/* Panel name at bottom */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase transition-all duration-300 group-hover:text-[#FF8C00]"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {panel.name.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom gradient for text readability */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0.65) 100%)" }}
      />

      {/* Orange bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: "#FF8C00" }} />

      {/* Upper-left logo */}
      <a
        href="https://voyage-view-go.base44.app"
        className="absolute top-6 left-6 z-50 cursor-pointer transition-all duration-300 hover:scale-105"
        title="Back to Main Page"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(-12px)", transition: "opacity 0.7s 0.3s, transform 0.7s 0.3s" }}
      >
        <img
          src="https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png"
          alt="Gladex Travel and Tours Corp."
          className="h-14 w-auto object-contain"
          style={{ filter: "drop-shadow(0 0 16px rgba(255,140,0,0.5))" }}
        />
      </a>

      {/* Dark mode toggle — top right */}
      {setDarkMode && (
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all hover:scale-105"
          style={{
            border: "1.5px solid rgba(255,255,255,0.35)",
            color: "rgba(255,255,255,0.85)",
            background: "rgba(0,0,0,0.25)",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.7s 0.5s",
          }}
        >
          {darkMode ? (
            <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg> Light</>
          ) : (
            <><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> Dark</>
          )}
        </button>
      )}

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
            transitionDelay: "0.35s",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
          }}
        >
          DISCOVER PREMIUM DOMESTIC DESTINATIONS
        </p>

        {/* DOMESTIC label */}
        <p
          className="mt-3 text-[11px] font-semibold tracking-[0.4em] uppercase transition-all duration-700"
          style={{
            color: "rgba(255,255,255,0.4)",
            transitionDelay: "0.45s",
            opacity: loaded ? 1 : 0,
          }}
        >
          DOMESTIC
        </p>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700"
          style={{ transitionDelay: "0.6s", opacity: loaded ? 1 : 0 }}
        >
          <div className="w-7 h-11 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="scroll-pulse w-1.5 h-2.5 rounded-full" style={{ background: "#FF8C00" }} />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.4em] uppercase text-white/40">SCROLL</span>
        </div>
      </div>
    </section>
  );
}